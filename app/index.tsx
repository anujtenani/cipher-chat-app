import { ThemedText } from "@/components/ui/ThemedText";
import { useAuth } from "@/hooks/useAuth";
import { useLocalSettings } from "@/hooks/useLocalSettings";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  View,
} from "react-native";

useAuth.getState().init();

export default function AppRoot() {
  return <Initializer></Initializer>;
}

function Initializer() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const welcomeSlidesCompleted = useLocalSettings(
    (state) => state.settings.welcomeSlidesCompleted
  );
  if (isAuthenticated === "unknown") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator></ActivityIndicator>
      </View>
    );
  }
  if (welcomeSlidesCompleted === false) {
    return <WelcomeSlides />;
  } else {
    return <Navigator isAuthenticated={isAuthenticated} />;
  }
}

function Navigator({ isAuthenticated }: { isAuthenticated: "yes" | "no" }) {
  requestIdleCallback(() => {
    if (isAuthenticated === "yes") {
      router.replace("/home");
    } else {
      router.replace("/login");
    }
  });
  return null;
}

const { width } = Dimensions.get("window");

interface Slide {
  id: number;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  backgroundColor: string;
}

const slides: Slide[] = [
  {
    id: 1,
    icon: "shield-checkmark",
    title: "End-to-End Encrypted",
    subtitle:
      "Your messages are secured with military-grade encryption. Only you and your recipient can read them.",
    backgroundColor: "#2c3e50", // Flat UI Blue
  },
  {
    id: 2,
    icon: "location",
    title: "Connect Nearby",
    subtitle:
      "Discover and chat with people around you. Make new connections in your area instantly.",
    backgroundColor: "#16a085", // Flat UI Green
  },
  {
    id: 3,
    icon: "lock-closed",
    title: "Privacy First",
    subtitle:
      "Your privacy matters. Set up PIN locks, control your visibility, and chat with confidence.",
    backgroundColor: "#8e44ad", // Flat UI Purple
  },
];

function WelcomeSlides() {
  const setSettings = useLocalSettings((state) => state.setSettings);
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleDone = async () => {
    await setSettings({ welcomeSlidesCompleted: true });
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View
            key={slide.id}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: slide.backgroundColor,
              width: width,
            }}
          >
            <View
              style={{
                alignItems: "center",
                paddingHorizontal: 40,
                maxWidth: 500,
              }}
            >
              <Ionicons name={slide.icon} size={120} color="#fff" />
              <ThemedText
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#fff",
                  marginTop: 40,
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                {slide.title}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 18,
                  color: "#fff",
                  textAlign: "center",
                  lineHeight: 26,
                  opacity: 0.95,
                }}
              >
                {slide.subtitle}
              </ThemedText>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <PaginationDots currentIndex={currentIndex}></PaginationDots>

      {/* Navigation Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingBottom: 40,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Pressable
          onPress={handlePrev}
          style={{
            padding: 16,
            opacity: currentIndex === 0 ? 0.5 : 1,
          }}
          disabled={currentIndex === 0}
        >
          <ThemedText
            style={{
              fontSize: 14,
              fontWeight: "bold",
              color: "white",
            }}
          >
            PREVIOUS
          </ThemedText>
        </Pressable>

        {currentIndex === slides.length - 1 ? (
          <Pressable
            onPress={handleDone}
            style={{
              padding: 16,
            }}
          >
            <ThemedText
              style={{
                fontSize: 16,
                color: "white",
                fontWeight: "bold",
              }}
            >
              DONE
            </ThemedText>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleNext}
            style={{
              padding: 16,
            }}
          >
            <ThemedText
              style={{
                fontSize: 14,
                color: "white",

                fontWeight: "bold",
              }}
            >
              NEXT
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function PaginationDots({ currentIndex }: { currentIndex: number }) {
  console.log({ currentIndex });
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
        position: "absolute",
        bottom: 100,
        left: 0,
        right: 0,
      }}
    >
      {slides.map((_, index) => (
        <View
          key={index}
          style={{
            height: 8,
            borderRadius: 4,
            backgroundColor:
              currentIndex === index ? "#fff" : "rgba(255, 255, 255, 0.4)",
            width: currentIndex === index ? 24 : 8,
            marginHorizontal: 6,
          }}
        />
      ))}
    </View>
  );
}
