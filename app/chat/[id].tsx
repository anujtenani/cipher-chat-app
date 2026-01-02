import BottomModal from "@/components/BottomModal";
import ChatInput from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/ChatMessageComponents";
import ScaleInPressable from "@/components/ScaleInPressable";
import { ThemedView } from "@/components/themed-view";
import Avatar from "@/components/ui/Avatar";
import { ThemedText } from "@/components/ui/ThemedText";
import { useThemeColor } from "@/hooks/use-theme-color";
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
  // const [galleryVisible, setGalleryVisible] = useState(false);
  // const media = msgs
  //   .filter((m) => m.data.attachments && m.data.attachments.length > 0)
  //   .flatMap((m) =>
  //     m.data.attachments!.map((att) => ({
  //       ...att,
  //       type: "image" as const,
  //       uri: att.url || att.thumbnail!,
  //       messageId: m.id,
  //     }))
  //   )
  //   .filter((att) => isValidUrl(att.uri));
  // console.log(
  //   msgs
  //     .filter((m) => m.data.attachments && m.data.attachments.length > 0)
  //     .flatMap((m) => m.data.attachments)
  // );
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

      {/* <MediaGallery
        media={media}
        initialIndex={0}
        visible={galleryVisible}
        onClose={() => setGalleryVisible(false)}
      /> */}
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
          isLoading
            ? null
            : () => (
                <ListEmptyComponent
                  conversationId={Number(id)}
                  otherUser={otherUser}
                />
              )
        }
        renderItem={({ item }) => (
          <ScaleInPressable
            onLongPress={() => {
              toggleBottomSheet();
            }}
            onPress={
              item.data?.attachments && item.data.attachments.length > 0
                ? () => {
                    // setGalleryVisible(true);
                    router.push(
                      `/gallery?source=conversation&username=${otherUser?.username}&start_id=${item.id}`
                    );
                    console.log("item pressed");
                  }
                : undefined
            }
          >
            {/* <ThemedText>Item</ThemedText> */}
            <MessageBubble
              canShowMedia={conversation?.conversation?.joined_at !== null}
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
      {conversation?.conversation?.joined_at === null ? (
        <AcceptRejectChatRequestPanel
          senderUsername={otherUser?.username}
          onAccept={mutateConversation}
          onReject={() => {
            router.back();
          }}
          conversationId={Number(id)}
        ></AcceptRejectChatRequestPanel>
      ) : null}
      {otherUser && otherUser?.left_at !== null ? (
        <OtherUserLeftChatBanner
          otherUser={otherUser}
          conversation={conversation?.conversation}
          onUpdate={mutateConversation}
        />
      ) : null}
      {conversation?.conversation &&
      conversation?.conversation?.muted_at !== null ? (
        <ChatArchived
          id={Number(id)}
          onUpdate={async () => {
            await mutateConversation();
          }}
        ></ChatArchived>
      ) : null}
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

function ListEmptyComponent({
  conversationId,
  otherUser,
}: {
  conversationId: number;
  otherUser?: PublicUser;
}) {
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
      <ConversationStarters
        conversationId={conversationId}
        username={otherUser?.username || ""}
      />
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

function OtherUserLeftChatBanner({
  otherUser,
  conversation,
  onUpdate,
}: {
  otherUser?: Conversation["participants"][0];
  conversation?: Conversation;
  onUpdate?: () => void;
}) {
  const [isArchiving, setIsArchiving] = useState(false);
  const router = useRouter();

  const isArchived = conversation?.muted_at !== null;

  const handleArchiveToggle = async () => {
    if (!conversation) return;

    setIsArchiving(true);
    try {
      await apiPost(`/conversations/${conversation.id}/status`, {
        archived: !isArchived,
      });
      router.back();
      onUpdate?.();
    } catch (error) {
      console.error("Failed to toggle archive:", error);
    } finally {
      setIsArchiving(false);
    }
  };
  return (
    <ThemedView
      style={{
        padding: 12,
        backgroundColor: "#FEE2E2",
        borderTopWidth: 1,
        borderTopColor: "#FCA5A5",
      }}
    >
      <ThemedView style={{ backgroundColor: "transparent" }}>
        <ThemedText
          style={{
            textAlign: "center",
            color: "#B91C1C",
            marginBottom: 8,
          }}
        >
          {otherUser
            ? `${otherUser.username} has left the chat. They will no longer receive messages you send.`
            : "The other user has left the chat."}
        </ThemedText>

        <ScaleInPressable
          onPress={handleArchiveToggle}
          disabled={isArchiving}
          style={{
            // backgroundColor: isArchived ? "#10B981" : "#6B7280",
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 6,
            alignSelf: "center",
            opacity: isArchiving ? 0.5 : 1,
          }}
        >
          <ThemedText
            style={{
              color: "black",
              fontSize: 14,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {isArchiving
              ? isArchived
                ? "Unarchiving..."
                : "Archiving..."
              : isArchived
              ? "Unarchive Chat"
              : "Archive Chat"}
          </ThemedText>
        </ScaleInPressable>
      </ThemedView>
    </ThemedView>
  );
}

function ChatArchived({
  id,
  onUpdate,
}: {
  id: number;
  onUpdate?: () => Promise<void>;
}) {
  const [isArchiving, setIsArchiving] = useState(false);
  const handleArchiveToggle = async () => {
    setIsArchiving(true);
    try {
      await apiPost(`/conversations/${id}/status`, {
        archived: false,
      });
      await onUpdate?.();
    } catch (error) {
      console.error("Failed to toggle archive:", error);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <>
      <ThemedView>
        <ThemedText style={{ textAlign: "center" }}>
          This conversation is archived
        </ThemedText>
        <ScaleInPressable
          onPress={handleArchiveToggle}
          disabled={isArchiving}
          style={{
            // backgroundColor: isArchived ? "#10B981" : "#6B7280",
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 6,
            alignSelf: "center",
            opacity: isArchiving ? 0.5 : 1,
          }}
        >
          <ThemedText
            style={{
              color: "black",
              fontSize: 14,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {isArchiving ? "Unarchiving..." : "Unarchive Chat"}
          </ThemedText>
        </ScaleInPressable>
      </ThemedView>
    </>
  );
}

function AcceptRejectChatRequestPanel({
  conversationId,
  onAccept,
  onReject,
  senderUsername,
}: {
  conversationId: number;
  onAccept?: () => void;
  onReject?: () => void;
  senderUsername?: string;
}) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await apiPost(`/conversations/${conversationId}/status`, {
        blocked: false,
      });
      onAccept?.();
    } catch (error) {
      console.error("Failed to accept chat request:", error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await apiPost(`/conversations/${conversationId}/status`, {
        blocked: true,
      });
      onReject?.();
    } catch (error) {
      console.error("Failed to reject chat request:", error);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <ThemedView
      style={{
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        backgroundColor: "#F9FAFB",
      }}
    >
      <ThemedView
        style={{
          backgroundColor: "#F9FAFB",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <ThemedText
          style={{
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          Chat Request
        </ThemedText>
        <ThemedText
          type="caption"
          style={{
            textAlign: "center",
          }}
        >
          {senderUsername
            ? `${senderUsername} wants to chat with you`
            : "You have a new chat request"}
        </ThemedText>
      </ThemedView>

      <ThemedView
        style={{
          flexDirection: "row",
          gap: 12,
          backgroundColor: "#F9FAFB",
        }}
      >
        <ScaleInPressable
          onPress={handleReject}
          disabled={isRejecting || isAccepting}
          style={{
            flex: 1,
            backgroundColor: "#EF4444",
            borderRadius: 8,
            paddingVertical: 12,
            opacity: isRejecting || isAccepting ? 0.5 : 1,
          }}
        >
          <ThemedText
            style={{
              color: "white",
              textAlign: "center",
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {isRejecting ? "Rejecting..." : "Reject"}
          </ThemedText>
        </ScaleInPressable>

        <ScaleInPressable
          onPress={handleAccept}
          disabled={isAccepting || isRejecting}
          style={{
            flex: 1,
            backgroundColor: "#10B981",
            borderRadius: 8,
            paddingVertical: 12,
            opacity: isAccepting || isRejecting ? 0.5 : 1,
          }}
        >
          <ThemedText
            style={{
              color: "white",
              textAlign: "center",
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {isAccepting ? "Accepting..." : "Accept"}
          </ThemedText>
        </ScaleInPressable>
      </ThemedView>
    </ThemedView>
  );
}

function ConversationStarters({
  conversationId,
  username,
}: {
  conversationId: number;
  username: string;
}) {
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");
  const self = useAuth((state) => state.user);
  const sendMessage = useMessages((state) => state.sendMessage);

  const { data, isLoading, mutate } = useSWR<{
    starters: string[];
  }>(username ? `/ai/conversation-starters?username=${username}` : null, {});
  if (isLoading || !data?.starters || data?.starters?.length === 0) {
    return null;
  }
  return (
    <View style={{ width: "100%" }}>
      <View style={{ margin: 4, borderWidth: 1, borderRadius: 8, borderColor }}>
        {data?.starters.map((starter, index) => (
          <ScaleInPressable
            style={{
              borderBottomWidth: index === data.starters.length - 1 ? 0 : 1,
              borderBottomColor: borderColor,
              padding: 8,
            }}
            key={String(starter)}
            onPress={() => {
              sendMessage({
                id: 0,
                created_at: new Date().toISOString(),
                sender: self!,
                conversation_id: conversationId,
                data: {
                  text: starter,
                },
              });
            }}
          >
            <ThemedText style={{ fontSize: 14, color: primaryColor }}>
              {starter}
            </ThemedText>
          </ScaleInPressable>
        ))}
      </View>
    </View>
  );
}

function ListItem() {}
