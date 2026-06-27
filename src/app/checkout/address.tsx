import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";
import { useCartStore } from "../../../store/cartStore";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Address {
  name: string;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

type PaymentMethod = "cod" | "upi" | "card";

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  sublabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  available: boolean;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "cod",
    label: "Cash on Delivery",
    sublabel: "Pay when your order arrives",
    icon: "cash-outline",
    iconColor: "#16A34A",
    iconBg: "#F0FDF4",
    available: true,
  },
  {
    id: "upi",
    label: "UPI",
    sublabel: "GPay, PhonePe, Paytm & more",
    icon: "phone-portrait-outline",
    iconColor: "#7C3AED",
    iconBg: "#F5F3FF",
    available: false,
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    sublabel: "Visa, Mastercard, RuPay",
    icon: "card-outline",
    iconColor: "#0284C7",
    iconBg: "#F0F9FF",
    available: false,
  },
];

export default function AddressScreen() {
  const router = useRouter();
  const { user } = useUser();
  const params = useLocalSearchParams<{
    total: string;
    subtotal: string;
    deliveryCharge: string;
    discount: string;
    couponCode: string;
  }>();

  const total = parseFloat(params.total ?? "0");
  const subtotal = parseFloat(params.subtotal ?? "0");
  const deliveryCharge = parseFloat(params.deliveryCharge ?? "0");
  const discount = parseFloat(params.discount ?? "0");
  const couponCode = params.couponCode ?? "";

  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  // State
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null,
  );
  const [manualAddress, setManualAddress] = useState<Address>({
    name: "",
    street: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
  });
  const [modalError, setModalError] = useState("");

  const canPlaceOrder =
    addressConfirmed && selectedPayment !== null && !placingOrder;

  useEffect(() => {
    requestLocation();
  }, []);

  //   const requestLocation = async () => {
  //     setLocationLoading(true);
  //     try {
  //       const { status } = await Location.requestForegroundPermissionsAsync();
  //       if (status !== "granted") {
  //         setLocationPermission(false);
  //         setLocationLoading(false);
  //         return;
  //       }
  //       setLocationPermission(true);

  //       const pos = await Location.getCurrentPositionAsync({
  //         accuracy: Location.Accuracy.High,
  //       });
  //       const { latitude, longitude } = pos.coords;
  //       setCoordinates({ latitude, longitude });

  //       const results = await Location.reverseGeocodeAsync({
  //         latitude,
  //         longitude,
  //       });
  //       if (results.length > 0) {
  //         const r = results[0];
  //         const fullName = user?.fullName ?? user?.firstName ?? "";
  //         setAddress({
  //           name: fullName,
  //           street: [r.name, r.street].filter(Boolean).join(" "),
  //           city: r.city ?? r.subregion ?? "",
  //           region: r.region ?? "",
  //           postalCode: r.postalCode ?? "",
  //           country: r.country ?? "",
  //         });
  //         setAddressConfirmed(true);
  //       }
  //     } catch (e) {
  //       console.error(e);
  //     } finally {
  //       setLocationLoading(false);
  //     }
  //   };

  const requestLocation = async () => {
    setLocationLoading(true);
    // mock data for testing
    setCoordinates({ latitude: 28.6139, longitude: 77.209 });
    setAddress({
      name: user?.fullName ?? user?.firstName ?? "",
      street: "Connaught Place",
      city: "New Delhi",
      region: "Delhi",
      postalCode: "110001",
      country: "India",
    });
    setAddressConfirmed(true);
    setLocationPermission(true);
    setLocationLoading(false);
  };

  const saveAddressToSupabase = async (addr: Address) => {
    if (!user?.id) return;
    try {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      const { error } = await supabase.from("addresses").insert({
        user_id: user.id,
        name: addr.name,
        street: addr.street,
        city: addr.city,
        region: addr.region,
        postal_code: addr.postalCode,
        country: addr.country,
        is_default: true,
      });
      if (error) console.error(error);
      else {
        setAddressSaved(true);
        setTimeout(() => setAddressSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUseThisAddress = () => {
    if (address) {
      setAddressConfirmed(true);
      saveAddressToSupabase(address);
    }
  };

  const handleConfirmManualAddress = () => {
    const fields = Object.values(manualAddress);
    if (fields.some((f) => !f.trim())) {
      setModalError("Please fill in all fields.");
      return;
    }
    setModalError("");
    setAddress(manualAddress);
    setAddressConfirmed(true);
    saveAddressToSupabase(manualAddress);
    setShowModal(false);
  };

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder || !address || !user?.id || !selectedPayment) return;
    setPlacingOrder(true);
    setOrderError("");

    try {
      const { data, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          subtotal,
          delivery_charge: deliveryCharge,
          discount,
          total,
          payment_method: selectedPayment,
          payment_status: "pending",
          coupon_code: couponCode || null,
          delivery_address: {
            name: address.name,
            street: address.street,
            city: address.city,
            region: address.region,
            postalCode: address.postalCode,
            country: address.country,
            latitude: coordinates?.latitude ?? null,
            longitude: coordinates?.longitude ?? null,
          },
        })
        .select()
        .single();

      if (orderErr || !data) throw orderErr ?? new Error("Order insert failed");

      const orderItems = cartItems.map((item) => ({
        order_id: data.id,
        product_id: item.product_id,
        title: item.title,
        image_url: item.image_url,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();

      await supabase.from("cart").delete().eq("user_id", user.id);

      router.replace({
        pathname: "/checkout/confirmation",
        params: { orderId: data.id, total: String(total) },
      });
    } catch (e) {
      console.error(e);
      setOrderError("Failed to place order. Please try again.");
      setPlacingOrder(false);
    }
  };

  // Permission denied state
  if (!locationLoading && !locationPermission) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#171717" />
          </TouchableOpacity>
          <Text className="text-lg font-extrabold text-neutral-900">
            Delivery Address
          </Text>
          <View style={{ width: 22 }} />
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="navigate-circle-outline" size={64} color="#D1D5DB" />
          <Text className="text-base font-bold text-neutral-800 mt-4 text-center">
            Location permission denied
          </Text>
          <Text className="text-sm text-neutral-500 mt-2 text-center leading-5">
            Please enable location access in settings to auto-detect your
            address.
          </Text>
          <TouchableOpacity
            className="mt-6 bg-neutral-900 rounded-2xl px-8 py-3"
            onPress={() => Linking.openSettings()}
          >
            <Text className="text-white font-bold text-sm">Open Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#171717" />
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-neutral-900">
          Delivery Address
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {locationLoading ? (
          <View className="items-center justify-center mt-16 px-8">
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="text-sm text-neutral-500 mt-4 font-medium">
              Detecting your location...
            </Text>
          </View>
        ) : (
          <>
            {/* ── Address Card ── */}
            {address && (
              <View
                className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden"
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                <View className="flex-row items-start p-4 gap-3">
                  <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center">
                    <Ionicons name="location" size={20} color="#F97316" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-extrabold text-neutral-900 mb-1">
                      {user?.fullName ?? user?.firstName ?? "You"}
                    </Text>
                    <Text className="text-sm text-neutral-600 leading-5">
                      {[
                        address.street,
                        address.city,
                        address.region,
                        address.postalCode,
                        address.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                    {coordinates && (
                      <Text className="text-xs text-neutral-400 mt-1">
                        {coordinates.latitude.toFixed(4)},{" "}
                        {coordinates.longitude.toFixed(4)}
                      </Text>
                    )}
                    {addressSaved && (
                      <Text className="text-xs text-green-600 font-medium mt-1">
                        ✓ Address saved
                      </Text>
                    )}
                  </View>
                </View>
                <View className="h-px bg-neutral-100" />
                <View className="flex-row">
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center gap-1.5 py-3"
                    onPress={handleUseThisAddress}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#16A34A"
                    />
                    <Text className="text-sm font-bold text-green-600">
                      Use This Address
                    </Text>
                  </TouchableOpacity>
                  <View className="w-px bg-neutral-100" />
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center gap-1.5 py-3"
                    onPress={() => setShowModal(true)}
                  >
                    <Ionicons name="pencil" size={16} color="#6B7280" />
                    <Text className="text-sm font-bold text-neutral-500">
                      Change Address
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── Payment Methods ── */}
            {addressConfirmed && (
              <View className="mx-4 mt-5">
                {/* Section header */}
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-1 h-4 bg-orange-500 rounded-full" />
                  <Text className="text-sm font-extrabold text-neutral-900 tracking-tight">
                    Payment Method
                  </Text>
                </View>

                <View
                  className="bg-white rounded-2xl border border-neutral-100 overflow-hidden"
                  style={{
                    shadowColor: "#000",
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  }}
                >
                  {PAYMENT_OPTIONS.map((option, index) => {
                    const isSelected = selectedPayment === option.id;
                    const isLast = index === PAYMENT_OPTIONS.length - 1;

                    return (
                      <React.Fragment key={option.id}>
                        <TouchableOpacity
                          onPress={() =>
                            option.available && setSelectedPayment(option.id)
                          }
                          activeOpacity={option.available ? 0.7 : 1}
                          className="flex-row items-center px-4 py-4"
                          style={
                            isSelected
                              ? { backgroundColor: "#FFFBF5" }
                              : undefined
                          }
                        >
                          {/* Icon bubble */}
                          <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{
                              backgroundColor: option.available
                                ? option.iconBg
                                : "#F5F5F5",
                            }}
                          >
                            <Ionicons
                              name={option.icon}
                              size={20}
                              color={
                                option.available ? option.iconColor : "#D4D4D4"
                              }
                            />
                          </View>

                          {/* Labels */}
                          <View className="flex-1">
                            <View className="flex-row items-center gap-2">
                              <Text
                                className={`text-sm font-bold ${
                                  option.available
                                    ? "text-neutral-900"
                                    : "text-neutral-300"
                                }`}
                              >
                                {option.label}
                              </Text>
                              {!option.available && (
                                <View className="bg-neutral-100 rounded-full px-2 py-0.5">
                                  <Text className="text-xs font-semibold text-neutral-400">
                                    Coming soon
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text
                              className={`text-xs mt-0.5 ${
                                option.available
                                  ? "text-neutral-400"
                                  : "text-neutral-300"
                              }`}
                            >
                              {option.sublabel}
                            </Text>
                          </View>

                          {/* Radio */}
                          <View
                            className="w-5 h-5 rounded-full border-2 items-center justify-center"
                            style={{
                              borderColor: isSelected
                                ? "#F97316"
                                : option.available
                                  ? "#D4D4D4"
                                  : "#E5E5E5",
                            }}
                          >
                            {isSelected && (
                              <View
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: "#F97316" }}
                              />
                            )}
                          </View>
                        </TouchableOpacity>

                        {/* COD selected — info banner */}
                        {isSelected && option.id === "cod" && (
                          <View className="mx-4 mb-3 flex-row items-start gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">
                            <Ionicons
                              name="information-circle-outline"
                              size={15}
                              color="#16A34A"
                              style={{ marginTop: 1 }}
                            />
                            <Text className="flex-1 text-xs text-green-700 leading-4">
                              Keep exact change ready. Our delivery partner will
                              collect payment at your door.
                            </Text>
                          </View>
                        )}

                        {!isLast && (
                          <View className="h-px bg-neutral-100 mx-4" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </View>

                {/* Prompt if no method selected yet */}
                {!selectedPayment && (
                  <View className="flex-row items-center gap-1.5 mt-2 px-1">
                    <Ionicons
                      name="alert-circle-outline"
                      size={13}
                      color="#F97316"
                    />
                    <Text className="text-xs text-orange-500 font-medium">
                      Select a payment method to continue
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* ── Order Summary Strip ── */}
            <View className="mx-4 mt-4 bg-orange-50 rounded-2xl px-4 py-3 border border-orange-100">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-bold text-neutral-900">
                    Order Total
                  </Text>
                  <Text className="text-xs text-neutral-400">
                    including delivery
                  </Text>
                </View>
                <Text className="text-lg font-extrabold text-orange-600">
                  ₹{total.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Error */}
            {orderError ? (
              <Text className="text-xs text-red-400 text-center mt-3 px-4">
                {orderError}
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>

      {/* ── Place Order Button ── */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-4 pt-3 border-t border-neutral-100"
        style={{ paddingBottom: Platform.OS === "ios" ? 34 : 16 }}
      >
        <TouchableOpacity
          className={`rounded-2xl py-4 flex-row items-center justify-center ${
            canPlaceOrder ? "bg-neutral-900" : "bg-neutral-300"
          }`}
          disabled={!canPlaceOrder}
          onPress={handlePlaceOrder}
          activeOpacity={0.85}
        >
          {placingOrder ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons
                name="bag-check-outline"
                size={20}
                color={canPlaceOrder ? "white" : "#A3A3A3"}
                style={{ marginRight: 8 }}
              />
              <Text
                className={`text-base font-bold ${
                  canPlaceOrder ? "text-white" : "text-neutral-400"
                }`}
              >
                {!addressConfirmed
                  ? "Confirm Address First"
                  : !selectedPayment
                    ? "Select Payment Method"
                    : "Place Order"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Change Address Modal ── */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-neutral-100">
            <Text className="text-base font-extrabold text-neutral-900">
              Enter Address
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#171717" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              className="flex-1 px-4 pt-4"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {(
                [
                  { label: "Full Name", key: "name", placeholder: "John Doe" },
                  {
                    label: "Street Address",
                    key: "street",
                    placeholder: "123 MG Road",
                  },
                  { label: "City", key: "city", placeholder: "Mumbai" },
                  {
                    label: "State / Region",
                    key: "region",
                    placeholder: "Maharashtra",
                  },
                  {
                    label: "Postal Code",
                    key: "postalCode",
                    placeholder: "400001",
                    keyboardType: "numeric",
                  },
                  { label: "Country", key: "country", placeholder: "India" },
                ] as const
              ).map((field) => (
                <View key={field.key} className="mb-1">
                  <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    {field.label}
                  </Text>
                  <TextInput
                    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 mb-3"
                    placeholder={field.placeholder}
                    placeholderTextColor="#A3A3A3"
                    value={manualAddress[field.key]}
                    onChangeText={(val) =>
                      setManualAddress((prev) => ({
                        ...prev,
                        [field.key]: val,
                      }))
                    }
                    keyboardType={(field as any).keyboardType ?? "default"}
                    autoCapitalize="words"
                  />
                </View>
              ))}

              {modalError ? (
                <Text className="text-xs text-red-400 mb-3">{modalError}</Text>
              ) : null}

              <View style={{ height: 16 }} />
            </ScrollView>

            <TouchableOpacity
              className="bg-neutral-900 rounded-2xl py-4 mx-4 mt-2 mb-4 items-center"
              onPress={handleConfirmManualAddress}
            >
              <Text className="text-white text-base font-bold">
                Confirm Address
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
