import SettingsListItem from "@/components/settings/SettingsListItem";
import SettingsSectionTitle from "@/components/settings/SettingsSectionTitle";
import { ThemedView } from "@/components/themed-view";
import Avatar from "@/components/ui/Avatar";
import { ThemedText } from "@/components/ui/ThemedText";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/hooks/useAuth";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Alert, Linking, Pressable, ScrollView, View } from "react-native";

export default function Settings() {
  const router = useRouter();
  const goto = (url: Parameters<typeof router.push>[0]) => () => {
    return router.push(url);
  };
  const contactEmail = async () => {
    const email = "support@goaffpro.com";
    const subject = "Cipher Chat Request";

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    const canOpen = await Linking.canOpenURL(mailtoUrl);
    if (canOpen) {
      await Linking.openURL(mailtoUrl);
    } else {
      Alert.alert("Error", "Could not open email client");
    }
  };
  const bgColor = useThemeColor({}, "background");
  return (
    <ScrollView style={{ flex: 1, backgroundColor: bgColor }}>
      <ThemedView style={{ flex: 1 }}>
        <Stack.Screen options={{ title: "Settings" }} />
        <ProfileCard></ProfileCard>
        <SettingsSectionTitle title="Preferences"></SettingsSectionTitle>
        <SettingsListItem
          title="Lock Setup"
          onPress={goto("/settings/lock-setup")}
          description="Manage your PIN and biometric settings"
        ></SettingsListItem>
        <SettingsListItem
          title="Notifications"
          description="Manage notification preferences"
          onPress={goto("/settings/notifications")}
        />

        <SettingsSectionTitle title="Help & About"></SettingsSectionTitle>
        <SettingsListItem title="Contact Us" onPress={contactEmail} />
        <SettingsListItem
          title="FAQ"
          onPress={goto("/settings/webview?page=faq")}
        />
        <SettingsListItem
          title="Terms of Service"
          onPress={goto("/settings/webview?page=terms")}
        />
        <SettingsListItem
          title="Privacy Policy"
          onPress={goto("/settings/webview?page=privacy")}
        ></SettingsListItem>

        <LogoutButton />
        <DeleteAccountButton></DeleteAccountButton>
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
            App Version 1.0.0
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

function DeleteAccountButton() {
  return (
    <View style={{ padding: 10, alignItems: "center", marginTop: 20 }}>
      <ThemedText style={{ color: "red" }}>Delete Account</ThemedText>
    </View>
  );
}
function LogoutButton() {
  const logout = useAuth((state) => state.logout);
  const router = useRouter();
  const handleLogout = () => {
    logout().then(() => {
      router.replace("/login");
    });
  };
  return (
    <Pressable onPress={handleLogout}>
      <View style={{ padding: 10 }}>
        <ThemedText>Logout ?</ThemedText>
      </View>
    </Pressable>
  );
}

function ProfileCard() {
  const user = useAuth((state) => state.user);
  const push = useRouter().push;
  return (
    <Pressable onPress={() => push("/settings/profile")}>
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
          padding: 20,
        }}
      >
        <Avatar
          name={user?.username || ""}
          uri={user?.profile_photo?.url}
        ></Avatar>
        <View>
          <ThemedText type="subtitle">{user?.username || ""}</ThemedText>
          <ThemedText type="caption">{user?.bio || "no bio set"}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}
