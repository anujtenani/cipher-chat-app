import Avatar from "@/components/ui/Avatar";
import HeaderIconButton from "@/components/ui/HeaderIconButton";
import { ThemedText } from "@/components/ui/ThemedText";
import TypingIndicator from "@/components/ui/TypingIndicator";
import { useThemeColor } from "@/hooks/use-theme-color";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useTyping } from "@/hooks/useTyping";
import { apiGet, socket } from "@/utils/api";
import { Conversation } from "@/utils/api_types";
import { formatTimestamp } from "@/utils/func";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, FlatList, Text, TouchableOpacity, View } from "react-native";
import useSWR from "swr";

type FilterType = "active" | "favorites" | "archived" | "blocked";

export default function HomeScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("active");

  const { data, mutate, isLoading } = useSWR<{ conversations: Conversation[] }>(
    `/conversations?status=${selectedFilter}`,
    apiGet
  );

  useEffect(() => {
    socket.on("message:new", (data: any) => {
      // Handle incoming message
      mutate();
      // console.log("New message received:", data);
    });
  }, [mutate]);

  useFocusEffect(() => {
    mutate();
  });

  const conversations = data?.conversations || [];
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const renderItem = ({ item }: { item: Conversation }) => {
    const otherParticipant = item.participants[0];
    const last_message = item.last_message;
    const lastMessage = last_message
      ? last_message?.data.attachments
        ? "Attachment"
        : last_message?.data.text
      : "No messages yet";

    return (
      <TouchableOpacity
        onPress={() => router.push(`/chat/${item.id}`)}
        style={{
          flexDirection: "row",
          padding: 16,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
          alignItems: "center",
        }}
      >
        <Avatar
          uri={otherParticipant?.profile_photo?.url}
          name={otherParticipant?.username}
          size={56}
          lastSeenAt={otherParticipant?.last_seen_at}
        />

        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: textColor }}>
              {otherParticipant.username}
            </Text>
            <Text style={{ fontSize: 12, color: textColor, opacity: 0.6 }}>
              {item.last_message_at
                ? formatTimestamp(item.last_message_at)
                : ""}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontSize: 14,
                color: textColor,
                opacity: item.unread_count > 0 ? 1 : 0.7,
                fontWeight: item.unread_count > 0 ? "500" : "400",
                flex: 1,
                marginRight: 8,
              }}
            >
              {lastMessage}
            </Text>
            <IsTypingInConversation
              conversationId={item.id}
            ></IsTypingInConversation>

            {item.unread_count > 0 && (
              <View
                style={{
                  backgroundColor: "#3b82f6",
                  borderRadius: 12,
                  minWidth: 20,
                  height: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 6,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}
                >
                  {item.unread_count > 99 ? "99+" : item.unread_count}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <React.Fragment>
      <Stack.Screen
        options={{
          title: "Chats",
          headerRight: () => (
            <HeaderIconButton
              icon={"add-outline"}
              onPress={() => router.push("/nearby")}
            />
          ),
        }}
      />
      <View style={{ flex: 1 }}>
        {/* Filter Pills */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            flexDirection: "row",
            gap: 8,
            borderBottomColor: borderColor,
          }}
        >
          <FilterPill
            label="Active"
            isSelected={selectedFilter === "active"}
            onPress={() => setSelectedFilter("active")}
          />
          {/* <FilterPill
            label="Favorites"
            isSelected={selectedFilter === "favorites"}
            onPress={() => setSelectedFilter("favorites")}
          /> */}
          <FilterPill
            label="Archived"
            isSelected={selectedFilter === "archived"}
            onPress={() => setSelectedFilter("archived")}
          />
          <FilterPill
            label="Blocked"
            isSelected={selectedFilter === "blocked"}
            onPress={() => setSelectedFilter("blocked")}
          />
        </View>

        <FlatList
          refreshing={isLoading}
          onRefresh={() => mutate()}
          data={conversations}
          ListEmptyComponent={isLoading ? null : ListEmptyComponent}
          // ListHeaderComponent={ShowPushNotificationPrompt}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={{ flex: 1 }}
        />
      </View>
    </React.Fragment>
  );
}

function IsTypingInConversation({
  conversationId,
}: {
  conversationId: number;
}) {
  const typingUsers = useTyping((state) => state.typingUsers);
  console.log({ typingUsers });
  if (typingUsers.has(conversationId)) {
    return <TypingIndicator />;
  }
  return null;
}

function ListEmptyComponent() {
  const router = useRouter();
  const textColor = useThemeColor({}, "text");

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 48,
      }}
    >
      <ThemedText
        style={{
          fontSize: 16,
          opacity: 0.6,
          textAlign: "center",
        }}
      >
        No conversations yet
      </ThemedText>
      <ThemedText
        style={{
          fontSize: 14,
          opacity: 0.4,
          marginTop: 8,
          textAlign: "center",
        }}
      >
        Start a new chat to get started
      </ThemedText>
      <TouchableOpacity
        onPress={() => router.push("/nearby")}
        style={{
          marginTop: 24,
          backgroundColor: "#3b82f6",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          Discover People Nearby
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ShowPushNotificationPrompt() {
  const { hasPermission, register } = usePushNotifications();

  if (!hasPermission) {
    return (
      <View style={{ padding: 16, alignItems: "center" }}>
        <ThemedText>Enable push notifications to stay updated!</ThemedText>
        <Button title="Enable Notifications" onPress={register} />
      </View>
    );
  }
  return null;
}

function FilterPill({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const textColor = useThemeColor({}, "text");

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: isSelected ? "#3B82F6" : "#F3F4F6",
        borderWidth: isSelected ? 0 : 1,
        borderColor: "#E5E7EB",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: isSelected ? "600" : "500",
          color: isSelected ? "white" : textColor,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
