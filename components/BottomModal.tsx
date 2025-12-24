import { useThemeColor } from "@/hooks/use-theme-color";
import {
  Dimensions,
  Modal,
  Pressable,
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

import useKeyboardHeight from "@/hooks/useKeyboardHeight";
import React, { useEffect, useState } from "react";
import ThemedButton from "./ui/ThemedButton";

export default function BottomModal({
  visible,
  title,
  disabled,
  onClose,
  children,
  onCancel,
  onSuccess,
}: {
  onCancel?: () => void;
  children: React.ReactNode;
  onSuccess?: () => void;
  title?: string;
  visible: boolean;
  disabled?: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [contentHeight, setContentHeight] = useState(0);
  const keyboardHeight = useKeyboardHeight();
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <BottomSheet
        visible={visible}
        onClose={onClose}
        contentHeight={contentHeight}
      >
        <View
          style={{
            paddingBottom: 24 + insets.bottom,
            // backgroundColor: useThemeColor({}, "background"),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setContentHeight(height);
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
          {onCancel || onSuccess ? (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <ThemedButton
                onPress={onCancel || onClose}
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
          ) : null}
          <View style={{ height: keyboardHeight }} />
        </View>
      </BottomSheet>
    </Modal>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.8;

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentHeight: number;
};

export function BottomSheet({
  visible,
  onClose,
  children,
  contentHeight,
}: BottomSheetProps) {
  const SHEET_HEIGHT = Math.min(
    contentHeight + 56, // Adding padding for handle and margins
    MAX_SHEET_HEIGHT
  );

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
  }, [backdropOpacity, translateY, visible, SHEET_HEIGHT]);

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
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
            <Animated.View style={[styles.backdrop, backdropStyle]} />
          </Pressable>

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
    maxHeight: MAX_SHEET_HEIGHT,
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
