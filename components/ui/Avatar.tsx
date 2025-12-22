import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface AvatarProps {
  uri?: string;
  name: string;
  size?: number;
  status?: "online" | "away";
  lastSeenAt?: string;
}

export default function Avatar({
  uri,
  name,
  size = 50,
  status,
  lastSeenAt,
}: AvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const computeStatus = (): "online" | "away" | null => {
    if (status) return status;
    if (!lastSeenAt) return null;
    const diff = Date.now() - new Date(lastSeenAt).getTime();
    return diff < 5 * 60 * 1000 ? "online" : "away";
  };

  const currentStatus = computeStatus();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size }]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}
      {currentStatus && (
        <View
          accessible
          accessibilityLabel={`Status: ${currentStatus}`}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: size * 0.22,
            height: size * 0.22,
            borderRadius: (size * 0.22) / 2,
            borderWidth: 2,
            borderColor: "#fff",
            backgroundColor: currentStatus === "online" ? "#10B981" : "#F59E0B",
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  image: {
    borderRadius: 999,
  },
  placeholder: {
    backgroundColor: "#6B7280",
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
