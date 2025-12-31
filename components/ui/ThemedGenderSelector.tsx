import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type Gender = "male" | "female" | "non-binary" | "prefer-not-to-say";

interface ThemedGenderSelectorProps {
  value?: string;
  onChange?: (gender: string) => void;
  style?: any;
}

export default function ThemedGenderSelector({
  value,
  onChange,
  style,
}: ThemedGenderSelectorProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");

  const genderOptions: { value: string; label: string; icon: string }[] = [
    { value: "m", label: "MALE", icon: "♂" },
    { value: "f", label: "FEMALE", icon: "♀" },
    // { value: "non-binary", label: "Non-binary", icon: "⚧" },
    // { value: "na", label: "prefer not to say", icon: "?" },
  ];

  return (
    <View
      style={[
        {
          gap: 8,
        },
        style,
      ]}
    >
      {genderOptions.map((option) => {
        const isSelected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange?.(option.value)}
            style={[
              {
                // flexDirection: "row",
                padding: 12,
                // gap: 4,
                // alignItems: "center",
                borderRadius: 8,
                borderWidth: 1,
                backgroundColor: isSelected ? primaryColor : cardColor,
                borderColor: isSelected ? primaryColor : borderColor,
              },
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                {
                  fontWeight: "bold",
                  minWidth: 70,
                  // textTransform: "uppercase",
                  //   minWidth: 70,
                  textAlign: "center",
                  color: isSelected ? "#FFFFFF" : textColor,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
