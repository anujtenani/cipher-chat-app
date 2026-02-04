import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import ScaleInPressable from "../ScaleInPressable";
import { ThemedView } from "../themed-view";
import { ThemedText } from "../ui/ThemedText";

const optionsGrid = [
  {
    icon: "image-outline",
    label: "Photos",
    id: "photo_video",
  },
  {
    icon: "camera-outline",
    label: "Camera",
    id: "camera",
  },
  {
    icon: "document-outline",
    label: "Document",
    id: "document",
  },
  {
    icon: "game-controller-outline",
    label: "Game",
    id: "game",
  },
] as const;

export default function AttachmentOptions({
  onSelect,
}: {
  onSelect: (optionId: string) => void;
}) {
  const iconColor = useThemeColor({}, "icon");
  const backgroundSecondary = useThemeColor(
    { light: "#E5E5EA", dark: "#2C2C2E" },
    "tint"
  );

  return (
    <ThemedView
      style={{
        padding: 16,
        marginHorizontal: 8,
        backgroundColor: backgroundSecondary,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",

          justifyContent: "center",
          gap: 16,
        }}
      >
        {optionsGrid.map((option) => (
          <ScaleInPressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={{
              width: 80,
              //   width: 100,
              //   backgroundColor: "orange",
              gap: 8,
            }}
          >
            <View
              style={{
                width: 50,
                aspectRatio: 1,
                height: 50,
                borderRadius: 25,
                alignSelf: "center",
                padding: 12,
                backgroundColor: backgroundSecondary,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name={option.icon} size={24} color={iconColor} />
            </View>
            <View style={{ width: "100%", backgroundColor: "pink" }}></View>
            <ThemedText
              style={{
                textAlign: "center",
                fontSize: 14,
              }}
            >
              {option.label}
            </ThemedText>
          </ScaleInPressable>
        ))}
      </View>
    </ThemedView>
  );
}
