import { useThemeColor } from "@/hooks/use-theme-color";
import { apiPost } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedInput from "../ui/ThemedInput";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendAttachment?: (uri: string, type: "image" | "video") => void;
  conversationId: number;
}

export default function ChatInput({
  onSendMessage,
  conversationId,
  onSendAttachment,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const iconColor = useThemeColor({}, "icon");
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    if (message.trim()) {
      apiPost(`/conversations/${conversationId}/messages`, {
        content: { text: message.trim() },
      });
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        paddingBottom: insets.bottom + 4,
        paddingLeft: insets.left + 8,
        paddingRight: insets.right + 8,
        backgroundColor: "white",
        borderTopColor: "#dedede",
        borderTopWidth: StyleSheet.hairlineWidth,
      }}
    >
      <AttachmentButton />
      <ThemedInput
        style={{ flex: 1, borderRadius: 20 }}
        placeholder="Type a message..."
        value={message}
        onChangeText={setMessage}
        multiline
        onSubmitEditing={handleSend}
      />

      <TouchableOpacity
        onPress={handleSend}
        style={{ marginLeft: 8, padding: 8 }}
        disabled={!message.trim()}
      >
        <Ionicons name="send-outline" size={20} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

function AttachmentButton() {
  const iconColor = useThemeColor({}, "icon");

  const handleAttachment = async () => {
    // Request permission
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    // Open image/video picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const type = asset.type === "video" ? "video" : "image";
      //   onSendAttachment?.(asset.uri, type);
    }
  };
  return (
    <TouchableOpacity style={{ padding: 8 }} onPress={handleAttachment}>
      <Ionicons name="attach" size={24} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    borderTopWidth: 1,
    gap: 8,
  },
  attachmentButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
});
