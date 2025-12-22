import { useThemeColor } from "@/hooks/use-theme-color";
import { View } from "react-native";
import { ThemedText } from "../ui/ThemedText";

export default function SettingsSectionTitle({ title }: { title: string }) {
  const borderColor = useThemeColor({}, "border");
  return (
    <View
      style={{
        borderTopColor: borderColor,
        borderTopWidth: 1,
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomColor: borderColor,
        borderBottomWidth: 1,
        paddingHorizontal: 8,
        // marginTop: 20,
      }}
    >
      <ThemedText
        style={{
          fontSize: 14,
          fontWeight: "bold",
          opacity: 0.6,
          textTransform: "uppercase",
        }}
      >
        {title}
      </ThemedText>
    </View>
  );
}
