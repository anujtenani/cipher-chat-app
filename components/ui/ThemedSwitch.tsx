import { useThemeColor } from "@/hooks/use-theme-color";
import { Switch } from "react-native";

export default function ThemedSwitch({
  value,
  onValueChange,
  disabled = false,
}: {
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const tintColor = useThemeColor({}, "primary");
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#767577", true: tintColor }}
      thumbColor="#f4f3f4"
      disabled={disabled}
    />
  );
}
