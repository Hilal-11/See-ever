import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { CircleUser, Heart, Search, ShoppingBag } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import SafeAreaView from "../../../components/SafeAreaView";
import { supabase } from "../../../lib/supabase";
import { Clothes } from "../../../types/types";
import BannerImages from "./BannerImages";

function ProductCard({ item }: { item: Clothes }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  return (
    <>
      <Link href={`/product/${item.id}` as any} asChild>
        <Pressable className="flex-1 bg-white rounded-2xl mb-4 mx-1.5 overflow-hidden border border-neutral-200 active:opacity-80 shadow-sm">
          {/* Image Container */}
          <View className="relative bg-neutral-100 h-40 overflow-hidden">
            {item.image_url ? (
              <Image
                source={{ uri: item?.image_url }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={300}
              />
            ) : (
              <View style={{ flex: 1, backgroundColor: "#E5E7EB" }} />
            )}
            {/* Discount Badge */}
            {item.discountPercentage > 0 && (
              <LinearGradient
                colors={["#DC2626", "#991B1B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute top-2 right-2 rounded-full px-2.5 py-1"
              >
                <Text className="text-white text-[11px] font-bold">
                  -{item.discountPercentage}%
                </Text>
              </LinearGradient>
            )}

            {/* Heart Icon */}
            <Pressable
              className="absolute top-2 left-2 bg-white/90 rounded-full p-2 active:opacity-70 cursor-pointer"
              onPress={() => setLiked(!liked)}
            >
              <Heart
                size={17}
                color={liked ? "#EF4444" : "#9CA3AF"}
                fill={liked ? "#EF4444" : "transparent"}
              />
            </Pressable>
          </View>

          {/* Content */}
          <View className="p-3 gap-1">
            {/* Title */}
            <Text
              className="text-sm font-semibold text-neutral-900 leading-4"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.title}
            </Text>

            {/* Brand */}
            <Text className="text-xs text-neutral-500 font-medium">
              {item.brand}
            </Text>

            {/* Rating */}
            <View className="flex-row items-center gap-1">
              <Text className="text-xs text-amber-500">★</Text>
              <Text className="text-xs font-semibold text-neutral-700">
                {item.rating}
              </Text>
              <Text className="text-xs text-neutral-400">({item.reviews})</Text>
            </View>

            {/* Price Row */}
            <View className="flex-row items-baseline gap-2 pt-1">
              <Text className="text-base font-bold text-orange-600">
                ${item.price.toFixed(2)}
              </Text>
              {item.originalPrice > item.price && (
                <Text className="text-xs text-neutral-400 line-through">
                  ${item.originalPrice.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        </Pressable>
      </Link>
    </>
  );
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Clothes[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Clothes[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All"); // ✅ Track selected

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("clothes").select("*");

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      if (data) {
        setProducts(data as Clothes[]);
        setFilteredProducts(data as Clothes[]);
        console.log("✅ Products loaded:", data.length);
      }
    } catch (err: any) {
      console.error("Error fetching products:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("clothes") // ✅ Use correct table name
        .select("category");

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      if (data) {
        // ✅ Extract just the category string
        const categoryNames = data.map((item: any) => item.category);

        // ✅ Remove duplicates
        const uniqueCategories = ["All", ...new Set(categoryNames)];

        setCategories(uniqueCategories);
        console.log("✅ Categories loaded:", uniqueCategories);
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err.message);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.title.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredProducts(filtered);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);

    if (category === "All") {
      // Show all products
      setFilteredProducts(products);
      console.log("📦 Showing all products:", products.length);
    } else {
      // Filter by selected category
      const filtered = products.filter(
        (product) => product.category === category,
      );
      setFilteredProducts(filtered);
      console.log(`📦 Showing ${filtered.length} products in ${category}`);
    }
  };

  useEffect(() => {
    getAllProducts();
    getCategories();
  }, []);

  return (
    <SafeAreaView className="flex-1 px-4">
      {/* Header with Gradient */}
      <View className="flex-row items-center justify-between px-4  ">
        <View>
          <Text className="text-3xl font-bold text-neutral-900">SeeEver</Text>
          <Text className="text-xs text-neutral-600 mt-0.5 pl-2">
            Discover fashion
          </Text>
        </View>
        <View className="flex-row gap-3">
          <Pressable className="bg-white/80 p-2.5 rounded-full active:opacity-70">
            <Search size={18} color="#1F2937" />
          </Pressable>
          <Pressable className="bg-white/80 p-2.5 rounded-full active:opacity-70">
            <ShoppingBag size={20} color="#1F2937" />
          </Pressable>
          <Link href="/profile" asChild>
            <Pressable className="bg-white/80 p-2.5 rounded-full active:opacity-70">
              <CircleUser size={20} color="#1F2937" />
            </Pressable>
          </Link>
        </View>
      </View>

      {/* Search Bar */}
      {/* <View className=" px-4 flex-row items-center gap-2 bg-white/90 rounded-xl py-1 border border-white/50">
        <Search size={18} color="#1F2937" />
        <TextInput
          className="flex-1 text-base text-neutral-900 font-medium"
          placeholder="Search products..."
          placeholderTextColor="#D1D5DB"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View> */}

      {/* Loading State */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="text-neutral-600 mt-3 text-sm">
            Loading products...
          </Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-lg font-semibold text-neutral-700 mb-2">
            No products found
          </Text>
          <Text className="text-sm text-neutral-500 text-center">
            {searchQuery
              ? "Try adjusting your search"
              : "Check back soon for new items"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          ListHeaderComponent={
            <View>
              <BannerImages />
              <ProductCategories
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
            </View>
          }
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => <ProductCard item={item} />}
          numColumns={2}
          columnWrapperStyle={{ paddingHorizontal: 6 }}
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 12 }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        />
      )}
    </SafeAreaView>
  );
}

interface ProductCategoriesProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const ProductCategories = ({
  categories,
  selectedCategory,
  onCategorySelect,
}: ProductCategoriesProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="bg-white"
    >
      <View className="flex-row gap-3 pt-8 pb-5 px-4">
        {categories.map((category: string) => (
          <Pressable
            key={category}
            onPress={() => onCategorySelect(category)} // ✅ Call parent callback
            className={`px-7 py-1.5 rounded-lg border ${
              selectedCategory === category // ✅ Highlight selected
                ? "bg-black border-black"
                : "bg-white border-neutral-400/40"
            }`}
          >
            <Text
              className={`font-bold text-sm ${
                selectedCategory === category
                  ? "text-white"
                  : "text-neutral-700"
              }`}
            >
              {category}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};
