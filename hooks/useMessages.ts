import { apiGet, apiPost } from "@/utils/api";
import { Message } from "@/utils/api_types";
import { create } from "zustand";

interface MessageStore {
  //   messages: Message[];
  data: Record<number, Message[]>;
  fetchSince: (conversationId: number, sinceId?: number) => Promise<Message[]>;
  fetchBefore: (conversationId: number) => Promise<Message[]>;
  sendMessage: (message: Message) => void;
}

const uniqueOnly = (message: Message[]) => {
  const map = new Map<number, Message>();
  message.forEach((m) => {
    map.set(m.id, m);
  });
  return Array.from(map.values());
};

export const useMessages = create<MessageStore>((set, get) => ({
  data: {},
  fetchSince: async (conversationId, sinceId?: number) => {
    const sinceMessageId = sinceId
      ? sinceId
      : get().data[conversationId]?.[get().data[conversationId].length - 1]
          ?.id || 0;
    const response = await apiGet<{
      messages: Message[];
    }>(`/conversations/${conversationId}/messages?since_id=${sinceMessageId}`);
    const existingMessages = (get().data[conversationId] || []).filter(
      (m) => m.temp_id !== String(sinceMessageId)
    );
    const newMessages = response.messages;
    set({
      data: {
        ...get().data,
        [conversationId]: uniqueOnly([...existingMessages, ...newMessages]),
      },
    });
    return newMessages;
  },
  fetchBefore: async (conversationId) => {
    const beforeMessageId =
      get().data[conversationId]?.[0]?.id || Number.MAX_SAFE_INTEGER;
    const response = await apiGet<{
      messages: Message[];
    }>(
      `/conversations/${conversationId}/messages?before_id=${beforeMessageId}`
    );
    const existingMessages = get().data[conversationId] || [];
    const newMessages = response.messages;
    set({
      data: {
        ...get().data,
        [conversationId]: uniqueOnly([...newMessages, ...existingMessages]),
      },
    });
    return newMessages;
  },
  sendMessage: (message: Message) => {
    console.log("sending", message.data);
    const sinceMessageId =
      get().data[message.conversation_id]?.[
        get().data[message.conversation_id].length - 1
      ]?.id || 0;
    const existingMessages = get().data[message.conversation_id] || [];
    set({
      data: {
        ...get().data,
        [message.conversation_id]: [
          ...existingMessages,
          { ...message, temp_id: String(sinceMessageId) },
        ],
      },
    });
    apiPost(`/conversations/${message.conversation_id}/messages`, {
      data: message.data,
    }).then((data) => {
      get().fetchSince(message.conversation_id, sinceMessageId);
    });
  },
}));
