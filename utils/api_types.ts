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

type BaseMessage = TurnBasedGameState | TextMessge | AttachmentMessage;

export type Message = BaseMessage & {
  id: number;
  temp_id?: string;
  conversation_id: number;
  // type: 1 | 2 | 3; // 1 = text, 2 = attachment, 3 = turn based game
  sender: PublicUser;
  // data: MessageItem;
  created_at: string;
};

export interface TurnBasedGameState {
  type: 3;
  data: {
    title: string;
    theme: string;
    lewdness: number;
    players: {
      username: string;
      gender?: string;
      age: number;
      id: number;
      accepted_at: number;
    }[];
    currentTurn: number;
    history: {
      sender: number;
      content: string;
      sent_at: number; //timestamp
    }[];
    // storySoFar: string;
    options: { option: string; storySentence: string }[];
  };
}

export interface TextMessge {
  type: 1;
  data: {
    text: string;
  };
}
export interface AttachmentMessage {
  type: 2;
  data: {
    attachments: {
      url: string;
      type: "image" | "video" | "audio" | "file";
      filename?: string;
    }[];
  };
}

export type MessageItem = TurnBasedGameState | TextMessge | AttachmentMessage;
