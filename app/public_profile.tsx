import { ThemedView } from "@/components/themed-view";
import Avatar from "@/components/ui/Avatar";
import ThemedButton from "@/components/ui/ThemedButton";
import { ThemedText } from "@/components/ui/ThemedText";
import { useThemeColor } from "@/hooks/use-theme-color";
import { apiGet, apiPost } from "@/utils/api";
import { MediaAsset, PublicUser } from "@/utils/api_types";
import { calculateAge, formatDistance } from "@/utils/func";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";

const { width } = Dimensions.get("window");
const MEDIA_GRID_SIZE = (width - 48) / 3; // 3 columns with padding

export default function PublicProfilePage() {
  const { username } = useLocalSearchParams();
  const router = useRouter();
  const { data, isLoading } = useSWR<{ user: PublicUser }>(
    `/users/user/${username}`,
    apiGet
  );
  const user = data?.user;

  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");
  const mutedColor = useThemeColor({}, "muted");
  const primaryColor = useThemeColor({}, "primary");
  const iconColor = useThemeColor({}, "icon");

  const [starting, setStarting] = React.useState(false);
  const insets = useSafeAreaInsets();
  const handleStartChat = () => {
    if (!user) return;
    // Navigate to chat screen with user
    setStarting(true);
    apiPost<{ conversation: { id: number } }>("/conversations/start", {
      username: user.username,
    }).then(({ conversation }) => {
      if (conversation.id) {
        setStarting(false);
        router.push(`/chat/${conversation.id}`);
      } else {
        alert("Could not start chat. Please try again later.");
      }
    });
  };

  const handleReport = async () => {
    if (!user) return;
    const email = "support@goaffpro.com";
    const subject = `Cipher Chat [ Report: ${user.username} ]`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    const canOpen = await Linking.canOpenURL(mailtoUrl);
    if (canOpen) {
      await Linking.openURL(mailtoUrl).catch((error) => {
        Alert.alert("Error", "Could not open email client");
      });
    } else {
      Alert.alert("Error", "Could not open email client");
    }

    // Handle report user
  };
  const age = calculateAge(user?.date_of_birth);

  return (
    <ThemedView
      style={{
        flex: 1,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
      }}
    >
      <Stack.Screen
        options={{
          title: (username as string) || "Profile",
          headerBackButtonDisplayMode: "minimal",
          headerRight: () => (
            <TouchableOpacity onPress={handleReport} style={{ marginRight: 8 }}>
              <Ionicons name="flag-outline" size={24} color={iconColor} />
            </TouchableOpacity>
          ),
        }}
      />

      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      ) : !user ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ThemedText type="subtitle">User not found</ThemedText>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {/* Header Section with Avatar and Basic Info */}
          <View style={{ alignItems: "center", padding: 16, paddingBottom: 8 }}>
            <View
              style={{ alignItems: "center", padding: 16, paddingBottom: 8 }}
            >
              <Avatar
                uri={user.profile_photo?.url}
                name={user.username}
                size={120}
                lastSeenAt={user.last_seen_at}
              />
              {user.verified && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 3,
                    borderColor: "white",
                    backgroundColor: primaryColor,
                  }}
                >
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              )}
            </View>

            <ThemedText
              type="title"
              style={{ fontSize: 28, fontWeight: "700", marginBottom: 4 }}
            >
              {user.username}
            </ThemedText>

            {user.status_message && (
              <ThemedText
                type="caption"
                lightColor={mutedColor}
                darkColor={mutedColor}
                style={{
                  fontStyle: "italic",
                  textAlign: "center",
                  paddingHorizontal: 32,
                }}
              >
                &apos;{user.status_message}&apos;
              </ThemedText>
            )}
          </View>

          <View style={{ paddingHorizontal: 16, gap: 12, marginBottom: 8 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                gap: 12,
                backgroundColor: cardColor,
                borderColor,
              }}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={primaryColor}
              />
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">
                  {user.location || user.country}
                </ThemedText>
                <ThemedText
                  type="caption"
                  lightColor={mutedColor}
                  darkColor={mutedColor}
                >
                  {formatDistance(user.distance_km)}
                </ThemedText>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                gap: 12,
                backgroundColor: cardColor,
                borderColor,
              }}
            >
              <Ionicons name="person-outline" size={20} color={primaryColor} />
              <View style={{ flex: 1 }}>
                {age ? (
                  <ThemedText type="defaultSemiBold">
                    {age} years old
                  </ThemedText>
                ) : null}
                <ThemedText
                  type="caption"
                  lightColor={mutedColor}
                  darkColor={mutedColor}
                >
                  {user.gender?.toUpperCase()} • {user.country}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Bio Section */}
          {user.bio && (
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
              <ThemedText
                type="defaultSemiBold"
                style={{ fontSize: 18, marginBottom: 12 }}
              >
                About
              </ThemedText>
              <View
                style={{
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  backgroundColor: cardColor,
                  borderColor,
                }}
              >
                <ThemedText>{user.bio}</ThemedText>
              </View>
            </View>
          )}

          {/* Media Gallery */}
          <UserGallery username={user.username} />
          <ConversationGallery username={user.username} />
          <View style={{ height: 12 }} />
        </ScrollView>
      )}
      <ThemedButton
        isLoading={starting}
        style={{ margin: 16 }}
        onPress={handleStartChat}
      >
        <Ionicons name="chatbubble-outline" size={20} color="white" />
        <ThemedText
          lightColor="white"
          darkColor="white"
          type="defaultSemiBold"
          style={{ fontSize: 16 }}
        >
          Send Message
        </ThemedText>
      </ThemedButton>
    </ThemedView>
  );
}

function RenderGalleryStrip({
  media,
  onItemPress,
}: {
  media: MediaAsset[];
  onItemPress: (item: MediaAsset) => void;
}) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <ThemedText
        type="defaultSemiBold"
        style={{ fontSize: 18, marginBottom: 12 }}
      >
        Photos & Videos ({media.length})
      </ThemedText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {media.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              width: MEDIA_GRID_SIZE,
              height: MEDIA_GRID_SIZE,
              borderRadius: 8,
              overflow: "hidden",
              position: "relative",
            }}
            onPress={() => {
              onItemPress(item);
            }}
          >
            <Image
              source={{ uri: item.thumbnail }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
            {item.type === "video" && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                }}
              >
                <Ionicons name="play-circle" size={32} color="white" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function UserGallery({ username }: { username: string }) {
  const { data, isLoading } = useSWR<{ media: MediaAsset[] }>(
    `/media/gallery?username=${username || ""}&source=user_gallery`
  );
  const onItemPress = (item: MediaAsset) => {
    router.push(
      `/gallery?source=user_gallery&username=${username}&start_id=${item.id}`
    );
  };
  if (data?.media?.length === 0) {
    return null;
  }
  return (
    <RenderGalleryStrip media={data?.media || []} onItemPress={onItemPress} />
  );
}
function ConversationGallery({ username }: { username: string }) {
  const { data, isLoading } = useSWR<{
    media: MediaAsset[];
    conversation_id: number;
  }>(`/media/gallery?source=conversation&username=${username}`);
  const router = useRouter();
  const onItemPress = (item: MediaAsset) => {
    router.push(
      `/gallery?source=conversation&username=${username}&start_id=${item.id}`
    );
  };
  if (data?.media?.length === 0) {
    return null;
  }
  return (
    <RenderGalleryStrip media={data?.media || []} onItemPress={onItemPress} />
  );
}
