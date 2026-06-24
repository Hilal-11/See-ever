import { Text, View } from "react-native";

export default function WishlistScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Your Wishlist ❤️</Text>
      <Text style={{ marginTop: 10, color: "#666" }}>Save items you love</Text>
    </View>
  );
}
