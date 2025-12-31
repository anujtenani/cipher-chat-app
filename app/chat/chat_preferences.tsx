import SettingsListItem from "@/components/settings/SettingsListItem";
import SettingsSectionTitle from "@/components/settings/SettingsSectionTitle";
import { ThemedView } from "@/components/themed-view";
import ThemedSwitch from "@/components/ui/ThemedSwitch";
import { ThemedText } from "@/components/ui/ThemedText";
import { apiGet, apiPost } from "@/utils/api";
import { Conversation } from "@/utils/api_types";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView } from "react-native";
import useSWR from "swr";

export default function ChatPreferences() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: conversation, mutate } = useSWR<{
    conversation: Conversation;
  }>(`/conversations/${id}`, apiGet);

  const conv = conversation?.conversation;
  const otherUser = conv?.participants?.[0];
  const isArchived = conv?.archived_at !== null;
  const isMuted = conv?.muted_at !== null;

  const handleArchiveToggle = async () => {
    if (!conv) return;
    setIsProcessing(true);
    try {
      await apiPost(`/conversations/${conv.id}/status`, {
        archived: !isArchived,
      });
      await mutate();
    } catch (error) {
      console.error("Failed to toggle archive:", error);
      Alert.alert("Error", "Failed to update archive status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMuteToggle = async () => {
    if (!conv) return;
    setIsProcessing(true);
    try {
      await apiPost(`/conversations/${conv.id}/status`, {
        muted: !isMuted,
      });
      await mutate();
    } catch (error) {
      console.error("Failed to toggle mute:", error);
      Alert.alert("Error", "Failed to update mute status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBlock = async () => {
    if (!conv) return;
    Alert.alert(
      "Block User",
      `Are you sure you want to block ${otherUser?.username}? You will no longer receive messages from them.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            setIsProcessing(true);
            try {
              await apiPost(`/conversations/${conv.id}/status`, {
                blocked: true,
              });
              await apiPost(`/conversations/${conv.id}/block`, {});
              router.back();
            } catch (error) {
              console.error("Failed to block:", error);
              Alert.alert("Error", "Failed to block user");
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleLeaveChat = async () => {
    if (!conv) return;
    Alert.alert(
      "Leave Chat",
      `Are you sure you want to leave this conversation with ${otherUser?.username}? They will be notified.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            setIsProcessing(true);
            try {
              await apiPost(`/conversations/${conv.id}/leave`, {});
              router.back();
            } catch (error) {
              console.error("Failed to leave chat:", error);
              Alert.alert("Error", "Failed to leave chat");
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteChat = async () => {
    if (!conv) return;
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsProcessing(true);
            try {
              await apiPost(`/conversations/${conv.id}/delete`, {});
              router.back();
            } catch (error) {
              console.error("Failed to delete chat:", error);
              Alert.alert("Error", "Failed to delete chat");
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Chat Settings",
          headerBackTitle: "Back",
        }}
      />
      <ScrollView style={{ flex: 1 }}>
        <SettingsSectionTitle title="Notifications" />
        <SettingsListItem
          title="Mute Notifications"
          description={
            isMuted
              ? "You won't receive notifications for this chat"
              : "Receive notifications for new messages"
          }
          disabled={isProcessing}
        >
          <ThemedSwitch value={isMuted} onValueChange={handleMuteToggle} />
        </SettingsListItem>

        <SettingsSectionTitle title="Chat Management" />
        <SettingsListItem
          title={isArchived ? "Unarchive Chat" : "Archive Chat"}
          description={
            isArchived
              ? "Move this chat back to your main list"
              : "Hide this chat from your main list"
          }
          onPress={handleArchiveToggle}
          disabled={isProcessing}
        />

        <SettingsListItem
          title="Leave Chat"
          description={`Stop receiving messages from ${
            otherUser?.username || "this user"
          }`}
          onPress={handleLeaveChat}
          disabled={isProcessing}
        />

        <SettingsSectionTitle title="Privacy & Safety" />
        <SettingsListItem
          title="Block User"
          description={`Block ${
            otherUser?.username || "this user"
          } and delete this conversation`}
          onPress={handleBlock}
          disabled={isProcessing}
        />

        <SettingsSectionTitle title="Danger Zone" />
        <SettingsListItem
          title="Delete Chat"
          description="Permanently delete this conversation. This cannot be undone."
          onPress={handleDeleteChat}
          disabled={isProcessing}
        />

        <ThemedView style={{ padding: 16, marginTop: 24 }}>
          <ThemedText
            style={{ fontSize: 12, opacity: 0.5, textAlign: "center" }}
          >
            Conversation ID: {id}
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}
