import { ProductsService } from './products.service';
import { BatchesService } from './batches.service';

export type AlertType = 'low_stock' | 'expiring_soon' | 'expired' | 'out_of_stock';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  product_id?: string;
  batch_id?: string;
  product_name?: string;
  sku?: string;
  quantity?: number;
  expiry_date?: string;
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

export class AlertsService {
  /**
   * Generate all alerts automatically
   */
  static async generateAlerts(): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // 1. Low stock alerts
    const lowStockProducts = await ProductsService.getLowStock();
    for (const product of lowStockProducts) {
      const stock = product.stock_actual || 0;
      const minStock = product.min_stock || 0;
      
      let priority: AlertPriority = 'medium';
      if (stock === 0) {
        priority = 'critical';
      } else if (stock < minStock * 0.5) {
        priority = 'high';
      }

      alerts.push({
        id: `low-stock-${product.id}`,
        type: stock === 0 ? 'out_of_stock' : 'low_stock',
        priority,
        title: stock === 0 ? 'Producto sin stock' : 'Stock bajo',
        message: stock === 0 
          ? `${product.name} está agotado`
          : `${product.name} tiene solo ${stock} unidades (mínimo: ${minStock})`,
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        quantity: stock,
        created_at: new Date().toISOString(),
        resolved: false,
      });
    }

    // 2. Expiring soon alerts
    const expiringBatches = await BatchesService.getExpiringSoon(30);
    for (const batch of expiringBatches) {
      const daysUntilExpiry = Math.ceil(
        (new Date(batch.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      let priority: AlertPriority = 'low';
      if (daysUntilExpiry <= 7) {
        priority = 'high';
      } else if (daysUntilExpiry <= 15) {
        priority = 'medium';
      }

      alerts.push({
        id: `expiring-${batch.id}`,
        type: 'expiring_soon',
        priority,
        title: 'Producto próximo a vencer',
        message: `Lote ${batch.lot_number} de ${(batch as any).product?.name || 'producto'} vence en ${daysUntilExpiry} días`,
        product_id: batch.product_id,
        batch_id: batch.id,
        product_name: (batch as any).product?.name,
        sku: (batch as any).product?.sku,
        quantity: batch.quantity,
        expiry_date: batch.expiry_date,
        created_at: new Date().toISOString(),
        resolved: false,
      });
    }

    // 3. Expired alerts
    const expiredBatches = await BatchesService.getExpired();
    for (const batch of expiredBatches) {
      alerts.push({
        id: `expired-${batch.id}`,
        type: 'expired',
        priority: 'critical',
        title: 'Producto vencido',
        message: `Lote ${batch.lot_number} de ${(batch as any).product?.name || 'producto'} está vencido`,
        product_id: batch.product_id,
        batch_id: batch.id,
        product_name: (batch as any).product?.name,
        sku: (batch as any).product?.sku,
        quantity: batch.quantity,
        expiry_date: batch.expiry_date,
        created_at: new Date().toISOString(),
        resolved: false,
      });
    }

    return alerts;
  }

  /**
   * Get all active alerts
   */
  static async getActive(): Promise<Alert[]> {
    return this.generateAlerts();
  }

  /**
   * Get alerts by type
   */
  static async getByType(type: AlertType): Promise<Alert[]> {
    const allAlerts = await this.generateAlerts();
    return allAlerts.filter(alert => alert.type === type);
  }

  /**
   * Get alerts by priority
   */
  static async getByPriority(priority: AlertPriority): Promise<Alert[]> {
    const allAlerts = await this.generateAlerts();
    return allAlerts.filter(alert => alert.priority === priority);
  }

  /**
   * Get alert counts by type
   */
  static async getCounts() {
    const alerts = await this.generateAlerts();
    
    return {
      total: alerts.length,
      critical: alerts.filter(a => a.priority === 'critical').length,
      high: alerts.filter(a => a.priority === 'high').length,
      medium: alerts.filter(a => a.priority === 'medium').length,
      low: alerts.filter(a => a.priority === 'low').length,
      by_type: {
        low_stock: alerts.filter(a => a.type === 'low_stock').length,
        out_of_stock: alerts.filter(a => a.type === 'out_of_stock').length,
        expiring_soon: alerts.filter(a => a.type === 'expiring_soon').length,
        expired: alerts.filter(a => a.type === 'expired').length,
      },
    };
  }
}
