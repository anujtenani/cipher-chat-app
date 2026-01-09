import ProfileQuickSetup from "@/components/ProfileQuickSetup";
import { ThemedView } from "@/components/themed-view";
import ThemedButton from "@/components/ui/ThemedButton";
import { ThemedText } from "@/components/ui/ThemedText";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NeedProfileCompletionPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const primaryColor = useThemeColor({}, "primary");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");

  const { profile_photo, date_of_birth, gender } = useAuth(
    (state) => state.user || {}
  );

  const isProfileComplete = profile_photo && date_of_birth && gender;

  // If profile is complete, go back
  React.useEffect(() => {
    if (isProfileComplete) {
      router.back();
    }
  }, [isProfileComplete, router]);

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
          title: "Complete Your Profile",
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, paddingTop: 32 }}>
          {/* Icon and Message */}
          <View
            style={{
              alignItems: "center",
              paddingHorizontal: 24,
              marginBottom: 32,
            }}
          >
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: `${primaryColor}20`,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Ionicons
                name="person-circle-outline"
                size={80}
                color={primaryColor}
              />
            </View>

            <ThemedText
              type="title"
              style={{
                fontSize: 26,
                fontWeight: "700",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Complete Your Profile
            </ThemedText>

            <ThemedText
              style={{
                fontSize: 16,
                textAlign: "center",
                lineHeight: 24,
                opacity: 0.7,
              }}
            >
              Before you can start chatting, please complete your profile. This
              helps create a better experience for everyone!
            </ThemedText>
          </View>

          {/* Requirements Checklist */}
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <View
              style={{
                backgroundColor: cardColor,
                borderWidth: 1,
                borderColor: borderColor,
                borderRadius: 16,
                padding: 20,
              }}
            >
              <ThemedText
                type="defaultSemiBold"
                style={{ fontSize: 18, marginBottom: 16 }}
              >
                What&apos;s needed:
              </ThemedText>

              <RequirementItem
                icon="person"
                label="Gender"
                isComplete={!!gender}
              />
              <RequirementItem
                icon="calendar"
                label="Date of Birth"
                isComplete={!!date_of_birth}
              />
              <RequirementItem
                icon="image"
                label="Profile Photo"
                isComplete={!!profile_photo}
              />
            </View>
          </View>

          {/* Profile Quick Setup Component */}
          <View style={{ paddingBottom: 24 }}>
            <ProfileQuickSetup />
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={{ padding: 16 }}>
        <ThemedButton
          disabled={!isProfileComplete}
          onPress={() => router.back()}
          style={{ opacity: isProfileComplete ? 1 : 0.5 }}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <ThemedText
            lightColor="white"
            darkColor="white"
            type="defaultSemiBold"
            style={{ fontSize: 16 }}
          >
            {isProfileComplete ? "Continue" : "Complete Profile Above"}
          </ThemedText>
        </ThemedButton>
      </View>
    </ThemedView>
  );
}

function RequirementItem({
  icon,
  label,
  isComplete,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isComplete: boolean;
}) {
  const primaryColor = useThemeColor({}, "primary");
  const mutedColor = useThemeColor({}, "muted");

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isComplete ? `${primaryColor}20` : `${mutedColor}10`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isComplete ? primaryColor : mutedColor}
        />
      </View>

      <ThemedText
        style={{
          flex: 1,
          fontSize: 16,
          opacity: isComplete ? 1 : 0.6,
        }}
      >
        {label}
      </ThemedText>

      {isComplete ? (
        <Ionicons name="checkmark-circle" size={24} color={primaryColor} />
      ) : (
        <Ionicons name="ellipse-outline" size={24} color={mutedColor} />
      )}
    </View>
  );
}
