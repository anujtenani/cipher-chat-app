import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import ThemedButton from "./ui/ThemedButton";
import { ThemedText } from "./ui/ThemedText";

interface UpdateModalProps {
  visible: boolean;
  versionName: string;
  isMandatory: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  versionName,
  isMandatory,
  onUpdate,
  onDismiss,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isMandatory ? undefined : onDismiss}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.tint + "20" },
            ]}
          >
            <ThemedText style={styles.icon}>🚀</ThemedText>
          </View>

          {/* Title */}
          <ThemedText type="title" style={styles.title}>
            {isMandatory ? "Update Required" : "Update Available"}
          </ThemedText>

          {/* Description */}
          <ThemedText style={styles.description}>
            {isMandatory
              ? `A mandatory update to version ${versionName} is required to continue using the app.`
              : `Version ${versionName} is now available. Update to get the latest features and improvements.`}
          </ThemedText>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <ThemedButton
              onPress={onUpdate}
              title="Update Now"
              style={[styles.button, styles.updateButton]}
            />

            {!isMandatory && (
              <Pressable onPress={onDismiss} style={styles.dismissButton}>
                <ThemedText style={styles.dismissText}>Maybe Later</ThemedText>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  button: {
    width: "100%",
  },
  updateButton: {
    paddingVertical: 14,
  },
  dismissButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  dismissText: {
    fontSize: 15,
    opacity: 0.6,
  },
});
