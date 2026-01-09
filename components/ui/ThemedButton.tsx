import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";
import ScaleInPressable from "../ScaleInPressable";

export default function ThemedButton({
  title,
  isLoading,
  disabled,
  children,
  style,
  icon,
  onPress,
}: {
  disabled?: boolean;
  isLoading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: any;
  children?: React.ReactNode;
  onPress?: () => void;
  title?: string;
}) {
  const primaryColor = useThemeColor({}, "primary");
  return (
    <ScaleInPressable
      onPress={onPress}
      disabled={isLoading || disabled}
      style={[
        {
          paddingVertical: 18,
          opacity: isLoading ? 0.5 : 1,
          backgroundColor: primaryColor,
          borderRadius: 8,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 12,
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {isLoading ? (
          <ActivityIndicator size={18} color="white" />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={18} color="white" /> : null}

            {children ? (
              <>{children}</>
            ) : (
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                {title}
              </Text>
            )}
          </>
        )}
      </View>
    </ScaleInPressable>
  );
}
