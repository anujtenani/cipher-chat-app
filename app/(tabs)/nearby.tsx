import RenderCountryFlag from "@/components/RenderCountryFlag";
import Avatar from "@/components/ui/Avatar";
import ThemedButton from "@/components/ui/ThemedButton";
import ThemedInput from "@/components/ui/ThemedInput";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { apiGet, apiPost } from "@/utils/api";
import { PublicUser } from "@/utils/api_types";
import { formatDistance, formatLastSeen } from "@/utils/func";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import useSWR from "swr";
import { useDebounceValue } from "usehooks-ts";

export default function NearbyUsers() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [search, setSearch] = useDebounceValue("", 300);

  const { data, isLoading, mutate, isValidating } = useSWR<{
    users: PublicUser[];
    count: number;
  }>(
    `/users/nearby?limit=100&offset=0${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`,
    apiGet
  );

  const router = useRouter();
  const handleUserPress = (user: PublicUser) => {
    router.push(`/public_profile?username=${user.username}`);
    // setSelectedUser(user);
    // setVisible(true);
  };

  const renderItem = ({ item }: { item: PublicUser }) => (
    <TouchableOpacity
      onPress={() => handleUserPress(item)}
      style={{ padding: 16 }}
    >
      <RenderUserItem user={item} />
    </TouchableOpacity>
  );

  return (
    <React.Fragment>
      <View style={{ flex: 1 }}>
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <ThemedInput
            placeholder="Search nearby users..."
            defaultValue={search}
            onChangeText={setSearch}
            // leftIcon="search-outline"
          />
        </View>
        <FlatList
          data={data?.users || []}
          style={{ flex: 1 }}
          keyExtractor={(item) => item.username.toString()}
          refreshing={isLoading || isValidating}
          onRefresh={mutate}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={
            !isLoading ? (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 60,
                }}
              >
                <Text style={{ fontSize: 16, color: colors.icon }}>
                  No nearby users found
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </React.Fragment>
  );
}

function RenderUserItem({ user }: { user: PublicUser }) {
  const item = user;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <Avatar uri={item.profile_photo?.url} name={item.username} size={60} />

      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.text, fontSize: 18 }}>
            {item.username}
          </Text>
          <Text style={{ color: colors.tint }}>
            {formatDistance(item.distance_km)}
          </Text>
        </View>
        {item.location || item.country ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 8,
              gap: 4,
            }}
          >
            <Ionicons name="location-outline" size={14} color={colors.icon} />
            <Text style={{ color: colors.icon, flex: 1 }} numberOfLines={1}>
              {item.location || item.country}

              {/* {item.country ? `, ${item.country}` : ""} */}
            </Text>
            <RenderCountryFlag countryCode={item.country} />
          </View>
        ) : null}

        {item.bio && (
          <Text style={{ color: colors.text, marginTop: 8 }} numberOfLines={2}>
            {item.bio}
          </Text>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <Text style={{ color: colors.icon }}>
            {formatLastSeen(item.last_seen_at)}
          </Text>
          {item.media && item.media.length > 0 && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Ionicons name="images-outline" size={12} color={colors.icon} />
              <Text style={{ color: colors.icon }}>
                {item.media.length}{" "}
                {item.media.length === 1 ? "photo" : "photos"}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function RenderBottomSheetContent({
  user,
  toggleClose,
}: {
  toggleClose: () => void;
  user?: PublicUser;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [starting, setStarting] = useState(false);
  const router = useRouter();
  if (!user) return null;

  const handleStartChat = () => {
    // Navigate to chat screen with user
    setStarting(true);
    apiPost<{ id: number }>("/conversations/start", {
      username: user.username,
    }).then((conversation) => {
      setStarting(false);
      toggleClose;
      router.push(`/chat/${conversation.id}`);
      console.log("Start chat with:", user.username);
    });
  };

  const handleReport = () => {
    // Handle report user
    console.log("Report user:", user.username);
  };

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 24,
      }}
    >
      <RenderUserItem user={user}></RenderUserItem>
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          marginTop: 16,
        }}
      >
        <ThemedButton
          onPress={handleStartChat}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
            Start Chat
          </Text>
        </ThemedButton>
        <TouchableOpacity
          onPress={handleReport}
          style={{
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.icon,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 8,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="flag-outline" size={20} color={colors.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
