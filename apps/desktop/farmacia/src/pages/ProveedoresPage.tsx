import { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Loader2,
  FileText,
} from 'lucide-react';
import { suppliersService, Supplier } from '@/services/suppliers.service';
import { purchasesService, PurchaseOrder } from '@/services/purchases.service';
import { toast } from 'sonner';

export default function ProveedoresPage() {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'orders'>('suppliers');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [suppliersData, ordersData] = await Promise.all([
        suppliersService.getAll(),
        purchasesService.getAll()
      ]);
      setSuppliers(suppliersData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Gestión de Proveedores
            </h1>
            <p className="text-muted-foreground mt-1">
              Administra tu cadena de suministro y órdenes de compra
            </p>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" />
            {activeTab === 'suppliers' ? 'Nuevo Proveedor' : 'Nueva Orden'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'suppliers'
              ? 'bg-primary text-white shadow-md'
              : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            Proveedores
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'orders'
              ? 'bg-primary text-white shadow-md'
              : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            Órdenes de Compra
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={activeTab === 'suppliers' ? "Buscar proveedores..." : "Buscar órdenes..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Cargando información...</p>
          </div>
        ) : activeTab === 'suppliers' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-all group hover:shadow-xl dark:hover:shadow-primary/5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${supplier.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {supplier.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {supplier.name}
                  </h3>

                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{supplier.email || 'Sin correo'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4" />
                      <span>{supplier.phone || 'Sin teléfono'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{supplier.address || 'Sin dirección'}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t dark:border-gray-700 flex justify-between items-center">
                    <div className="text-xs">
                      <p className="text-muted-foreground">Contacto:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {supplier.contact_person || 'N/A'}
                      </p>
                    </div>
                    <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No se encontraron proveedores</h3>
                <p className="text-muted-foreground mt-2">Intenta con otro término de búsqueda</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Orden #</th>
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Total (USD)</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium text-gray-900 dark:text-white">{order.po_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {order.supplier?.name}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        ${order.total_usd.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No hay órdenes de compra registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4">
        <div className="flex justify-around items-center max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Proveedores</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{suppliers.length}</p>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:border-gray-700" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Órdenes Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}
            </p>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:border-gray-700" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Entregas Recibidas</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {orders.filter(o => o.status === 'delivered').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
