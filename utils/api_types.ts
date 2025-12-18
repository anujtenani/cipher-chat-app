export interface PublicUser {
  username: string;
  distance_km: number;
  bio: string;
  location: string;
  country: string;
  profile_photo: {
    url: string;
    thumbnail_url?: string;
  };
  last_seen_at: string;
  media: {
    // shown as  gallery of the user
    url: string;
    thumbnail_url?: string;
    type: "image" | "video";
  }[];
}

export interface Conversation {
  id: number;
  unread_count: number;
  participants: PublicUser[];
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
      type: "image" | "video";
      thumbnail_url?: string;
    }[];
  };
  created_at: string;
}
