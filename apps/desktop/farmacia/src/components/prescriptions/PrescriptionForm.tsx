/**
 * Formulario para crear nueva receta médica
 * Incluye búsqueda de paciente y selección de medicamentos
 */

import { useState } from 'react';
import { X, Plus, Trash2, Search, User, Calendar, FileText } from 'lucide-react';
import { useCreatePrescription } from '@/hooks/usePrescriptions';
import { useProducts } from '@/hooks/useProducts';
import { ProductSearch } from '@/components/products/ProductSearch';
import type { Product } from '@/services/products.service';

interface PrescriptionFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface PrescriptionItem {
  product_id: string;
  product?: Product;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
}

export function PrescriptionForm({ onClose, onSuccess }: PrescriptionFormProps) {
  const createMutation = useCreatePrescription();
  const { data: products = [] } = useProducts();

  // Estado del formulario
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [doctorName, setDoctorName] = useState('');
  const [doctorLicense, setDoctorLicense] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Calcular fecha de expiración por defecto (30 días)
  const calculateExpiryDate = (issueDate: string) => {
    const date = new Date(issueDate);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  // Cuando cambia la fecha de emisión, actualizar expiración
  const handleIssueDateChange = (date: string) => {
    setIssueDate(date);
    if (!expiryDate) {
      setExpiryDate(calculateExpiryDate(date));
    }
  };

  // Agregar medicamento a la receta
  const handleAddProduct = (product: Product) => {
    const newItem: PrescriptionItem = {
      product_id: product.id,
      product,
      quantity: 1,
      dosage: product.presentation || '',
      frequency: 'Cada 8 horas',
      duration: '7 días',
    };
    setItems([...items, newItem]);
    setShowProductSearch(false);
  };

  // Actualizar item de la receta
  const handleUpdateItem = (index: number, field: keyof PrescriptionItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Eliminar item de la receta
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Validar formulario
  const isValid = () => {
    return (
      selectedPatient &&
      doctorName.trim() &&
      doctorLicense.trim() &&
      issueDate &&
      expiryDate &&
      items.length > 0 &&
      items.every(item => item.quantity > 0 && item.dosage && item.frequency && item.duration)
    );
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid()) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      await createMutation.mutateAsync({
        patient_id: selectedPatient.id,
        doctor_name: doctorName,
        doctor_license: doctorLicense,
        issue_date: issueDate,
        expiry_date: expiryDate,
        notes,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          dispensed_quantity: 0,
        })),
        status: 'pending',
        prescription_number: '', // Se genera automáticamente
      } as any);

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating prescription:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Nueva Receta Médica
              </h2>
              <p className="text-sm text-muted-foreground">
                Complete los datos de la receta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-6">
          {/* Información del Paciente */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="h-4 w-4" />
              Información del Paciente
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Buscar Paciente *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Buscar por nombre o cédula..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700"
                  />
                </div>
                {selectedPatient && (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="font-medium text-green-900 dark:text-green-100">
                      {selectedPatient.name}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {selectedPatient.id_number}
                    </p>
                  </div>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Nota: En producción, esto buscará en la base de datos de pacientes
                </p>
              </div>
            </div>
          </div>

          {/* Información del Médico */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Información del Médico
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre del Médico *
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Dr. Juan Pérez"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Licencia Médica *
                </label>
                <input
                  type="text"
                  value={doctorLicense}
                  onChange={(e) => setDoctorLicense(e.target.value)}
                  placeholder="MPPS-12345"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fechas
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fecha de Emisión *
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => handleIssueDateChange(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fecha de Vencimiento *
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={issueDate}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Medicamentos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Medicamentos ({items.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowProductSearch(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                Agregar Medicamento
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <p className="text-muted-foreground">
                  No hay medicamentos agregados
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Haga clic en "Agregar Medicamento" para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.product?.name || 'Producto desconocido'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.product?.presentation}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Cantidad *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value))}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Dosis *
                        </label>
                        <input
                          type="text"
                          value={item.dosage}
                          onChange={(e) => handleUpdateItem(index, 'dosage', e.target.value)}
                          placeholder="500mg"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Frecuencia *
                        </label>
                        <select
                          value={item.frequency}
                          onChange={(e) => handleUpdateItem(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700"
                        >
                          <option>Cada 4 horas</option>
                          <option>Cada 6 horas</option>
                          <option>Cada 8 horas</option>
                          <option>Cada 12 horas</option>
                          <option>Cada 24 horas</option>
                          <option>Según necesidad</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Duración *
                        </label>
                        <select
                          value={item.duration}
                          onChange={(e) => handleUpdateItem(index, 'duration', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700"
                        >
                          <option>3 días</option>
                          <option>5 días</option>
                          <option>7 días</option>
                          <option>10 días</option>
                          <option>14 días</option>
                          <option>30 días</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Notas Importantes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Paciente alérgico a penicilina, tomar con alimentos, etc."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid() || createMutation.isPending}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Creando...' : 'Crear Receta'}
          </button>
        </div>
      </div>

      {/* Modal de búsqueda de productos */}
      {showProductSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold">Buscar Medicamento</h3>
              <button
                onClick={() => setShowProductSearch(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <ProductSearch
                onSelect={handleAddProduct}
                placeholder="Buscar medicamento..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
