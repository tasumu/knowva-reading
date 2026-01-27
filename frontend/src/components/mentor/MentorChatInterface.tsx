"use client";

import { useRef, useEffect, useState } from "react";
import { useMentorChat } from "@/hooks/useMentorChat";
import { ChatInput } from "@/components/chat/ChatInput";
import type { MentorFeedback, MentorFeedbackType, MentorMessage } from "@/lib/types";

interface Props {
  latestFeedback?: MentorFeedback | null;
  onFeedbackGenerated?: () => void;
}

function MentorMessageBubble({ message }: { message: MentorMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-gray-100 text-gray-800 rounded-bl-md"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
        <p
          className={`text-xs mt-1 ${isUser ? "text-blue-200" : "text-gray-400"}`}
        >
          {new Date(message.created_at).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

export function MentorChatInterface({ latestFeedback, onFeedbackGenerated }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const { messages, sendMessage, resetSession, isLoading } = useMentorChat({
    onError: (errorMessage) => {
      setError(errorMessage);
    },
    onMessageComplete: () => {
      // フィードバックが生成された可能性があるので親に通知
      onFeedbackGenerated?.();
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    setError(null);
    await sendMessage(text);
  };

  const handleQuickReflection = async (feedbackType: MentorFeedbackType) => {
    setError(null);
    const message =
      feedbackType === "weekly"
        ? "今週の振り返りをお願いします"
        : "今月の振り返りをお願いします";
    await sendMessage(message, feedbackType);
  };

  const handleReset = async () => {
    await resetSession();
    setError(null);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
      {/* 最新フィードバックサマリー */}
      {latestFeedback && (
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <p className="text-sm font-medium text-blue-700">
            最新の{latestFeedback.feedback_type === "weekly" ? "週次" : "月次"}
            フィードバック
          </p>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {latestFeedback.content}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(latestFeedback.created_at).toLocaleDateString("ja-JP")}
          </p>
        </div>
      )}

      {/* ワンタップ振り返り生成ボタン */}
      <div className="p-3 border-b bg-gray-50 flex gap-2">
        <button
          onClick={() => handleQuickReflection("weekly")}
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📅 週次振り返りを生成
        </button>
        <button
          onClick={() => handleQuickReflection("monthly")}
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📆 月次振り返りを生成
        </button>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-lg">🧭 メンターとの対話を始めましょう</p>
            <p className="text-sm mt-2">
              読書生活全体について相談したり、振り返りを生成できます
            </p>
            <p className="text-xs mt-4 text-gray-300">
              上のボタンをタップして、今週/今月の振り返りを生成してみましょう
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MentorMessageBubble key={msg.id} message={msg} />
        ))}

        {/* ローディング表示 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="text-center text-red-500 text-sm py-2">{error}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* リセットボタン */}
      <div className="px-4 py-2 border-t border-gray-100 flex justify-end">
        <button
          onClick={handleReset}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          会話をリセット
        </button>
      </div>

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
