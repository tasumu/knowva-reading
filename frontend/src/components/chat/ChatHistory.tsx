"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Message } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";

interface Props {
  readingId: string;
  sessionId: string;
}

/**
 * 過去の対話ログを表示するコンポーネント（読み取り専用）
 */
export function ChatHistory({ readingId, sessionId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const data = await apiClient<Message[]>(
          `/api/readings/${readingId}/sessions/${sessionId}/messages`
        );
        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "メッセージの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, [readingId, sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>このセッションにはメッセージがありません</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
      </div>
      
      {/* 読み取り専用の表示 */}
      <div className="p-4 bg-gray-100 border-t border-gray-200">
        <p className="text-center text-gray-500 text-sm">
          このセッションは終了しています。新しいセッションを開始してください。
        </p>
      </div>
    </div>
  );
}
