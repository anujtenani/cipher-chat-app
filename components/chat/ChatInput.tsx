import { useThemeColor } from "@/hooks/use-theme-color";
import { useTypingEvents } from "@/hooks/useTyping";
import { apiPost, socket } from "@/utils/api";
import { formatFileSize } from "@/utils/func";
import { getThumbnailAsync } from "@/utils/thumbnail_utils";
import { uploadFile, uploadImageFile } from "@/utils/upload_functions";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { create } from "zustand";
import { ThemedView } from "../themed-view";
import ThemedInput from "../ui/ThemedInput";
import { ThemedText } from "../ui/ThemedText";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  conversationId: number;
}

export default function ChatInput({
  onSendMessage,
  conversationId,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const iconColor = useThemeColor({}, "icon");
  const insets = useSafeAreaInsets();
  const handleTyping = useTypingEvents({
    delay: 700,
    onStart: () => {
      socket.emit("typing:start", { conversationId });
    },
    onStop: () => {
      socket.emit("typing:stop", { conversationId });
    },
  });

  const handleSend = () => {
    if (message.trim()) {
      apiPost(`/conversations/${conversationId}/messages`, {
        content: { text: message.trim() },
      });
      onSendMessage(message.trim());
      setMessage("");
    }
  };
  const borderColor = useThemeColor({}, "border");

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
          onPress={() => router.push("/camera")}
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
    </ThemedView>
  );
}

type FileAttachment = ImagePicker.ImagePickerAsset & {
  conversationId: number;
  id: string;
  metadata: {
    thumbnail?: string;
    width: number;
    height: number;
    duration?: number;
    size?: number;
    blurhash?: string;
  };
};

interface AttachmentSenderState {
  files: FileAttachment[];
  fileQueue: FileAttachment[];
  isProcessing: boolean;
  progressTracker: { [fileId: string]: number };
  addFile: (file: FileAttachment) => void;
  removeSendingFile: (fileId: string) => void;
  processQueue: () => Promise<void>;
}

const useAttachmentSender = create<AttachmentSenderState>((set, get) => {
  return {
    files: [] as FileAttachment[],
    progressTracker: {},
    isProcessing: false,
    fileQueue: [] as FileAttachment[],
    addFile: (file: FileAttachment) => {
      set({
        files: [...get().files, file],
        fileQueue: [...get().fileQueue, file],
      });
      get().processQueue();
    },
    removeSendingFile: (fileId: string) => {
      set({
        files: get().files.filter((f) => f.id !== fileId),
        fileQueue: get().fileQueue.filter((f) => f.id !== fileId),
      });
    },
    processQueue: async () => {
      const { fileQueue, isProcessing } = get();
      if (isProcessing) return;
      if (fileQueue.length > 0) {
        const toProcess = fileQueue.pop();

        set({ fileQueue: fileQueue, isProcessing: true });
        if (toProcess) {
          try {
            // Upload logic here
            const [thumbnailResult, uploadResult] = await Promise.all([
              toProcess.mimeType?.includes("video")
                ? await uploadImageFile(toProcess)
                : null,
              await uploadFile(toProcess, (uploaded, total) => {
                const progress = (uploaded / total) * 100;
                set({
                  progressTracker: {
                    ...get().progressTracker,
                    [toProcess.id]: progress,
                  },
                });
              }),
            ]);
            const fromUploadResult =
              "videoId" in uploadResult ? null : uploadResult.url;

            await apiPost(
              `/conversations/${toProcess.conversationId}/messages`,
              {
                content: {
                  attachments: [
                    {
                      ...uploadResult,
                      ...toProcess.metadata,
                      id: toProcess.id,
                      thumbnail:
                        thumbnailResult?.url || fromUploadResult
                          ? `${fromUploadResult}?width=300`
                          : undefined,
                    },
                  ],
                },
              }
            );
          } catch (error) {
            console.error("Error uploading file:", error);
          }
          // After successful upload, remove the file from the queue
          // in case of error, add the file back to the queue
          get().removeSendingFile(toProcess.id);
        }
        set({ isProcessing: false });
        get().processQueue();
      } else {
        set({ isProcessing: false });
      }
    },
  };
});

function UploadingList({ conversationId }: { conversationId: number }) {
  const files = useAttachmentSender((state) => state.files);
  const conversationFiles = files.filter(
    (f) => f.conversationId === conversationId
  );
  if (conversationFiles.length === 0) return null;
  return (
    <View>
      {conversationFiles.map((file) => {
        return (
          <View
            key={file.id}
            style={{
              padding: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Image
              contentFit="fill"
              source={{
                uri: file.metadata.thumbnail,
                blurhash: file.metadata.blurhash,
                width: file.width,
                height: file.height,
              }}
              style={{ width: 50, height: 50 }}
            ></Image>
            <View>
              <ThemedText>{formatFileSize(file.metadata.size || 0)}</ThemedText>
              <ProgressPercentage fileId={file.id} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ProgressPercentage({ fileId }: { fileId: string }) {
  const progressTracker = useAttachmentSender(
    (state) => state.progressTracker[fileId] || 0
  );
  return <ThemedText>{progressTracker.toFixed(2)}%</ThemedText>;
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
            thumbnail: metadata.thumbnail,
            width: metadata.width,
            height: metadata.height,
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
