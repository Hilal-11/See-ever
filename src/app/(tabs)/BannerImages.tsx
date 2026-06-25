import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, Text, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AUTO_SCROLL_INTERVAL = 5000;

const BANNERS = [
  {
    id: "1",
    image: require("../../../assets/banner1.png"),
    title: "Summer Collection",
    subtitle: "Up to 50% off on trending styles",
    tag: "HOT DEAL",
  },
  {
    id: "2",
    image: require("../../../assets/banner2.png"),
    title: "New Arrivals",
    subtitle: "Check out the latest drops",
    tag: "NEW IN",
  },
  {
    id: "3",
    image: require("../../../assets/banner3.png"),
    title: "Weekend Flash Sale",
    subtitle: "Extra 20% off everything",
    tag: "FLASH SALE",
  },
  {
    id: "4",
    image: require("../../../assets/banner4.png"),
    title: "Premium Edit",
    subtitle: "Curated designer picks",
    tag: "PREMIUM",
  },
  {
    id: "5",
    image: require("../../../assets/banner5.png"),
    title: "Free Shipping",
    subtitle: "On orders above ₹999",
    tag: "FREE SHIP",
  },
];

function DotIndicator({ total, current }: { total: number; current: number }) {
  return (
    <View className="flex-row justify-center items-center pt-2.5 gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`h-1.5 rounded-full ${
            i === current ? "w-5 bg-neutral-900" : "w-1.5 bg-neutral-300"
          }`}
        />
      ))}
    </View>
  );
}

export default function BannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoScroll = () => {
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % BANNERS.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
  };

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
    if (timerRef.current) clearInterval(timerRef.current);
    startAutoScroll();
  };

  const renderItem = ({ item }: { item: (typeof BANNERS)[0] }) => (
    <View
      style={{ width: SCREEN_WIDTH }}
      className="h-auto overflow-hidden p-5"
    >
      {/* Background Image */}
      <Image
        source={item.image}
        className="w-full h-full rounded-2xl"
        resizeMode="cover"
      />

      {/* Dark overlay */}
      <View className="absolute inset-0" />

      {/* Text Content */}
      <View className="absolute bottom-5 left-5 right-5">
        {/* Tag badge */}
        <View className="self-start bg-white px-2.5 py-0.5 rounded-full mb-2">
          <Text className="text-xs font-extrabold text-neutral-900 tracking-widest">
            {item.tag}
          </Text>
        </View>

        {/* Title */}
        <Text className="text-2xl font-extrabold text-white tracking-tight mb-1">
          {item.title}
        </Text>

        {/* Subtitle */}
        <Text className="text-sm text-white/80 font-medium">
          {item.subtitle}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="bg-white" style={{ height: 208 + 36 }}>
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        bounces={false}
      />

      {/* Dot Indicators */}
      <DotIndicator total={BANNERS.length} current={currentIndex} />
    </View>
  );
}
