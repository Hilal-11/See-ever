import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useCartStore } from "../../../store/cartStore";
import { useWishlistStore } from "../../../store/wishlistStore";
const TabLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const cartItems = useCartStore((s) => s.items);
  const wishlistIds = useWishlistStore((s) => s.ids);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const wishlistCount = wishlistIds.length;
  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href={"/(auth)/sign-up"} />;

  return (
    <NativeTabs tintColor={"orange"} shadowColor={"#ffffff"}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cart" disablePopToTop>
        <NativeTabs.Trigger.Label>Cart</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("../../../assets/shopping-cart.png")}
        />
        {cartCount > 0 && (
          <NativeTabs.Trigger.Badge>
            {String(cartCount)}
          </NativeTabs.Trigger.Badge>
        )}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="wishlist" disablePopToTop>
        <NativeTabs.Trigger.Label>Wishlist</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("../../../assets/favourite.png")}
        />
        {wishlistCount > 0 && (
          <NativeTabs.Trigger.Badge>
            {String(wishlistCount)}
          </NativeTabs.Trigger.Badge>
        )}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" disablePopToTop>
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require("../../../assets/user.png")} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings" disablePopToTop>
        <NativeTabs.Trigger.Icon sf="gear" md="settings" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabLayout;
