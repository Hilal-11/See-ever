import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
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
  total: number;
  payment_method: string;
  created_at: string;
  order_items: OrderItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

type FilterKey =
  | "all"
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_META: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    icon: keyof typeof Ionicons.glyphMap;
  }
> = {
  pending: {
    label: "Pending",
    color: "#D97706",
    bg: "#FFFBEB",
    icon: "time-outline",
  },
  confirmed: {
    label: "Confirmed",
    color: "#7C3AED",
    bg: "#F5F3FF",
    icon: "checkmark-circle-outline",
  },
  preparing: {
    label: "Preparing",
    color: "#0284C7",
    bg: "#F0F9FF",
    icon: "construct-outline",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "#F97316",
    bg: "#FFF7ED",
    icon: "bicycle-outline",
  },
  delivered: {
    label: "Delivered",
    color: "#16A34A",
    bg: "#F0FDF4",
    icon: "home-outline",
  },
  cancelled: {
    label: "Cancelled",
    color: "#EF4444",
    bg: "#FEF2F2",
    icon: "close-circle-outline",
  },
};

const PAYMENT_LABEL: Record<string, string> = {
  cod: "Cash on Delivery",
  upi: "UPI",
  card: "Card",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function totalItems(items: OrderItem[]) {
  return items.reduce((s, i) => s + i.quantity, 0);
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const meta = STATUS_META[order.status] ?? STATUS_META["pending"];
  const firstThreeImages = order.order_items.slice(0, 3);
  const extraCount = order.order_items.length - 3;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      className="mx-4 mb-3 bg-white rounded-2xl border border-neutral-100 overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      {/* Card top row */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-neutral-50">
        <View>
          <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            Order
          </Text>
          <Text className="text-sm font-extrabold text-neutral-900 mt-0.5">
            #{order.id.slice(0, 8).toUpperCase()}
          </Text>
        </View>

        {/* Status pill */}
        <View
          className="flex-row items-center gap-1.5 rounded-full px-3 py-1"
          style={{ backgroundColor: meta.bg }}
        >
          <Ionicons name={meta.icon} size={13} color={meta.color} />
          <Text className="text-xs font-bold" style={{ color: meta.color }}>
            {meta.label}
          </Text>
        </View>
      </View>

      {/* Product image strip */}
      <View className="flex-row items-center gap-2 px-4 py-3">
        {firstThreeImages.map((item, i) => (
          <View key={item.id} className="relative">
            <Image
              source={{ uri: item.image_url }}
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#F5F5F5",
              }}
              contentFit="cover"
            />
            {/* Extra count badge on the last visible image */}
            {i === 2 && extraCount > 0 && (
              <View
                className="absolute inset-0 rounded-xl items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
              >
                <Text className="text-white text-xs font-extrabold">
                  +{extraCount}
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* Item count + total items */}
        <View className="flex-1 pl-1">
          <Text className="text-xs text-neutral-400 font-medium">
            {totalItems(order.order_items)} item
            {totalItems(order.order_items) !== 1 ? "s" : ""}
          </Text>
          <Text className="text-base font-extrabold text-neutral-900 mt-0.5">
            ₹{order.total.toLocaleString()}
          </Text>
          <Text className="text-xs text-neutral-400 mt-0.5">
            {PAYMENT_LABEL[order.payment_method] ?? order.payment_method}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-neutral-50 border-t border-neutral-100">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="calendar-outline" size={13} color="#A3A3A3" />
          <Text className="text-xs text-neutral-400">
            {formatDate(order.created_at)}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="text-xs font-bold text-orange-500">Track Order</Text>
          <Ionicons name="chevron-forward" size={13} color="#F97316" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: FilterKey }) {
  const messages: Partial<
    Record<FilterKey, { icon: keyof typeof Ionicons.glyphMap; text: string }>
  > = {
    all: { icon: "bag-outline", text: "You haven't placed any orders yet." },
    delivered: { icon: "home-outline", text: "No delivered orders yet." },
    cancelled: { icon: "close-circle-outline", text: "No cancelled orders." },
    out_for_delivery: {
      icon: "bicycle-outline",
      text: "Nothing out for delivery right now.",
    },
  };
  const m = messages[filter] ?? {
    icon: "receipt-outline",
    text: "No orders in this category.",
  };

  return (
    <View className="flex-1 items-center justify-center pt-24 px-8">
      <Ionicons name={m.icon} size={56} color="#E5E5E5" />
      <Text className="text-sm font-bold text-neutral-400 mt-4 text-center">
        {m.text}
      </Text>
      <Text className="text-xs text-neutral-300 mt-1 text-center">
        Orders you place will appear here.
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useUser();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total, payment_method, created_at, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setOrders(data as Order[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filtered =
    activeFilter === "all"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  // Count badge per filter
  const countFor = (key: FilterKey) =>
    key === "all"
      ? orders.length
      : orders.filter((o) => o.status === key).length;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color="#171717" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-lg font-extrabold text-neutral-900">
            My Orders
          </Text>
          {orders.length > 0 && (
            <Text className="text-xs text-neutral-400">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={fetchOrders} hitSlop={8}>
          <Ionicons name="refresh-outline" size={21} color="#171717" />
        </TouchableOpacity>
      </View>

      {/* ── Filter chips ── */}
      <View className="bg-white border-b border-neutral-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 8,
          }}
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            const count = countFor(f.key);
            if (count === 0 && f.key !== "all") return null;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setActiveFilter(f.key)}
                activeOpacity={0.8}
                className="flex-row items-center gap-1.5 rounded-full px-3.5 py-1.5"
                style={{
                  backgroundColor: isActive ? "#171717" : "#F5F5F5",
                }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: isActive ? "#FFFFFF" : "#737373" }}
                >
                  {f.label}
                </Text>
                {count > 0 && (
                  <View
                    className="rounded-full px-1.5 py-0.5 min-w-4 items-center"
                    style={{
                      backgroundColor: isActive ? "#F97316" : "#E5E5E5",
                    }}
                  >
                    <Text
                      className="text-xs font-extrabold"
                      style={{
                        color: isActive ? "#FFFFFF" : "#A3A3A3",
                        fontSize: 10,
                      }}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
          <Text className="text-xs text-neutral-400 mt-3">
            Loading your orders...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 40,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F97316"
            />
          }
        >
          {filtered.length === 0 ? (
            <EmptyState filter={activeFilter} />
          ) : (
            filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() =>
                  router.push({
                    pathname: "/checkout/track",
                    params: { orderId: order.id },
                  })
                }
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
