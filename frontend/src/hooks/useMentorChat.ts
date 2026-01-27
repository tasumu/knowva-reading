"use client";

import { useState, useCallback } from "react";
import { chatWithMentor, resetMentorSession } from "@/lib/api";
import type { MentorMessage, MentorFeedbackType } from "@/lib/types";

interface UseMentorChatOptions {
  onMessageComplete?: (message: MentorMessage) => void;
  onError?: (error: string) => void;
}

export function useMentorChat({
  onMessageComplete,
  onError,
}: UseMentorChatOptions = {}) {
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (text: string, feedbackType: MentorFeedbackType = "weekly") => {
      setIsLoading(true);

      // ユーザーメッセージを楽観的更新で追加
      const userMsg: MentorMessage = {
        id: `temp-user-${Date.now()}`,
        role: "user",
        message: text,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const response = await chatWithMentor(text, feedbackType);
        setMessages((prev) => [...prev, response]);
        onMessageComplete?.(response);
      } catch (e) {
        // ユーザーメッセージを削除（楽観的更新の取り消し）
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        const errorMessage =
          e instanceof Error ? e.message : "エラーが発生しました";
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [onMessageComplete, onError]
  );

  const resetSession = useCallback(async () => {
    try {
      await resetMentorSession();
      setMessages([]);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "セッションのリセットに失敗しました";
      onError?.(errorMessage);
    }
  }, [onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    setMessages,
    sendMessage,
    resetSession,
    clearMessages,
    isLoading,
  };
}
