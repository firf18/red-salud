export type InventoryZone = 'available' | 'quarantine' | 'rejected' | 'approved' | 'damaged';

export interface Batch {
  id: string;
  product_id: string;
  lot_number: string;
  expiry_date: string;
  manufacturing_date?: string;
  warehouse_id: string;
  location?: string;
  zone: InventoryZone;
  quantity: number;
  original_quantity: number;
  received_at: string;
  supplier_id?: string;
  created_at: string;
  updated_at: string;
}
