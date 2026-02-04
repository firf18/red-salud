import { useState, useEffect } from 'react';
import { Search, Package, AlertCircle, Loader2 } from 'lucide-react';
import { useProductSearch } from '@/hooks/useProducts';
import type { Product } from '@/types/product.types';

interface ProductSearchProps {
  onSelect: (product: Product) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function ProductSearch({ 
  onSelect, 
  placeholder = "Buscar por nombre, SKU o código de barras...",
  autoFocus = false 
}: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const { data: results, isLoading, error } = useProductSearch(query);

  useEffect(() => {
    setShowResults(query.length >= 2 && !!results);
  }, [query, results]);

  const handleSelect = (product: Product) => {
    onSelect(product);
    setQuery('');
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      setQuery('');
    }
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowResults(false)}
          />
          
          {/* Results */}
          <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
            {error && (
              <div className="p-4 flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">Error al buscar productos</p>
              </div>
            )}

            {!error && results && results.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron productos</p>
                <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
              </div>
            )}

            {!error && results && results.length > 0 && (
              <div className="py-2">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 dark:hover:bg-gray-700 transition-colors flex items-start gap-3"
                  >
                    <Package className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {product.name}
                          </p>
                          {product.generic_name && (
                            <p className="text-xs text-muted-foreground truncate">
                              {product.generic_name}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            ${product.sale_price_usd?.toFixed(2)}
                          </p>
                          {product.sale_price_ves && (
                            <p className="text-xs text-muted-foreground">
                              Bs. {product.sale_price_ves.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>SKU: {product.sku}</span>
                        <span>•</span>
                        <span className={
                          product.stock_actual && product.stock_actual <= product.min_stock
                            ? 'text-yellow-600 dark:text-yellow-400 font-medium'
                            : ''
                        }>
                          Stock: {product.stock_actual || 0}
                        </span>
                        {product.requires_prescription && (
                          <>
                            <span>•</span>
                            <span className="text-orange-600 dark:text-orange-400">
                              Requiere receta
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
