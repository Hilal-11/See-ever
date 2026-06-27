import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

interface Order {
  id: string;
  status: string;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  payment_method: string;
  coupon_code: string | null;
  created_at: string;
  delivery_address: {
    name: string;
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  order_items: OrderItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STEPS = [
  {
    key: "pending",
    label: "Order Placed",
    icon: "receipt-outline" as const,
    description: "Your order has been received",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: "checkmark-circle-outline" as const,
    description: "Seller confirmed your order",
  },
  {
    key: "preparing",
    label: "Preparing",
    icon: "construct-outline" as const,
    description: "Your order is being packed",
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    icon: "bicycle-outline" as const,
    description: "Order is on the way",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: "home-outline" as const,
    description: "Order delivered successfully",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: "close-circle-outline" as const,
    description: "Order was cancelled",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatAddress(addr: Order["delivery_address"] | null) {
  if (!addr) return "—";
  return [addr.street, addr.city, addr.region, addr.postalCode, addr.country]
    .filter(Boolean)
    .join(", ");
}

// ─── Pulsing circle for current step ─────────────────────────────────────────

function PulsingCircle({
  icon,
  color,
  bg,
}: {
  icon: (typeof STATUS_STEPS)[0]["icon"];
  color: string;
  bg: string;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        animStyle,
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      <Ionicons name={icon} size={20} color={color} />
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function TrackOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId: string }>();
  const orderId = params.orderId ?? "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId)
        .single();
      if (!error && data) setOrder(data as Order);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    intervalRef.current = setInterval(fetchOrder, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orderId]);

  // Determine current step index
  const isCancelled = order?.status === "cancelled";
  const mainSteps = STATUS_STEPS.filter((s) => s.key !== "cancelled");
  const visibleSteps = isCancelled ? STATUS_STEPS : mainSteps;

  const currentIndex = order
    ? visibleSteps.findIndex((s) => s.key === order.status)
    : -1;

  // ── Step state helpers ───────────────────────────────────────────────────────

  const getStepState = (
    index: number,
  ): "completed" | "current" | "future" | "cancelled" => {
    if (isCancelled) {
      return index === currentIndex
        ? "cancelled"
        : index < currentIndex
          ? "completed"
          : "future";
    }
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "future";
  };

  const circleStyle = (state: ReturnType<typeof getStepState>) => {
    switch (state) {
      case "completed":
        return { bg: "#DCFCE7", color: "#16A34A" };
      case "current":
        return { bg: "#FFEDD5", color: "#F97316" };
      case "cancelled":
        return { bg: "#FEE2E2", color: "#EF4444" };
      default:
        return { bg: "#F5F5F5", color: "#9CA3AF" };
    }
  };

  const connectorColor = (state: ReturnType<typeof getStepState>) =>
    state === "completed" ? "#86EFAC" : "#E5E5E5";

  const labelColor = (state: ReturnType<typeof getStepState>) =>
    state === "future" ? "#A3A3A3" : "#171717";

  const descColor = (state: ReturnType<typeof getStepState>) =>
    state === "future" ? "#D4D4D4" : "#737373";

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color="#171717" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-lg font-extrabold text-neutral-900">
            Track Order
          </Text>
          <Text className="text-xs text-neutral-400">
            #{orderId.slice(0, 8).toUpperCase()}
          </Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
          <Text className="text-xs text-neutral-400 mt-3">
            Fetching order status...
          </Text>
        </View>
      ) : !order ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={48} color="#D4D4D4" />
          <Text className="text-sm font-bold text-neutral-500 mt-3 text-center">
            Order not found
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* ── Status banner ── */}
          <View
            className={`mx-4 mt-4 rounded-2xl px-4 py-3.5 flex-row items-center gap-3 ${
              isCancelled
                ? "bg-red-50 border border-red-100"
                : "bg-orange-50 border border-orange-100"
            }`}
          >
            <View
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: isCancelled ? "#FEE2E2" : "#FFEDD5" }}
            >
              <Ionicons
                name={isCancelled ? "close-circle" : "radio-button-on"}
                size={20}
                color={isCancelled ? "#EF4444" : "#F97316"}
              />
            </View>
            <View className="flex-1">
              <Text
                className={`text-xs font-bold uppercase tracking-widest ${
                  isCancelled ? "text-red-400" : "text-orange-400"
                }`}
              >
                Current Status
              </Text>
              <Text
                className={`text-sm font-extrabold mt-0.5 ${
                  isCancelled ? "text-red-600" : "text-orange-600"
                }`}
              >
                {visibleSteps[currentIndex]?.label ?? order.status}
              </Text>
            </View>
            {/* Live dot */}
            {!isCancelled && (
              <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-orange-400" />
                <Text className="text-xs text-orange-400 font-semibold">
                  Live
                </Text>
              </View>
            )}
          </View>

          {/* ── Timeline ── */}
          <View className="mx-4 mt-5">
            {visibleSteps.map((step, index) => {
              const state = getStepState(index);
              const { bg, color } = circleStyle(state);
              const isLast = index === visibleSteps.length - 1;

              return (
                <View key={step.key} className="flex-row items-start">
                  {/* Left: icon + connector */}
                  <View className="items-center" style={{ width: 40 }}>
                    {state === "current" ? (
                      <PulsingCircle icon={step.icon} color={color} bg={bg} />
                    ) : (
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: bg,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name={step.icon} size={20} color={color} />
                      </View>
                    )}
                    {!isLast && (
                      <View
                        style={{
                          width: 2,
                          flex: 1,
                          minHeight: 32,
                          backgroundColor: connectorColor(state),
                          marginTop: 2,
                        }}
                      />
                    )}
                  </View>

                  {/* Right: labels */}
                  <View className="flex-1 pb-6 pl-3">
                    <Text
                      className="text-sm font-bold"
                      style={{ color: labelColor(state) }}
                    >
                      {step.label}
                    </Text>
                    <Text
                      className="text-xs mt-0.5"
                      style={{ color: descColor(state) }}
                    >
                      {step.description}
                    </Text>
                    {state === "current" && !isCancelled && (
                      <Text className="text-xs text-orange-500 font-semibold mt-1">
                        In Progress...
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── Order details card ── */}
          <View
            className="mx-4 mt-2 bg-white rounded-2xl border border-neutral-100 p-4"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
              Order Details
            </Text>
            {[
              {
                label: "Order ID",
                value: `#${orderId.slice(0, 8).toUpperCase()}`,
              },
              { label: "Payment", value: order.payment_method.toUpperCase() },
              { label: "Total", value: `₹${order.total.toLocaleString()}` },
              { label: "Placed", value: formatDate(order.created_at) },
              {
                label: "Deliver to",
                value: formatAddress(order.delivery_address),
              },
            ].map((row, i, arr) => (
              <View
                key={row.label}
                className={`flex-row justify-between items-center py-1.5 ${
                  i < arr.length - 1 ? "border-b border-neutral-50" : ""
                }`}
              >
                <Text className="text-xs text-neutral-400 font-medium">
                  {row.label}
                </Text>
                <Text
                  className="text-xs font-bold text-neutral-800 max-w-[60%] text-right"
                  numberOfLines={2}
                >
                  {row.value}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Items ordered ── */}
          {order.order_items && order.order_items.length > 0 && (
            <View
              className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 p-4"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                Items Ordered
              </Text>
              {order.order_items.map((item, i) => (
                <View
                  key={item.id}
                  className={`flex-row items-center gap-3 py-2 ${
                    i < order.order_items.length - 1
                      ? "border-b border-neutral-50"
                      : ""
                  }`}
                >
                  <Image
                    source={{ uri: item.image_url }}
                    style={{ width: 48, height: 48, borderRadius: 12 }}
                    contentFit="cover"
                  />
                  <View className="flex-1">
                    <Text
                      className="text-sm font-bold text-neutral-900"
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text className="text-xs text-neutral-400 mt-0.5">
                      {item.size} · {item.color}
                    </Text>
                    <View className="flex-row justify-between items-center mt-1">
                      <Text className="text-xs text-neutral-500">
                        Qty: {item.quantity}
                      </Text>
                      <Text className="text-sm font-bold text-orange-600">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Bottom CTA ── */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-4 pt-3 border-t border-neutral-100"
        style={{ paddingBottom: Platform.OS === "ios" ? 34 : 16 }}
      >
        <TouchableOpacity
          className="border border-neutral-200 rounded-2xl py-3.5 flex-row items-center justify-center gap-2"
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.8}
        >
          <Ionicons name="storefront-outline" size={18} color="#525252" />
          <Text className="text-sm font-bold text-neutral-600">
            Continue Shopping
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
