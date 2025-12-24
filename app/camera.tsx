import { Ionicons } from "@expo/vector-icons";
import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type CameraMode = "photo" | "video";

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [mode, setMode] = useState<CameraMode>("photo");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [zoom] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const recordingTimerRef = useRef<number | null>(null);

  // Animation values - must be called before any conditional returns
  const shutterScale = useSharedValue(1);

  const shutterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shutterScale.value }],
  }));
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      return () => {
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingTime(0);
    }
  }, [isRecording]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={80} color="#888" />
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((current) => {
      if (current === "off") return "on";
      if (current === "on") return "auto";
      return "off";
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    shutterScale.value = withSpring(0.9, {}, () => {
      shutterScale.value = withSpring(1);
    });

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
      });

      if (photo) {
        // TODO: Handle photo for chat - pass to callback or navigate with photo.uri
        console.log("Photo taken:", photo.uri);
        // For now, navigate back with the photo URI
        // You can modify this to pass the URI to a callback or use router params
        router.back();
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to take picture");
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;

    try {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
      });

      if (video) {
        // TODO: Handle video for chat - pass to callback or navigate with video.uri
        console.log("Video recorded:", video.uri);
        // For now, navigate back with the video URI
        // You can modify this to pass the URI to a callback or use router params
        router.back();
      }
    } catch (error) {
      console.error("Error recording video:", error);
      Alert.alert("Error", "Failed to record video");
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!cameraRef.current || !isRecording) return;
    cameraRef.current.stopRecording();
  };

  const getFlashIcon = () => {
    if (flash === "on") return "flash" as const;
    if (flash === "auto") return "flash-outline" as const;
    return "flash-off" as const;
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        zoom={zoom}
        mode={mode === "photo" ? "picture" : "video"}
      />

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>

        <View style={styles.topRightControls}>
          <TouchableOpacity style={styles.topButton} onPress={toggleFlash}>
            <Ionicons name={getFlashIcon()} size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recording Timer */}
      {isRecording && (
        <View style={styles.recordingTimer}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>{formatTime(recordingTime)}</Text>
        </View>
      )}

      {/* Zoom Slider */}
      {zoom > 0 && (
        <View style={styles.zoomIndicator}>
          <Text style={styles.zoomText}>{zoom.toFixed(1)}x</Text>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.controlsRow}>
          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Shutter Button */}
          <View style={styles.shutterContainer}>
            {mode === "photo" ? (
              <Animated.View style={shutterAnimatedStyle}>
                <TouchableOpacity
                  style={styles.shutterButton}
                  onPress={takePicture}
                  disabled={isRecording}
                >
                  <View style={styles.shutterInner} />
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.shutterButton,
                  isRecording && styles.recordingButton,
                ]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <View
                  style={[
                    styles.shutterInner,
                    isRecording && styles.recordingInner,
                  ]}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Flip Camera Button */}
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>
        </View>

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === "photo" && styles.activeModeButton,
            ]}
            onPress={() => !isRecording && setMode("photo")}
          >
            <Text
              style={[
                styles.modeText,
                mode === "photo" && styles.activeModeText,
              ]}
            >
              PHOTO
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === "video" && styles.activeModeButton,
            ]}
            onPress={() => !isRecording && setMode("video")}
          >
            <Text
              style={[
                styles.modeText,
                mode === "video" && styles.activeModeText,
              ]}
            >
              VIDEO
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    color: "white",
    fontSize: 18,
    marginTop: 20,
    marginBottom: 30,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  topControls: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 1,
  },
  topRightControls: {
    flexDirection: "row",
    gap: 15,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingTimer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
    marginRight: 8,
  },
  recordingText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  zoomIndicator: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  zoomText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    paddingHorizontal: 20,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  spacer: {
    width: 50,
  },
  shutterContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  recordingButton: {
    borderColor: "#FF3B30",
  },
  recordingInner: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  activeModeButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFD60A",
  },
  modeText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },
  activeModeText: {
    color: "#FFD60A",
  },
});
