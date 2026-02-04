import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Calendar,
  Package,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { ProductsService } from '@/services/products.service';
import { toast } from 'sonner';
import { usePrescriptions, usePrescriptionStats, useDispensePrescription, useCancelPrescription } from '@/hooks/usePrescriptions';
import { prescriptionsService } from '@/services/prescriptions.service';

export default function RecetasPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { setPrescription, clearCart, addItem } = useCartStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'dispensed' | 'cancelled'>('all');

  // Obtener datos reales de Supabase
  const { data: prescriptions = [], isLoading, error } = usePrescriptions({
    status: filterStatus,
    search: searchTerm,
  });
  const { data: stats } = usePrescriptionStats();
  const dispenseMutation = useDispensePrescription();
  const cancelMutation = useCancelPrescription();

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      dispensed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      dispensed: CheckCircle,
      cancelled: XCircle,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendiente',
      dispensed: 'Dispensada',
      cancelled: 'Cancelada',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleDispense = async (prescriptionId: string) => {
    try {
      const prescription = prescriptions.find(p => p.id === prescriptionId);
      if (!prescription) return;

      // 1. Limpiar carrito actual y preparar para receta
      clearCart();
      setPrescription(prescription);

      // 2. Cargar productos de la receta al carrito
      let itemsAdded = 0;
      for (const item of prescription.items) {
        try {
          // Obtener detalles completos del producto para el carrito
          const fullProduct = await ProductsService.getById(item.product_id);
          if (addItem(fullProduct, item.quantity, item.id)) {
            itemsAdded++;
          }
        } catch (err) {
          console.error(`Error al cargar producto ${item.product_id}:`, err);
          toast.error(`No se pudo cargar el producto: ${item.product?.name || 'Desconocido'}`);
        }
      }

      if (itemsAdded > 0) {
        toast.success(`${itemsAdded} productos de la receta cargados al carrito`);
        // 3. Navegar al POS
        navigate('/caja');
      } else {
        toast.error('No se pudo cargar ningún producto de la receta al carrito');
        setPrescription(null);
      }
    } catch (err) {
      console.error('Error en el proceso de dispensación:', err);
      toast.error('Error al procesar la receta');
    }
  };

  const handleCancel = async (prescriptionId: string) => {
    const reason = prompt('Motivo de cancelación:');
    if (!reason) return;

    await cancelMutation.mutateAsync({ id: prescriptionId, reason });
  };

  const statusCounts = {
    all: stats?.total || 0,
    pending: stats?.pending || 0,
    dispensed: stats?.dispensed || 0,
    cancelled: stats?.cancelled || 0,
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Recetas Digitales
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestión de recetas médicas
            </p>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nueva Receta
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {statusCounts.all}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {statusCounts.pending}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400">Dispensadas</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {statusCounts.dispensed}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">Canceladas</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
              {statusCounts.cancelled}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por número, paciente o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="dispensed">Dispensadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando recetas...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error al cargar recetas
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && prescriptions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No hay recetas
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchTerm || filterStatus !== 'all'
                ? 'No se encontraron recetas con los filtros seleccionados'
                : 'No hay recetas registradas en el sistema'
              }
            </p>
          </div>
        )}

        {/* Prescriptions List */}
        {!isLoading && !error && prescriptions.length > 0 && (
          <div className="space-y-4">
            {prescriptions.map((prescription) => {
              const isValid = prescriptionsService.isValid(prescription);
              const isExpiringSoon = prescriptionsService.isExpiringSoon(prescription);

              return (
                <div
                  key={prescription.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {prescription.prescription_number}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(prescription.status)}`}>
                            {getStatusIcon(prescription.status)}
                            {getStatusLabel(prescription.status)}
                          </span>
                          {!isValid && prescription.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              <AlertCircle className="h-3 w-3" />
                              Vencida
                            </span>
                          )}
                          {isExpiringSoon && prescription.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                              <AlertCircle className="h-3 w-3" />
                              Próxima a vencer
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{prescription.patient?.name || 'N/A'}</span>
                            <span className="text-xs">({prescription.patient?.id_number || 'N/A'})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(prescription.issue_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            Vence: {new Date(prescription.expiry_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {prescription.status === 'pending' && isValid && (
                        <button
                          onClick={() => handleDispense(prescription.id)}
                          disabled={dispenseMutation.isPending}
                          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {dispenseMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                          Dispensar
                        </button>
                      )}
                      {prescription.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(prescription.id)}
                          disabled={cancelMutation.isPending}
                          className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancelar
                        </button>
                      )}
                      <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Ver Detalles
                      </button>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Médico Tratante</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {prescription.doctor_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Licencia: {prescription.doctor_license}
                    </p>
                  </div>

                  {/* Medications */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Medicamentos ({prescription.items?.length || 0})
                    </p>
                    {prescription.items?.map((item) => (
                      <div
                        key={item.id}
                        className="pl-6 py-2 border-l-2 border-primary/30"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.product?.name || 'Producto desconocido'} - {item.quantity} unidades
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.dosage} - {item.frequency} - {item.duration}
                        </p>
                        {item.dispensed_quantity > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Dispensado: {item.dispensed_quantity} unidades
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {prescription.notes && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Nota Importante:
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {prescription.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
