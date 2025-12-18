import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
export default function AppRoot() {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const init = useAuth((state) => state.init);
  useEffect(() => {
    if (!user) {
      init().then((data) => {
        if (data.access_token) {
          router.replace("/home");
        } else {
          router.replace("/login");
        }
      });
    }
  }, [init, router, user]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator></ActivityIndicator>
    </View>
  );
}
