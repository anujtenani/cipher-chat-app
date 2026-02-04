import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const REVIEW_PROMPT_KEY = "review:promptDismissedAt";
const REVIEW_COMPLETED_KEY = "review:completed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface ReviewPromptProps {
  delayMs?: number;
}

export default function ReviewPrompt({ delayMs = 5000 }: ReviewPromptProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const checkAndShowPrompt = useCallback(async () => {
    try {
      // Check if review was already completed
      const completed = await AsyncStorage.getItem(REVIEW_COMPLETED_KEY);
      if (completed === "true") return;

      // Check if prompt was recently dismissed
      const dismissedAt = await AsyncStorage.getItem(REVIEW_PROMPT_KEY);
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt, 10);
        if (Date.now() - dismissedTime < DISMISS_DURATION_MS) {
          return;
        }
      }

      // Show prompt after delay
      setTimeout(() => {
        setVisible(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, delayMs);
    } catch (error) {
      console.error("Error checking review prompt status:", error);
    }
  }, [delayMs, fadeAnim]);

  useEffect(() => {
    checkAndShowPrompt();
  }, [checkAndShowPrompt]);

  const handleDismiss = async () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
    await AsyncStorage.setItem(REVIEW_PROMPT_KEY, Date.now().toString());
  };

  const handleRate = async () => {
    try {
      // Mark as completed
      await AsyncStorage.setItem(REVIEW_COMPLETED_KEY, "true");

      // Check if in-app review is available
      const isAvailable = await StoreReview.isAvailableAsync();

      if (isAvailable) {
        await StoreReview.requestReview();
      } else {
        // Fallback to opening store page
        const storeUrl = Platform.select({
          ios: "https://apps.apple.com/app/id<YOUR_APP_ID>", // Replace with your App Store ID
          android:
            "https://play.google.com/store/apps/details?id=com.cipherapp.cipher", // Replace with your package name
        });
        if (storeUrl) {
          Linking.openURL(storeUrl);
        }
      }

      handleDismiss();
    } catch (error) {
      console.error("Error requesting review:", error);
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
        <Ionicons name="close" size={20} color={colors.icon} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name="star"
              size={28}
              color="#FFD700"
              style={styles.star}
            />
          ))}
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Enjoying Cipher?
        </Text>

        <Text style={[styles.description, { color: colors.icon }]}>
          Rate us 5 stars and include your username{" "}
          <Text style={{ fontWeight: "700", color: colors.primary }}>
            @{user?.username || "your_username"}
          </Text>{" "}
          in your review to find new friends and unlock exclusive features! 🎉
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.laterButton, { borderColor: colors.border }]}
            onPress={handleDismiss}
          >
            <Text style={[styles.laterButtonText, { color: colors.icon }]}>
              Maybe Later
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rateButton, { backgroundColor: colors.primary }]}
            onPress={handleRate}
          >
            <Ionicons
              name="star"
              size={18}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.rateButtonText}>Rate Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  content: {
    padding: 20,
    paddingTop: 16,
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  star: {
    marginHorizontal: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  laterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  laterButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  rateButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  rateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
