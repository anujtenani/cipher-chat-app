import { useThemeColor } from "@/hooks/use-theme-color";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./ui/ThemedText";

export default function BottomModal({
  visible,
  title,
  disabled,
  onClose,
  children,
  onSuccess,
}: {
  children: React.ReactNode;
  onSuccess?: () => void;
  title?: string;
  visible: boolean;
  disabled?: boolean;
  onClose: () => void;
}) {
  const primaryColor = useThemeColor({}, "primary");
  const dangerColor = useThemeColor({}, "danger");
  const borderColor = useThemeColor({}, "border");
  const insets = useSafeAreaInsets();
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
        }}
        pointerEvents="box-none"
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
        ></Pressable>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            paddingBottom: 24 + insets.bottom,
            backgroundColor: useThemeColor({}, "background"),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          {title || onSuccess ? (
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: borderColor,
                //   backgroundColor: "orange",
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              {onSuccess ? (
                <Pressable onPress={onClose}>
                  <ThemedText
                    style={{
                      color: dangerColor,
                    }}
                  >
                    Close
                  </ThemedText>
                </Pressable>
              ) : (
                <View></View>
              )}
              <ThemedText style={{ fontSize: 14, fontFamily: "bold" }}>
                {title}
              </ThemedText>
              {onSuccess ? (
                <Pressable disabled={disabled} onPress={onSuccess}>
                  <ThemedText
                    style={{
                      color: disabled ? "#ccc" : primaryColor,
                    }}
                  >
                    Done
                  </ThemedText>
                </Pressable>
              ) : (
                <View></View>
              )}
            </View>
          ) : null}
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
