import { useState, useEffect } from 'react';
import { X, Loader2, Package, Calendar, MapPin } from 'lucide-react';
import { useBatches } from '@/hooks/useBatches';
import type { Batch } from '@/types/batch.types';
import type { InventoryZone } from '@/types/batch.types';

interface BatchFormProps {
  isOpen: boolean;
  onClose: () => void;
  batch?: Batch | null;
  productId: string;
  mode: 'create' | 'edit';
}

export function BatchForm({ isOpen, onClose, batch, productId, mode }: BatchFormProps) {
  const { createBatch, updateBatch } = useBatches();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<{
    lot_number: string;
    expiry_date: string;
    manufacturing_date: string;
    warehouse_id: string;
    location: string;
    zone: InventoryZone;
    quantity: number;
  }>({
    lot_number: '',
    expiry_date: '',
    manufacturing_date: '',
    warehouse_id: '00000000-0000-0000-0000-000000000000', // TODO: Get from user
    location: '',
    zone: 'available',
    quantity: 0,
  });

  useEffect(() => {
    if (batch && mode === 'edit') {
      setFormData({
        lot_number: batch.lot_number || '',
        expiry_date: batch.expiry_date || '',
        manufacturing_date: batch.manufacturing_date || '',
        warehouse_id: batch.warehouse_id || '00000000-0000-0000-0000-000000000000',
        location: batch.location || '',
        zone: batch.zone || 'available',
        quantity: batch.quantity || 0,
      });
    }
  }, [batch, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'create') {
        await createBatch.mutateAsync({
          ...formData,
          product_id: productId,
          received_at: new Date().toISOString(),
        });
      } else if (batch) {
        await updateBatch.mutateAsync({
          id: batch.id,
          data: formData,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving batch:', error);
      alert('Error al guardar el lote');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="h-6 w-6" />
              {mode === 'create' ? 'Nuevo Lote' : 'Editar Lote'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Lot Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Información del Lote
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Número de Lote *
                  </label>
                  <input
                    type="text"
                    value={formData.lot_number}
                    onChange={(e) => handleChange('lot_number', e.target.value)}
                    required
                    placeholder="Ej: LOTE-2024-001"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
                    required
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Zona
                  </label>
                  <select
                    value={formData.zone}
                    onChange={(e) => handleChange('zone', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="available">Disponible</option>
                    <option value="quarantine">Cuarentena</option>
                    <option value="approved">Aprobado</option>
                    <option value="rejected">Rechazado</option>
                    <option value="damaged">Dañado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fechas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fecha de Fabricación
                  </label>
                  <input
                    type="date"
                    value={formData.manufacturing_date}
                    onChange={(e) => handleChange('manufacturing_date', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fecha de Vencimiento *
                  </label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => handleChange('expiry_date', e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación
              </h3>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ubicación en Almacén
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Ej: A-01-01, Estante 5, etc."
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Código o descripción de la ubicación física del lote
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  mode === 'create' ? 'Crear Lote' : 'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
