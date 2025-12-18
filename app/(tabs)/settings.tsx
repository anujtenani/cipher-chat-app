import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function Settings() {
  return (
    <View>
      <Stack.Screen options={{ title: "Settings" }} />
      <Text>Settings</Text>
    </View>
  );
}
