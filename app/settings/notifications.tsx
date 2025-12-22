import SettingsListItem from "@/components/settings/SettingsListItem";
import SettingsSectionTitle from "@/components/settings/SettingsSectionTitle";
import { ThemedView } from "@/components/themed-view";
import ThemedSwitch from "@/components/ui/ThemedSwitch";
import { useThemeColor } from "@/hooks/use-theme-color";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { apiDelete, apiPost } from "@/utils/api";
import { Stack } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import useSWR from "swr";

interface NotificationSettingsResponseType {
  id: number;
  settings: {
    pushNotifications: boolean;
    messageNotifications: boolean;
    newChats: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    showPreviews: boolean;
  };
}

export default function NotificationSettings() {
  const bgColor = useThemeColor({}, "background");
  const { hasPermission, register, deviceToken, tokenType } =
    usePushNotifications();

  const { data, mutate } = useSWR<NotificationSettingsResponseType>(
    deviceToken
      ? `/auth/push/settings?token=${deviceToken}&type=${tokenType}`
      : null
  );

  const notificationSettings = data?.settings || {
    pushNotifications: true,
    messageNotifications: true,
    newChats: true,
    soundEnabled: true,
    vibrationEnabled: true,
    showPreviews: true,
  };
  const toggleNotificationSettings = (key: string) => (value: boolean) => {
    console.log("toggle called", key, value);
    if (!data?.id) {
      return;
    }
    mutate(
      apiPost("/auth/push/register", {
        token: deviceToken,
        type: tokenType,
        settings: {
          ...notificationSettings,
          [key]: value,
        },
      }),
      {
        revalidate: false,
        populateCache: false,
        rollbackOnError: true,
        optimisticData: {
          id: data?.id || 0,
          settings: {
            ...notificationSettings,
            [key]: value,
          },
        },
      }
    );
  };
  const notificationsEnabled =
    deviceToken && notificationSettings.pushNotifications ? true : false;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bgColor }}>
      <ThemedView style={{ flex: 1 }}>
        <Stack.Screen options={{ title: "Notifications" }} />

        <SettingsSectionTitle title="Push Notifications" />

        <SettingToggle
          title="Enable Push Notifications"
          description="Receive push notifications on this device"
          value={notificationsEnabled}
          onValueChange={(enabled: boolean) => {
            if (data?.id) {
              apiDelete(`/auth/push/${data?.id}`).then(() => {
                mutate();
              });
            } else {
              register();
            }
          }}
        />
        {notificationsEnabled ? (
          <>
            <SettingsSectionTitle title="Message Alerts" />

            <SettingToggle
              title="Message Notifications"
              description="Get notified when you receive new messages"
              value={notificationSettings.messageNotifications}
              onValueChange={toggleNotificationSettings("messageNotifications")}
            />

            <SettingToggle
              title="New Chat Requests"
              description="Get notified when someone starts a new chat"
              value={notificationSettings.newChats}
              onValueChange={toggleNotificationSettings("newChats")}
              disabled={!notificationSettings.pushNotifications}
            />

            <SettingsSectionTitle title="Notification Style" />

            <SettingToggle
              title="Sound"
              description="Play sound for notifications"
              value={notificationSettings.soundEnabled}
              onValueChange={toggleNotificationSettings("soundEnabled")}
              disabled={!notificationSettings.pushNotifications}
            />

            <SettingToggle
              title="Vibration"
              description="Vibrate for notifications"
              value={notificationSettings.vibrationEnabled}
              onValueChange={toggleNotificationSettings("vibrationEnabled")}
              disabled={!notificationSettings.pushNotifications}
            />

            <SettingToggle
              title="Show Message Previews"
              description="Display message content in notifications"
              value={notificationSettings.showPreviews}
              onValueChange={toggleNotificationSettings("showPreviews")}
              disabled={!notificationSettings.pushNotifications}
            />
          </>
        ) : null}

        <View style={{ height: 40 }} />
      </ThemedView>
    </ScrollView>
  );
}

function SettingToggle({
  title,
  description,
  value,
  onValueChange,
  disabled = false,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <SettingsListItem
      title={title}
      description={description}
      disabled={disabled}
    >
      <ThemedSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </SettingsListItem>
  );
}
