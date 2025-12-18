import React, { useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const screenHeight = Dimensions.get("window").height;

export default function BottomSheet({
  visible,
  onClose,
  children,
}: BottomSheetProps) {
  const [isMounted, setIsMounted] = useState(visible);
  const progress = useSharedValue(visible ? 1 : 0);
  const translateY = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow downward swipes
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      const shouldDismiss = event.translationY > 100 || event.velocityY > 500;

      if (shouldDismiss) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
      }
    });

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      translateY.value = 0;
      progress.value = withTiming(1, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = withTiming(
        0,
        {
          duration: 240,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(setIsMounted)(false);
          }
        }
      );
    }
  }, [progress, translateY, visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          interpolate(progress.value, [0, 1], [screenHeight, 0], "clamp") +
          translateY.value,
      },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 0.4], "clamp"),
  }));

  return (
    <Modal
      transparent
      visible={isMounted}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.fullscreen} pointerEvents="box-none">
        <Pressable style={styles.backdropPressable} onPress={onClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.sheet, sheetStyle, { minHeight: 200 }]}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={[styles.sheetInner, { paddingBottom: 24 + insets.bottom }]}
            >
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>
              <ScrollView
                bounces={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#fff",
    maxHeight: screenHeight * 0.8,
    overflow: "hidden",
  },
  sheetInner: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D9D9D9",
  },
  contentContainer: {
    paddingBottom: 24,
    gap: 12,
  },
});
