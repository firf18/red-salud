import { useState } from 'react';
import { X, CreditCard, DollarSign, Smartphone, Banknote, Building2, Loader2, Truck, MapPin } from 'lucide-react';
import type { PaymentMethod } from '@/types/invoice.types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod, paymentDetails?: any) => Promise<void>;
  total: { usd: number; ves: number };
  exchangeRate: number;
}

export function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  total,
  exchangeRate,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [processing, setProcessing] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [showUSD, setShowUSD] = useState(true);

  // Delivery State
  const [isDelivery, setIsDelivery] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  if (!isOpen) return null;

  const paymentMethods = [
    { id: 'cash', name: 'Efectivo', icon: DollarSign, color: 'bg-green-500' },
    { id: 'card', name: 'Tarjeta', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'pago_movil', name: 'Pago Móvil', icon: Smartphone, color: 'bg-purple-500' },
    { id: 'zelle', name: 'Zelle', icon: Banknote, color: 'bg-indigo-500' },
    { id: 'transfer', name: 'Transferencia', icon: Building2, color: 'bg-cyan-500' },
  ];

  const totalAmount = showUSD ? total.usd : total.ves;
  const currency = showUSD ? 'USD' : 'VES';
  const symbol = showUSD ? '$' : 'Bs.';

  const calculateChange = () => {
    const received = parseFloat(cashReceived) || 0;
    return received - totalAmount;
  };

  const handleConfirm = async () => {
    setProcessing(true);

    try {
      const paymentDetails: any = {
        currency: showUSD ? 'USD' : 'VES',
      };

      if (selectedMethod === 'cash') {
        const received = parseFloat(cashReceived) || 0;
        if (received < totalAmount) {
          alert('El monto recibido es menor al total');
          setProcessing(false);
          return;
        }
        paymentDetails.received = received;
        paymentDetails.change = calculateChange();
      }

      if (isDelivery) {
        if (!customerName || !deliveryAddress) {
          alert('Nombre y dirección son obligatorios para entregas');
          setProcessing(false);
          return;
        }
        paymentDetails.delivery = {
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_address: deliveryAddress,
          delivery_notes: deliveryNotes,
        };
      }

      await onConfirm(selectedMethod, paymentDetails);
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
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
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Procesar Pago
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Total */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total a Pagar</span>
                <button
                  onClick={() => setShowUSD(!showUSD)}
                  className="text-xs text-primary hover:underline"
                >
                  Cambiar a {showUSD ? 'VES' : 'USD'}
                </button>
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {symbol}{totalAmount.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Tasa: ${exchangeRate.toFixed(2)} USD/Bs.
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Método de Pago
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                      ${selectedMethod === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <div className={`${method.color} p-3 rounded-lg`}>
                      <method.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {method.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Input */}
            {selectedMethod === 'cash' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monto Recibido ({currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {symbol}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Change */}
                {cashReceived && parseFloat(cashReceived) >= totalAmount && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Cambio
                      </span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {symbol}{calculateChange().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick amounts */}
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setCashReceived(amount.toString())}
                      className="py-2 px-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      {symbol}{amount}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Other payment methods info */}
            {selectedMethod !== 'cash' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {selectedMethod === 'card' && 'Procesar pago con tarjeta de débito o crédito'}
                  {selectedMethod === 'pago_movil' && 'Confirmar pago móvil recibido'}
                  {selectedMethod === 'zelle' && 'Verificar transferencia Zelle recibida'}
                  {selectedMethod === 'transfer' && 'Confirmar transferencia bancaria'}
                </p>
              </div>
            )}

            {/* Delivery Option */}
            <div className="border-t dark:border-gray-700 pt-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`
                  w-6 h-6 rounded border-2 flex items-center justify-center transition-all
                  ${isDelivery ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary'}
                `}>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isDelivery}
                    onChange={(e) => setIsDelivery(e.target.checked)}
                  />
                  {isDelivery && <Truck className="h-4 w-4 text-white" />}
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ¿Es una entrega a domicilio?
                </span>
              </label>

              {isDelivery && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                      Nombre del Cliente
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nombre completo"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+58-xxx-xxxxxxx"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                      Dirección de Entrega
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Calle, edificio, apto, punto de referencia..."
                        rows={2}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none "
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                      Notas de Entrega (Opcional)
                    </label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Ej: Tocar timbre fuerte, dejar en recepción..."
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={processing}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={processing || (selectedMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < totalAmount))}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Confirmar Pago'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
