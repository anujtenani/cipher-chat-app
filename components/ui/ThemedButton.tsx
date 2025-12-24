import {
  ActivityIndicator,
  Text,
  TouchableHighlight,
  View,
} from "react-native";

export default function ThemedButton({
  title,
  isLoading,
  disabled,
  children,
  style,
  onPress,
}: {
  disabled?: boolean;
  isLoading?: boolean;
  style?: any;
  children?: React.ReactNode;
  onPress?: () => void;
  title?: string;
}) {
  return (
    <TouchableHighlight
      onPress={onPress}
      disabled={isLoading || disabled}
      style={[
        {
          opacity: isLoading ? 0.5 : 1,
          backgroundColor: isLoading ? "#007AFF" : "#007AFF",
          borderRadius: 8,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          height: 56,
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {isLoading ? (
          <ActivityIndicator size={18} color="white" />
        ) : (
          <>
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
    </TouchableHighlight>
  );
}
