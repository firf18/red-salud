export type PaymentMethod = 'cash' | 'card' | 'pago_movil' | 'zelle' | 'biopago' | 'crypto' | 'transfer' | 'mixed';
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'cancelled' | 'refunded';

export interface Invoice {
  id: string;
  invoice_number: string;
  fiscal_control_number?: string;
  patient_id?: string;
  warehouse_id: string;
  user_id: string;
  status: InvoiceStatus;
  
  // Totals
  subtotal_usd: number;
  subtotal_ves: number;
  iva_usd: number;
  iva_ves: number;
  total_usd: number;
  total_ves: number;
  
  // Payment
  payment_method: PaymentMethod;
  payment_details?: Record<string, any>;
  
  // Exchange rate at time of sale
  exchange_rate: number;
  
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  batch_id?: string;
  product_name: string;
  generic_name?: string;
  quantity: number;
  unit_type: string;
  unit_price_usd: number;
  unit_price_ves: number;
  total_usd: number;
  total_ves: number;
  iva_rate: number;
  iva_usd: number;
  iva_ves: number;
  created_at: string;
}

export interface CreateInvoiceInput {
  patient_id?: string;
  warehouse_id: string;
  payment_method: PaymentMethod;
  payment_details?: Record<string, any>;
  exchange_rate: number;
  notes?: string;
  items: CreateInvoiceItemInput[];
}

export interface CreateInvoiceItemInput {
  product_id: string;
  batch_id?: string;
  quantity: number;
}
