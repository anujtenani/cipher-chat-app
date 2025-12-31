import { create } from "zustand";

import { useCallback, useRef } from "react";

interface TypingState {
  typingUsers: Set<number>;
  addTypingUser: (userId: number) => void;
  removeTypingUser: (userId: number) => void;
}

export const useTyping = create<TypingState>((set) => ({
  typingUsers: new Set<number>(),
  addTypingUser: (userId: number) =>
    set((state) => {
      const newSet = new Set(state.typingUsers);
      newSet.add(userId);
      return { typingUsers: newSet };
    }),
  removeTypingUser: (userId: number) =>
    set((state) => {
      const newSet = new Set(state.typingUsers);
      newSet.delete(userId);
      return { typingUsers: newSet };
    }),
}));

type UseTypingEventsOptions = {
  delay?: number;
  onStart?: () => void;
  onStop?: () => void;
};

export function useTypingEvents({
  delay = 500,
  onStart,
  onStop,
}: UseTypingEventsOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef<boolean>(false);

  const handleTyping = useCallback(() => {
    // Fire typing start once
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onStart?.();
    }

    // Reset stop timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onStop?.();
    }, delay);
  }, [delay, onStart, onStop]);

  return handleTyping;
}
