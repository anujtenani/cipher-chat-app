import { useThemeColor } from "@/hooks/use-theme-color";
import { Pressable, View } from "react-native";
import { ThemedText } from "../ui/ThemedText";

interface SettingsListItemProps {
  onPress?: (() => void) | undefined;
  title: string;
  description?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function SettingsListItem({
  title,
  description,
  children,
  onPress,
  disabled,
}: SettingsListItemProps) {
  const borderColor = useThemeColor({}, "border");
  const Cmp = onPress ? Pressable : View;
  return (
    <Cmp
      onPress={onPress}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomColor: borderColor,
        borderBottomWidth: 0.5,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <ThemedText style={{ fontWeight: "500", marginBottom: 4 }}>
            {title}
          </ThemedText>
          {description && (
            <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
              {description}
            </ThemedText>
          )}
        </View>
        {children}
      </View>
    </Cmp>
  );
}
