import { ThemedView } from "@/components/themed-view";
import ThemedButton from "@/components/ui/ThemedButton";
import ThemedInput from "@/components/ui/ThemedInput";
import { useAuth } from "@/hooks/useAuth";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";

export default function UpdateBio() {
  const [bio, setBio] = useState("");
  const updateProfile = useAuth((state) => state.updateProfile);
  const user = useAuth((state) => state.user);
  const router = useRouter();
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <Stack.Screen
        options={{
          title: "Update Bio",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <ThemedInput defaultValue={user?.bio} onChangeText={setBio}></ThemedInput>
      <ThemedButton
        style={{ marginTop: 16 }}
        title="Submit"
        onPress={() => {
          updateProfile({
            bio,
          });
          router.back();
        }}
      ></ThemedButton>
    </ThemedView>
  );
}
