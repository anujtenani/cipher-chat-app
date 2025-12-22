import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "react-native-reanimated";

import PinLockOverlay from "@/components/lockscreen/PinLockOverlay";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { apiGet } from "@/utils/api";
import { useNetworkState } from "expo-network";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SWRConfig } from "swr";

// export const unstable_settings = {
//   anchor: "(tabs)",
// };

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView>
        <SWRConfig
          value={{
            isOnline: () => networkState.isConnected ?? true,
            revalidateOnFocus: false,
            provider: () => new Map(),

            initFocus(callback) {
              let appState = AppState.currentState;
              const onAppStateChange = (nextAppState: typeof appState) => {
                /* If it's resuming from background or inactive mode to active one */
                if (
                  appState.match(/inactive|background/) &&
                  nextAppState === "active"
                ) {
                  callback();
                }
                appState = nextAppState;
              };
              // Subscribe to the app state change events
              const subscription = AppState.addEventListener(
                "change",
                onAppStateChange
              );
              return () => {
                subscription.remove();
              };
            },
            fetcher: apiGet,
          }}
        >
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
        </SWRConfig>
        <StatusBar style="auto" />
        <PinLockOverlay></PinLockOverlay>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
