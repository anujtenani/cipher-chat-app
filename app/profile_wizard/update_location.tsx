import { ThemedView } from "@/components/themed-view";
import ThemedButton from "@/components/ui/ThemedButton";
import ThemedInput from "@/components/ui/ThemedInput";
import { useAuth } from "@/hooks/useAuth";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";

export default function UpdateLocation() {
  const [location, setLocation] = useState("");
  const updateProfile = useAuth((state) => state.updateProfile);
  const user = useAuth((state) => state.user);
  const router = useRouter();
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <Stack.Screen
        options={{
          title: "Update Location",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <ThemedInput
        defaultValue={user?.location}
        onChangeText={setLocation}
      ></ThemedInput>
      <ThemedButton
        style={{ marginTop: 16 }}
        title="Submit"
        onPress={() => {
          updateProfile({
            location,
          });
          router.back();
        }}
      ></ThemedButton>
    </ThemedView>
  );
}
