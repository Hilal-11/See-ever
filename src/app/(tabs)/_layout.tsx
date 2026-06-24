import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
const TabLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();

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
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="wishlist" disablePopToTop>
        <NativeTabs.Trigger.Label>Wishlist</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("../../../assets/favourite.png")}
        />
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
