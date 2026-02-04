/**
 * Servicio de Compras y Órdenes de Pedido
 * Gestiona el ciclo de vida de las compras a proveedores
 */

import { supabase } from '@/lib/supabase';

export interface PurchaseOrder {
    id: string;
    pharmacy_id: string;
    po_number: string;
    supplier_id: string;
    supplier?: {
        name: string;
    };
    order_date: string;
    expected_delivery_date?: string;
    subtotal_usd: number;
    tax_usd: number;
    total_usd: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    notes?: string;
    items: PurchaseOrderItem[];
    created_at: string;
    updated_at: string;
}

export interface PurchaseOrderItem {
    id: string;
    purchase_order_id: string;
    product_id: string;
    product?: {
        name: string;
        sku: string;
    };
    quantity: number;
    unit_price_usd: number;
    total_price_usd: number;
}

export const purchasesService = {
    /**
     * Obtener todas las órdenes de compra
     */
    async getAll(): Promise<PurchaseOrder[]> {
        const { data, error } = await supabase
            .from('purchase_orders')
            .select(`
        *,
        supplier:suppliers(name)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as PurchaseOrder[];
    },

    /**
     * Obtener una orden por ID con sus items
     */
    async getById(id: string): Promise<PurchaseOrder> {
        const { data, error } = await supabase
            .from('purchase_orders')
            .select(`
        *,
        supplier:suppliers(name),
        items:purchase_order_items(
          *,
          product:products(name, sku)
        )
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as PurchaseOrder;
    },

    /**
     * Crear nueva orden de compra
     */
    async create(order: Partial<PurchaseOrder>, items: Partial<PurchaseOrderItem>[]): Promise<PurchaseOrder> {
        // 1. Insertar la cabecera de la orden
        const { data: orderData, error: orderError } = await supabase
            .from('purchase_orders')
            .insert({
                ...order,
                po_number: `PO-${Date.now()}`,
                status: 'pending'
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Insertar los items
        if (items && items.length > 0) {
            const itemsToInsert = items.map(item => ({
                ...item,
                purchase_order_id: orderData.id
            }));

            const { error: itemsError } = await supabase
                .from('purchase_order_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;
        }

        return await this.getById(orderData.id);
    },

    /**
     * Actualizar estado de la orden
     */
    async updateStatus(id: string, status: PurchaseOrder['status']): Promise<void> {
        const { error } = await supabase
            .from('purchase_orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Recibir mercancía (actualiza stock)
     * En un sistema real, esto crearía lotes (batches) automáticamente
     */
    async receiveOrder(orderId: string, warehouseId: string): Promise<void> {
        const order = await this.getById(orderId);

        // Solo permitir recibir si no fue recibida antes
        if (order.status === 'delivered') {
            throw new Error('Esta orden ya fue recibida');
        }

        // Por cada item, actualizar el stock o crear un movimiento
        for (const item of order.items) {
            // 1. Aumentar stock_actual en products
            const { error: productError } = await supabase.rpc('increment_product_stock', {
                p_id: item.product_id,
                p_quantity: item.quantity
            });

            if (productError) throw productError;

            // 2. Opcional: Crear un batch genérico para recibir la mercancía
            // ... lógica de lotes ...
        }

        // 3. Marcar orden como entregada/recibida
        await this.updateStatus(orderId, 'delivered');
    }
};
