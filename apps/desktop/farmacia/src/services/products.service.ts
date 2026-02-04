import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product.types';

export class ProductsService {
  /**
   * Get all products with their batches
   */
  static async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        batches (
          id,
          lot_number,
          expiry_date,
          quantity,
          warehouse_id,
          zone
        )
      `)
      .order('name');

    if (error) throw error;
    return data as Product[];
  }

  /**
   * Get product by ID
   */
  static async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        batches (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Product;
  }

  /**
   * Search products by name, SKU, or barcode
   */
  static async search(query: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        batches!inner (
          id,
          lot_number,
          expiry_date,
          quantity,
          zone
        )
      `)
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.eq.${query},generic_name.ilike.%${query}%,active_ingredient.ilike.%${query}%`)
      .eq('batches.zone', 'available')
      .gt('batches.quantity', 0)
      .limit(20);

    if (error) throw error;
    
    // Calculate total stock from batches
    return (data as Product[]).map(product => ({
      ...product,
      stock_actual: product.batches?.reduce((sum, batch) => sum + batch.quantity, 0) || 0,
    }));
  }

  /**
   * Get products with low stock
   */
  static async getLowStock(threshold: number = 10) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        batches!inner (
          quantity
        )
      `)
      .lte('min_stock', threshold);

    if (error) throw error;
    
    // Filter products where total stock is below min_stock
    return (data as Product[]).filter(product => {
      const totalStock = product.batches?.reduce((sum, batch) => sum + batch.quantity, 0) || 0;
      return totalStock <= product.min_stock;
    });
  }

  /**
   * Get products expiring soon
   */
  static async getExpiringSoon(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        batches!inner (
          id,
          lot_number,
          expiry_date,
          quantity
        )
      `)
      .lte('batches.expiry_date', futureDate.toISOString())
      .gt('batches.quantity', 0)
      .order('batches.expiry_date', { ascending: true });

    if (error) throw error;
    return data as Product[];
  }

  /**
   * Get products by category
   */
  static async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('name');

    if (error) throw error;
    return data as Product[];
  }

  /**
   * Create new product
   */
  static async create(product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  }

  /**
   * Update product
   */
  static async update(id: string, product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  }

  /**
   * Delete product (soft delete)
   */
  static async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Get product stock by warehouse
   */
  static async getStockByWarehouse(productId: string) {
    const { data, error } = await supabase
      .from('batches')
      .select(`
        warehouse_id,
        quantity,
        warehouses (
          name,
          code
        )
      `)
      .eq('product_id', productId)
      .gt('quantity', 0);

    if (error) throw error;
    return data;
  }
}
