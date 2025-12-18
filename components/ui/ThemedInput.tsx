import { TextInput } from "react-native";

export default function ThemedInput(props: TextInput["props"]) {
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
            borderColor: "#ccc",
          },
          props.style,
        ]}
      ></TextInput>
    </>
  );
}
