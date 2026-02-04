import { X, Printer, Download, Check } from 'lucide-react';
import type { Invoice } from '@/types/invoice.types';

interface InvoicePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function InvoicePreview({ isOpen, onClose, invoice }: InvoicePreviewProps) {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    alert('Función de descarga en desarrollo');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 print:hidden">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Venta Completada
                </h2>
                <p className="text-sm text-muted-foreground">
                  Factura #{invoice.invoice_number}
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

          {/* Invoice Content */}
          <div className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Red-Salud Farmacia
              </h1>
              <p className="text-sm text-muted-foreground">
                Sistema de Gestión Farmacéutica
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                RIF: J-12345678-9
              </p>
            </div>

            {/* Invoice Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Factura</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {invoice.invoice_number}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(invoice.created_at).toLocaleString('es-VE')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Método de Pago</p>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                  {invoice.payment_method.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Tasa de Cambio</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  ${invoice.exchange_rate.toFixed(2)} USD/Bs.
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Productos
              </h3>
              <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                        Producto
                      </th>
                      <th className="text-center p-3 font-medium text-gray-700 dark:text-gray-300">
                        Cant.
                      </th>
                      <th className="text-right p-3 font-medium text-gray-700 dark:text-gray-300">
                        Precio
                      </th>
                      <th className="text-right p-3 font-medium text-gray-700 dark:text-gray-300">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {invoice.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.product_name}
                          </p>
                          {item.generic_name && (
                            <p className="text-xs text-muted-foreground">
                              {item.generic_name}
                            </p>
                          )}
                        </td>
                        <td className="p-3 text-center text-gray-900 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="p-3 text-right text-gray-900 dark:text-white">
                          ${item.unit_price_usd.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-medium text-gray-900 dark:text-white">
                          ${item.total_usd.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t dark:border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${invoice.subtotal_usd.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bs. {invoice.subtotal_ves.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (16%):</span>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${invoice.iva_usd.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bs. {invoice.iva_ves.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <div className="text-right">
                  <p className="text-green-600 dark:text-green-400">
                    ${invoice.total_usd.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bs. {invoice.total_ves.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground border-t dark:border-gray-700 pt-4">
              <p>Gracias por su compra</p>
              <p className="mt-1">Red-Salud Farmacia - Sistema POS v1.0.0</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700 print:hidden">
            <button
              onClick={handleDownload}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
