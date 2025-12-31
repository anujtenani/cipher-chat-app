import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/hooks/useAuth";
import useKeyboardHeight from "@/hooks/useKeyboardHeight";
import { useMessages } from "@/hooks/useMessages";
import { useTypingEvents } from "@/hooks/useTyping";
import { socket } from "@/utils/api";
import { formatFileSize } from "@/utils/func";
import { getThumbnailAsync } from "@/utils/thumbnail_utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "../themed-view";
import ThemedInput from "../ui/ThemedInput";
import { ThemedText } from "../ui/ThemedText";
import { useAttachmentSender } from "./useAttachmentSender";

interface ChatInputProps {
  conversationId: number;
}

export default function ChatInput({ conversationId }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const iconColor = useThemeColor({}, "icon");
  const insets = useSafeAreaInsets();
  const handleTyping = useTypingEvents({
    delay: 700,
    onStart: () => {
      console.log("emitted typing:start for conversation", conversationId);
      socket.emit("typing:start", { conversationId });
    },
    onStop: () => {
      console.log("emitted typing:stop for conversation", conversationId);
      socket.emit("typing:stop", { conversationId });
    },
  });
  const sendMessage = useMessages((state) => state.sendMessage);
  const user = useAuth((state) => state.user);
  const handleSend = () => {
    if (message.trim()) {
      sendMessage({
        id: 0,
        conversation_id: conversationId,
        data: { text: message.trim() },
        sender: user!,
        created_at: new Date().toISOString(),
      });
      setMessage("");
    }
  };
  const borderColor = useThemeColor({}, "border");
  const keyboardHeight = useKeyboardHeight();
  return (
    <ThemedView>
      <UploadingList conversationId={conversationId} />

      <ThemedView
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 8,
          paddingBottom: insets.bottom + 4,
          paddingLeft: insets.left + 8,
          paddingRight: insets.right + 8,
          borderTopColor: borderColor,
          borderTopWidth: StyleSheet.hairlineWidth,
        }}
      >
        <AttachmentButton conversationId={conversationId} />
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={() => {
            router.push(`/camera?conversationId=${conversationId}`); // Pass conversationId via query params
          }}
        >
          <Ionicons name="camera-outline" size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedInput
          style={{ flex: 1, borderRadius: 20 }}
          placeholder="Type a message..."
          value={message}
          onChangeText={(message) => {
            setMessage(message);
            handleTyping();
          }}
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
      </ThemedView>
      <View style={{ height: keyboardHeight }} />
    </ThemedView>
  );
}

function UploadingList({ conversationId }: { conversationId: number }) {
  const files = useAttachmentSender((state) => state.files);
  const removeFile = useAttachmentSender((state) => state.removeFile);
  const conversationFiles = files.filter(
    (f) => f.conversationId === conversationId
  );
  const borderColor = useThemeColor({}, "border");
  const iconColor = useThemeColor({}, "icon");
  const backgroundColor = useThemeColor(
    { light: "#f8f9fa", dark: "#1a1a1a" },
    "background"
  );

  if (conversationFiles.length === 0) return null;

  return (
    <ThemedView
      style={{
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: borderColor,
        backgroundColor,
      }}
    >
      {conversationFiles.map((file) => {
        return (
          <View
            key={file.id}
            style={{
              padding: 12,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: borderColor,
            }}
          >
            <Image
              contentFit="cover"
              source={file.metadata.thumbnail}
              placeholder={{
                blurhash: file.metadata.blurhash,
              }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 8,
              }}
            />
            <View style={{ flex: 1, gap: 6 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <ThemedText style={{ fontSize: 14, fontWeight: "500" }}>
                  {file.type === "video" ? "Video" : "Photo"} •{" "}
                  {formatFileSize(file.metadata.size || 0)}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => removeFile(file.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="close-circle" size={20} color={iconColor} />
                </TouchableOpacity>
              </View>
              <ProgressBar fileId={file.id} />
            </View>
          </View>
        );
      })}
    </ThemedView>
  );
}

function ProgressBar({ fileId }: { fileId: string }) {
  const progressTracker = useAttachmentSender(
    (state) => state.progressTracker[fileId] || 0
  );
  const progressColor = useThemeColor(
    { light: "#007AFF", dark: "#0A84FF" },
    "tint"
  );
  const trackColor = useThemeColor(
    { light: "#E5E5EA", dark: "#3A3A3C" },
    "border"
  );

  return (
    <View style={{ gap: 4 }}>
      <View
        style={{
          height: 4,
          backgroundColor: trackColor,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${progressTracker}%`,
            backgroundColor: progressColor,
            borderRadius: 2,
          }}
        />
      </View>
      <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
        {progressTracker.toFixed(0)}% uploaded
      </ThemedText>
    </View>
  );
}
function AttachmentButton({ conversationId }: { conversationId: number }) {
  const iconColor = useThemeColor({}, "icon");

  const addFile = useAttachmentSender((state) => state.addFile);

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
      mediaTypes: ["images", "videos", "livePhotos"],
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (!result.canceled) {
      for (const asset of result.assets) {
        const metadata = await getThumbnailAsync(asset);
        console.log("Metadata for attachment:", metadata);
        addFile({
          ...asset,
          conversationId,
          metadata: {
            thumbnail: metadata.uri,
            width: metadata.width || 0,
            height: metadata.height || 0,
            size: asset.fileSize,
            duration: asset.duration || undefined,
            blurhash: metadata.blurhash,
          },
          id: `${asset.uri}-${Date.now()}`,
        });
      }
    }
  };
  return (
    <TouchableOpacity style={{ padding: 8 }} onPress={handleAttachment}>
      <Ionicons name="attach" size={24} color={iconColor} />
    </TouchableOpacity>
  );
}
