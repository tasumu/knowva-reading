"use client";

import Link from "next/link";
import { AllInsightsResponse, InsightWithBook } from "@/lib/types";

interface Props {
  data: AllInsightsResponse;
  groupBy: "book" | "type";
}

const typeLabels: Record<string, string> = {
  learning: "学び",
  impression: "印象",
  question: "疑問",
  connection: "自分との関連",
};

const typeColors: Record<string, string> = {
  learning: "bg-blue-100 text-blue-700",
  impression: "bg-pink-100 text-pink-700",
  question: "bg-yellow-100 text-yellow-700",
  connection: "bg-green-100 text-green-700",
};

function InsightCard({ insight }: { insight: InsightWithBook }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-start gap-2">
        <span
          className={`inline-block px-2 py-0.5 text-xs rounded-full shrink-0 ${typeColors[insight.type] || "bg-gray-100 text-gray-700"}`}
        >
          {typeLabels[insight.type] || insight.type}
        </span>
        <p className="text-sm text-gray-800 flex-1">{insight.content}</p>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {new Date(insight.created_at).toLocaleDateString("ja-JP")}
      </p>
    </div>
  );
}

export function InsightList({ data, groupBy }: Props) {
  if (data.total_count === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        まだ気づきがありません。読書記録からAIとの対話を始めましょう。
      </p>
    );
  }

  if (groupBy === "book") {
    // 本ごとにグルーピング
    const byBook = data.insights.reduce(
      (acc, insight) => {
        const key = insight.reading_id;
        if (!acc[key]) {
          acc[key] = {
            book: insight.book,
            reading_id: insight.reading_id,
            insights: [],
          };
        }
        acc[key].insights.push(insight);
        return acc;
      },
      {} as Record<
        string,
        { book: InsightWithBook["book"]; reading_id: string; insights: InsightWithBook[] }
      >
    );

    return (
      <div className="space-y-6">
        {Object.values(byBook).map((group) => (
          <div key={group.reading_id}>
            <Link
              href={`/readings/${group.reading_id}`}
              className="font-medium text-gray-900 hover:text-blue-600"
            >
              {group.book.title}
            </Link>
            {group.book.author && (
              <p className="text-sm text-gray-500 mb-2">{group.book.author}</p>
            )}
            <div className="space-y-2 pl-4 border-l-2 border-gray-200">
              {group.insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // タイプごとにグルーピング
  const byType = data.insights.reduce(
    (acc, insight) => {
      const key = insight.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(insight);
      return acc;
    },
    {} as Record<string, InsightWithBook[]>
  );

  const typeOrder = ["learning", "impression", "question", "connection"];

  return (
    <div className="space-y-6">
      {typeOrder.map((type) => {
        const insights = byType[type];
        if (!insights || insights.length === 0) return null;

        return (
          <div key={type}>
            <h3 className="font-medium text-gray-900 mb-2">
              <span
                className={`inline-block px-2 py-0.5 text-xs rounded-full mr-2 ${typeColors[type]}`}
              >
                {typeLabels[type]}
              </span>
              ({insights.length})
            </h3>
            <div className="space-y-2">
              {insights.map((insight) => (
                <div key={insight.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <InsightCard insight={insight} />
                  </div>
                  <Link
                    href={`/readings/${insight.reading_id}`}
                    className="text-xs text-gray-400 hover:text-blue-600 whitespace-nowrap shrink-0"
                  >
                    {insight.book.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
