import { Message } from "@/utils/api_types";
import { formatTimestamp } from "@/utils/func";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text, View } from "react-native";

function formatDuration(seconds?: number): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function RenderAttachment({
  attachment,
  canShowMedia,
  index,
  totalAttachments,
}: {
  attachment: NonNullable<Message["data"]["attachments"]>[number];
  canShowMedia: boolean;
  index: number;
  totalAttachments: number;
}) {
  const isVideo = attachment.type === "video";
  console.log({ attachment });
  return (
    <View
      style={{
        position: "relative",
        marginBottom: index < totalAttachments - 1 ? 6 : 0,
      }}
    >
      <Image
        key={String(index)}
        source={{
          uri: attachment.thumbnail,
          blurhash: attachment.blurhash,
        }}
        style={{
          width: 240,
          height: 240,
          borderRadius: 16,
        }}
        contentFit="cover"
        contentPosition="center"
      />
      {isVideo && (
        <>
          {/* Play button overlay */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="play"
                size={28}
                color="#FFFFFF"
                style={{ marginLeft: 3 }}
              />
            </View>
          </View>
          {/* Duration badge */}
          {attachment.duration !== undefined && (
            <View
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {formatDuration(attachment.duration)}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

export function MessageText({
  side,
  text,
  timestamp,
}: {
  side: "left" | "right";
  text: string;
  timestamp: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: side === "right" ? "flex-end" : "flex-start",
        marginBottom: 16,
        paddingHorizontal: 12,
      }}
    >
      <View
        style={{
          maxWidth: "80%",
        }}
      >
        <View
          style={{
            backgroundColor: side === "right" ? "#007AFF" : "#FFFFFF",
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: side === "right" ? "#FFFFFF" : "#000000",
              lineHeight: 22,
            }}
          >
            {text}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 12,
            color: "#8E8E93",
            marginTop: 6,
            marginLeft: side === "left" ? 12 : 0,
            marginRight: side === "right" ? 12 : 0,
            textAlign: side === "right" ? "right" : "left",
          }}
        >
          {formatTimestamp(timestamp)}
        </Text>
      </View>
    </View>
  );
}
export function MessageAttachmentMedia({
  side,
  attachments,
  canShowMedia,
  timestamp,
}: {
  side: "left" | "right";
  canShowMedia: boolean;
  attachments: Message["data"]["attachments"];
  timestamp: string;
}) {
  if (!attachments || attachments.length === 0) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: side === "right" ? "flex-end" : "flex-start",
        marginBottom: 16,
        paddingHorizontal: 12,
      }}
    >
      <View
        style={{
          maxWidth: "80%",
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 6,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {attachments.map((attachment, index) => (
            <RenderAttachment
              canShowMedia={canShowMedia}
              key={String(index)}
              attachment={attachment}
              index={index}
              totalAttachments={attachments.length}
            />
          ))}
        </View>
        <Text
          style={{
            fontSize: 12,
            color: "#8E8E93",
            marginTop: 6,
            marginLeft: side === "left" ? 12 : 0,
            marginRight: side === "right" ? 12 : 0,
            textAlign: side === "right" ? "right" : "left",
          }}
        >
          {formatTimestamp(timestamp)}
        </Text>
      </View>
    </View>
  );
}

export function MessageBubble({
  message,
  isCurrentUser,
  canShowMedia,
}: {
  message: Message;
  isCurrentUser: boolean;
  canShowMedia: boolean;
}) {
  const side = isCurrentUser ? "right" : "left";
  const hasAttachments =
    message.data.attachments && message.data.attachments.length > 0;
  const hasText = message.data.text && message.data.text.trim().length > 0;

  return (
    <View>
      {hasAttachments && (
        <MessageAttachmentMedia
          side={side}
          canShowMedia={canShowMedia}
          attachments={message.data.attachments}
          timestamp={message.created_at}
        />
      )}
      {hasText && (
        <MessageText
          side={side}
          text={message.data.text || ""}
          timestamp={message.created_at}
        />
      )}
    </View>
  );
}
