export type AlertType = 'stock_low' | 'expiry_soon' | 'expired' | 'system' | 'security';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'resolved' | 'dismissed';

export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  title: string;
  message: string;
  product_id?: string;
  batch_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}
