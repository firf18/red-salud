export type ProductType = 'medicine' | 'supply' | 'food' | 'cosmetic' | 'equipment';
export type ProductCategory = 
  | 'analgesic' 
  | 'antibiotic' 
  | 'antihypertensive' 
  | 'diabetes'
  | 'cardiovascular' 
  | 'vitamins' 
  | 'dermatology' 
  | 'respiratory'
  | 'gastrointestinal' 
  | 'psychotropic' 
  | 'controlled' 
  | 'other';

export type UnitType = 'unit' | 'box' | 'blister' | 'pack' | 'bottle' | 'tube';

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  generic_name?: string;
  active_ingredient?: string;
  description?: string;
  product_type: ProductType;
  category: ProductCategory;
  manufacturer?: string;
  brand?: string;
  
  // Pricing
  cost_price_usd: number;
  cost_price_ves: number;
  sale_price_usd: number;
  sale_price_ves: number;
  wholesale_price_usd?: number;
  wholesale_price_ves?: number;
  
  // Tax
  iva_rate: number;
  iva_exempt: boolean;
  
  // Inventory
  min_stock: number;
  max_stock: number;
  reorder_point: number;
  stock_actual?: number;
  
  // Units
  unit_type: UnitType;
  units_per_box: number;
  allow_fractional_sale: boolean;
  
  // Control flags
  requires_prescription: boolean;
  controlled_substance: boolean;
  psychotropic: boolean;
  refrigerated: boolean;
  
  // Metadata
  image_url?: string;
  tags?: string[];
  
  // Tracking
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Relations (imported from batch.types)
  batches?: import('./batch.types').Batch[];
}
