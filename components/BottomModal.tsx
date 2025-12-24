import { useThemeColor } from "@/hooks/use-theme-color";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";
import { ThemedText } from "./ui/ThemedText";

import React, { useEffect } from "react";
import ThemedButton from "./ui/ThemedButton";

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
  const insets = useSafeAreaInsets();
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <BottomSheet visible={visible} onClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            paddingBottom: 24 + insets.bottom,
            // backgroundColor: useThemeColor({}, "background"),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <ThemedText
            style={{
              fontSize: 18,
              letterSpacing: 1,
              fontWeight: "bold",
            }}
          >
            {title}
          </ThemedText>

          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <ThemedButton
              onPress={onClose}
              title="Cancel"
              style={{
                flex: 1,
                backgroundColor: "transparent",
              }}
            ></ThemedButton>
            <ThemedButton
              title="Submit"
              onPress={onSuccess}
              style={{ flex: 2 }}
            ></ThemedButton>
          </View>
        </KeyboardAvoidingView>
      </BottomSheet>
    </Modal>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.4;

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  // Open / close animation
  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 80 });
      // translateY.value = withTiming(0, {
      //   duration: 300,
      //   easing: Easing.in(Easing.ease),
      // });
      backdropOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.in(Easing.ease),
      });
    } else {
      translateY.value = withSpring(SHEET_HEIGHT, { damping: 80 });

      // translateY.value = withTiming(SHEET_HEIGHT, {
      //   duration: 300,
      //   easing: Easing.in(Easing.ease),
      // });
      backdropOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [backdropOpacity, translateY, visible]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      console.log(e.translationY);
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      if (translateY.value > SHEET_HEIGHT / 3) {
        translateY.value = withTiming(SHEET_HEIGHT, {}, () => {
          scheduleOnRN(onClose);
        });
        backdropOpacity.value = withTiming(0);
      } else {
        translateY.value = withSpring(0);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const backgroudColor = useThemeColor({}, "background");

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <View style={StyleSheet.absoluteFill}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />

          <Animated.View
            style={[
              styles.sheet,
              sheetStyle,
              { backgroundColor: backgroudColor },
            ]}
          >
            <View style={styles.handle} />
            {children}
          </Animated.View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    height: SHEET_HEIGHT,
    width: "99%",
    alignSelf: "center",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  handle: {
    width: 40,
    height: 4,
    marginTop: -32,
    borderRadius: 2,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 24,
  },
});
