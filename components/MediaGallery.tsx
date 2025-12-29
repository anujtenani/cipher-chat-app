import React from "react";
import { Dimensions, FlatList, Modal } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

function ZoomableImage({
  flatlistGesture,
  uri,
  width,
  height,
}: {
  flatlistGesture: typeof Gesture;
  width: number;
  height: number;
  uri: string;
}) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const enablePan = useSharedValue(false);

  const MAX_SCALE = 3;

  // 🔍 Pinch
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(
        MAX_SCALE,
        Math.max(1, savedScale.value * e.scale)
      );
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1.1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        enablePan.value = false;
        // scheduleOnRN(onZoomChange, false);
      } else {
        enablePan.value = true;
        // scheduleOnRN(onZoomChange, true);
      }
    });

  // ✋ Pan (only when zoomed)
  const panGesture = Gesture.Pan()
    .blocksExternalGesture(flatlistGesture)
    .enableTrackpadTwoFingerGesture(true)
    .manualActivation(true)
    .onTouchesMove((e, state) => {
      if (scale.value > 1) {
        state.activate();
      } else {
        state.fail();
      }
    })
    .onUpdate((e) => {
      if (scale.value > 1) {
        // Calculate how much the image extends beyond the visible area
        const imageAspectRatio = width / height;

        const boxWidth =
          imageAspectRatio < 1 ? screenWidth : screenHeight * imageAspectRatio;
        const boxHeight =
          imageAspectRatio < 1 ? screenWidth / imageAspectRatio : screenHeight;
        // const scaledWidth = boxWidth * scale.value;
        // const scaledHeight = boxHeight * scale.value;

        // const imageWidth = scaledHeight * imageAspectRatio;
        // const imageHeight = scaledWidth / imageAspectRatio;
        // 1920px wide is contained in 822 pixels
        // so we

        // const screenAspectRatio = screenWidth / screenHeight;

        // Maximum translation is the overflow amount
        const maxTranslateX =
          (boxWidth * scale.value - boxWidth) / (2 * scale.value);
        const maxTranslateY =
          (boxHeight * scale.value - boxHeight) / (2 * scale.value);

        const newTranslateX = savedTranslateX.value + e.translationX;
        const newTranslateY = savedTranslateY.value + e.translationY;
        console.log(newTranslateX, maxTranslateX, screenWidth, scale.value);

        // Clamp to prevent showing empty space
        translateX.value = Math.max(
          -maxTranslateX,
          Math.min(maxTranslateX, newTranslateX)
        );
        translateY.value = Math.max(
          -maxTranslateY,
          Math.min(maxTranslateY, newTranslateY)
        );
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // 👆👆 Double tap toggle
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        enablePan.value = false;
        // scheduleOnRN(onZoomChange, false);
      } else {
        scale.value = withTiming(2);
        savedScale.value = 2;
        enablePan.value = true;
        // scheduleOnRN(onZoomChange, true);
      }
    });

  function reset() {
    "worklet";

    // onZoomChange(false);
  }

  const gesture = Gesture.Simultaneous(
    Gesture.Race(pinchGesture, doubleTapGesture),
    panGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={{ flex: 1, overflow: "hidden" }}>
        <Animated.Image
          source={{ uri }}
          resizeMode={"contain"}
          style={[
            {
              width: screenWidth,
              backgroundColor: "orange",
              height: screenHeight,
            },
            animatedStyle,
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
}

export default function MediaGallery({
  media,
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
  media: { uri: string }[];
}) {
  const native = Gesture.Native();
  return (
    <Modal
      visible={visible}
      style={{ flex: 1, backgroundColor: "pink" }}
      transparent={true}
      onRequestClose={onClose}
      animationType="slide"
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={native}>
          <FlatList
            data={media}
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)" }}
            horizontal
            pagingEnabled
            keyExtractor={(item) => item.uri}
            //   estimatedItemSize={220}
            renderItem={({ item }) => (
              <ZoomableImage
                flatlistGesture={native}
                width={item.width}
                height={item.height}
                uri={item.uri}
              />
            )}
          />
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}
