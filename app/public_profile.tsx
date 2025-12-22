import { ThemedView } from "@/components/themed-view";
import Avatar from "@/components/ui/Avatar";
import { ThemedText } from "@/components/ui/ThemedText";
import { useThemeColor } from "@/hooks/use-theme-color";
import { apiGet } from "@/utils/api";
import { PublicUser } from "@/utils/api_types";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
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

  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");
  const mutedColor = useThemeColor({}, "muted");
  const primaryColor = useThemeColor({}, "primary");
  const iconColor = useThemeColor({}, "icon");

  const user = data?.user;

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDistance = (km: number) => {
    if (km < 1) return `${Math.round(km * 1000)}m away`;
    return `${km.toFixed(1)}km away`;
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: (username as string) || "Profile",
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 8 }}>
              <Ionicons
                name="ellipsis-horizontal"
                size={24}
                color={iconColor}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      ) : !user ? (
        <View style={styles.loadingContainer}>
          <ThemedText type="subtitle">User not found</ThemedText>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          {/* Header Section with Avatar and Basic Info */}
          <View style={styles.headerSection}>
            <View style={styles.avatarContainer}>
              <Avatar
                uri={user.profile_photo?.url}
                name={user.username}
                size={120}
                lastSeenAt={user.last_seen_at}
              />
              {user.verified && (
                <View
                  style={[
                    styles.verifiedBadge,
                    { backgroundColor: primaryColor },
                  ]}
                >
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              )}
            </View>

            <ThemedText type="title" style={styles.username}>
              {user.username}
            </ThemedText>

            {user.status_message && (
              <ThemedText
                type="caption"
                lightColor={mutedColor}
                darkColor={mutedColor}
                style={styles.statusMessage}
              >
                "{user.status_message}"
              </ThemedText>
            )}
          </View>

          {/* Info Cards */}
          <View style={styles.infoSection}>
            {/* Location & Distance */}
            <View
              style={[
                styles.infoCard,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={primaryColor}
              />
              <View style={styles.infoTextContainer}>
                <ThemedText type="defaultSemiBold">{user.location}</ThemedText>
                <ThemedText
                  type="caption"
                  lightColor={mutedColor}
                  darkColor={mutedColor}
                >
                  {formatDistance(user.distance_km)}
                </ThemedText>
              </View>
            </View>

            {/* Age & Gender */}
            <View
              style={[
                styles.infoCard,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Ionicons name="person-outline" size={20} color={primaryColor} />
              <View style={styles.infoTextContainer}>
                <ThemedText type="defaultSemiBold">
                  {calculateAge(user.date_of_birth)} years old
                </ThemedText>
                <ThemedText
                  type="caption"
                  lightColor={mutedColor}
                  darkColor={mutedColor}
                >
                  {user.gender} • {user.country}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Bio Section */}
          {user.bio && (
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                About
              </ThemedText>
              <View
                style={[
                  styles.bioCard,
                  { backgroundColor: cardColor, borderColor },
                ]}
              >
                <ThemedText>{user.bio}</ThemedText>
              </View>
            </View>
          )}

          {/* Media Gallery */}
          {user.media && user.media.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Photos & Videos ({user.media.length})
              </ThemedText>
              <View style={styles.mediaGrid}>
                {user.media.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.mediaItem}
                    onPress={() => {
                      // TODO: Open media viewer
                    }}
                  >
                    <Image
                      source={{ uri: item.thumbnail || item.url }}
                      style={styles.mediaImage}
                      resizeMode="cover"
                    />
                    {item.type === "video" && (
                      <View style={styles.videoOverlay}>
                        <Ionicons name="play-circle" size={32} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.messageButton, { backgroundColor: primaryColor }]}
            onPress={() => {
              // TODO: Navigate to chat or start conversation
              // router.push(`/chat/${user.id}`)
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color="white" />
            <ThemedText
              type="defaultSemiBold"
              style={styles.messageButtonText}
              lightColor="white"
              darkColor="white"
            >
              Send Message
            </ThemedText>
          </TouchableOpacity>

          {/* Bottom Spacing */}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  verifiedBadge: {
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
  },
  username: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  statusMessage: {
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  infoSection: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  bioCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  mediaItem: {
    width: MEDIA_GRID_SIZE,
    height: MEDIA_GRID_SIZE,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  messageButtonText: {
    fontSize: 16,
  },
});
