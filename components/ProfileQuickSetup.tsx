import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/hooks/useAuth";
import useSingleFileUpload from "@/hooks/useSingleFileUpload";
import React from "react";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import ScaleInPressable from "./ScaleInPressable";
import { ThemedText } from "./ui/ThemedText";

export default function ProfileQuickSetup() {
  const borderColor = useThemeColor({}, "border");
  const surface = useThemeColor({}, "surface");
  const profile_photo = useAuth((state) => state.user?.profile_photo);
  const age = useAuth((state) => state.user?.date_of_birth);
  const gender = useAuth((state) => state.user?.gender);
  if (profile_photo && age && gender) return null;
  return (
    <View
      style={{
        margin: 12,
        backgroundColor: surface,
        padding: 12,
        borderWidth: 1,
        borderColor: borderColor,
        borderRadius: 8,
      }}
    >
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

      {!gender ? <AreYouMaleOrFemale></AreYouMaleOrFemale> : null}
      {!profile_photo ? <UploadProfilePhoto></UploadProfilePhoto> : null}
      {!age ? <YourAge></YourAge> : null}
    </View>
  );
}

function OptionTitle({ title }: { title: string }) {
  return (
    <>
      <ThemedText
        style={{
          textAlign: "center",
          marginTop: 12,
          fontSize: 14,
          fontWeight: "500",
        }}
      >
        {title}
      </ThemedText>
    </>
  );
}
const ageRange = Array.from({ length: 83 }, (_, i) => i + 18);
function YourAge() {
  const date_of_birth = useAuth((state) => state.user?.date_of_birth);
  const userAge =
    new Date().getFullYear() - new Date(date_of_birth || "").getFullYear();

  const updateProfile = useAuth((state) => state.updateProfile);
  if (userAge > 12) {
    return null;
  }
  const handleAge = (age: number) => () => {
    updateProfile({
      date_of_birth: `${new Date().getFullYear() - Number(age)}-06-01`,
    });
  };
  return (
    <View>
      <OptionTitle title="How old are you?" />
      <ScrollView
        horizontal
        contentContainerStyle={{ gap: 8 }}
        showsHorizontalScrollIndicator={true}
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
  const profile_photo = useAuth((state) => state.user?.profile_photo);
  if (profile_photo) {
    return null;
  }

  return (
    <View>
      <OptionTitle title="Set your profile picture" />
      <PillButton
        onPress={trigger}
        isSelected={false}
        text="Click here to select"
      ></PillButton>
    </View>
  );
}

function AreYouMaleOrFemale() {
  const gender = useAuth((state) => state.user?.gender);
  const updateProfile = useAuth((state) => state.updateProfile);
  if (gender) {
    return null;
  }
  return (
    <View>
      <OptionTitle title="Select your gender" />
      <View style={{ alignSelf: "center", flexDirection: "row", gap: 12 }}>
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
  return (
    <ScaleInPressable
      onPress={onPress}
      style={{
        padding: 12,
        borderWidth: 1,
        borderColor: borderColor,
        borderRadius: 6,
        marginTop: 12,
        minWidth: 100,
        backgroundColor: isSelected ? "#3b82f6" : "white",
        alignItems: "center",
      }}
    >
      <Text style={{ color: isSelected ? "white" : "#222" }}>{text}</Text>
    </ScaleInPressable>
  );
}
