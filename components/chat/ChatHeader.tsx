import { PublicUser } from "@/utils/api_types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Avatar from "../ui/Avatar";
import TypingIndicator from "../ui/TypingIndicator";

interface ChatHeaderProps {
  user: (PublicUser & { id: number }) | null;
  isTyping?: boolean;
}

export default function ChatHeader({ user, isTyping }: ChatHeaderProps) {
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.username}>Chat</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Avatar
        uri={user.profile_photo?.thumbnail_url || user.profile_photo?.url}
        name={user.username}
        size={32}
        lastSeenAt={user.last_seen_at}
      />
      <View style={styles.textContainer}>
        <Text style={styles.username}>{user.username}</Text>
        {isTyping ? (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>typing</Text>
            <TypingIndicator dotSize={4} dotColor="#6B7280" />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
  },
  textContainer: {
    flexDirection: "column",
    gap: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  typingText: {
    fontSize: 12,
    color: "#6B7280",
  },
});
