import ChatInput from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/ChatMessageComponents";
import { useAuth } from "@/hooks/useAuth";
import { apiGet, socket } from "@/utils/api";
import { Conversation, Message } from "@/utils/api_types";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { FlatList, Text, View } from "react-native";
import useSWR from "swr";
export default function ChatPanel() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const {
    data: messages,
    isLoading,
    mutate,
  } = useSWR<{ messages: Message[] }>(`/conversations/${id}/messages`, apiGet);
  useEffect(() => {
    socket.on(`conversation:${id}`, (newMessage: Message) => {
      mutate();
    });
    return () => {
      socket.off(`conversation:${id}`);
    };
  }, [mutate, id]);
  const { data: conversation } = useSWR<{ conversation: Conversation }>(
    `/conversations/${id}`,
    apiGet
  );

  const ListEmptyComponent = () => {
    const otherUser = conversation?.conversation?.participants?.[0];
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
          paddingVertical: 48,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#eff6ff",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 40 }}>💬</Text>
        </View>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            color: "#111827",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {otherUser
            ? `Say hello to ${otherUser.username}!`
            : "Start a conversation"}
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#6b7280",
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          {otherUser
            ? `This is the beginning of your conversation with ${otherUser.username}. Send a message to get started.`
            : "No messages yet. Start the conversation by sending your first message below."}
        </Text>
      </View>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <FlatList
        data={messages?.messages || []}
        ListEmptyComponent={ListEmptyComponent}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isCurrentUser={item.sender.username === user?.username}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        inverted
        contentContainerStyle={{
          paddingVertical: 16,
          flexDirection: "column-reverse",
        }}
        style={{ flex: 1 }}
      />
      <ChatInput
        conversationId={Number(id)}
        onSendMessage={() => mutate()}
        onSendAttachment={() => {
          console.log("attachment setn");
        }}
      />
    </View>
  );
}
