import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { Text } from "react-native";

const TabLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href={"/(auth)/sign-up"} />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Text style={{ color }}>🏠</Text>,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
