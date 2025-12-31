import { MediaAsset } from "@/utils/api_types";
import { MaterialIcons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface RenderGalleryItemProps {
  item: MediaAsset;
  width?: number;
  height?: number;
  setImageDimensions: (dimensions: { width: number; height: number }) => void;
  borderRadius?: number;
}

const formatDuration = (seconds: number | null | undefined): string => {
  if (!seconds) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};
const AnimatedImage = Animated.createAnimatedComponent(Image);

const RenderGalleryItem: React.FC<RenderGalleryItemProps> = ({
  item,
  setImageDimensions,
}) => {
  const imageSource = {
    uri: item.type === "video" ? item.thumbnail : item.url || item.thumbnail,
  };
  console.log({ imageSource });

  const [shouldPlay, setShouldPlay] = useState(false);
  if (shouldPlay && item.type === "video") {
    return <RenderVideoItem item={item} />;
  }
  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AnimatedImage
        onLoad={() => {
          setImageDimensions({
            width: item.width,
            height: item.height,
          });
        }}
        // sharedTransitionTag={`item-${item.id}`}
        source={imageSource}
        placeholder={{ blurhash: item.blurhash }}
        style={{
          width: "100%",
          aspectRatio: item.width / item.height,
        }}
        contentFit={"cover"}
        contentPosition={"center"}
      />

      {item.type === "video" && (
        <>
          {/* Video Play Icon Overlay */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setShouldPlay(true);
              }}
              style={{
                backgroundColor: "rgba(0,0,0,0.4)",
                borderRadius: 50,
                padding: 8,
              }}
            >
              <MaterialIcons name="play-arrow" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {/* Duration Overlay */}
          {item.duration && (
            <View
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                backgroundColor: "rgba(0,0,0,0.6)",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text style={{ color: "white", fontSize: 12 }}>
                {formatDuration(item.duration)}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

function RenderVideoItem({ item }: { item: MediaAsset & { type: "video" } }) {
  const player = useVideoPlayer(
    item.hlsURL || "",
    // "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4",
    (player) => {
      player.loop = true;
      player.play();
    }
  );
  const { status } = useEvent(player, "statusChange", {
    status: player.status,
  });
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {status === "loading" ? (
        <View
          style={{
            position: "absolute",
            inset: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator></ActivityIndicator>
        </View>
      ) : null}
      {status === "error" ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Video Error</Text>
        </View>
      ) : null}
      <VideoView
        player={player}
        allowsFullscreen
        startsPictureInPictureAutomatically
        allowsPictureInPicture
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </View>
  );
}

export default RenderGalleryItem;
