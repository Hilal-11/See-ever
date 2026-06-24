import { Text, View } from "react-native";

export default function CartScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Shopping Cart 🛒</Text>
      <Text style={{ marginTop: 10, color: "#666" }}>Your cart is empty</Text>
    </View>
  );
}
