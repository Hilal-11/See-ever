import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";

interface OrderDetail {
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
}

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image_url: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function estimatedDelivery(iso: string) {
  const d = new Date(iso);
  d.setDate(d.getDate() + 5);
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function ConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId: string; total: string }>();
  const orderId = params.orderId ?? "";
  const total = parseFloat(params.total ?? "0");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Animations
  const circleScale = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;
  const contentY = useRef(new Animated.Value(40)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    // Staggered entrance
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(circleScale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 12,
          stiffness: 180,
        }),
        Animated.timing(circleOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(120),
      Animated.spring(checkScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 10,
        stiffness: 200,
      }),
      Animated.delay(60),
      Animated.parallel([
        Animated.timing(contentY, {
          toValue: 0,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Pulsing ring
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1.35,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(400),
      ]),
    ).start();
  }, []);

  const fetchOrder = async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    try {
      const [{ data: ord }, { data: its }] = await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).single(),
        supabase.from("order_items").select("*").eq("order_id", orderId),
      ]);
      if (ord) setOrder(ord as OrderDetail);
      if (its) setItems(its as OrderItem[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const shortId = orderId ? `#${orderId.slice(0, 8).toUpperCase()}` : "—";

  const paymentLabel: Record<string, string> = {
    cod: "Cash on Delivery",
    upi: "UPI",
    card: "Card",
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Hero success block ── */}
        <View className="items-center pt-12 pb-8 px-6">
          {/* Animated circle + ring */}
          <View
            className="items-center justify-center"
            style={{ width: 120, height: 120 }}
          >
            {/* Pulsing ring */}
            <Animated.View
              style={{
                position: "absolute",
                width: 120,
                height: 120,
                borderRadius: 60,
                borderWidth: 2,
                borderColor: "#F97316",
                transform: [{ scale: ringScale }],
                opacity: ringOpacity,
              }}
            />
            {/* Main circle */}
            <Animated.View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: "#FFF7ED",
                borderWidth: 3,
                borderColor: "#FDBA74",
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: circleScale }],
                opacity: circleOpacity,
              }}
            >
              <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                <Ionicons name="checkmark" size={46} color="#F97316" />
              </Animated.View>
            </Animated.View>
          </View>

          {/* Heading */}
          <Animated.View
            style={{
              transform: [{ translateY: contentY }],
              opacity: contentOpacity,
            }}
            className="items-center mt-5"
          >
            <Text className="text-2xl font-extrabold text-neutral-900 tracking-tight text-center">
              Order Placed!
            </Text>
            <Text className="text-sm text-neutral-500 mt-2 text-center leading-5 max-w-xs">
              Your order {shortId} has been confirmed. We'll get it packed and
              on its way soon.
            </Text>

            {/* Order ID pill */}
            <View className="mt-4 flex-row items-center gap-1.5 bg-white border border-neutral-200 rounded-full px-4 py-1.5">
              <Ionicons name="receipt-outline" size={13} color="#A3A3A3" />
              <Text className="text-xs font-bold text-neutral-500 tracking-widest">
                {shortId}
              </Text>
            </View>
          </Animated.View>
        </View>

        <Animated.View
          style={{
            transform: [{ translateY: contentY }],
            opacity: contentOpacity,
          }}
        >
          {/* ── Delivery timeline strip ── */}
          {order && (
            <View className="mx-4 mb-4 bg-orange-500 rounded-2xl px-4 py-4">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                  <Ionicons name="bicycle-outline" size={22} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-orange-100 uppercase tracking-widest">
                    Estimated Delivery
                  </Text>
                  <Text className="text-base font-extrabold text-white mt-0.5">
                    {estimatedDelivery(order.created_at)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="white" />
              </View>
            </View>
          )}

          {/* ── Order summary card ── */}
          <View
            className="mx-4 mb-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            {/* Card header */}
            <View className="flex-row items-center gap-2 px-4 pt-4 pb-3 border-b border-neutral-100">
              <View className="w-1 h-4 bg-orange-500 rounded-full" />
              <Text className="text-sm font-extrabold text-neutral-900">
                Order Summary
              </Text>
            </View>

            {/* Items */}
            {loading ? (
              <View className="py-6 items-center">
                <Text className="text-xs text-neutral-400">
                  Loading items...
                </Text>
              </View>
            ) : items.length > 0 ? (
              <View className="px-4 pt-3">
                {items.map((item, i) => (
                  <View key={item.id}>
                    <View className="flex-row items-start py-2.5 gap-3">
                      {/* Color dot */}
                      <View
                        className="w-2 h-2 rounded-full mt-1.5"
                        style={{ backgroundColor: item.color || "#D4D4D4" }}
                      />
                      <View className="flex-1">
                        <Text
                          className="text-sm font-semibold text-neutral-800"
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text className="text-xs text-neutral-400 mt-0.5">
                          Size: {item.size} · Qty: {item.quantity}
                        </Text>
                      </View>
                      <Text className="text-sm font-bold text-neutral-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </Text>
                    </View>
                    {i < items.length - 1 && (
                      <View className="h-px bg-neutral-50" />
                    )}
                  </View>
                ))}
              </View>
            ) : null}

            {/* Pricing breakdown */}
            {order && (
              <View className="px-4 pt-3 pb-4">
                <View className="h-px bg-neutral-100 mb-3" />
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-neutral-400">Subtotal</Text>
                    <Text className="text-xs font-medium text-neutral-600">
                      ₹{order.subtotal.toLocaleString()}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-neutral-400">Delivery</Text>
                    <Text className="text-xs font-medium text-neutral-600">
                      {order.delivery_charge === 0
                        ? "Free"
                        : `₹${order.delivery_charge.toLocaleString()}`}
                    </Text>
                  </View>
                  {order.discount > 0 && (
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-green-600">
                        Discount
                        {order.coupon_code ? ` (${order.coupon_code})` : ""}
                      </Text>
                      <Text className="text-xs font-medium text-green-600">
                        −₹{order.discount.toLocaleString()}
                      </Text>
                    </View>
                  )}
                  <View className="h-px bg-neutral-100 my-1" />
                  <View className="flex-row justify-between">
                    <Text className="text-sm font-extrabold text-neutral-900">
                      Total Paid
                    </Text>
                    <Text className="text-sm font-extrabold text-orange-600">
                      ₹{order.total.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* ── Delivery & Payment details ── */}
          {order && (
            <View
              className="mx-4 mb-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              {/* Deliver to */}
              <View className="flex-row items-start gap-3 px-4 py-4 border-b border-neutral-100">
                <View className="w-9 h-9 rounded-full bg-orange-50 items-center justify-center">
                  <Ionicons name="location-outline" size={18} color="#F97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">
                    Deliver to
                  </Text>
                  <Text className="text-sm font-bold text-neutral-900">
                    {order.delivery_address?.name ?? "—"}
                  </Text>
                  <Text className="text-xs text-neutral-500 mt-0.5 leading-4">
                    {[
                      order.delivery_address?.street,
                      order.delivery_address?.city,
                      order.delivery_address?.region,
                      order.delivery_address?.postalCode,
                      order.delivery_address?.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </View>
              </View>

              {/* Payment */}
              <View className="flex-row items-center gap-3 px-4 py-4 border-b border-neutral-100">
                <View className="w-9 h-9 rounded-full bg-green-50 items-center justify-center">
                  <Ionicons name="cash-outline" size={18} color="#16A34A" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">
                    Payment
                  </Text>
                  <Text className="text-sm font-bold text-neutral-900">
                    {paymentLabel[order.payment_method] ?? order.payment_method}
                  </Text>
                </View>
                <View className="bg-amber-50 border border-amber-100 rounded-full px-3 py-1">
                  <Text className="text-xs font-bold text-amber-600">
                    Pending
                  </Text>
                </View>
              </View>

              {/* Placed at */}
              <View className="flex-row items-center gap-3 px-4 py-4">
                <View className="w-9 h-9 rounded-full bg-neutral-50 items-center justify-center">
                  <Ionicons name="time-outline" size={18} color="#A3A3A3" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">
                    Placed on
                  </Text>
                  <Text className="text-sm font-bold text-neutral-900">
                    {formatDate(order.created_at)}
                  </Text>
                  <Text className="text-xs text-neutral-400 mt-0.5">
                    {formatTime(order.created_at)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ── What happens next ── */}
          <View
            className="mx-4 mb-6 bg-white rounded-2xl border border-neutral-100 overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <View className="flex-row items-center gap-2 px-4 pt-4 pb-3 border-b border-neutral-100">
              <View className="w-1 h-4 bg-orange-500 rounded-full" />
              <Text className="text-sm font-extrabold text-neutral-900">
                What happens next
              </Text>
            </View>
            {[
              {
                icon: "checkmark-done-outline" as const,
                color: "#16A34A",
                bg: "#F0FDF4",
                title: "Order Confirmed",
                sub: "Weve received your order",
              },
              {
                icon: "shirt-outline" as const,
                color: "#7C3AED",
                bg: "#F5F3FF",
                title: "Being Packed",
                sub: "Your items are being prepared",
              },
              {
                icon: "bicycle-outline" as const,
                color: "#F97316",
                bg: "#FFF7ED",
                title: "Out for Delivery",
                sub: "Your package is on its way",
              },
              {
                icon: "home-outline" as const,
                color: "#0284C7",
                bg: "#F0F9FF",
                title: "Delivered",
                sub: `Expected by ${order ? estimatedDelivery(order.created_at) : "—"}`,
              },
            ].map((step, i, arr) => (
              <View
                key={step.title}
                className="flex-row items-start px-4 py-3 gap-3"
              >
                {/* Icon + connector line */}
                <View className="items-center">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: i === 0 ? step.bg : "#F5F5F5" }}
                  >
                    <Ionicons
                      name={step.icon}
                      size={16}
                      color={i === 0 ? step.color : "#D4D4D4"}
                    />
                  </View>
                  {i < arr.length - 1 && (
                    <View
                      className="w-px mt-1"
                      style={{
                        height: 18,
                        backgroundColor: i === 0 ? "#FED7AA" : "#E5E5E5",
                      }}
                    />
                  )}
                </View>
                <View className="flex-1 pt-1">
                  <Text
                    className={`text-sm font-bold ${
                      i === 0 ? "text-neutral-900" : "text-neutral-400"
                    }`}
                  >
                    {step.title}
                  </Text>
                  <Text className="text-xs text-neutral-400 mt-0.5">
                    {step.sub}
                  </Text>
                </View>
                {i === 0 && (
                  <View className="mt-1 bg-green-50 border border-green-100 rounded-full px-2.5 py-0.5">
                    <Text className="text-xs font-bold text-green-600">
                      Done
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* ── CTAs ── */}
          <View className="mx-4 gap-3">
            <TouchableOpacity
              className="bg-neutral-900 rounded-2xl py-4 flex-row items-center justify-center gap-2"
              onPress={() => router.replace("/orders")}
              activeOpacity={0.85}
            >
              <Ionicons name="storefront-outline" size={18} color="white" />
              <Text className="text-white text-base font-bold">
                Continue Shopping
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white border border-neutral-200 rounded-2xl py-4 flex-row items-center justify-center gap-2"
              onPress={() => router.push("/orders/index")}
              activeOpacity={0.85}
            >
              <Ionicons name="list-outline" size={18} color="#404040" />
              <Text className="text-neutral-700 text-base font-bold">
                View My Orders
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
