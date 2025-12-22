import { Tabs } from "expo-router";
import React, { useEffect } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/hooks/useAuth";
import { socket } from "@/utils/api";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const id = useAuth((state) => state.user?.id);
  useEffect(() => {
    if (!id) return;
    socket.connect();
    socket.on(`typing:start`, ({ conversationId, userId }) => {
      // console.log("User started typing:", data);
    });
    return () => {
      socket.disconnect();
    };
  }, [id]);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: true,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Chats",
          headerTitle: "Chats",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title: "Nearby",
          headerTitle: "Nearby",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerTitle: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gear" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
