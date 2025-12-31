import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "react-native-reanimated";

import PinLockOverlay from "@/components/lockscreen/PinLockOverlay";
import { apiGet } from "@/utils/api";
import { useNetworkState } from "expo-network";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { AppState, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SWRConfig } from "swr";

// export const unstable_settings = {
//   anchor: "(tabs)",
// };

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  // const { isAvailable, isMandatory, updateInfo, openUpdateURL, dismissUpdate } =
  //   useUpdateChecker();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
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
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false, title: "Main" }}
            />

            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
            <Stack.Screen
              name="camera"
              options={{ headerShown: false, animation: "fade" }}
            />
          </Stack>
        </SWRConfig>
        <StatusBar style="auto" />
        <PinLockOverlay></PinLockOverlay>
        {/* <UpdateModal
          visible={isAvailable}
          versionName={updateInfo?.versionName || ""}
          isMandatory={isMandatory}
          onUpdate={openUpdateURL}
          onDismiss={dismissUpdate}
        /> */}
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
