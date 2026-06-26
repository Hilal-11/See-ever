import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";

export type CartItem = {
  id: string;
  product_id: number; // ✅ change from string to number
  title: string;
  price: number;
  image_url: string;
  size?: string;
  color?: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "id">, userId: string) => Promise<void>;
  removeFromCart: (productId: number, userId: string) => Promise<void>;
  incrementQty: (productId: number) => void;
  decrementQty: (productId: number, userId: string) => Promise<void>;
  clearCart: () => void;
  syncFromSupabase: (userId: string) => Promise<void>;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: async (item, userId) => {
        const existing = get().items.find(
          (i) =>
            i.product_id === item.product_id &&
            i.size === item.size &&
            i.color === item.color,
        );

        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.product_id === item.product_id
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            ),
          }));
          await supabase
            .from("cart")
            .update({ quantity: existing.quantity + 1 })
            .eq("id", existing.id);
        } else {
          const { data, error } = await supabase
            .from("cart")
            .insert({
              user_id: userId,
              product_id: item.product_id,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
            })
            .select()
            .single();

          if (data) {
            set((state) => ({
              items: [...state.items, { ...item, id: data.id }],
            }));
          }
        }
      },

      removeFromCart: async (productId, userId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product_id !== Number(productId)),
        }));
        await supabase
          .from("cart")
          .delete()
          .eq("product_id", productId)
          .eq("user_id", userId);
      },

      incrementQty: (productId) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === Number(productId)
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        }));
      },

      decrementQty: async (productId, userId) => {
        const item = get().items.find(
          (i) => i.product_id === Number(productId),
        );
        if (!item) return;

        if (item.quantity <= 1) {
          get().removeFromCart(productId, userId);
        } else {
          set((state) => ({
            items: state.items.map((i) =>
              i.product_id === Number(productId)
                ? { ...i, quantity: i.quantity - 1 }
                : i,
            ),
          }));
        }
      },

      clearCart: () => set({ items: [] }),

      syncFromSupabase: async (userId) => {
        const { data } = await supabase
          .from("cart")
          .select("*, clothes(title, price, image_url)")
          .eq("user_id", userId);

        if (data) {
          const mapped: CartItem[] = data.map((row: any) => ({
            id: row.id,
            product_id: row.product_id,
            title: row.clothes.title,
            price: row.clothes.price,
            image_url: row.clothes.image_url,
            size: row.size,
            color: row.color,
            quantity: row.quantity,
          }));
          set({ items: mapped });
        }
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
