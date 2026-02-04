import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/hooks/useAuth";
import useSingleFileUpload from "@/hooks/useSingleFileUpload";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { EnablePushNotifications } from "./home/EnablePushNotifications";
import ScaleInPressable from "./ScaleInPressable";
import ThemedButton from "./ui/ThemedButton";
import { ThemedText } from "./ui/ThemedText";

export default function ProfileQuickSetup() {
  const borderColor = useThemeColor({}, "border");
  const surface = useThemeColor({}, "surface");
  const profile_photo = useAuth((state) => state.user?.profile_photo);
  const age = useAuth((state) => state.user?.date_of_birth);
  const userAge = new Date().getFullYear() - new Date(age || "").getFullYear();

  const gender = useAuth((state) => state.user?.gender);
  if (profile_photo && age && gender) return null;
  return (
    <View>
      <ThemedText
        style={{
          textAlign: "center",
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        Complete your profile for better matches!
      </ThemedText>

      <View
        style={{
          marginHorizontal: 12,
          backgroundColor: surface,
          padding: 12,
          borderWidth: 1,
          borderColor: borderColor,
          borderRadius: 18,
          gap: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {!gender ? <AreYouMaleOrFemale></AreYouMaleOrFemale> : null}
        {!profile_photo ? <UploadProfilePhoto></UploadProfilePhoto> : null}
        {!userAge || userAge <= 12 ? <YourAge></YourAge> : null}
      </View>

      <EnablePushNotifications></EnablePushNotifications>
      <View style={{ height: 12 }}></View>
    </View>
  );
}
const ageRange = Array.from({ length: 83 }, (_, i) => i + 18);
function YourAge() {
  const date_of_birth = useAuth((state) => state.user?.date_of_birth);
  const userAge =
    new Date().getFullYear() - new Date(date_of_birth || "").getFullYear();

  const updateProfile = useAuth((state) => state.updateProfile);
  const iconColor = useThemeColor({}, "text");

  const handleAge = (age: number) => () => {
    updateProfile({
      date_of_birth: `${new Date().getFullYear() - Number(age)}-06-01`,
    });
  };
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 8,
          marginBottom: 12,
        }}
      >
        <Ionicons name="calendar-outline" size={20} color={iconColor} />
        <ThemedText
          style={{
            fontSize: 16,
            fontWeight: "500",
          }}
        >
          Your Age
        </ThemedText>
      </View>
      <ScrollView
        horizontal
        contentContainerStyle={{ gap: 8, paddingHorizontal: 8 }}
        showsHorizontalScrollIndicator={false}
      >
        {ageRange.map((age) => {
          return (
            <PillButton
              key={String(age)}
              onPress={handleAge(age)}
              isSelected={userAge === age}
              text={`${age} yrs`}
            ></PillButton>
          );
        })}
      </ScrollView>
    </View>
  );
}

function UploadProfilePhoto() {
  const {
    trigger,
    // isUploading,
    // uploadProgress: progress,
  } = useSingleFileUpload((data) => {
    updateProfile({
      profile_photo: data,
    });
  });
  const updateProfile = useAuth((state) => state.updateProfile);
  const iconColor = useThemeColor({}, "text");

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Ionicons name="camera-outline" size={20} color={iconColor} />
        <View>
          <ThemedText
            style={{
              fontSize: 16,
              fontWeight: "500",
            }}
          >
            Profile Picture
          </ThemedText>
        </View>
      </View>
      <ThemedButton
        style={{ paddingVertical: 12, paddingHorizontal: 2 }}
        title="Choose"
        onPress={trigger}
        icon="camera-outline"
      ></ThemedButton>
    </View>
  );
}

function AreYouMaleOrFemale() {
  const updateProfile = useAuth((state) => state.updateProfile);
  const iconColor = useThemeColor({}, "text");

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Ionicons name="person-outline" size={20} color={iconColor} />
        <View>
          <ThemedText
            style={{
              fontSize: 16,
              fontWeight: "500",
            }}
          >
            Gender
          </ThemedText>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <PillButton
          text="Male"
          isSelected={false}
          onPress={() => {
            updateProfile({
              gender: "m",
            });
          }}
        ></PillButton>
        <PillButton
          text="Female"
          isSelected={false}
          onPress={() => {
            updateProfile({
              gender: "f",
            });
          }}
        ></PillButton>
      </View>
    </View>
  );
}

function PillButton({
  text,
  isSelected,
  onPress,
}: {
  text: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");
  return (
    <ScaleInPressable
      onPress={onPress}
      style={{
        padding: 12,
        borderWidth: 1,
        borderColor: borderColor,
        borderRadius: 6,
        minWidth: 100,
        backgroundColor: isSelected ? primaryColor : "white",
        alignItems: "center",
      }}
    >
      <Text style={{ color: isSelected ? "white" : "#222" }}>{text}</Text>
    </ScaleInPressable>
  );
}
