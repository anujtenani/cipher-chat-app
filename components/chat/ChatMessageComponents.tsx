import { Message } from "@/utils/api_types";
import { formatTimestamp } from "@/utils/func";
import { Image, Text, View } from "react-native";

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
  timestamp,
}: {
  side: "left" | "right";
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
            <Image
              key={index}
              source={{ uri: attachment.thumbnail_url || attachment.url }}
              style={{
                width: 240,
                height: 240,
                borderRadius: 16,
                marginBottom: index < attachments.length - 1 ? 6 : 0,
              }}
              resizeMode="cover"
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
}: {
  message: Message;
  isCurrentUser: boolean;
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
          attachments={message.data.attachments}
          timestamp={message.created_at}
        />
      )}
      {hasText && (
        <MessageText
          side={side}
          text={message.data.text}
          timestamp={message.created_at}
        />
      )}
    </View>
  );
}
