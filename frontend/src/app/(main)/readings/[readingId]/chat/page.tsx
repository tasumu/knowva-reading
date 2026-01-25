"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Reading, Session } from "@/lib/types";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ChatHistory } from "@/components/chat/ChatHistory";

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const readingId = params.readingId as string;
  const sessionId = searchParams.get("sessionId");

  const [reading, setReading] = useState<Reading | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.push(`/readings/${readingId}`);
      return;
    }
    async function fetchData() {
      try {
        const [readingData, sessionsData] = await Promise.all([
          apiClient<Reading>(`/api/readings/${readingId}`),
          apiClient<Session[]>(`/api/readings/${readingId}/sessions`),
        ]);
        setReading(readingData);
        
        // 現在のセッションを取得
        const currentSession = sessionsData.find((s) => s.id === sessionId);
        setSession(currentSession || null);
      } catch {
        router.push("/home");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [readingId, sessionId, router]);

  const handleEndSession = async () => {
    if (!confirm("このセッションを終了しますか？")) return;
    try {
      await apiClient(`/api/readings/${readingId}/sessions/${sessionId}/end`, {
        method: "POST",
      });
      router.push(`/readings/${readingId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
    }
  };

  // セッションが終了しているかどうか
  const isSessionEnded = session?.ended_at != null;

  // セッションタイプのラベル
  const sessionTypeLabel = session
    ? {
        before_reading: "📖 読書前",
        during_reading: "📚 読書中",
        after_reading: "✨ 読了後",
      }[session.session_type]
    : "";

  if (loading || !reading || !sessionId) {
    return <div className="text-center py-8 text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Link
            href={`/readings/${readingId}`}
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; 戻る
          </Link>
          <span className="text-sm font-medium text-gray-700">
            {reading.book.title}
          </span>
          {session && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {sessionTypeLabel}
              {isSessionEnded && " (終了)"}
            </span>
          )}
        </div>
        {!isSessionEnded && (
          <button
            onClick={handleEndSession}
            className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50"
          >
            セッション終了
          </button>
        )}
      </div>
      
      {/* 終了セッションは履歴表示、アクティブセッションはチャットUI */}
      {isSessionEnded ? (
        <ChatHistory readingId={readingId} sessionId={sessionId} />
      ) : (
        <ChatInterface readingId={readingId} sessionId={sessionId} />
      )}
    </div>
  );
}
