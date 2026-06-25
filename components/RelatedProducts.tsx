import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
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
type RelatedProductsProps = {
  categoriesProducts: Clothes[];
};
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CategoryRelatedProducts = ({
  categoriesProducts,
}: RelatedProductsProps) => {
  const router = useRouter();
  return (
    <View className="mb-0">
      <Text className="text-lg font-extrabold text-neutral-900 mb-4 px-1 pl-4">
        You May Also Like
      </Text>
      <View className="flex-row flex-wrap gap-3 justify-center w-full mx-auto">
        {categoriesProducts.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-400/40"
            style={{ width: (SCREEN_WIDTH - 52) / 2 }}
            activeOpacity={0.85}
            onPress={() => router.push(`/product/${item.id}`)}
          >
            {/* Image */}
            <View className="w-full h-44 bg-neutral-100">
              <Image
                source={{ uri: item.image_url }}
                className="w-full h-full"
                resizeMode="cover"
              />
              {/* Discount badge */}
              {item.discountPercentage > 0 && (
                <View className="absolute top-2 left-2 bg-red-500 px-2 py-0.5 rounded-full">
                  <Text className="text-white text-xs font-extrabold">
                    {item.discountPercentage}% OFF
                  </Text>
                </View>
              )}
            </View>

            {/* Info */}
            <View className="p-3">
              <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-0.5">
                {item.brand}
              </Text>
              <Text
                className="text-sm font-bold text-neutral-900 mb-1.5"
                numberOfLines={1}
              >
                {item.title}
              </Text>

              {/* Rating */}
              <View className="flex-row items-center gap-1 mb-2">
                <Ionicons name="star" size={11} color="#F5A623" />
                <Text className="text-xs font-semibold text-neutral-600">
                  {item.rating.toFixed(1)}
                </Text>
                <Text className="text-xs text-neutral-400">
                  ({item.reviews})
                </Text>
              </View>

              {/* Price */}
              <View className="flex-row items-center gap-1.5">
                <Text className="text-base font-extrabold text-neutral-900">
                  ₹{item.price.toLocaleString()}
                </Text>
                {item.originalPrice > item.price && (
                  <Text className="text-xs text-neutral-400 line-through">
                    ₹{item.originalPrice.toLocaleString()}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default CategoryRelatedProducts;
