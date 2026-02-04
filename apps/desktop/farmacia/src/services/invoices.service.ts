import { supabase } from '@/lib/supabase';
import type { Invoice, CreateInvoiceInput } from '@/types/invoice.types';

export class InvoicesService {
  /**
   * Generate unique invoice number
   */
  static generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${timestamp}-${random}`;
  }

  /**
   * Create invoice with items and update stock (FEFO)
   */
  static async create(input: CreateInvoiceInput) {
    // Calculate totals
    let subtotal_usd = 0;
    let subtotal_ves = 0;
    let iva_usd = 0;
    let iva_ves = 0;

    // Get product details for each item
    const itemsWithDetails = await Promise.all(
      input.items.map(async (item) => {
        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.product_id)
          .single();

        if (error) throw error;

        const itemSubtotalUsd = product.sale_price_usd * item.quantity;
        const itemSubtotalVes = product.sale_price_ves * item.quantity;
        const itemIvaUsd = product.iva_exempt ? 0 : itemSubtotalUsd * product.iva_rate;
        const itemIvaVes = product.iva_exempt ? 0 : itemSubtotalVes * product.iva_rate;

        subtotal_usd += itemSubtotalUsd;
        subtotal_ves += itemSubtotalVes;
        iva_usd += itemIvaUsd;
        iva_ves += itemIvaVes;

        return {
          ...item,
          product,
          unit_price_usd: product.sale_price_usd,
          unit_price_ves: product.sale_price_ves,
          total_usd: itemSubtotalUsd,
          total_ves: itemSubtotalVes,
          iva_rate: product.iva_rate,
          iva_usd: itemIvaUsd,
          iva_ves: itemIvaVes,
        };
      })
    );

    const total_usd = subtotal_usd + iva_usd;
    const total_ves = subtotal_ves + iva_ves;

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: this.generateInvoiceNumber(),
        patient_id: input.patient_id,
        warehouse_id: input.warehouse_id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        status: 'paid',
        subtotal_usd,
        subtotal_ves,
        iva_usd,
        iva_ves,
        total_usd,
        total_ves,
        payment_method: input.payment_method,
        payment_details: input.payment_details,
        exchange_rate: input.exchange_rate,
        notes: input.notes,
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Create invoice items
    const invoiceItems = itemsWithDetails.map((item) => ({
      invoice_id: invoice.id,
      product_id: item.product_id,
      batch_id: item.batch_id,
      product_name: item.product.name,
      generic_name: item.product.generic_name,
      quantity: item.quantity,
      unit_type: item.product.unit_type,
      unit_price_usd: item.unit_price_usd,
      unit_price_ves: item.unit_price_ves,
      total_usd: item.total_usd,
      total_ves: item.total_ves,
      iva_rate: item.iva_rate,
      iva_usd: item.iva_usd,
      iva_ves: item.iva_ves,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);

    if (itemsError) throw itemsError;

    // Update stock using FEFO (First Expired First Out)
    for (const item of itemsWithDetails) {
      await this.updateStockFEFO(item.product_id, item.quantity, input.warehouse_id);
    }

    return invoice as Invoice;
  }

  /**
   * Update stock using FEFO (First Expired First Out)
   */
  private static async updateStockFEFO(
    productId: string,
    quantity: number,
    warehouseId: string
  ) {
    // Get batches ordered by expiry date (FEFO)
    const { data: batches, error: batchError } = await supabase
      .from('batches')
      .select('*')
      .eq('product_id', productId)
      .eq('warehouse_id', warehouseId)
      .eq('zone', 'available')
      .gt('quantity', 0)
      .order('expiry_date', { ascending: true });

    if (batchError) throw batchError;

    let remainingQty = quantity;

    for (const batch of batches) {
      if (remainingQty <= 0) break;

      const qtyToDeduct = Math.min(remainingQty, batch.quantity);

      const { error: updateError } = await supabase
        .from('batches')
        .update({ quantity: batch.quantity - qtyToDeduct })
        .eq('id', batch.id);

      if (updateError) throw updateError;

      remainingQty -= qtyToDeduct;
    }

    if (remainingQty > 0) {
      throw new Error(`Stock insuficiente para el producto ${productId}`);
    }
  }

  /**
   * Get invoices with filters
   */
  static async getAll(filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    warehouseId?: string;
  }) {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.warehouseId) {
      query = query.eq('warehouse_id', filters.warehouseId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Invoice[];
  }

  /**
   * Get invoice by ID
   */
  static async getById(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Invoice;
  }

  /**
   * Get today's sales
   */
  static async getTodaySales() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('invoices')
      .select('total_usd, total_ves')
      .eq('status', 'paid')
      .gte('created_at', today.toISOString());

    if (error) throw error;

    const totals = data.reduce(
      (acc, invoice) => ({
        usd: acc.usd + invoice.total_usd,
        ves: acc.ves + invoice.total_ves,
      }),
      { usd: 0, ves: 0 }
    );

    return { count: data.length, ...totals };
  }

  /**
   * Get sales by date range
   */
  static async getSalesByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Invoice[];
  }
}
