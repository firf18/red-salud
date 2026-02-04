import { useState, useEffect } from 'react';
import { X, Loader2, Package, DollarSign, AlertCircle } from 'lucide-react';
import type { Product } from '@/types/product.types';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  product?: Product | null;
  mode: 'create' | 'edit';
}

export function ProductForm({ isOpen, onClose, onSubmit, product, mode }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    sku: '',
    barcode: '',
    name: '',
    generic_name: '',
    active_ingredient: '',
    product_type: 'medicine' as const,
    category: undefined,
    manufacturer: '',
    brand: '',
    cost_price_usd: 0,
    cost_price_ves: 0,
    sale_price_usd: 0,
    sale_price_ves: 0,
    iva_rate: 0.16,
    iva_exempt: false,
    min_stock: 10,
    max_stock: 100,
    reorder_point: 20,
    unit_type: 'unit' as const,
    units_per_box: 1,
    allow_fractional_sale: false,
    requires_prescription: false,
    controlled_substance: false,
    psychotropic: false,
    refrigerated: false,
  });

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        sku: product.sku || '',
        barcode: product.barcode || '',
        name: product.name || '',
        generic_name: product.generic_name || '',
        active_ingredient: product.active_ingredient || '',
        product_type: product.product_type || 'medicine',
        category: product.category || '',
        manufacturer: product.manufacturer || '',
        brand: product.brand || '',
        cost_price_usd: product.cost_price_usd || 0,
        cost_price_ves: product.cost_price_ves || 0,
        sale_price_usd: product.sale_price_usd || 0,
        sale_price_ves: product.sale_price_ves || 0,
        iva_rate: product.iva_rate || 0.16,
        iva_exempt: product.iva_exempt || false,
        min_stock: product.min_stock || 10,
        max_stock: product.max_stock || 100,
        reorder_point: product.reorder_point || 20,
        unit_type: product.unit_type || 'unit',
        units_per_box: product.units_per_box || 1,
        allow_fractional_sale: product.allow_fractional_sale || false,
        requires_prescription: product.requires_prescription || false,
        controlled_substance: product.controlled_substance || false,
        psychotropic: product.psychotropic || false,
        refrigerated: product.refrigerated || false,
      });
    }
  }, [product, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error al guardar el producto');
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="h-6 w-6" />
              {mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
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
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Información Básica
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SKU *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Código de Barras</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => handleChange('barcode', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Nombre Comercial *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre Genérico</label>
                  <input
                    type="text"
                    value={formData.generic_name}
                    onChange={(e) => handleChange('generic_name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Principio Activo</label>
                  <input
                    type="text"
                    value={formData.active_ingredient}
                    onChange={(e) => handleChange('active_ingredient', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categoría</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fabricante</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => handleChange('manufacturer', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Precios
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Costo USD *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_price_usd}
                    onChange={(e) => handleChange('cost_price_usd', parseFloat(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Costo VES</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_price_ves}
                    onChange={(e) => handleChange('cost_price_ves', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Venta USD *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price_usd}
                    onChange={(e) => handleChange('sale_price_usd', parseFloat(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Venta VES</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price_ves}
                    onChange={(e) => handleChange('sale_price_ves', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Stock */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Control de Stock
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Mínimo</label>
                  <input
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => handleChange('min_stock', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Máximo</label>
                  <input
                    type="number"
                    value={formData.max_stock}
                    onChange={(e) => handleChange('max_stock', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Punto de Reorden</label>
                  <input
                    type="number"
                    value={formData.reorder_point}
                    onChange={(e) => handleChange('reorder_point', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Características
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_prescription}
                    onChange={(e) => handleChange('requires_prescription', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Requiere Receta</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.controlled_substance}
                    onChange={(e) => handleChange('controlled_substance', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Sustancia Controlada</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.psychotropic}
                    onChange={(e) => handleChange('psychotropic', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Psicotrópico</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.refrigerated}
                    onChange={(e) => handleChange('refrigerated', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Refrigerado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.iva_exempt}
                    onChange={(e) => handleChange('iva_exempt', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Exento de IVA</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allow_fractional_sale}
                    onChange={(e) => handleChange('allow_fractional_sale', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Venta Fraccionada</span>
                </label>
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
                  mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
