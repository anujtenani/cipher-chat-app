import { ActivityIndicator, View } from "react-native";

export default function LoadingScreen() {
  return (
    <View
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <ActivityIndicator></ActivityIndicator>
    </View>
  );
}
