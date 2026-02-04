import { supabase } from '@/lib/supabase';
import type { Batch } from '@/types/batch.types';

export class BatchesService {
  /**
   * Get all batches with product info
   */
  static async getAll() {
    const { data, error } = await supabase
      .from('batches')
      .select(`
        *,
        product:products (
          id,
          name,
          sku,
          generic_name
        )
      `)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data as Batch[];
  }

  /**
   * Get batches by product ID
   */
  static async getByProductId(productId: string) {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('product_id', productId)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data as Batch[];
  }

  /**
   * Get batch by ID
   */
  static async getById(id: string) {
    const { data, error } = await supabase
      .from('batches')
      .select(`
        *,
        product:products (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Batch;
  }

  /**
   * Get batches expiring soon (within days)
   */
  static async getExpiringSoon(days: number = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const { data, error } = await supabase
      .from('batches')
      .select(`
        *,
        product:products (
          id,
          name,
          sku,
          generic_name
        )
      `)
      .gte('expiry_date', today.toISOString().split('T')[0])
      .lte('expiry_date', futureDate.toISOString().split('T')[0])
      .gt('quantity', 0)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data as Batch[];
  }

  /**
   * Get expired batches
   */
  static async getExpired() {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('batches')
      .select(`
        *,
        product:products (
          id,
          name,
          sku,
          generic_name
        )
      `)
      .lt('expiry_date', today)
      .gt('quantity', 0)
      .order('expiry_date', { ascending: false });

    if (error) throw error;
    return data as Batch[];
  }

  /**
   * Create new batch
   */
  static async create(batch: Partial<Batch>) {
    const { data, error } = await supabase
      .from('batches')
      .insert({
        ...batch,
        original_quantity: batch.quantity,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Batch;
  }

  /**
   * Update batch
   */
  static async update(id: string, batch: Partial<Batch>) {
    const { data, error } = await supabase
      .from('batches')
      .update(batch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Batch;
  }

  /**
   * Delete batch
   */
  static async delete(id: string) {
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Get batches by warehouse
   */
  static async getByWarehouse(warehouseId: string) {
    const { data, error } = await supabase
      .from('batches')
      .select(`
        *,
        product:products (
          id,
          name,
          sku,
          generic_name
        )
      `)
      .eq('warehouse_id', warehouseId)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data as Batch[];
  }

  /**
   * Get batches by zone
   */
  static async getByZone(zone: string) {
    const { data, error } = await supabase
      .from('batches')
      .select(`
        *,
        product:products (
          id,
          name,
          sku,
          generic_name
        )
      `)
      .eq('zone', zone)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data as Batch[];
  }
}
