import { encode } from "blurhash";
import { Image } from "expo-image";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { ImagePickerAsset } from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";

export async function getThumbnailAsync({
  uri,
  type,
  width,
  height,
}: {
  uri: string;
  type?: ImagePickerAsset["type"];
  width?: number;
  height?: number;
}) {
  if (type?.startsWith("video")) {
    const thumbnail = await getVideoThumbnail(uri);
    return {
      // ...thumbnail,
      uri: thumbnail.uri,
      width: thumbnail.width,
      height: thumbnail.height,
      blurhash: await getBlurHash(thumbnail.uri),
    };
  } else {
    return {
      blurhash: await getBlurHash(uri),
      uri: uri,
      width,
      height,
    };
  }
}
function getVideoThumbnail(uri: string) {
  return VideoThumbnails.getThumbnailAsync(uri, {
    time: 2000,
  });
}

export async function getBlurHash(uri: string, width = 32, height = 32) {
  const manipulator = ImageManipulator.manipulate(uri);
  manipulator.resize({
    width,
    height,
  });
  const image = await manipulator.renderAsync();
  const { uri: resizedUri, base64 } = await image.saveAsync({
    base64: true,
  }); // small image gives a faster blurhash
  // Decode the base64 string to a Uint8Array
  const binaryString = atob(base64 as string);
  const bytes = new Uint8ClampedArray(width * height * 4);
  let index = 0;
  for (let i = 0; i < binaryString.length; i++) {
    bytes[index++] = binaryString.charCodeAt(i);
  }
  return encode(bytes, width, height, 4, 4);
}

export async function getBlurhashIOS(uri: string) {
  const manipulator = ImageManipulator.manipulate(uri);

  manipulator.resize({
    width: 300,
    // height: 300,
  });

  // Remove the data URL prefix
  const image = await manipulator.renderAsync();

  const result = await image.saveAsync({
    format: SaveFormat.JPEG, // should we use PNG ??
  }); // small image gives a faster blurhash

  return Image.generateBlurhashAsync(result.uri, [4, 3]);
}
