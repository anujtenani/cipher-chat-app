import RenderGalleryItem from "@/components/gallery/RenderGalleryItem";
import { MediaAsset } from "@/utils/api_types";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AwesomeGallery, { GalleryRef } from "react-native-awesome-gallery";
import useSWR from "swr";

const Gallery = () => {
  const { back } = useRouter();
  const { start_id, source, username, conversation_id } = useLocalSearchParams<{
    conversation_id?: string;
    username?: string;
    start_id: string;
    source: "user_gallery" | "conversation";
  }>();
  const { data: album, isLoading } = useSWR<{ media: MediaAsset[] }>(
    `/misc/gallery_media?source=${source}&username=${username}&conversation_id=${conversation_id}`
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const ref = useRef<GalleryRef>(null);
  useEffect(() => {
    if (!album?.media) return;

    const initialIndex = album.media.findIndex((item) => item.id == start_id);
    console.log("initial index", initialIndex);
    if (ref?.current) {
      ref.current?.setIndex(initialIndex);
    }
    // if (initialIndex !== -1) {
    // setCurrentIndex(initialIndex);
    // } else {
    // setCurrentIndex(0);
    // }
  }, [album, start_id, ref]);

  if (isLoading || currentIndex < -1) {
    return (
      <React.Fragment>
        <Stack.Screen
          options={{
            headerTransparent: true,
            animation: "fade",
            headerTitle: "",
            headerBackButtonDisplayMode: "minimal",
            headerTintColor: "#fff",
            headerShadowVisible: false,
          }}
        />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator></ActivityIndicator>
        </View>
      </React.Fragment>
    );
  }
  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          animation: "fade",
          headerTitle: "",
          headerBackButtonDisplayMode: "minimal",
          headerTintColor: "#fff",
          headerShadowVisible: false,
        }}
      />
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <AwesomeGallery
          ref={ref}
          loop
          data={album?.media || []}
          keyExtractor={(item) => String(item.id)}
          initialIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          onSwipeToClose={back}
          renderItem={({ item, setImageDimensions }) => (
            <RenderGalleryItem
              setImageDimensions={setImageDimensions}
              item={item}
            />
          )}
        />
      </View>
    </>
  );
};

export default Gallery;
