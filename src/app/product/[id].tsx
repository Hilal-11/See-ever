import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CategoryRelatedProducts from "../../../components/RelatedProducts";
import { supabase } from "../../../lib/supabase";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Clothes {
  id: number;
  title: string;
  brand: string;
  category: string;
  subCategory: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviews: number;
  color: string;
  size_options: string;
  gender: string;
  image_url: string;
  tags: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View className="flex-row items-center">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.floor(rating);
        const half = !filled && i - 0.5 <= rating;
        return (
          <Ionicons
            key={i}
            name={filled ? "star" : half ? "star-half" : "star-outline"}
            size={14}
            color={filled || half ? "#F5A623" : "#D1D5DB"}
            style={{ marginRight: 1 }}
          />
        );
      })}
    </View>
  );
}

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Clothes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [categoriesProducts, setCategoriesProducts] = useState<Clothes[]>([]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("clothes")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setProduct(data);
    } catch (err: any) {
      setError(err.message || "Failed to load product.");
    } finally {
      setLoading(false);
    }
  };

  const getCategoriesProducts = async (category: string | null) => {
    if (!category) return; // 👈 guard if category is null

    try {
      const { data, error } = await supabase
        .from("clothes")
        .select("*") // 👈 get all columns not just category
        .eq("category", category) // 👈 filter by this product's category
        .neq("id", product?.id); // 👈 exclude current product from results

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      setCategoriesProducts(data ? (data as Clothes[]) : []);
    } catch (err: any) {
      console.error("Error fetching categories:", err.message);
    }
  };

  console.log("RELATED PRODUCTS ARE HERE = ", categoriesProducts);
  useEffect(() => {
    fetchProduct();
    getCategoriesProducts(product?.category || null);
  }, [id]);

  // ── LOADING ──
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-neutral-50">
        <ActivityIndicator size="large" color="#1A1A2E" />
        <Text className="mt-3 text-sm text-neutral-400 font-medium">
          Loading product...
        </Text>
      </View>
    );
  }

  // ── ERROR ──
  if (error || !product) {
    return (
      <View className="flex-1 justify-center items-center bg-neutral-50 px-6">
        <Ionicons name="alert-circle-outline" size={52} color="#E63946" />
        <Text className="mt-4 text-lg font-bold text-neutral-900">
          Something went wrong
        </Text>
        <Text className="mt-1 text-sm text-neutral-400 text-center">
          {error}
        </Text>
        <TouchableOpacity
          className="mt-6 bg-neutral-900 px-8 py-3 rounded-full"
          onPress={fetchProduct}
        >
          <Text className="text-white font-bold text-sm">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Fix sizes parsing - simple and clean
  const sizes = (product.size_options ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const tags = (product.tags ?? "")
    .split(",")
    .map((t: string) => t.trim())
    .filter(Boolean);
  return (
    <View className="flex-1 bg-neutral-50">
      <StatusBar barStyle="light-content" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── HERO IMAGE ── */}
        <View
          className="relative w-full"
          style={{ height: SCREEN_HEIGHT * 0.55 }}
        >
          <Image
            source={{ uri: product.image_url }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* gradient overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 130,
            }}
          />

          {/* back button */}
          <TouchableOpacity
            className="absolute left-4 top-10 w-10 h-10 rounded-full bg-neutral-500/40 justify-center items-center"
            style={{ top: Platform.OS === "ios" ? 74 : 36 }}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          {/* discount badge */}
          {product.discountPercentage > 0 && (
            <View
              className="absolute right-4 bg-red-500 px-3 py-1 rounded-full"
              style={{ top: Platform.OS === "ios" ? 54 : 16 }}
            >
              <Text className="text-white text-xs font-extrabold tracking-wide">
                {product.discountPercentage}% OFF
              </Text>
            </View>
          )}
        </View>

        {/* ── CONTENT CARD ── */}
        <View className="bg-white rounded-t-3xl -mt-6 px-5 pt-7">
          {/* Brand + Category row */}
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-xs font-bold text-neutral-400 tracking-widest uppercase">
              {product.brand}
            </Text>
            <Text className="text-xs text-neutral-400 font-medium">
              {product.category} › {product.subCategory}
            </Text>
          </View>

          {/* Title */}
          <Text className="text-2xl font-extrabold text-neutral-900 leading-tight mt-1 mb-3">
            {product.title}
          </Text>

          {/* Rating row */}
          <View className="flex-row items-center flex-wrap gap-1.5 mb-4">
            <StarRating rating={product.rating} />
            <Text className="text-sm font-bold text-neutral-900">
              {product.rating.toFixed(1)}
            </Text>
            <Text className="text-xs text-neutral-400">
              ({product.reviews} reviews)
            </Text>
            <View className="bg-indigo-50 px-2.5 py-0.5 rounded-full ml-1">
              <Text className="text-xs font-semibold text-indigo-600 capitalize">
                {product.gender}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="h-px bg-neutral-100 my-1 mb-4" />

          {/* Price row */}
          <View className="flex-row items-end gap-2.5 mb-4">
            <Text className="text-3xl font-extrabold text-neutral-900">
              ₹{product.price.toLocaleString()}
            </Text>
            {product.originalPrice > product.price && (
              <Text className="text-base text-neutral-400 line-through font-medium mb-0.5">
                ₹{product.originalPrice.toLocaleString()}
              </Text>
            )}
          </View>

          {/* Divider */}
          <View className="h-px bg-neutral-100 mb-4" />

          {/* Color */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2.5">
              Color
            </Text>
            <View className="flex-row items-center gap-2.5">
              <View
                className="w-7 h-7 rounded-full border-2 border-neutral-200"
                style={{ backgroundColor: product.color }}
              />
              <Text className="text-sm text-neutral-700 font-medium capitalize">
                {product.color}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="h-px bg-neutral-100 mb-4" />

          {/* Sizes */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2.5">
              Size
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
            >
              {sizes.map((size: any) => {
                const selected = selectedSize === size;
                return (
                  <TouchableOpacity
                    key={size}
                    className={`px-5 py-2.5 rounded-sm border-2 ${
                      selected
                        ? "bg-neutral-900 border-neutral-900"
                        : "bg-neutral-50 border-neutral-200"
                    }`}
                    onPress={() => setSelectedSize(size)}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selected ? "text-white" : "text-neutral-700"
                      }`}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Divider */}
          <View className="h-px bg-neutral-100 mb-4" />

          {/* Tags */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2.5">
              Tags
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            >
              {tags.map((tag) => (
                <View
                  key={tag}
                  className="bg-neutral-100 px-3.5 py-1.5 rounded-full"
                >
                  <Text className="text-xs text-neutral-500 font-semibold">
                    #{tag}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* bottom spacing for pinned button */}
        </View>

        
        {/* Related Products based on category */}
        <CategoryRelatedProducts categoriesProducts={categoriesProducts} />

      </ScrollView>

      {/* ── ADD TO CART (pinned bottom) ── */}
      <View
        className="absolute bottom-2 left-0 right-0 bg-white border-t border-neutral-100 px-5 pt-3"
        style={{ paddingBottom: Platform.OS === "ios" ? 34 : 16 }}
      >
        <TouchableOpacity
          className={`rounded-2xl py-4 flex-row items-center justify-center ${
            selectedSize ? "bg-neutral-900" : "bg-neutral-400"
          }`}
          activeOpacity={0.85}
          disabled={!selectedSize}
          onPress={() => {
            // TODO: add to cart logic
          }}
        >
          <Ionicons
            name="bag-add-outline"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text className="text-white text-base font-bold tracking-wide">
            {selectedSize ? "Add to Cart" : "Select a Size"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
