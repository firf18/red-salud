import { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Loader2,
  AlertCircle,
  Package
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useInvoices } from '@/hooks/useInvoices';
import { useDispensePrescription } from '@/hooks/usePrescriptions';
import { deliveriesService } from '@/services/deliveries.service';
import { ProductSearch } from '@/components/products/ProductSearch';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { InvoicePreview } from '@/components/pos/InvoicePreview';
import type { Product } from '@/types/product.types';
import type { PaymentMethod } from '@/types/invoice.types';
import type { Invoice } from '@/types/invoice.types';

const EXCHANGE_RATE = 36; // TODO: Get from API or config
const DEFAULT_WAREHOUSE_ID = '00000000-0000-0000-0000-000000000000'; // TODO: Get from user config

export default function POSPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);

  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getIVA,
    getTotal,
    getItemCount,
    hasItems,
    currentPrescription,
    setPrescription
  } = useCartStore();

  const { createInvoice, isCreating } = useInvoices();
  const dispenseMutation = useDispensePrescription();

  const subtotal = getSubtotal();
  const iva = getIVA();
  const total = getTotal();

  const handleProductSelect = (product: Product) => {
    addItem(product, 1);
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    const item = items.find(i => i.product.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    updateQuantity(productId, newQuantity);
  };

  const handleProcessSale = async (paymentMethod: PaymentMethod, paymentDetails?: any) => {
    try {
      // 1. Create Invoice
      const invoice = await createInvoice({
        warehouse_id: DEFAULT_WAREHOUSE_ID,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        exchange_rate: EXCHANGE_RATE,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      });

      // 2. If it was a prescription sale, mark it as dispensed
      if (currentPrescription) {
        try {
          const dispenseItems = items
            .filter(item => item.prescriptionItemId)
            .map(item => ({
              id: item.prescriptionItemId!,
              dispensed_quantity: item.quantity
            }));

          await dispenseMutation.mutateAsync({
            id: currentPrescription.id,
            items: dispenseItems
          });
        } catch (err) {
          console.error('Error marking prescription as dispensed:', err);
        }
      }

      // 3. If it was a delivery sale, create delivery record
      if (paymentDetails?.delivery) {
        try {
          await deliveriesService.create({
            pharmacy_id: DEFAULT_WAREHOUSE_ID, // Use current pharmacy ID
            invoice_id: invoice.id,
            ...paymentDetails.delivery,
            status: 'pending'
          });
        } catch (err) {
          console.error('Error creating delivery record:', err);
        }
      }

      // 4. Show invoice preview
      setCompletedInvoice(invoice);
      setShowPaymentModal(false);
      setShowInvoicePreview(true);

      // 5. Clear cart and prescription session
      clearCart();
    } catch (error) {
      console.error('Error processing sale:', error);
      throw error;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Punto de Venta
            </h1>
            <p className="text-sm text-muted-foreground">
              Busca y agrega productos al carrito
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Tasa de Cambio</p>
              <p className="text-sm font-semibold">${EXCHANGE_RATE.toFixed(2)} USD/Bs.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Search */}
          <div className="mb-6">
            <ProductSearch
              onSelect={handleProductSelect}
              autoFocus
            />
          </div>

          {/* Instructions */}
          {items.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Comienza una nueva venta
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Busca productos por nombre, SKU o código de barras y agrégalos al carrito
              </p>
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className="w-96 border-l dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrito
              </h2>
              {hasItems() && (
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {getItemCount()} {getItemCount() === 1 ? 'producto' : 'productos'}
            </p>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Carrito vacío</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        ${item.product.sale_price_usd.toFixed(2)} c/u
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.product.id, -1)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.product.id, 1)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${(item.product.sale_price_usd * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bs. {(item.product.sale_price_ves * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Warnings */}
                  {item.product.requires_prescription && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                      <AlertCircle className="h-3 w-3" />
                      <span>Requiere receta</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Cart Summary */}
          {hasItems() && (
            <div className="border-t dark:border-gray-700 p-4 space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <div className="text-right">
                  <p className="font-medium">${subtotal.usd.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    Bs. {subtotal.ves.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* IVA */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (16%):</span>
                <div className="text-right">
                  <p className="font-medium">${iva.usd.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    Bs. {iva.ves.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between text-lg font-bold pt-3 border-t dark:border-gray-700">
                <span>Total:</span>
                <div className="text-right">
                  <p className="text-green-600 dark:text-green-400">
                    ${total.usd.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bs. {total.ves.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={isCreating}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Receipt className="h-5 w-5" />
                    Procesar Venta
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleProcessSale}
        total={total}
        exchangeRate={EXCHANGE_RATE}
      />

      {/* Invoice Preview */}
      <InvoicePreview
        isOpen={showInvoicePreview}
        onClose={() => {
          setShowInvoicePreview(false);
          setCompletedInvoice(null);
        }}
        invoice={completedInvoice}
      />
    </div>
  );
}
