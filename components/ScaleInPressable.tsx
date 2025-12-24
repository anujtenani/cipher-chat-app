import React from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface ScaleInPressableProps extends PressableProps {
  children: React.ReactNode;
  scaleValue?: number;
}

export default function ScaleInPressable({
  children,
  scaleValue = 0.95,
  onPressIn,
  onPressOut,
  ...props
}: ScaleInPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (event: any) => {
    scale.value = withSpring(scaleValue, {
      damping: 20,
      stiffness: 400,
    });
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    scale.value = withSpring(1, {
      damping: 20,
      stiffness: 400,
    });
    onPressOut?.(event);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...props}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
}
