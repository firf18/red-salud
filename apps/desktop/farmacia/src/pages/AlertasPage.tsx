import { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  XCircle,
  Package,
  Filter,
  Loader2,
  Calendar,
  TrendingDown,
} from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import type { AlertType, AlertPriority } from '@/services/alerts.service';

export default function AlertasPage() {
  const { alerts, counts, isLoading, refetch } = useAlerts();
  const [filterType, setFilterType] = useState<AlertType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<AlertPriority | 'all'>('all');

  const filteredAlerts = alerts.filter((alert) => {
    if (filterType !== 'all' && alert.type !== filterType) return false;
    if (filterPriority !== 'all' && alert.priority !== filterPriority) return false;
    return true;
  });

  const getPriorityColor = (priority: AlertPriority) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    };
    return colors[priority];
  };

  const getPriorityIcon = (priority: AlertPriority) => {
    const icons = {
      critical: XCircle,
      high: AlertTriangle,
      medium: AlertCircle,
      low: Clock,
    };
    const Icon = icons[priority];
    return <Icon className="h-5 w-5" />;
  };

  const getTypeIcon = (type: AlertType) => {
    const icons = {
      low_stock: TrendingDown,
      out_of_stock: XCircle,
      expiring_soon: Clock,
      expired: Calendar,
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

  const getTypeLabel = (type: AlertType) => {
    const labels = {
      low_stock: 'Stock Bajo',
      out_of_stock: 'Sin Stock',
      expiring_soon: 'Próximo a Vencer',
      expired: 'Vencido',
    };
    return labels[type];
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Alertas del Sistema
            </h1>
            <p className="text-muted-foreground mt-1">
              Notificaciones y avisos importantes
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Actualizar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {counts.total}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Críticas</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {counts.critical}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Altas</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {counts.high}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Medias</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {counts.medium}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Bajas</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {counts.low}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as AlertType | 'all')}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700"
          >
            <option value="all">Todos los tipos</option>
            <option value="out_of_stock">Sin Stock</option>
            <option value="low_stock">Stock Bajo</option>
            <option value="expiring_soon">Próximo a Vencer</option>
            <option value="expired">Vencido</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as AlertPriority | 'all')}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700"
          >
            <option value="all">Todas las prioridades</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          <span className="text-sm text-muted-foreground">
            {filteredAlerts.length} alertas
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No hay alertas
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {filterType !== 'all' || filterPriority !== 'all'
                ? 'No se encontraron alertas con los filtros seleccionados'
                : '¡Todo está en orden! No hay alertas activas en este momento'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg p-4 border-l-4 ${getPriorityColor(alert.priority)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {getPriorityIcon(alert.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {alert.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {alert.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-white/50 dark:bg-gray-800/50">
                          {getTypeIcon(alert.type)}
                          {getTypeLabel(alert.type)}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {alert.product_name && (
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span>{alert.product_name}</span>
                        </div>
                      )}
                      {alert.sku && (
                        <div className="flex items-center gap-1">
                          <span className="font-mono">{alert.sku}</span>
                        </div>
                      )}
                      {alert.quantity !== undefined && (
                        <div className="flex items-center gap-1">
                          <span>Stock: {alert.quantity}</span>
                        </div>
                      )}
                      {alert.expiry_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Vence: {new Date(alert.expiry_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
