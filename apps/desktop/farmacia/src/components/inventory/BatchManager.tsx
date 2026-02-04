import { useState } from 'react';
import { Plus, Edit2, Calendar, Package, Loader2 } from 'lucide-react';
import { useBatchesByProduct } from '@/hooks/useBatches';
import { BatchForm } from './BatchForm';
import type { Batch } from '@/types/batch.types';
import type { Product } from '@/types/product.types';

interface BatchManagerProps {
  product: Product;
}

export function BatchManager({ product }: BatchManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { data: batches, isLoading } = useBatchesByProduct(product.id);

  const handleCreate = () => {
    setSelectedBatch(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleEdit = (batch: Batch) => {
    setSelectedBatch(batch);
    setFormMode('edit');
    setShowForm(true);
  };

  const getZoneColor = (zone: string) => {
    const colors = {
      available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      quarantine: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      damaged: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[zone as keyof typeof colors] || colors.available;
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { label: 'Vencido', color: 'text-red-600 dark:text-red-400', days: Math.abs(daysUntilExpiry) };
    } else if (daysUntilExpiry <= 7) {
      return { label: 'Vence pronto', color: 'text-orange-600 dark:text-orange-400', days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 30) {
      return { label: 'Próximo a vencer', color: 'text-yellow-600 dark:text-yellow-400', days: daysUntilExpiry };
    } else {
      return { label: 'Vigente', color: 'text-green-600 dark:text-green-400', days: daysUntilExpiry };
    }
  };

  const totalStock = batches?.reduce((sum, batch) => sum + batch.quantity, 0) || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lotes de {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            Stock total: {totalStock} unidades en {batches?.length || 0} lotes
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Agregar Lote
        </button>
      </div>

      {/* Batches List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : batches && batches.length > 0 ? (
        <div className="space-y-3">
          {batches.map((batch) => {
            const expiryStatus = getExpiryStatus(batch.expiry_date);
            return (
              <div
                key={batch.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Lote: {batch.lot_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getZoneColor(batch.zone)}`}>
                        {batch.zone}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Cantidad:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {batch.quantity} / {batch.original_quantity}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Ubicación:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {batch.location || 'Sin asignar'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Vencimiento:</span>
                        <span className={`ml-1 font-medium ${expiryStatus.color}`}>
                          {new Date(batch.expiry_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div>
                        <span className={`text-xs font-medium ${expiryStatus.color}`}>
                          {expiryStatus.label} ({expiryStatus.days} días)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => handleEdit(batch)}
                      className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Stock utilizado</span>
                    <span>{Math.round((batch.quantity / batch.original_quantity) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(batch.quantity / batch.original_quantity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            No hay lotes registrados para este producto
          </p>
          <button
            onClick={handleCreate}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Agregar primer lote
          </button>
        </div>
      )}

      {/* Batch Form Modal */}
      {showForm && (
        <BatchForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          batch={selectedBatch}
          productId={product.id}
          mode={formMode}
        />
      )}
    </div>
  );
}
