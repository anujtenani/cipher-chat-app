import { UploadedImageAsset, uploadImageFile } from "@/utils/upload_functions";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";

export default function useSingleFileUpload(
  onUploadCallback: (data: UploadedImageAsset & { thumbnail: string }) => void
) {
  const [uploadProgress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const trigger = useCallback(
    () => async () => {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert(`Failed to get permission. Please allow access to your photos.`);
        return;
      }

      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
        if (!result.canceled) {
          const selectedAsset = result.assets[0];
          setIsUploading(true);
          const uploadResult = await uploadImageFile(
            selectedAsset,
            (progress) => {
              setProgress(progress);
            }
          );
          setIsUploading(false);
          onUploadCallback({
            ...uploadResult,
            thumbnail: `${uploadResult.url}?height=300`,
            width: selectedAsset.width,
            height: selectedAsset.height,
          });
        }
      } catch (error) {
        console.error("Error picking image:", error);
      }
    },
    [onUploadCallback]
  );

  return {
    trigger,
    uploadProgress,
    isUploading,
    // uploadedUrl,
  };
}
