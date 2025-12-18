import { apiGet } from "@/utils/api";
import { Conversation } from "@/utils/api_types";
import { formatTimestamp } from "@/utils/func";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useSWR from "swr";

export default function HomeScreen() {
  const router = useRouter();
  const { data, isLoading } = useSWR<{ conversations: Conversation[] }>(
    "/conversations",
    apiGet
  );
  const conversations = data?.conversations || [];

  const renderItem = ({ item }: { item: Conversation }) => {
    const otherParticipant = item.participants[0];
    const lastMessage =
      item.last_message?.data?.text ||
      item.last_message?.data?.text ||
      "No messages yet";

    return (
      <TouchableOpacity
        onPress={() => router.push(`/chat/${item.id}`)}
        style={{
          flexDirection: "row",
          padding: 16,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
          alignItems: "center",
        }}
      >
        <Image
          source={{
            uri:
              otherParticipant.profile_photo?.url ||
              "https://via.placeholder.com/50",
          }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            marginRight: 12,
          }}
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
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111" }}>
              {otherParticipant.username}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              {formatTimestamp(item.last_message_at)}
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
                color: item.unread_count > 0 ? "#111" : "#6b7280",
                fontWeight: item.unread_count > 0 ? "500" : "400",
                flex: 1,
                marginRight: 8,
              }}
            >
              {lastMessage}
            </Text>
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

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ fontSize: 16, color: "#6b7280" }}>
          No conversations yet
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      style={{ flex: 1, backgroundColor: "#fff" }}
    />
  );
}
