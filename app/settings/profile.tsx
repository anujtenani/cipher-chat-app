import Avatar from "@/components/ui/Avatar";
import ThemedButton from "@/components/ui/ThemedButton";
import ThemedDatePicker from "@/components/ui/ThemedDatePicker";
import ThemedInput from "@/components/ui/ThemedInput";
import { ThemedText } from "@/components/ui/ThemedText";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/hooks/useAuth";
import { uploadImageFile } from "@/utils/upload_functions";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
export default function ProfileSettings() {
  const user = useAuth((state) => state.user);
  const updateProfile = useAuth((state) => state.updateProfile);
  const [progress, setProgress] = React.useState(0);
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
        updateProfile({ profile_photo: { url: uploadResult.url } });
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };
  const [formData, setFormData] = React.useState({});
  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const backgroundColor = useThemeColor({}, "background");
  return (
    <ScrollView style={{ flex: 1, paddingVertical: 16, backgroundColor }}>
      <Stack.Screen
        options={{
          title: "Profile",
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
          value={formData.dob}
          onChange={(d) => handleChange("dob")(d.toString())}
        />
      </View>
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
          BIO
        </ThemedText>
        <ThemedInput
          value={formData.bio}
          placeholder={"Add a bio"}
          onChangeText={handleChange("bio")}
        ></ThemedInput>
      </View>

      {/* <View
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
          MEDIA
        </ThemedText>
        <ThemedText type="subtitle">42 photos and videos</ThemedText>
      </View> */}

      <View style={{ marginTop: 20 }}></View>
      <ThemedButton title="Submit"></ThemedButton>
    </ScrollView>
  );
}
