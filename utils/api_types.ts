export interface PublicUser {
  // basic information
  username: string;
  bio: string;
  profile_photo?: MediaItem;

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

  media: MediaItem[];
}

export interface MediaItem {
  url: string;
  blurhash?: string;
  thumbnail?: string;
  width: number;
  height: number;
  id: string;
  duration: number;
  type: "image" | "video";
  hlsURL?: string;
}

export interface AuthenticatedUser extends PublicUser {
  email: string;
  id: number;
}

export interface Conversation {
  id: number;
  unread_count: number;
  participants: (PublicUser & { id: number })[];
  last_message_at: string;
  last_message: Message;
}

export interface Message {
  id: number;
  sender: PublicUser;
  data: {
    text: string;
    attachments?: {
      url: string;
      blurhash?: string;
      thumbnail?: string;
      type: "image" | "video";
    }[];
  };
  created_at: string;
}
