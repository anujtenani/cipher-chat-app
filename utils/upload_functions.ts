import axios from "axios";
import { type ImagePickerAsset } from "expo-image-picker";
import * as tus from "tus-js-client";
import { apiPost } from "./api";
import { randomString } from "./func";

export interface UploadedImageAsset {
  url: string;
  mimetype?: string;
  name: string;
  type: "image";
  id: string;
}
export interface UploadedVideoAsset {
  thumbnail: string;
  id: string;
  libraryId: string;
  videoId: string;
  mimetype?: string;
  hlsURL: string;
  playURL: string;
  // url: string;
  animationURL: string;
  name: string;
  type: "video";
}

export type UploadedAsset = UploadedImageAsset | UploadedVideoAsset;

function getExtension(mimeType?: string | null) {
  if (mimeType?.includes("video")) {
    return ".mp4";
  } else {
    return ".jpg";
  }
}
export async function uploadFile(
  file: ImagePickerAsset,
  progressCallback?: (bytesUploaded: number, bytesTotal: number) => void
): Promise<UploadedAsset> {
  if (file.type?.includes("video")) {
    return tusUpload(file, progressCallback);
  } else {
    return uploadImageFile(file, progressCallback);
  }
}
function getPreSignedUrl(fileType: string) {
  return apiPost("/media/preSignedUrl", {
    fileType,
  }).then((data) => data as { url: string; fields: Record<string, string> });
}

export async function uploadImageFile(
  file: ImagePickerAsset,
  progressCallback?: (bytesUploaded: number, bytesTotal: number) => void,
  abortController?: AbortController
): Promise<UploadedImageAsset> {
  const filename =
    file.fileName || randomString() + getExtension(file.mimeType);
  // get pre signed post
  const { url, fields } = await getPreSignedUrl(file.mimeType || "image/jpg");
  const formData = new FormData();
  Object.keys(fields).forEach((key) => {
    formData.append(key, fields[key]);
  });
  const mimeType =
    file.mimeType || file.type == "image" ? "image/jpg" : "video/mp4";
  formData.append("Content-Type", mimeType);
  //@ts-ignore
  // don't pass the entire file object as mimetype and filenames can be undefined, so the upload fails on android. This ensures that
  // uri, type and name are always defined
  formData.append("file", {
    uri: file.uri,
    type: mimeType,
    name: filename,
  });
  await axios
    .post(url, formData, {
      //https://github.com/axios/axios/issues/5366
      //https://github.com/axios/axios/issues/5366#issuecomment-1420052291
      headers: {
        "content-type": "multipart/form-data",
      },
      signal: abortController?.signal,
      onUploadProgress: progressCallback
        ? (event) => {
            if (event.total) {
              progressCallback(event.loaded, event.total);
            }
          }
        : undefined,
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
  const uri = `https://media.goaffpro.com/${fields.key}`;
  return {
    // key: fields.key,
    url: uri,
    id: randomString(),
    mimetype: file.mimeType,
    name: filename,
    type: "image",
  };
}

export async function tusUpload(
  file: ImagePickerAsset,
  onProgress?: (bytesUploaded: number, bytesTotal: number) => void
): Promise<UploadedVideoAsset> {
  const filename = file.fileName || randomString() + getExtension(file.type);
  const {
    tusHeaders,
    // videoURL,
    thumbnail,
    mimetype,
    videoId,
    animationURL,
    hlsURL,
    playURL,
    libraryId,
  } = await apiPost<{
    tusHeaders: Record<string, string>;
    // videoURL: string;
    thumbnail: string;
    mimetype: string;
    videoId: string;
    animationURL: string;
    hlsURL: string;
    playURL: string;
    libraryId: number;
  }>("/media/bunnyUploadStreamTus", {
    filename,
  }).then((data) => data);
  const blob = await fetch(file.uri).then((res) => res.blob());
  // Create a new tus upload
  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(blob, {
      endpoint: "https://video.bunnycdn.com/tusupload",
      retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000],
      headers: tusHeaders,
      metadata: {
        filetype: file.mimeType || "video/mp4",
        title: filename,
        collection: "cc39cc1b-cc8a-49ba-9efb-39f5220ec50d",
      },
      onError: function (error) {
        console.log("got error");
        console.log(error);
        reject(error);
      },
      onProgress,
      onSuccess: function () {
        resolve({
          // url: videoURL,
          thumbnail,
          id: randomString(),
          hlsURL,
          playURL,
          animationURL,
          type: "video",
          mimetype,
          videoId,
          libraryId: String(libraryId),
          name: filename,
        });
        console.log("success");
      },
    });

    // Check if there are any previous uploads to continue.
    upload.findPreviousUploads().then(function (previousUploads) {
      console.log("previousUploads", previousUploads);
      // Found previous uploads so we select the first one.
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      // Start the upload
      upload.start();
    });
  });
}
