import { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Plus,
  Loader2,
  Navigation,
  Calendar
} from 'lucide-react';
import { deliveriesService, CustomerDelivery } from '@/services/deliveries.service';
import { toast } from 'sonner';

export default function EntregasPage() {
  const [deliveries, setDeliveries] = useState<CustomerDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    setIsLoading(true);
    try {
      const data = await deliveriesService.getAll();
      setDeliveries(data);
    } catch (error) {
      console.error('Error loading deliveries:', error);
      toast.error('Error al cargar entregas');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statuses = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
      assigned: { label: 'Asignado', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: User },
      in_transit: { label: 'En Camino', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Navigation },
      delivered: { label: 'Entregado', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
      failed: { label: 'Fallido', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
      cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: AlertCircle },
    };
    return statuses[status as keyof typeof statuses] || statuses.pending;
  };

  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = d.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.delivery_address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || d.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Truck className="h-8 w-8 text-primary" />
              Entregas a Domicilio
            </h1>
            <p className="text-muted-foreground mt-1">
              Seguimiento de pedidos y logística de última milla
            </p>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" />
            Nueva Solicitud
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por cliente o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 border-none rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="in_transit">En Camino</option>
            <option value="delivered">Entregados</option>
            <option value="failed">Fallidos</option>
          </select>

          <button
            onClick={loadDeliveries}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Clock className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Cargando entregas...</p>
          </div>
        ) : filteredDeliveries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeliveries.map((delivery) => {
              const status = getStatusInfo(delivery.status);
              const StatusIcon = status.icon;

              return (
                <div
                  key={delivery.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
                >
                  {/* Status Bar */}
                  <div className={`h-1.5 w-full ${status.color.split(' ')[0]}`} />

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-lg ${status.color}`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {delivery.customer_name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4" />
                      {new Date(delivery.created_at).toLocaleString()}
                    </div>

                    <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {delivery.delivery_address}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {delivery.customer_phone || 'Sin teléfono'}
                        </p>
                      </div>
                    </div>

                    {delivery.delivery_person_name && (
                      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-xs">
                          <p className="text-muted-foreground">Repartidor:</p>
                          <p className="font-bold text-gray-900 dark:text-white">{delivery.delivery_person_name}</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex gap-2">
                      <button className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-2 rounded-lg transition-colors text-sm">
                        Detalles
                      </button>
                      <button className="px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors">
                        <Navigation className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <Truck className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-medium">No se encontraron entregas</h3>
            <p className="text-muted-foreground mt-2">No hay pedidos pendientes por entregar</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4">
        <div className="flex justify-around items-center max-w-4xl mx-auto text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{deliveries.length}</p>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Total</p>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
          <div>
            <p className="text-2xl font-bold text-yellow-500">
              {deliveries.filter(d => d.status === 'pending' || d.status === 'assigned').length}
            </p>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Pendientes</p>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
          <div>
            <p className="text-2xl font-bold text-purple-500">
              {deliveries.filter(d => d.status === 'in_transit').length}
            </p>
            <p className="text-xs text-muted-foreground uppercase font-semibold">En Camino</p>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
          <div>
            <p className="text-2xl font-bold text-green-500">
              {deliveries.filter(d => d.status === 'delivered').length}
            </p>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Entregados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
