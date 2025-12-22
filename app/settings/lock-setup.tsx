import BottomModal from "@/components/BottomModal";
import SettingsListItem from "@/components/settings/SettingsListItem";
import { ThemedView } from "@/components/themed-view";
import ThemedInput from "@/components/ui/ThemedInput";
import ThemedSwitch from "@/components/ui/ThemedSwitch";
import { ThemedText } from "@/components/ui/ThemedText";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/hooks/useAuth";
import { useLocalSettings } from "@/hooks/useLocalSettings";
import useToggle from "@/hooks/useToggle";
import { isValidEmail } from "@/utils/func";
import Icon from "@expo/vector-icons/Ionicons";
import { Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
function LockSetupSettingsScreen() {
  const iconColor = useThemeColor({}, "icon");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");

  const pinEnabled = useLocalSettings((state) => state.settings.pinCodeEnabled);
  const fingerprintEnabled = useLocalSettings(
    (state) => state.settings.fingerprintEnabled
  );
  const setSettings = useLocalSettings((state) => state.setSettings);

  const pinCode = useLocalSettings((state) => state.settings.pinCode);

  const userEmail = useAuth((state) => state.user?.email);
  const [visible, toggleVisible] = useToggle(false);
  const savePin = () => {
    // Save the pin code logic here
    toggleVisible();
    // apiPost("/auth/");
    //TODO save this on the server as well
    setSettings({ pinCode: pin, recoveryEmail: email || userEmail || "" });
  };
  const canSave = pin.length >= 4 && isValidEmail(userEmail || email);
  return (
    <ThemedView style={{ flex: 1 }}>
      <SettingsListItem
        onPress={() =>
          setSettings({
            fingerprintEnabled: !fingerprintEnabled,
            pinCodeEnabled: !pinEnabled,
          })
        }
        title="Enable Pin Lock"
        description="Require a PIN code to access the app"
      >
        <ThemedSwitch
          value={pinEnabled}
          onValueChange={(value) =>
            setSettings({ pinCodeEnabled: value, fingerprintEnabled: value })
          }
        />
      </SettingsListItem>
      {pinEnabled && (
        <>
          <SettingsListItem
            onPress={toggleVisible}
            title={pinCode ? "Change PIN Code" : "Set PIN Code"}
            description={
              pinCode
                ? "Update your PIN code for added security"
                : "Set a PIN code for added security"
            }
          >
            <Icon name="chevron-forward" color={iconColor} size={20} />
          </SettingsListItem>
          <BottomModal
            title="Change PIN Code"
            visible={visible}
            onSuccess={savePin}
            disabled={!canSave}
            onClose={toggleVisible}
          >
            <View style={{ padding: 16 }}>
              <ThemedInput
                keyboardType="number-pad"
                autoFocus
                textAlign="center"
                placeholder="Enter new pin code"
                value={pin}
                onChangeText={setPin}
              ></ThemedInput>
            </View>
            {!userEmail && (
              <View style={{ paddingBottom: 16, paddingHorizontal: 16 }}>
                <ThemedText
                  style={{ textAlign: "center", fontSize: 14, marginBottom: 8 }}
                >
                  Set your email to recover your PIN if forgotten.
                </ThemedText>
                <ThemedInput
                  keyboardType="email-address"
                  autoFocus
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                ></ThemedInput>
              </View>
            )}
          </BottomModal>
          <SettingsListItem
            onPress={() => {
              setSettings({
                fingerprintEnabled: !fingerprintEnabled,
              });
            }}
            title="Enable Biometric Unlock"
          >
            <ThemedSwitch
              value={fingerprintEnabled}
              onValueChange={(value) =>
                setSettings({ fingerprintEnabled: value })
              }
            />
          </SettingsListItem>
          <Stack.Screen options={{ title: "Lock Setup" }} />
        </>
      )}
    </ThemedView>
  );
}

export default LockSetupSettingsScreen;
