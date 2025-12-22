import { useThemeColor } from "@/hooks/use-theme-color";
import { useLocalAuthentication } from "@/hooks/useLocalAuthentication";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const PinLockScreen = ({
  correctPin,
  fingerprintEnabled,
  handleSuccessfulUnlock,
}: {
  correctPin: string;
  fingerprintEnabled: boolean;
  handleSuccessfulUnlock: () => void;
}) => {
  const { isCompatible, authenticate } = useLocalAuthentication();
  const handleBiometricAuth = useCallback(async () => {
    const success = await authenticate();
    if (success) {
      handleSuccessfulUnlock();
      //   setLoginState("logged_in");
    }
  }, [authenticate, handleSuccessfulUnlock]);
  useEffect(() => {
    if (isCompatible && fingerprintEnabled) {
      handleBiometricAuth();
    }
  }, [isCompatible, handleBiometricAuth, fingerprintEnabled]);

  const primaryColor = useThemeColor({}, "primary");

  const colorScheme = useColorScheme();
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  return (
    <View key={colorScheme}>
      {isCompatible && (
        <TouchableOpacity
          onPress={handleBiometricAuth}
          style={{
            marginBottom: 20,
            padding: 10,
          }}
        >
          <MaterialCommunityIcons
            name="fingerprint"
            size={32}
            color={primaryColor}
          />
        </TouchableOpacity>
      )}

      <TextInput
        keyboardType="number-pad"
        placeholder="Enter pin code"
        onChangeText={(value) => {
          if (correctPin === value) {
            handleSuccessfulUnlock();
          }
        }}
        maxLength={6}
        autoFocus
        secureTextEntry
        style={{
          color: textColor,
          padding: 16,
          fontSize: 26,
          textAlign: "center",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: borderColor,
          borderRadius: 2,
        }}
      ></TextInput>
    </View>
  );
};

export default PinLockScreen;
