import { useThemeColor } from "@/hooks/use-theme-color";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import ThemedButton from "../ui/ThemedButton";
import { ThemedText } from "../ui/ThemedText";

export function EnablePushNotifications() {
  const { hasPermission, register } = usePushNotifications();
  const borderColor = useThemeColor({}, "border");
  const surface = useThemeColor({}, "surface");
  const iconColor = useThemeColor({}, "text");
  if (!hasPermission) {
    return (
      <View
        style={{
          marginHorizontal: 12,
          marginTop: 12,
          backgroundColor: surface,
          padding: 12,
          borderWidth: 1,
          borderColor: borderColor,
          borderRadius: 18,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={iconColor}
            />
            <View>
              <ThemedText
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                }}
              >
                Never miss a message!
              </ThemedText>
              <ThemedText
                style={{
                  marginTop: 4,
                  fontSize: 14,
                }}
              >
                Enable Push Notifications
              </ThemedText>
            </View>
          </View>

          <ThemedButton
            style={{ paddingVertical: 12, paddingHorizontal: 2 }}
            onPress={register}
            title="Enable"
          ></ThemedButton>
        </View>
      </View>
    );
  }
}
