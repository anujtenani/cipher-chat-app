import { useThemeColor } from "@/hooks/use-theme-color";
import { TextInput } from "react-native";

export default function ThemedInput(props: TextInput["props"]) {
  const borderColor = useThemeColor({}, "border");
  const color = useThemeColor({}, "text");
  return (
    <>
      <TextInput
        {...props}
        style={[
          {
            borderWidth: 1,
            borderRadius: 8,
            fontSize: 18,
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderColor: borderColor,
            color,
          },
          props.style,
        ]}
      ></TextInput>
    </>
  );
}
