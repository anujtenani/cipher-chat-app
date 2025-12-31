import { UploadedAsset } from "./upload_functions";

export type MediaAsset = UploadedAsset & {
  thumbnail?: string;
  width: number;
  height: number;
  blurhash?: string;
  duration?: number;
};

export interface PublicUser {
  // basic information
  username: string;
  bio: string;
  display_name: string;
  profile_photo?: MediaAsset & { type: "image" };

  // demography
  date_of_birth: string;
  gender: string;
  country: string;

  status_message: string; // like online status message
  verified: boolean;

  // location
  distance_km: number;
  location: string;

  // activity
  last_seen_at: string; // get online status from this (if last_seen_at within 5 minutes, show online)

  media: MediaAsset[];
}

export interface AuthenticatedUser extends PublicUser {
  email: string;
  visibility: number; // 1 = public, 0 = private
  id: number;
}

export interface Conversation {
  id: number;
  unread_count: number;
  participants: (PublicUser & {
    id: number;
    left_at?: number;
    joined_at?: number;
    last_read_message_id?: number;
  })[];
  last_message_at: string;
  last_message: Message;
  left_at: string | null;
  muted_at: string | null;
  archived_at: string | null;
  joined_at: string | null;
}

export interface Message {
  id: number;
  temp_id?: string;
  conversation_id: number;
  sender: PublicUser;
  data: {
    text?: string;
    attachments?: {
      url?: string;
      id: string;
      blurhash?: string;
      thumbnail?: string;
      type: "image" | "video";
      duration?: number;
    }[];
  };
  created_at: string;
}
