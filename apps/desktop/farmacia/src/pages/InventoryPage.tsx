import { useState } from 'react';
import { 
  Package, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter,
  Edit2,
  Trash2,
  Loader2,
  DollarSign,
  Layers
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { ProductForm } from '@/components/inventory/ProductForm';
import { BatchManager } from '@/components/inventory/BatchManager';
import type { Product } from '@/types/product.types';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showBatchManager, setShowBatchManager] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { 
    products, 
    isLoading, 
    createProduct, 
    updateProduct, 
    deleteProduct 
  } = useProducts();

  // Filter products by search term
  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreate = () => {
    setSelectedProduct(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleManageBatches = (product: Product) => {
    setSelectedProduct(product);
    setShowBatchManager(true);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Eliminar ${product.name}?`)) return;
    
    try {
      await deleteProduct.mutateAsync(product.id);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  };

  const handleSubmit = async (data: Partial<Product>) => {
    try {
      if (formMode === 'create') {
        await createProduct.mutateAsync(data);
      } else if (selectedProduct) {
        await updateProduct.mutateAsync({ id: selectedProduct.id, data });
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  };

  const getStockStatus = (product: Product) => {
    const stock = product.stock_actual || 0;
    const minStock = product.min_stock || 0;
    
    if (stock === 0) {
      return { label: 'Sin Stock', color: 'bg-red-100 text-red-700', icon: true };
    } else if (stock < minStock) {
      return { label: 'Bajo Stock', color: 'bg-orange-100 text-orange-700', icon: true };
    } else {
      return { label: 'Normal', color: 'bg-green-100 text-green-700', icon: false };
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Inventario
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestión de productos y stock
            </p>
          </div>
          <button 
            onClick={handleCreate}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar Producto
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o genérico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando tu primer producto al inventario'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <tr 
                      key={product.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </p>
                            {product.generic_name && (
                              <p className="text-sm text-muted-foreground">
                                {product.generic_name}
                              </p>
                            )}
                            {product.requires_prescription && (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                                Requiere Receta
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className={`font-semibold ${
                            (product.stock_actual || 0) < (product.min_stock || 0)
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {product.stock_actual || 0}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">
                            unidades
                          </span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Mín: {product.min_stock || 0}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {product.sale_price_usd.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Bs. {product.sale_price_ves.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon && <AlertCircle className="w-3 h-3" />}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleManageBatches(product)}
                            className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400 transition-colors"
                            title="Gestionar Lotes"
                          >
                            <Layers className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ProductForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        product={selectedProduct}
        mode={formMode}
      />

      {/* Batch Manager Modal */}
      {showBatchManager && selectedProduct && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowBatchManager(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-6 w-6" />
                  Gestión de Lotes
                </h2>
                <button
                  onClick={() => setShowBatchManager(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5 rotate-45" />
                </button>
              </div>
              <div className="p-6">
                <BatchManager product={selectedProduct} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
