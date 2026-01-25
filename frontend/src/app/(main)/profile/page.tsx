"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { apiClient } from "@/lib/api";
import { ProfileEntry, AllInsightsResponse } from "@/lib/types";
import { InsightList } from "@/components/profile/InsightList";
import { ProfileEntryList } from "@/components/profile/ProfileEntryList";

export default function ProfilePage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ProfileEntry[]>([]);
  const [insightsData, setInsightsData] = useState<AllInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<"book" | "type">("book");
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [entriesOpen, setEntriesOpen] = useState(true);

  const fetchData = async () => {
    try {
      const [entriesRes, insightsRes] = await Promise.all([
        apiClient<ProfileEntry[]>("/api/profile/entries"),
        apiClient<AllInsightsResponse>(`/api/profile/insights?group_by=${groupBy}`),
      ]);
      setEntries(entriesRes);
      setInsightsData(insightsRes);
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBy]);

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
        <h1 className="text-2xl font-bold text-gray-900">プロファイル</h1>
        <Link
          href="/profile/settings"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          プロファイルを編集
        </Link>
      </div>

      {/* 基本情報 */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium">メール:</span> {user?.email || "-"}
          </p>
        </div>
      </section>

      {/* プロファイルエントリ */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => setEntriesOpen(!entriesOpen)}
          className="w-full flex items-center justify-between p-6 text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900">
            あなたについて ({entries.length})
          </h2>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${entriesOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {entriesOpen && (
          <div className="px-6 pb-6">
            {entries.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-4">
                  まだプロファイル情報がありません。
                  <br />
                  AIと対話してあなたのことを教えてください。
                </p>
                <Link
                  href="/profile/settings"
                  className="text-blue-600 hover:underline text-sm"
                >
                  プロファイルを設定する
                </Link>
              </div>
            ) : (
              <ProfileEntryList entries={entries} onDelete={handleDeleteEntry} />
            )}
          </div>
        )}
      </section>

      {/* 全読書からのInsight一覧 */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => setInsightsOpen(!insightsOpen)}
          className="w-full flex items-center justify-between p-6 text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900">
            読書からの気づき ({insightsData?.total_count || 0})
          </h2>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${insightsOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {insightsOpen && (
          <div className="px-6 pb-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setGroupBy("book")}
                className={`px-3 py-1 text-sm rounded-md ${
                  groupBy === "book"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                本ごと
              </button>
              <button
                onClick={() => setGroupBy("type")}
                className={`px-3 py-1 text-sm rounded-md ${
                  groupBy === "type"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                タイプごと
              </button>
            </div>
            {insightsData && <InsightList data={insightsData} groupBy={groupBy} />}
          </div>
        )}
      </section>
    </div>
  );
}
