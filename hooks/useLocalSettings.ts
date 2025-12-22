import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface LocalSettings {
  theme: "light" | "dark" | "system";
  pinCode: string | null;
  pinCodeEnabled: boolean;
  recoveryEmail: string | null;
  fingerprintEnabled: boolean;
  welcomeSlidesCompleted?: boolean;
}

// AsyncStorage.removeItem("settings:welcomeSlidesCompleted").catch(() => {});

async function getLocalSettings(): Promise<LocalSettings> {
  return AsyncStorage.multiGet([
    "settings:theme",
    "settings:pinCode",
    "settings:pinCodeEnabled",
    "settings:fingerprintEnabled",
    "settings:recoveryEmail",
    "settings:welcomeSlidesCompleted",
  ]).then((result) => {
    const settings: LocalSettings = {
      theme: "system",
      pinCode: null,
      recoveryEmail: null,
      pinCodeEnabled: false,
      fingerprintEnabled: false,
      welcomeSlidesCompleted: false,
    };
    result.forEach(([key, value]) => {
      if (value === null) return;
      switch (key) {
        case "settings:theme":
          settings.theme = value as "light" | "dark" | "system";
          break;
        case "settings:pinCode":
          settings.pinCode = value;
          break;
        case "settings:pinCodeEnabled":
          settings.pinCodeEnabled = value === "true";
          break;
        case "settings:fingerprintEnabled":
          settings.fingerprintEnabled = value === "true";
          break;
        case "settings:recoveryEmail":
          settings.recoveryEmail = value;
          break;
        case "settings:welcomeSlidesCompleted":
          settings.welcomeSlidesCompleted = value === "true";
          break;
      }
    });
    return settings;
  });
}

interface LocalSettingsState {
  settings: LocalSettings;
  setSettings: (settings: Partial<LocalSettings>) => Promise<void>;
  init: () => Promise<void>;
}

export const useLocalSettings = create<LocalSettingsState>((set, get) => ({
  settings: {
    theme: "system",
    recoveryEmail: null,
    pinCode: null,
    pinCodeEnabled: false,
    fingerprintEnabled: false,
  },
  init: async () => {
    const settings = await getLocalSettings();
    set({ settings });
  },
  setSettings: async (newSettings: Partial<LocalSettings>) => {
    const updatedSettings = { ...get().settings, ...newSettings };
    set({ settings: updatedSettings });

    const entries = Object.entries(newSettings).map(([key, value]) => {
      let stringValue: string | null;
      if (typeof value === "boolean") {
        stringValue = value ? "true" : "false";
      } else {
        stringValue = value;
      }
      return [`settings:${key}`, String(stringValue)];
    });
    console.log({ entries });

    await AsyncStorage.multiSet(entries as [string, string][]);
  },
}));
