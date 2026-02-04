import { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Download,
  Calendar,
  Loader2,
  BarChart3,
  PieChart,
  ShoppingCart,
} from 'lucide-react';
import { useSalesSummary, useReports } from '@/hooks/useReports';
import { ReportsService } from '@/services/reports.service';

export default function ReportesPage() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const { data: summary, isLoading: isLoadingSummary } = useSalesSummary(startDate, endDate);
  const { dailySales, topProducts, inventoryValuation, isLoadingDailySales, isLoadingTopProducts, isLoadingValuation } = useReports();

  const handleExportSales = async () => {
    try {
      const csv = await ReportsService.exportSalesToCSV(startDate, endDate);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ventas_${startDate}_${endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting sales:', error);
      alert('Error al exportar ventas');
    }
  };

  const isLoading = isLoadingSummary || isLoadingDailySales || isLoadingTopProducts || isLoadingValuation;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reportes y Estadísticas
            </h1>
            <p className="text-muted-foreground mt-1">
              Análisis de ventas e inventario
            </p>
          </div>
          <button
            onClick={handleExportSales}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar Ventas
          </button>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Período:</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700"
          />
          <span className="text-sm text-muted-foreground">hasta</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Ventas</span>
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${summary?.total_sales_usd.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Bs. {summary?.total_sales_ves.toFixed(2) || '0.00'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Transacciones</span>
                  <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary?.total_transactions || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Promedio: ${summary?.average_ticket_usd.toFixed(2) || '0.00'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Stock Total</span>
                  <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {inventoryValuation?.total_units || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  unidades
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Valor Inventario</span>
                  <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${inventoryValuation?.total_cost_usd.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Bs. {inventoryValuation?.total_cost_ves.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ventas Últimos 30 Días
              </h3>
              {dailySales && dailySales.length > 0 ? (
                <div className="space-y-2">
                  {dailySales.slice(-10).map((day) => (
                    <div key={day.date} className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground w-24">
                        {new Date(day.date).toLocaleDateString()}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            ${day.sales_usd.toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {day.transactions} ventas
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: `${Math.min((day.sales_usd / Math.max(...dailySales.map(d => d.sales_usd))) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos de ventas para mostrar
                </p>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Productos Más Vendidos
              </h3>
              {topProducts && topProducts.length > 0 ? (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.product_id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {product.product_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {product.quantity_sold} unidades vendidas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${product.total_usd.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Bs. {product.total_ves.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos de productos vendidos
                </p>
              )}
            </div>

            {/* Payment Methods */}
            {summary?.by_payment_method && Object.keys(summary.by_payment_method).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Métodos de Pago
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(summary.by_payment_method).map(([method, data]) => (
                    <div key={method} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {data.count}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize mt-1">
                        {method.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        ${data.total_usd.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inventory Valuation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Valorización de Inventario
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Costo Total</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ${inventoryValuation?.total_cost_usd.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor de Venta</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ${inventoryValuation?.total_sale_usd.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ganancia Potencial</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    ${inventoryValuation?.potential_profit_usd.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
