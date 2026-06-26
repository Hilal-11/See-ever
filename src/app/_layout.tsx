import { ClerkProvider, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

// Inner component — inside ClerkProvider so useUser works
function InitialLayout() {
  const { user } = useUser();
  const syncCart = useCartStore((s) => s.syncFromSupabase);
  const syncWishlist = useWishlistStore((s) => s.syncFromSupabase);

  useEffect(() => {
    if (user?.id) {
      syncCart(user.id);
      syncWishlist(user.id);
    }
  }, [user?.id]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <InitialLayout />
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
