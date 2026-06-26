import { create } from "zustand";
import { supabase } from "../lib/supabase";

type WishlistStore = {
  ids: number[]; // ✅ changed from string[] to number[]
  toggle: (productId: number, userId: string) => Promise<void>;
  isWishlisted: (productId: number) => boolean;
  syncFromSupabase: (userId: string) => Promise<void>;
  clear: () => void;
};

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  ids: [],

  toggle: async (productId, userId) => {
    const already = get().ids.includes(productId);

    // Optimistic UI — update instantly
    set((state) => ({
      ids: already
        ? state.ids.filter((id) => id !== productId)
        : [...state.ids, productId],
    }));

    if (already) {
      await supabase
        .from("wishlist")
        .delete()
        .eq("product_id", productId)
        .eq("user_id", userId);
    } else {
      await supabase
        .from("wishlist")
        .insert({ user_id: userId, product_id: productId });
    }
  },

  isWishlisted: (productId) => get().ids.includes(productId),

  syncFromSupabase: async (userId) => {
    const { data } = await supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_id", userId);
    if (data) set({ ids: data.map((r) => r.product_id) });
  },

  clear: () => set({ ids: [] }),
}));
