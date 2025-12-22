import { useThemeColor } from "@/hooks/use-theme-color";
import Icon from "@expo/vector-icons/Ionicons";
import { TouchableOpacity } from "react-native";
export default function HeaderIconButton({
  icon,
  onPress,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  onPress: () => void;
}) {
  const iconColor = useThemeColor({}, "icon");
  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 8 }}>
      <Icon size={24} name={icon} color={iconColor} />
    </TouchableOpacity>
  );
}
