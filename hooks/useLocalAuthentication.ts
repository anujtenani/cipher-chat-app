import * as LocalAuthentication from "expo-local-authentication";
import { useEffect, useState } from "react";

export const useLocalAuthentication = () => {
  const [isCompatible, setIsCompatible] = useState(false);

  useEffect(() => {
    checkCompatibility();
  }, []);

  const checkCompatibility = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsCompatible(compatible && enrolled);
  };

  const authenticate = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to unlock",
        fallbackLabel: "Use PIN instead",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (error) {
      console.error("Authentication error:", error);
      return false;
    }
  };

  return { isCompatible, authenticate };
};
