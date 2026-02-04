/**
 * Servicio de Proveedores
 * Gestiona todas las operaciones CRUD de proveedores de la farmacia
 */

import { supabase } from '@/lib/supabase';

export interface Supplier {
    id: string;
    pharmacy_id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    tax_id?: string;
    bank_account?: string;
    contact_person?: string;
    contact_phone?: string;
    payment_terms?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const suppliersService = {
    /**
     * Obtener todos los proveedores
     */
    async getAll(): Promise<Supplier[]> {
        const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .order('name');

        if (error) throw error;
        return data as Supplier[];
    },

    /**
     * Obtener un proveedor por ID
     */
    async getById(id: string): Promise<Supplier> {
        const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Supplier;
    },

    /**
     * Crear un nuevo proveedor
     */
    async create(supplier: Partial<Supplier>): Promise<Supplier> {
        const { data, error } = await supabase
            .from('suppliers')
            .insert(supplier)
            .select()
            .single();

        if (error) throw error;
        return data as Supplier;
    },

    /**
     * Actualizar un proveedor
     */
    async update(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
        const { data, error } = await supabase
            .from('suppliers')
            .update({ ...supplier, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Supplier;
    },

    /**
     * Eliminar un proveedor (soft delete o hard delete según RLS)
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('suppliers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
