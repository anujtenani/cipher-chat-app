import BottomModal from "@/components/BottomModal";
import ChatInput from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/ChatMessageComponents";
import ScaleInPressable from "@/components/ScaleInPressable";
import { ThemedView } from "@/components/themed-view";
import Avatar from "@/components/ui/Avatar";
import { ThemedText } from "@/components/ui/ThemedText";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import useToggle from "@/hooks/useToggle";
import { useTyping } from "@/hooks/useTyping";
import { apiGet, apiPost, socket } from "@/utils/api";
import { Conversation, PublicUser } from "@/utils/api_types";
import { formatDistance } from "@/utils/func";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import useSWR from "swr";
export default function ChatPanel() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const data = useMessages((state) => state.data[Number(id)]);
  const msgs = data || [];
  const fetchBefore_internal = useMessages((state) => state.fetchBefore);
  const fetchSince = useMessages((state) => state.fetchSince);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(msgs.length === 0);
  const fetchBefore = useCallback(() => {
    if (!hasMore) return;
    setIsLoading(true);
    fetchBefore_internal(Number(id)).then((newMessages) => {
      setIsLoading(false);
      setHasMore(newMessages.length > 0);
    });
  }, [hasMore, fetchBefore_internal, id]);
  const mutate = useCallback(() => fetchSince(Number(id)), [id, fetchSince]);
  useEffect(() => {
    fetchBefore();
  }, [id, fetchBefore]);
  // const {
  //   data: messages,
  //   isLoading,
  //   mutate,
  // } = useSWR<{ messages: Message[] }>(`/conversations/${id}/messages`, apiGet);
  const { data: conversation, mutate: mutateConversation } = useSWR<{
    conversation: Conversation;
  }>(`/conversations/${id}`, apiGet);
  useEffect(() => {
    const listener = ({
      conversationId,
      senderId,
      messageId,
    }: {
      conversationId: number;
      senderId: number;
      messageId: number;
    }) => {
    if (Number(id) !== conversationId) return;
      mutate();
    };
    socket.on(`message:new`, listener);
    return () => {
      socket.off(`message:new`, listener);
    };
  }, [mutate, id]);

  const [bottomSheet, toggleBottomSheet] = useToggle();
  useEffect(() => {
    apiPost("/messages/read", { conversationId: Number(id) });
  }, [id]);
  const otherUser = conversation?.conversation?.participants?.[0];
  const router = useRouter();
  // const msgs = messages?.messages || [];
  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => {
                router.push(`/public_profile?username=${otherUser?.username}`);
              }}
            >
              <Avatar
                size={28}
                name={otherUser?.username || ""}
                uri={otherUser?.profile_photo?.url}
                lastSeenAt={otherUser?.last_seen_at}
              ></Avatar>
            </Pressable>
          ),
          headerTitle: () => (
            <HeaderTitle
              conversationId={Number(id)}
              participant={otherUser}
            ></HeaderTitle>
          ),
        }}
      />
      <FlatList
        data={msgs}
        refreshing={isLoading}
        onRefresh={() => {
          mutate();
          mutateConversation();
        }}
        onEndReached={() => {
          if (isLoading) return;
          fetchBefore();
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isLoading ? null : () => <ListEmptyComponent otherUser={otherUser} />
        }
        renderItem={({ item }) => (
          <ScaleInPressable
            onLongPress={() => {
              toggleBottomSheet();
            }}
            onPress={() => {
              router.push(
                `/gallery?source=conversation&username=${otherUser?.username}&start_id=${item.id}`
              );
              console.log("item pressed");
            }}
          >
            {/* <ThemedText>Item</ThemedText> */}
            <MessageBubble
              message={item}
              isCurrentUser={item.sender.username === user?.username}
            />
          </ScaleInPressable>
        )}
        keyExtractor={(item) => item.id.toString()}
        inverted={msgs.length > 0}
        contentContainerStyle={{
          paddingVertical: 16,
          flexDirection: "column-reverse",
        }}
        style={{ flex: 1 }}
      />
      <ChatInput conversationId={Number(id)} />
      <BottomModal visible={bottomSheet} onClose={toggleBottomSheet}>
        <ThemedView
          style={{
            padding: 16,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          <ThemedText
            style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}
          >
            Message Options
          </ThemedText>
          <ThemedText
            style={{ fontSize: 16, paddingVertical: 12 }}
            onPress={() => {
              console.log("Delete message");
              toggleBottomSheet();
            }}
          >
            Delete Message
          </ThemedText>
          <ThemedText
            style={{ fontSize: 16, paddingVertical: 12, color: "red" }}
            onPress={() => {
              toggleBottomSheet();
            }}
          >
            Cancel
          </ThemedText>
        </ThemedView>
      </BottomModal>
    </ThemedView>
  );
}

function ListEmptyComponent({ otherUser }: { otherUser?: PublicUser }) {
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
}

function HeaderTitle({
  conversationId,
  participant,
}: {
  conversationId: number;
  participant?: PublicUser;
}) {
  const typing = useTyping((state) => state.typingUsers);
  const isTyping = typing.has(Number(conversationId));
  const self = useAuth((state) => state.user);
  const distance = participant?.distance_km || 0;
  return (
    <>
      <ThemedView
        style={{ alignItems: "center", gap: 8, flexDirection: "row" }}
      >
        <ThemedText>
          {participant?.username || ""} ({formatDistance(distance)})
        </ThemedText>
        {isTyping ? (
          <ThemedText type="caption" style={{ fontStyle: "italic" }}>
            Typing...
          </ThemedText>
        ) : null}
      </ThemedView>
    </>
  );
}
