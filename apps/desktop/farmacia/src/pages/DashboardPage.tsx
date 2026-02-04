import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  TrendingUp,
  Loader2,
  Clock
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useInvoices } from '@/hooks/useInvoices';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { getFullName } = useAuthStore();
  
  // Load data
  const { lowStockProducts, expiringProducts, isLoadingLowStock, isLoadingExpiring } = useProducts();
  const { todaySales, invoices, isLoadingTodaySales, isLoading: isLoadingInvoices } = useInvoices({
    startDate: new Date().toISOString().split('T')[0],
  });

  const isLoading = isLoadingLowStock || isLoadingExpiring || isLoadingTodaySales || isLoadingInvoices;

  // Calculate stats
  const stats = [
    {
      name: 'Ventas Hoy',
      value: `$${todaySales.usd.toFixed(2)}`,
      subValue: `Bs. ${todaySales.ves.toFixed(2)}`,
      change: `${todaySales.count} transacciones`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Transacciones',
      value: todaySales.count.toString(),
      change: 'Hoy',
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      name: 'Productos Bajo Stock',
      value: lowStockProducts.length.toString(),
      change: 'Requieren atención',
      icon: Package,
      color: 'bg-orange-500',
    },
    {
      name: 'Por Vencer',
      value: expiringProducts.length.toString(),
      change: 'Próximos 30 días',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  // Recent sales (last 5)
  const recentSales = invoices.slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Bienvenido, {getFullName()}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Clock className="h-4 w-4" />
          {new Date().toLocaleDateString('es-VE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div 
            key={stat.name} 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </h3>
            {stat.subValue && (
              <p className="text-sm text-muted-foreground mb-1">{stat.subValue}</p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Ventas Recientes
            </h2>
            <button 
              onClick={() => navigate('/ventas')}
              className="text-primary text-sm font-medium hover:underline"
            >
              Ver todas
            </button>
          </div>
          
          {recentSales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay ventas registradas hoy</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div 
                  key={sale.id} 
                  className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {sale.invoice_number}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(sale.created_at).toLocaleTimeString('es-VE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${sale.total_usd.toFixed(2)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Bs. {sale.total_ves.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/caja')}
              className="flex flex-col items-center justify-center p-6 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <ShoppingCart className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Nueva Venta
              </span>
            </button>
            
            <button 
              onClick={() => navigate('/inventario')}
              className="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Package className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Inventario
              </span>
            </button>
            
            <button 
              onClick={() => navigate('/reportes')}
              className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Reportes
              </span>
            </button>
            
            <button 
              onClick={() => navigate('/alertas')}
              className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Alertas
              </span>
              {(lowStockProducts.length + expiringProducts.length) > 0 && (
                <span className="mt-1 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                  {lowStockProducts.length + expiringProducts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(lowStockProducts.length > 0 || expiringProducts.length > 0) && (
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Alertas de Inventario
              </h3>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {lowStockProducts.length > 0 && (
                  <p>• {lowStockProducts.length} productos con stock bajo</p>
                )}
                {expiringProducts.length > 0 && (
                  <p>• {expiringProducts.length} productos próximos a vencer</p>
                )}
              </div>
              <button 
                onClick={() => navigate('/alertas')}
                className="mt-3 text-sm font-medium text-yellow-700 dark:text-yellow-400 hover:underline"
              >
                Ver detalles →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
