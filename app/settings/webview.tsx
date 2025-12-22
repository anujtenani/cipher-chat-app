import { useLocalSearchParams } from "expo-router";
import React from "react";
import WebView from "react-native-webview";
export default function WebViewPage() {
  const { url } = useLocalSearchParams();
  return (
    <WebView
      style={{
        flex: 1,
      }}
      source={{ uri: (url as string) || "https://hideitpro.com" }}
    />
  );
}
