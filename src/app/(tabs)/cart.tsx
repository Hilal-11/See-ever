import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CartItem, useCartStore } from "../../../store/cartStore";

// ─── Constants ────────────────────────────────────────────────────────────────

const DELIVERY_THRESHOLD = 999;
const DELIVERY_CHARGE = 49;
const VALID_COUPON = "SAVE10";
const COUPON_DISCOUNT_RATE = 0.1;

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <View className="flex-1 items-center justify-center px-6">
    {/* Illustration */}
    <View className="items-center justify-center mb-8">
      {/* Outer glow ring */}
      <View className="w-44 h-44 rounded-full bg-orange-50 items-center justify-center">
        {/* Middle ring */}
        <View className="w-32 h-32 rounded-full bg-orange-100 items-center justify-center">
          {/* Icon circle */}
          <View className="w-20 h-20 rounded-full bg-orange-500 items-center justify-center shadow-lg">
            <Ionicons name="bag-handle-outline" size={38} color="white" />
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
        <Ionicons name="heart-outline" size={16} color="#F97316" />
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
        <Ionicons name="pricetag-outline" size={14} color="#F97316" />
      </View>
    </View>

    {/* Text */}
    <Text className="text-2xl font-extrabold text-neutral-900 text-center mb-2">
      Your Bag is Empty
    </Text>
    <Text className="text-sm text-black text-center leading-6 mb-10 px-4">
      You haven't added anything yet.{"\n"}Discover amazing fashion and fill it
      up!
    </Text>

    {/* CTA button */}
    <TouchableOpacity
      onPress={() => router.back()}
      activeOpacity={0.85}
      className="bg-orange-500 px-10 py-6 rounded-2xl flex-row items-center gap-2"
      style={{
        shadowColor: "#F97316",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      <Ionicons name="storefront-outline" size={18} color="white" />
      <Text className="text-black text-sm font-extrabold tracking-wide">
        Explore Collection
      </Text>
    </TouchableOpacity>

    {/* Bottom hint */}
    <Text className="text-xs text-black text-center mt-6">
      Free delivery on orders above ₹999
    </Text>
  </View>
);
// ─── Cart Item Card ───────────────────────────────────────────────────────────

interface CartCardProps {
  item: CartItem;
  onRemove: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

const CartCard: React.FC<CartCardProps> = ({
  item,
  onRemove,
  onIncrement,
  onDecrement,
}) => (
  <View
    className="flex-row bg-white rounded-2xl mb-3 overflow-hidden"
    style={{
      borderWidth: 1,
      borderColor: "#E9EAEC",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
      minHeight: 130,
    }}
  >
    {/* Product image */}
    <Image
      source={{ uri: item.image_url }}
      style={{ width: 112, height: "100%" }}
      contentFit="cover"
    />

    {/* Info column */}
    <View className="flex-1 p-3 justify-between">
      {/* Top row — title + trash */}
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <Text
            className="text-sm font-bold text-neutral-900 leading-5"
            numberOfLines={2}
          >
            {item.title}
          </Text>
          {item.size ? (
            <Text className="text-xs text-neutral-400 mt-0.5">
              Size: {item.size}
            </Text>
          ) : null}
          {item.color ? (
            <View className="flex-row items-center mt-0.5">
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: item.color.toLowerCase(),
                  borderWidth: 0.5,
                  borderColor: "#D1D5DB",
                  marginRight: 4,
                }}
              />
              <Text className="text-xs text-neutral-400 capitalize">
                {item.color}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Delete */}
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          activeOpacity={0.7}
          className="w-7 h-7 rounded-lg bg-red-50 items-center justify-center"
          style={{ borderWidth: 1, borderColor: "#FECDD3" }}
        >
          <Ionicons name="trash-outline" size={14} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Bottom row — qty control + line total */}
      <View className="flex-row justify-between items-center mt-3">
        {/* Qty stepper */}
        <View
          className="flex-row items-center bg-neutral-50 rounded-xl px-1 py-1"
          style={{ borderWidth: 1, borderColor: "#E9EAEC", gap: 10 }}
        >
          <TouchableOpacity
            onPress={onDecrement}
            activeOpacity={0.75}
            className="w-7 h-7 rounded-lg bg-white items-center justify-center"
            style={{ borderWidth: 1, borderColor: "#E9EAEC" }}
          >
            <Ionicons name="remove" size={14} color="#374151" />
          </TouchableOpacity>

          <Text className="text-sm font-bold text-neutral-900 w-5 text-center">
            {item.quantity}
          </Text>

          <TouchableOpacity
            onPress={onIncrement}
            activeOpacity={0.75}
            className="w-7 h-7 rounded-lg bg-neutral-900 items-center justify-center"
          >
            <Ionicons name="add" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Line total */}
        <Text className="text-base font-extrabold text-orange-600">
          ₹{(item.price * item.quantity).toLocaleString()}
        </Text>
      </View>
    </View>
  </View>
);

// ─── Cart Screen ──────────────────────────────────────────────────────────────

export default function CartScreen() {
  const { user } = useUser();
  const { items, removeFromCart, incrementQty, decrementQty } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  // ── Derived totals ──────────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryCharge = subtotal > DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const couponDiscount = couponApplied ? subtotal * COUPON_DISCOUNT_RATE : 0;
  const total = subtotal + deliveryCharge - couponDiscount;

  // ── Coupon logic ────────────────────────────────────────────────────────────
  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === VALID_COUPON) {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode("");
    setCouponError("");
  };

  // ── Render helpers ──────────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <CartCard
        item={item}
        onRemove={() => removeFromCart(item.product_id, user!.id)}
        onIncrement={() => incrementQty(item.product_id)}
        onDecrement={() => decrementQty(item.product_id, user!.id)}
      />
    ),
    [user, removeFromCart, incrementQty, decrementQty],
  );

  const keyExtractor = useCallback((item: CartItem) => item.id, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        className={`flex-1 bg-neutral-50 ${items.length === 0 ? "flex-1 min-h-screen justify-center items-center" : ""}`}
      >
        <SafeAreaView className="flex-1" edges={["top"]}>
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <View className="flex-row items-center justify-between px-4">
            {/* Back */}
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="w-9 h-9 items-center justify-center rounded-xl bg-neutral-50"
              style={{ borderWidth: 1, borderColor: "#E9EAEC" }}
            >
              <Ionicons name="chevron-back" size={20} color="#111827" />
            </TouchableOpacity>

            {/* Title */}
            <View className="items-center">
              <Text className="text-base font-extrabold text-neutral-900 tracking-tight">
                My Cart
              </Text>
              <View className="flex-row items-center mt-0.5">
                <Ionicons name="bag-outline" size={9} color="#9CA3AF" />
                <Text className="text-xs text-neutral-400 ml-1">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </Text>
              </View>
            </View>

            {/* Avatar → profile */}
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

          {/* ── Body ───────────────────────────────────────────────────────── */}
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            <FlatList
              data={items}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 300,
              }}
            />
          )}

          {/* ── Bottom Sheet ────────────────────────────────────────────────── */}
          {items.length > 0 && (
            <View
              className="absolute bottom-5 left-0 right-0 bg-white px-4 pt-4"
              style={{
                paddingBottom: Platform.OS === "ios" ? 34 : 16,
                borderTopWidth: 1,
                borderTopColor: "#F0F0F2",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.07,
                shadowRadius: 12,
                elevation: 12,
              }}
            >
              {/* Coupon row */}
              {couponApplied ? (
                <View
                  className="flex-row items-center justify-between bg-green-50 rounded-2xl px-4 py-3 mb-4"
                  style={{ borderWidth: 1, borderColor: "#BBF7D0" }}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#16A34A"
                    />
                    <Text className="text-sm font-bold text-green-700 ml-2">
                      SAVE10 applied — 10% off!
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleRemoveCoupon}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="mb-4">
                  <View className="flex-row items-center" style={{ gap: 8 }}>
                    <TextInput
                      value={couponCode}
                      onChangeText={(t) => {
                        setCouponCode(t);
                        setCouponError("");
                      }}
                      placeholder="Enter coupon code"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="characters"
                      className="flex-1 bg-neutral-50 rounded-2xl px-4 py-3 text-sm font-medium text-neutral-900"
                      style={{
                        borderWidth: 1,
                        borderColor: couponError ? "#FCA5A5" : "#E5E7EB",
                      }}
                    />
                    <TouchableOpacity
                      onPress={handleApplyCoupon}
                      activeOpacity={0.85}
                      className="bg-neutral-900 px-5 py-3 rounded-2xl"
                    >
                      <Text className="text-white text-sm font-bold">
                        Apply
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {couponError ? (
                    <Text className="text-xs text-red-400 mt-1.5 ml-1">
                      {couponError}
                    </Text>
                  ) : null}
                </View>
              )}

              {/* Price breakdown */}
              <View className="mb-4" style={{ gap: 6 }}>
                {/* Subtotal */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-neutral-500 font-medium">
                    Subtotal
                  </Text>
                  <Text className="text-sm font-semibold text-neutral-900">
                    ₹{subtotal.toLocaleString()}
                  </Text>
                </View>

                {/* Delivery */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-neutral-500 font-medium">
                    Delivery
                  </Text>
                  {deliveryCharge === 0 ? (
                    <Text className="text-sm font-bold text-green-600">
                      FREE
                    </Text>
                  ) : (
                    <Text className="text-sm font-semibold text-neutral-900">
                      ₹{deliveryCharge}
                    </Text>
                  )}
                </View>

                {/* Coupon discount — only when applied */}
                {couponApplied && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-neutral-500 font-medium">
                      Coupon (SAVE10)
                    </Text>
                    <Text className="text-sm font-semibold text-green-600">
                      −₹{couponDiscount.toLocaleString()}
                    </Text>
                  </View>
                )}

                {/* Divider */}
                <View className="h-px bg-neutral-100 my-1" />

                {/* Total */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-base font-extrabold text-neutral-900">
                    Total
                  </Text>
                  <Text className="text-base font-extrabold text-orange-600">
                    ₹{total.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Continue button */}
              <TouchableOpacity
                onPress={() => router.push("/checkout/address")}
                activeOpacity={0.85}
                disabled={items.length === 0}
                className={`fixed bottom-4 w-full rounded-2xl py-4 flex-row items-center justify-center mt-2 ${
                  items.length === 0 ? "bg-neutral-400" : "bg-neutral-900"
                }`}
                style={
                  items.length > 0
                    ? {
                        shadowColor: "#111827",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 4,
                      }
                    : undefined
                }
              >
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white text-base font-bold">
                  Continue to Checkout
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}
