"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { ProfileEntry } from "@/lib/types";
import { ProfileChatInterface } from "@/components/profile/ProfileChatInterface";
import { ProfileEntryList } from "@/components/profile/ProfileEntryList";

export default function ProfileSettingsPage() {
  const [entries, setEntries] = useState<ProfileEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      const data = await apiClient<ProfileEntry[]>("/api/profile/entries");
      setEntries(data);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await apiClient(`/api/profile/entries/${entryId}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/profile"
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; プロファイルに戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            プロファイル設定
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側: 対話エリア */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            AIと対話する
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            あなたの目標、興味、読みたい本などを自由に話してください。
            AIが聞き出してプロファイルに追加します。
          </p>
          <ProfileChatInterface onEntryAdded={fetchEntries} />
        </div>

        {/* 右側: 現在のエントリ一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            登録済みの情報 ({entries.length})
          </h2>
          {entries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              まだ情報がありません。AIと対話して追加しましょう。
            </p>
          ) : (
            <ProfileEntryList entries={entries} onDelete={handleDeleteEntry} />
          )}
        </div>
      </div>
    </div>
  );
}
