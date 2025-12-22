import { apiPost } from "@/utils/api";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export async function registerForNativePushToken() {
  if (!Device.isDevice) {
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    throw new Error("Push permission not granted");
  }

  // 👇 THIS is the native token
  const token = await Notifications.getDevicePushTokenAsync();
  apiPost("/auth/push/register", {
    service: token.type === "fcm" ? "fcm" : "apns",
    token: token.data,
  });

  return token;
}

export function usePushNotifications() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);

  useEffect(() => {
    async function getPermission() {
      const { status } = await Notifications.getPermissionsAsync();
      const hasPermission = status === "granted";
      setHasPermission(hasPermission);
      if (hasPermission) {
        const token = await registerForNativePushToken();
        if (token) {
          setDeviceToken(token.data);
        }
      }
    }
    getPermission();
  }, []);

  const register = () => {
    registerForNativePushToken()
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  };

  return {
    hasPermission,
    register,
    deviceToken,
    tokenType: Platform.OS === "ios" ? "apns" : "fcm",
  };
}
