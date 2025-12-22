import { useLocalSettings } from "@/hooks/useLocalSettings";
import useToggle from "@/hooks/useToggle";
import { Modal, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "../themed-view";
import PinLockScreen from "../ui/PinLockScreen";
import { ThemedText } from "../ui/ThemedText";

export default function PinLockOverlay() {
  const [visible, toggle] = useToggle(true);
  const insets = useSafeAreaInsets();
  const pinEnabled = useLocalSettings((state) => state.settings.pinCodeEnabled);
  const fingerprintEnabled = useLocalSettings(
    (state) => state.settings.fingerprintEnabled
  );
  const pinCode = useLocalSettings((state) => state.settings.pinCode);
  if (!pinEnabled || !pinCode) {
    return null;
  }
  return (
    <Modal visible={visible} animationType="none" transparent={false}>
      <ThemedView style={{ flex: 1, paddingTop: 50 + insets.top }}>
        <ThemedText
          style={{ marginBottom: 20, textAlign: "center", fontSize: 18 }}
        >
          Enter your pin code to access
        </ThemedText>
        <PinLockScreen
          correctPin={pinCode}
          fingerprintEnabled={fingerprintEnabled}
          handleSuccessfulUnlock={toggle}
        ></PinLockScreen>
        <ThemedText style={{ textAlign: "center" }}>
          Forgot pin code ?
        </ThemedText>
        <Pressable>
          <ThemedText type="link" style={{ textAlign: "center", marginTop: 8 }}>
            Click here to receive your pin over email
          </ThemedText>
        </Pressable>
      </ThemedView>
    </Modal>
  );
}
