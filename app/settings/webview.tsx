import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import WebView from "react-native-webview";
export default function WebViewPage() {
  const { url, title } = useLocalSearchParams<{
    url?: string;
    title?: string;
  }>();
  return (
    <>
      <Stack.Screen
        options={{
          title: (title as string) || "WebView",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <WebView
        style={{
          flex: 1,
        }}
        source={{ uri: (url as string) || "https://hideitpro.com" }}
      />
    </>
  );
}
