import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { uploadFile, uploadImageFile } from "@/utils/upload_functions";
import { type ImagePickerAsset } from "expo-image-picker";
import { create } from "zustand";

export type FileAttachment = ImagePickerAsset & {
  conversationId: number;
  id: string;
  metadata: {
    thumbnail?: string;
    width: number;
    height: number;
    duration?: number;
    size?: number;
    blurhash?: string;
  };
};

export interface AttachmentSenderState {
  files: FileAttachment[];
  fileQueue: FileAttachment[];
  isProcessing: boolean;
  progressTracker: { [fileId: string]: number };
  addFile: (file: FileAttachment) => void;
  removeFile: (fileId: string) => void;
  processQueue: () => Promise<void>;
  cancelledUploads: string[];
}

export const useAttachmentSender = create<AttachmentSenderState>((set, get) => {
  return {
    cancelledUploads: [],
    files: [] as FileAttachment[],
    progressTracker: {},
    isProcessing: false,
    fileQueue: [] as FileAttachment[],
    addFile: (file: FileAttachment) => {
      set({
        files: [...get().files, file],
        fileQueue: [...get().fileQueue, file],
      });
      get().processQueue();
    },
    removeFile: (fileId: string) => {
      set({
        cancelledUploads: [...get().cancelledUploads, fileId],
        files: get().files.filter((f) => f.id !== fileId),
        fileQueue: get().fileQueue.filter((f) => f.id !== fileId),
      });
    },
    processQueue: async () => {
      const { fileQueue, isProcessing } = get();
      if (isProcessing) return;
      if (fileQueue.length > 0) {
        const toProcess = fileQueue.pop();

        set({ fileQueue: fileQueue, isProcessing: true });
        if (toProcess) {
          try {
            // Upload logic here
            const [thumbnailResult, uploadResult] = await Promise.all([
              toProcess.type?.includes("video") && toProcess.metadata.thumbnail
                ? await uploadImageFile({
                    uri: toProcess.metadata.thumbnail,
                    type: "image",
                    width: toProcess.metadata.width,
                    height: toProcess.metadata.height,
                  })
                : null,
              await uploadFile(toProcess, (uploaded, total) => {
                const progress = (uploaded / total) * 100;
                set({
                  progressTracker: {
                    ...get().progressTracker,
                    [toProcess.id]: progress,
                  },
                });
              }),
            ]);
            const fromUploadResult =
              "videoId" in uploadResult ? null : uploadResult.url;
            if (get().cancelledUploads.includes(toProcess.id)) {
              console.log("Upload cancelled for", toProcess.id);
              return;
            }
            useMessages.getState().sendMessage({
              conversation_id: toProcess.conversationId,
              sender: useAuth.getState().user!,
              id: 0,
              created_at: new Date().toISOString(),
              data: {
                attachments: [
                  {
                    ...uploadResult,
                    ...toProcess.metadata,
                    id: toProcess.id,
                    thumbnail:
                      thumbnailResult?.url ?? `${fromUploadResult}?width=300`,
                  },
                ],
              },
            });
          } catch (error) {
            console.error("Error uploading file:", error);
          }
          // After successful upload, remove the file from the queue
          // in case of error, add the file back to the queue
          get().removeFile(toProcess.id);
        }
        set({ isProcessing: false });
        get().processQueue();
      } else {
        set({ isProcessing: false });
      }
    },
  };
});
