import { supabase } from '@/lib/supabase';
import type { Invoice } from '@/types/invoice.types';

export interface SalesReport {
  date: string;
  total_usd: number;
  total_ves: number;
  count: number;
}

export interface ProductSalesReport {
  product_id: string;
  product_name: string;
  sku: string;
  quantity_sold: number;
  total_usd: number;
  total_ves: number;
}

export interface DailySalesReport {
  date: string;
  sales_usd: number;
  sales_ves: number;
  transactions: number;
}

export class ReportsService {
  /**
   * Get sales report by date range
   */
  static async getSalesByDateRange(startDate: string, endDate: string): Promise<SalesReport[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('created_at, total_usd, total_ves')
      .eq('status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const grouped = (data as Invoice[]).reduce((acc, invoice) => {
      const date = invoice.created_at.split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          total_usd: 0,
          total_ves: 0,
          count: 0,
        };
      }
      acc[date].total_usd += invoice.total_usd;
      acc[date].total_ves += invoice.total_ves;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, SalesReport>);

    return Object.values(grouped);
  }

  /**
   * Get top selling products
   */
  static async getTopSellingProducts(limit: number = 10, startDate?: string, endDate?: string): Promise<ProductSalesReport[]> {
    let query = supabase
      .from('invoice_items')
      .select(`
        product_id,
        product_name,
        quantity,
        total_usd,
        total_ves,
        invoice:invoices!inner(status, created_at)
      `);

    if (startDate) {
      query = query.gte('invoice.created_at', startDate);
    }
    if (endDate) {
      query = query.lte('invoice.created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by product
    const grouped = (data as any[]).reduce((acc, item) => {
      if (item.invoice.status !== 'paid') return acc;
      
      const productId = item.product_id;
      if (!acc[productId]) {
        acc[productId] = {
          product_id: productId,
          product_name: item.product_name,
          sku: '',
          quantity_sold: 0,
          total_usd: 0,
          total_ves: 0,
        };
      }
      acc[productId].quantity_sold += item.quantity;
      acc[productId].total_usd += item.total_usd;
      acc[productId].total_ves += item.total_ves;
      return acc;
    }, {} as Record<string, ProductSalesReport>);

    return Object.values(grouped)
      .sort((a, b) => (b as ProductSalesReport).total_usd - (a as ProductSalesReport).total_usd)
      .slice(0, limit) as ProductSalesReport[];
  }

  /**
   * Get sales summary
   */
  static async getSalesSummary(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('total_usd, total_ves, payment_method')
      .eq('status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    const invoices = data as Invoice[];

    const summary = {
      total_sales_usd: 0,
      total_sales_ves: 0,
      total_transactions: invoices.length,
      average_ticket_usd: 0,
      average_ticket_ves: 0,
      by_payment_method: {} as Record<string, { count: number; total_usd: number; total_ves: number }>,
    };

    invoices.forEach((invoice) => {
      summary.total_sales_usd += invoice.total_usd;
      summary.total_sales_ves += invoice.total_ves;

      const method = invoice.payment_method || 'unknown';
      if (!summary.by_payment_method[method]) {
        summary.by_payment_method[method] = { count: 0, total_usd: 0, total_ves: 0 };
      }
      summary.by_payment_method[method].count += 1;
      summary.by_payment_method[method].total_usd += invoice.total_usd;
      summary.by_payment_method[method].total_ves += invoice.total_ves;
    });

    if (invoices.length > 0) {
      summary.average_ticket_usd = summary.total_sales_usd / invoices.length;
      summary.average_ticket_ves = summary.total_sales_ves / invoices.length;
    }

    return summary;
  }

  /**
   * Get daily sales for chart
   */
  static async getDailySales(days: number = 30): Promise<DailySalesReport[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const { data, error } = await supabase
      .from('invoices')
      .select('created_at, total_usd, total_ves')
      .eq('status', 'paid')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const grouped = (data as Invoice[]).reduce((acc, invoice) => {
      const date = invoice.created_at.split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          sales_usd: 0,
          sales_ves: 0,
          transactions: 0,
        };
      }
      acc[date].sales_usd += invoice.total_usd;
      acc[date].sales_ves += invoice.total_ves;
      acc[date].transactions += 1;
      return acc;
    }, {} as Record<string, DailySalesReport>);

    // Fill missing dates with zeros
    const result: DailySalesReport[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      result.push(grouped[dateStr] || {
        date: dateStr,
        sales_usd: 0,
        sales_ves: 0,
        transactions: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  /**
   * Export sales to CSV
   */
  static async exportSalesToCSV(startDate: string, endDate: string): Promise<string> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const invoices = data as Invoice[];

    // CSV Header
    let csv = 'Fecha,Número de Factura,Método de Pago,Subtotal USD,IVA USD,Total USD,Subtotal VES,IVA VES,Total VES\n';

    // CSV Rows
    invoices.forEach((invoice) => {
      const date = new Date(invoice.created_at).toLocaleDateString();
      csv += `${date},${invoice.invoice_number},${invoice.payment_method},`;
      csv += `${invoice.subtotal_usd},${invoice.iva_usd},${invoice.total_usd},`;
      csv += `${invoice.subtotal_ves},${invoice.iva_ves},${invoice.total_ves}\n`;
    });

    return csv;
  }

  /**
   * Get inventory valuation
   */
  static async getInventoryValuation() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        sku,
        cost_price_usd,
        cost_price_ves,
        sale_price_usd,
        sale_price_ves,
        batches (quantity)
      `);

    if (error) throw error;

    const products = data as any[];

    let total_cost_usd = 0;
    let total_cost_ves = 0;
    let total_sale_usd = 0;
    let total_sale_ves = 0;
    let total_units = 0;

    products.forEach((product) => {
      const stock = product.batches?.reduce((sum: number, batch: any) => sum + batch.quantity, 0) || 0;
      total_units += stock;
      total_cost_usd += product.cost_price_usd * stock;
      total_cost_ves += product.cost_price_ves * stock;
      total_sale_usd += product.sale_price_usd * stock;
      total_sale_ves += product.sale_price_ves * stock;
    });

    return {
      total_units,
      total_cost_usd,
      total_cost_ves,
      total_sale_usd,
      total_sale_ves,
      potential_profit_usd: total_sale_usd - total_cost_usd,
      potential_profit_ves: total_sale_ves - total_cost_ves,
    };
  }
}
