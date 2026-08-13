import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, color: string | null, colorName: string | null, size: string | null) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, color, colorName, size) => {
        const itemId = `${product.id}-${color || 'nocolor'}-${size || 'nosize'}`;
        const existing = get().items.find(i => i.id === itemId);
        if (existing) {
          set({
            items: get().items.map(i =>
              i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({
            items: [...get().items, { product, color, colorName, size, quantity: 1, id: itemId }],
          });
        }
      },
      removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map(i => (i.id === id ? { ...i, quantity } : i)),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'wwenatou-cart' }
  )
);
