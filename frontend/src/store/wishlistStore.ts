import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, WishlistItem } from '../types';

interface WishlistStore {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getCount: () => number;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        if (!get().items.find(i => i.product.id === product.id)) {
          set({ items: [...get().items, { product, addedAt: new Date().toISOString() }] });
        }
      },
      removeItem: (productId) =>
        set({ items: get().items.filter(i => i.product.id !== productId) }),
      isInWishlist: (productId) => get().items.some(i => i.product.id === productId),
      getCount: () => get().items.length,
    }),
    { name: 'wwenatou-wishlist' }
  )
);
