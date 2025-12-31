import { apiGet } from "@/utils/api";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { Linking, Platform } from "react-native";

interface UpdateInfo {
  versionCode: number;
  versionName: string;
  isMandatory: boolean;
  updateURL: string;
}

interface UpdateStatus {
  isAvailable: boolean;
  isMandatory: boolean;
  updateInfo: UpdateInfo | null;
  isLoading: boolean;
  error: string | null;
}

export const useUpdateChecker = () => {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    isAvailable: false,
    isMandatory: false,
    updateInfo: null,
    isLoading: false,
    error: null,
  });

  const currentVersionCode =
    Constants.expoConfig?.android?.versionCode ||
    Constants.expoConfig?.ios?.buildNumber ||
    1;

  const checkForUpdate = async () => {
    setUpdateStatus((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiGet<UpdateInfo>(`/version?os=${Platform.OS}`);

      if (response && response.versionCode > Number(currentVersionCode)) {
        setUpdateStatus({
          isAvailable: true,
          isMandatory: response.isMandatory,
          updateInfo: response,
          isLoading: false,
          error: null,
        });
      } else {
        setUpdateStatus({
          isAvailable: false,
          isMandatory: false,
          updateInfo: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
      setUpdateStatus((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check for updates",
      }));
    }
  };

  const openUpdateURL = () => {
    if (updateStatus.updateInfo?.updateURL) {
      Linking.openURL(updateStatus.updateInfo.updateURL);
    }
  };

  const dismissUpdate = () => {
    if (!updateStatus.isMandatory) {
      setUpdateStatus((prev) => ({
        ...prev,
        isAvailable: false,
      }));
    }
  };

  useEffect(() => {
    // Check for updates on mount
    checkForUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...updateStatus,
    checkForUpdate,
    openUpdateURL,
    dismissUpdate,
  };
};
