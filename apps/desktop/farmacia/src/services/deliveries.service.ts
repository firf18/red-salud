/**
 * Servicio de Entregas a Domicilio (Last Mile)
 * Gestiona el seguimiento de pedidos para clientes
 */

import { supabase } from '@/lib/supabase';

export interface CustomerDelivery {
    id: string;
    pharmacy_id: string;
    invoice_id?: string;
    customer_name: string;
    customer_phone?: string;
    delivery_address: string;
    city?: string;
    delivery_notes?: string;
    status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
    delivery_person_name?: string;
    delivery_person_phone?: string;
    estimated_delivery_time?: string;
    actual_delivery_time?: string;
    created_at: string;
    updated_at: string;
}

export const deliveriesService = {
    /**
     * Obtener todas las entregas de la farmacia
     */
    async getAll(): Promise<CustomerDelivery[]> {
        const { data, error } = await supabase
            .from('customer_deliveries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as CustomerDelivery[];
    },

    /**
     * Obtener una entrega por ID
     */
    async getById(id: string): Promise<CustomerDelivery> {
        const { data, error } = await supabase
            .from('customer_deliveries')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as CustomerDelivery;
    },

    /**
     * Crear una nueva solicitud de entrega
     */
    async create(delivery: Partial<CustomerDelivery>): Promise<CustomerDelivery> {
        const { data, error } = await supabase
            .from('customer_deliveries')
            .insert(delivery)
            .select()
            .single();

        if (error) throw error;
        return data as CustomerDelivery;
    },

    /**
     * Actualizar el estado de una entrega
     */
    async updateStatus(id: string, status: CustomerDelivery['status'], metadata?: Partial<CustomerDelivery>): Promise<CustomerDelivery> {
        const updateData: any = { status, updated_at: new Date().toISOString() };

        if (status === 'delivered') {
            updateData.actual_delivery_time = new Date().toISOString();
        }

        if (metadata) {
            Object.assign(updateData, metadata);
        }

        const { data, error } = await supabase
            .from('customer_deliveries')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as CustomerDelivery;
    },

    /**
     * Obtener estadísticas de entregas
     */
    async getStats() {
        const { data, error } = await supabase
            .from('customer_deliveries')
            .select('status');

        if (error) throw error;

        const stats = {
            total: data.length,
            pending: data.filter(d => d.status === 'pending').length,
            in_transit: data.filter(d => d.status === 'in_transit').length,
            delivered: data.filter(d => d.status === 'delivered').length,
            failed: data.filter(d => d.status === 'failed' || d.status === 'cancelled').length,
        };

        return stats;
    }
};
