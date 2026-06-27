import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";
import { useCartStore } from "../../../store/cartStore";
import { useWishlistStore } from "../../../store/wishlistStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Clothes {
  id: number;
  title: string;
  brand: string;
  price: number;
  original_price: number;
  discount: number;
  rating: number;
  reviews: number;
  color: string;
  image_url: string;
  category: string;
  gender: string;
}

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => (
  <View
    className="flex-1 items-center justify-center px-6"
    style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
  >
    {/* Illustration */}
    <View className="items-center justify-center mb-8">
      {/* Outer glow ring */}
      <View className="w-44 h-44 rounded-full bg-red-50 items-center justify-center">
        {/* Middle ring */}
        <View className="w-32 h-32 rounded-full bg-red-100 items-center justify-center">
          {/* Icon circle */}
          <View className="w-20 h-20 rounded-full bg-red-500 items-center justify-center">
            <Ionicons name="heart-outline" size={38} color="white" />
          </View>
        </View>
      </View>

      {/* Floating badge top right */}
      <View
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white items-center justify-center"
        style={{
          elevation: 4,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 6,
        }}
      >
        <Ionicons name="shirt-outline" size={16} color="#EF4444" />
      </View>

      {/* Floating badge bottom left */}
      <View
        className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-white items-center justify-center"
        style={{
          elevation: 4,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 6,
        }}
      >
        <Ionicons name="star-outline" size={14} color="#EF4444" />
      </View>
    </View>

    {/* Text */}
    <Text className="text-2xl font-extrabold text-neutral-900 text-center mb-2">
      Nothing Saved Yet
    </Text>
    <Text className="text-sm text-neutral-400 text-center leading-6 mb-10 px-4">
      Tap the heart on any item you love{"\n"}and find it here anytime.
    </Text>

    {/* CTA button */}
    <TouchableOpacity
      onPress={() => router.back()}
      activeOpacity={0.85}
      className="bg-red-500 px-10 py-4 rounded-2xl flex-row items-center gap-2"
      style={{
        shadowColor: "#EF4444",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      <Ionicons name="storefront-outline" size={18} color="white" />
      <Text className="text-white text-sm font-extrabold tracking-wide">
        Explore Collection
      </Text>
    </TouchableOpacity>

    {/* Bottom hint */}
    <Text className="text-xs text-neutral-300 text-center mt-6">
      Your saved items will appear here
    </Text>
  </View>
);

// ─── Product Card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  item: Clothes;
  onRemove: (id: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, onRemove }) => {
  const hasDiscount = item.original_price > item.price;
  const { user } = useUser();
  const { addToCart } = useCartStore();

  const handleCardPress = () => {
    router.push(`/product/${item.id}`);
  };

  const handleRemovePress = (e: any) => {
    e.stopPropagation?.();
    onRemove(item.id);
  };

  const handleAddToCart = async (e: any) => {
    e.stopPropagation?.();
    if (!user?.id) return;
    try {
      await addToCart(
        {
          product_id: item.id,
          title: item.title,
          price: item.price,
          image_url: item.image_url,
          color: item.color,
          quantity: 1,
        },
        user.id,
      );
      Alert.alert(
        "Added to Cart",
        `${item.title} has been added to your cart.`,
      );
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handleCardPress}
      className="flex-row bg-white rounded-2xl mx-4 mb-3 overflow-hidden border border-neutral-100 shadow-sm"
    >
      {/* Product Image */}
      <Image
        source={{ uri: item.image_url }}
        style={{ width: 112, height: "100%" }}
        contentFit="cover"
      />

      {/* Product Info */}
      <View className="flex-1 p-3 justify-between">
        {/* Top: brand, title, rating */}
        <View>
          <Text
            className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-0.5"
            numberOfLines={1}
          >
            {item.brand}
          </Text>

          <Text
            className="text-sm font-bold text-neutral-900 mb-1"
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {/* Rating row */}
          <View className="flex-row items-center gap-x-1">
            <Ionicons name="star" size={11} color="#F5A623" />
            <Text className="text-xs font-semibold text-neutral-600">
              {item.rating.toFixed(1)}
            </Text>
            <Text className="text-xs text-neutral-400">
              ({item.reviews.toLocaleString()})
            </Text>
          </View>
        </View>

        {/* Bottom: price + actions */}
        <View className="flex-row items-center justify-between mt-2">
          {/* Price block */}
          <View className="flex-row items-center">
            <Text className="text-base font-extrabold text-orange-600">
              ${item.price.toFixed(2)}
            </Text>
            {hasDiscount && (
              <Text className="text-xs text-neutral-400 line-through ml-1.5">
                ${item.original_price.toFixed(2)}
              </Text>
            )}
          </View>

          {/* Actions row */}
          <View className="flex-row items-center gap-x-2">
            {/* Add to Cart */}
            <TouchableOpacity
              onPress={handleAddToCart}
              className="flex-row items-center bg-neutral-900 rounded-lg px-3 py-1.5"
              activeOpacity={0.8}
            >
              <Ionicons name="bag-add-outline" size={14} color="#fff" />
              <Text className="text-white text-xs font-bold ml-1">Cart</Text>
            </TouchableOpacity>

            {/* Remove from wishlist */}
            <TouchableOpacity
              onPress={handleRemovePress}
              activeOpacity={0.75}
              className="absolute bottom-16 right-2 bg-white rounded-lg items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderWidth: 1,
                borderColor: "#FECDD3", // rose-200 — matches the heart colour
                shadowColor: "#EF4444",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.12,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Ionicons name="heart" size={17} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Wishlist Screen ──────────────────────────────────────────────────────────

export default function WishlistScreen() {
  const { user } = useUser();
  const { ids, toggle, syncFromSupabase } = useWishlistStore();

  const [products, setProducts] = useState<Clothes[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync wishlist IDs from Supabase on mount
  useEffect(() => {
    if (user?.id) {
      syncFromSupabase(user.id);
    }
  }, [user?.id]);

  // Fetch product details whenever the ids array changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (ids.length === 0) {
        setProducts([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("clothes")
          .select("*")
          .in("id", ids);

        if (error) {
          console.error("Error fetching wishlist products:", error.message);
          return;
        }

        setProducts((data as Clothes[]) ?? []);
      } catch (err) {
        console.error("Unexpected error fetching wishlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [ids]);

  const handleRemove = useCallback(
    (productId: number) => {
      if (user?.id) {
        toggle(productId, user.id);
      }
    },
    [user?.id, toggle],
  );

  const renderItem = useCallback(
    ({ item }: { item: Clothes }) => (
      <ProductCard item={item} onRemove={handleRemove} />
    ),
    [handleRemove],
  );

  const keyExtractor = useCallback((item: Clothes) => item.id.toString(), []);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 min-h-screen">
      {/* Header */}
      <View className="px-4 pt-3 pb-4">
        <View className="flex-row items-center justify-between">
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="w-9 h-9 items-center justify-center rounded-xl bg-neutral-50"
            style={{ borderWidth: 1, borderColor: "#E9EAEC" }}
          >
            <Ionicons name="chevron-back" size={20} color="#111827" />
          </TouchableOpacity>

          {/* Center — title + item count pill */}
          <View className="items-center">
            <Text className="text-base font-extrabold text-neutral-900 tracking-tight">
              My Wishlist
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Ionicons name="heart" size={9} color="#EF4444" />
              <Text className="text-xs text-neutral-400 ml-1">
                {ids.length} {ids.length === 1 ? "item saved" : "items saved"}
              </Text>
            </View>
          </View>

          {/* Right — user avatar → profile */}
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            activeOpacity={0.75}
            style={{
              width: 36,
              height: 36,
              borderRadius: 100,
              overflow: "hidden",
              borderWidth: 1,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.18,
              shadowRadius: 3,
              elevation: 2,
              insetInline: "auto",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={{ width: 36, height: 36 }}
                contentFit="cover"
              />
            ) : (
              <View className="flex-1 bg-orange-100 items-center justify-center">
                <Ionicons name="person" size={18} color="#F97316" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Body */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : ids.length === 0 || products.length === 0 ? (
        <View className="min-h-screen">
          <EmptyState />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 4 }}
        />
      )}
    </SafeAreaView>
  );
}
