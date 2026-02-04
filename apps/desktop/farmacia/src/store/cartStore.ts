import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/product.types';
import type { Prescription } from '@/services/prescriptions.service';

export interface CartItem {
  product: Product;
  quantity: number;
  batchId?: string;
  prescriptionItemId?: string;
}

interface CartState {
  items: CartItem[];

  // Actions
  addItem: (product: Product, quantity?: number, prescriptionItemId?: string) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => boolean;
  clearCart: () => void;

  // Calculations
  getSubtotal: () => { usd: number; ves: number };
  getIVA: () => { usd: number; ves: number };
  getTotal: () => { usd: number; ves: number };
  getItemCount: () => number;

  // Validations
  canAddItem: (product: Product, quantity: number) => { valid: boolean; message?: string };
  hasItems: () => boolean;

  // Prescription integration
  currentPrescription: Prescription | null;
  setPrescription: (prescription: Prescription | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Add item with validations
      addItem: (product, quantity = 1, prescriptionItemId) => {
        const validation = get().canAddItem(product, quantity);

        if (!validation.valid) {
          alert(validation.message);
          return false;
        }

        set((state) => {
          const existingItem = state.items.find(
            (i) => i.product.id === product.id
          );

          if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            // Validate new quantity
            const stockAvailable = product.stock_actual || 0;
            if (newQuantity > stockAvailable) {
              alert(`Stock insuficiente. Disponible: ${stockAvailable}`);
              return state;
            }

            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: newQuantity }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity, prescriptionItemId }],
          };
        });

        return true;
      },

      // Remove item
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        })),

      // Update quantity with validation
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return true;
        }

        const item = get().items.find((i) => i.product.id === productId);
        if (!item) return false;

        const stockAvailable = item.product.stock_actual || 0;
        if (quantity > stockAvailable) {
          alert(`Stock máximo: ${stockAvailable}`);
          return false;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));

        return true;
      },

      // Clear cart
      clearCart: () => set({ items: [], currentPrescription: null }),

      // Calculate subtotal (before IVA)
      getSubtotal: () => {
        const { items } = get();
        return items.reduce(
          (acc, item) => ({
            usd: acc.usd + item.product.sale_price_usd * item.quantity,
            ves: acc.ves + item.product.sale_price_ves * item.quantity,
          }),
          { usd: 0, ves: 0 }
        );
      },

      // Calculate IVA
      getIVA: () => {
        const { items } = get();
        return items.reduce(
          (acc, item) => {
            if (item.product.iva_exempt) return acc;

            const ivaRate = item.product.iva_rate || 0.16;
            return {
              usd: acc.usd + item.product.sale_price_usd * item.quantity * ivaRate,
              ves: acc.ves + item.product.sale_price_ves * item.quantity * ivaRate,
            };
          },
          { usd: 0, ves: 0 }
        );
      },

      // Calculate total (subtotal + IVA)
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const iva = get().getIVA();
        return {
          usd: subtotal.usd + iva.usd,
          ves: subtotal.ves + iva.ves,
        };
      },

      // Get total item count
      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      // Validate if item can be added
      canAddItem: (product, quantity) => {
        // Check if product requires prescription
        if (product.requires_prescription && !get().currentPrescription) {
          const confirm = window.confirm(
            `⚠️ ${product.name} requiere receta médica. ¿Continuar?`
          );
          if (!confirm) {
            return { valid: false, message: 'Producto requiere receta médica' };
          }
        }

        // Check if product is controlled substance
        if (product.controlled_substance && !get().currentPrescription) {
          const confirm = window.confirm(
            `⚠️ ${product.name} es sustancia controlada. ¿Continuar?`
          );
          if (!confirm) {
            return { valid: false, message: 'Producto es sustancia controlada' };
          }
        }

        // Check stock availability
        const currentInCart = get().items
          .filter((item) => item.product.id === product.id)
          .reduce((sum, item) => sum + item.quantity, 0);

        const stockAvailable = product.stock_actual || 0;

        if (currentInCart + quantity > stockAvailable) {
          return {
            valid: false,
            message: `Stock insuficiente. Disponible: ${stockAvailable - currentInCart}`,
          };
        }

        return { valid: true };
      },

      // Check if cart has items
      hasItems: () => get().items.length > 0,

      // Prescription integration
      currentPrescription: null,
      setPrescription: (prescription) => set({ currentPrescription: prescription }),
    }),
    {
      name: 'farmacia-cart',
    }
  )
);
