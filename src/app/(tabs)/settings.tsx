import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: SectionProps) {
  return (
    <View className="mb-5">
      <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-4 mb-2">
        {title}
      </Text>
      <View
        className="mx-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Row({
  icon,
  iconColor,
  iconBg,
  label,
  sublabel,
  onPress,
  right,
  destructive = false,
}: RowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center px-4 py-3.5 border-b border-neutral-50 last:border-0"
    >
      {/* Icon */}
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      {/* Labels */}
      <View className="flex-1">
        <Text
          className={`text-sm font-semibold ${
            destructive ? "text-red-500" : "text-neutral-900"
          }`}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text className="text-xs text-neutral-400 mt-0.5">{sublabel}</Text>
        ) : null}
      </View>

      {/* Right side */}
      {right ??
        (onPress ? (
          <Ionicons name="chevron-forward" size={16} color="#D4D4D4" />
        ) : null)}
    </TouchableOpacity>
  );
}

function Divider() {
  return <View className="h-px bg-neutral-50" />;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // hook up to your delete logic
          },
        },
      ],
    );
  };

  const avatarUrl = user?.imageUrl;
  const fullName = user?.fullName ?? user?.firstName ?? "You";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color="#171717" />
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-neutral-900">
          Settings
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48, paddingTop: 20 }}
      >
        {/* ── Profile card ── */}
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          activeOpacity={0.85}
          className="mx-4 mb-6 bg-white rounded-2xl border border-neutral-100 p-4 flex-row items-center gap-3"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
            elevation: 3,
          }}
        >
          {/* Avatar */}
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 56, height: 56, borderRadius: 28 }}
              contentFit="cover"
            />
          ) : (
            <View className="w-14 h-14 rounded-full bg-orange-100 items-center justify-center">
              <Text className="text-xl font-extrabold text-orange-500">
                {fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Info */}
          <View className="flex-1">
            <Text
              className="text-base font-extrabold text-neutral-900"
              numberOfLines={1}
            >
              {fullName}
            </Text>
            <Text className="text-xs text-neutral-400 mt-0.5" numberOfLines={1}>
              {email}
            </Text>
            <View className="flex-row items-center gap-1 mt-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <Text className="text-xs text-green-600 font-medium">
                Active account
              </Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#D4D4D4" />
        </TouchableOpacity>

        {/* ── My Account ── */}
        <Section title="My Account">
          <Row
            icon="person-outline"
            iconColor="#7C3AED"
            iconBg="#F5F3FF"
            label="Edit Profile"
            sublabel="Update your name, photo, and info"
            onPress={() => router.push("/profile")}
          />
          <Divider />
          <Row
            icon="location-outline"
            iconColor="#F97316"
            iconBg="#FFF7ED"
            label="Saved Addresses"
            sublabel="Manage delivery addresses"
            onPress={() => router.push("/addresses")}
          />
          <Divider />
          <Row
            icon="card-outline"
            iconColor="#0284C7"
            iconBg="#F0F9FF"
            label="Payment Methods"
            sublabel="Cards, UPI, wallets"
            onPress={() => router.push("/payments")}
          />
        </Section>

        {/* ── Shopping ── */}
        <Section title="Shopping">
          <Row
            icon="bag-outline"
            iconColor="#F97316"
            iconBg="#FFF7ED"
            label="My Orders"
            sublabel="View and track your orders"
            onPress={() => router.push("/orders")}
          />
          <Divider />
          <Row
            icon="heart-outline"
            iconColor="#EF4444"
            iconBg="#FEF2F2"
            label="Wishlist"
            sublabel="Items you've saved"
            onPress={() => router.push("/(tabs)/wishlist")}
          />
          <Divider />
          <Row
            icon="cart-outline"
            iconColor="#16A34A"
            iconBg="#F0FDF4"
            label="My Cart"
            sublabel="Review items in your cart"
            onPress={() => router.push("/(tabs)/cart")}
          />
          <Divider />
          <Row
            icon="pricetag-outline"
            iconColor="#D97706"
            iconBg="#FFFBEB"
            label="Coupons & Offers"
            sublabel="Your available discounts"
            onPress={() => router.push("/coupons")}
          />
        </Section>

        {/* ── Notifications ── */}
        <Section title="Notifications">
          <Row
            icon="notifications-outline"
            iconColor="#7C3AED"
            iconBg="#F5F3FF"
            label="Push Notifications"
            sublabel="Order updates, offers, restocks"
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#E5E5E5", true: "#FDBA74" }}
                thumbColor={notificationsEnabled ? "#F97316" : "#FAFAFA"}
              />
            }
          />
          <Divider />
          <Row
            icon="mail-outline"
            iconColor="#0284C7"
            iconBg="#F0F9FF"
            label="Email Updates"
            sublabel="Newsletter and promotions"
            right={
              <Switch
                value={emailUpdates}
                onValueChange={setEmailUpdates}
                trackColor={{ false: "#E5E5E5", true: "#FDBA74" }}
                thumbColor={emailUpdates ? "#F97316" : "#FAFAFA"}
              />
            }
          />
        </Section>

        {/* ── Preferences ── */}
        <Section title="Preferences">
          <Row
            icon="moon-outline"
            iconColor="#6B7280"
            iconBg="#F5F5F5"
            label="Dark Mode"
            sublabel="Coming soon"
            right={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: "#E5E5E5", true: "#FDBA74" }}
                thumbColor={darkMode ? "#F97316" : "#FAFAFA"}
                disabled
              />
            }
          />
          <Divider />
          <Row
            icon="language-outline"
            iconColor="#16A34A"
            iconBg="#F0FDF4"
            label="Language"
            sublabel="English"
            onPress={() => {}}
            right={
              <View className="flex-row items-center gap-1">
                <Text className="text-xs font-bold text-neutral-400">EN</Text>
                <Ionicons name="chevron-forward" size={16} color="#D4D4D4" />
              </View>
            }
          />
          <Divider />
          <Row
            icon="cash-outline"
            iconColor="#D97706"
            iconBg="#FFFBEB"
            label="Currency"
            sublabel="Indian Rupee (₹)"
            onPress={() => {}}
            right={
              <View className="flex-row items-center gap-1">
                <Text className="text-xs font-bold text-neutral-400">INR</Text>
                <Ionicons name="chevron-forward" size={16} color="#D4D4D4" />
              </View>
            }
          />
        </Section>

        {/* ── Support ── */}
        <Section title="Support">
          <Row
            icon="help-circle-outline"
            iconColor="#0284C7"
            iconBg="#F0F9FF"
            label="Help & FAQ"
            sublabel="Common questions answered"
            onPress={() => router.push("/help")}
          />
          <Divider />
          <Row
            icon="chatbubble-ellipses-outline"
            iconColor="#7C3AED"
            iconBg="#F5F3FF"
            label="Contact Support"
            sublabel="Chat with our team"
            onPress={() => router.push("/support")}
          />
          <Divider />
          <Row
            icon="star-outline"
            iconColor="#D97706"
            iconBg="#FFFBEB"
            label="Rate SeeEver"
            sublabel="Enjoying the app? Leave a review"
            onPress={() => {}}
          />
          <Divider />
          <Row
            icon="share-social-outline"
            iconColor="#16A34A"
            iconBg="#F0FDF4"
            label="Share App"
            sublabel="Invite your friends"
            onPress={() => {}}
          />
        </Section>

        {/* ── Legal ── */}
        <Section title="Legal">
          <Row
            icon="document-text-outline"
            iconColor="#6B7280"
            iconBg="#F5F5F5"
            label="Terms of Service"
            onPress={() => router.push("/terms")}
          />
          <Divider />
          <Row
            icon="shield-checkmark-outline"
            iconColor="#6B7280"
            iconBg="#F5F5F5"
            label="Privacy Policy"
            onPress={() => router.push("/privacy")}
          />
          <Divider />
          <Row
            icon="newspaper-outline"
            iconColor="#6B7280"
            iconBg="#F5F5F5"
            label="Licenses"
            onPress={() => router.push("/licenses")}
          />
        </Section>

        {/* ── App info ── */}
        <View
          className="mx-4 mb-5 bg-white rounded-2xl border border-neutral-100 px-4 py-3 flex-row items-center justify-between"
          style={{ elevation: 1 }}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-xl bg-neutral-900 items-center justify-center">
              <Text className="text-white font-extrabold text-xs">SE</Text>
            </View>
            <View>
              <Text className="text-sm font-bold text-neutral-900">
                SeeEver
              </Text>
              <Text className="text-xs text-neutral-400">Version 1.0.0</Text>
            </View>
          </View>
          <View className="bg-green-50 border border-green-100 rounded-full px-2.5 py-1">
            <Text className="text-xs font-bold text-green-600">Up to date</Text>
          </View>
        </View>

        {/* ── Sign out ── */}
        <Section title="Account Actions">
          <Row
            icon="log-out-outline"
            iconColor="#EF4444"
            iconBg="#FEF2F2"
            label="Sign Out"
            destructive
            onPress={handleSignOut}
          />
          <Divider />
          <Row
            icon="trash-outline"
            iconColor="#EF4444"
            iconBg="#FEF2F2"
            label="Delete Account"
            sublabel="Permanently remove your account"
            destructive
            onPress={handleDeleteAccount}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
