import Avatar from "@/components/ui/Avatar";
import ThemedDatePicker from "@/components/ui/ThemedDatePicker";
import ThemedGenderSelector from "@/components/ui/ThemedGenderSelector";
import { ThemedText } from "@/components/ui/ThemedText";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/hooks/useAuth";
import { uploadImageFile } from "@/utils/upload_functions";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
export default function ProfileSettings() {
  const user = useAuth((state) => state.user);
  const updateProfile = useAuth((state) => state.updateProfile);
  const [progress, setProgress] = React.useState(0);
  const router = useRouter();
  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert(`Failed to get permission. Please allow access to your photos.`);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });
      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        const uploadResult = await uploadImageFile(
          selectedAsset,
          (progress) => {
            setProgress(progress);
          }
        );
        updateProfile({
          profile_photo: {
            ...uploadResult,
            thumbnail: `${uploadResult.url}?height=300`,
            width: selectedAsset.width,
            height: selectedAsset.height,
          },
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const backgroundColor = useThemeColor({}, "background");
  return (
    <ScrollView style={{ flex: 1, paddingVertical: 16, backgroundColor }}>
      <Stack.Screen
        options={{
          title: "Profile",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Pressable onPress={pickImage} style={{ alignSelf: "center" }}>
        <Avatar
          size={120}
          name={user?.username || "U"}
          uri={user?.profile_photo?.url}
        ></Avatar>
      </Pressable>
      <View
        style={{
          borderTopWidth: 1,
          borderBottomWidth: 1,
          padding: 12,
          borderColor: useThemeColor({}, "border"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 16,
        }}
      >
        <ThemedText style={{ fontSize: 12, fontWeight: "bold" }}>
          USERNAME
        </ThemedText>
        <ThemedText type="subtitle">{user?.username}</ThemedText>
      </View>

      <View
        style={{
          borderBottomWidth: 1,
          padding: 12,
          borderColor: useThemeColor({}, "border"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <ThemedText style={{ fontSize: 12, fontWeight: "bold" }}>
          DATE OF BIRTH
        </ThemedText>
        <ThemedDatePicker
          value={new Date(user?.date_of_birth || "")}
          onChange={(d) => updateProfile({ date_of_birth: d.toString() })}
        />
      </View>
      <View
        style={{
          borderBottomWidth: 1,
          padding: 12,
          borderColor: useThemeColor({}, "border"),
          flexDirection: "column",
          // alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <ThemedText style={{ fontSize: 12, fontWeight: "bold" }}>
          GENDER
        </ThemedText>
        <ThemedGenderSelector
          value={user?.gender}
          onChange={(gender: string) =>
            updateProfile({
              gender,
            })
          }
          style={{ flexDirection: "row" }}
        ></ThemedGenderSelector>
      </View>
      <ProfileItem
        title="BIO"
        description={user?.bio || "You haven't set a bio yet. Tap to update."}
        onPress={() => {
          router.push("/profile_wizard/update_bio");
        }}
      />
      <ProfileItem
        title="LOCATION"
        description={
          user?.location || "You haven't set a location yet. Tap to update."
        }
        onPress={() => {
          router.push("/profile_wizard/update_location");
        }}
      />
    </ScrollView>
  );
}

function ProfileItem({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          borderBottomWidth: 1,
          padding: 12,
          gap: 8,
          borderColor: useThemeColor({}, "border"),
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <ThemedText style={{ fontSize: 12, fontWeight: "bold" }}>
          {title}
        </ThemedText>
        <ThemedText>{description}</ThemedText>
      </View>
    </Pressable>
  );
}
