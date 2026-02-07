"use client";

import type { Report, InsightVisibility } from "@/lib/types";
import ReportVisibilitySelector from "./ReportVisibilitySelector";

interface Props {
  report: Report;
  showVisibilityControl?: boolean;
  onVisibilityChange?: (
    visibility: InsightVisibility,
    includeContextAnalysis: boolean
  ) => Promise<void>;
}

export function ReportView({
  report,
  showVisibilityControl = false,
  onVisibilityChange,
}: Props) {
  return (
    <div className="space-y-6">
      {/* メタ情報 */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>セッション数: {report.metadata.session_count}</span>
        <span>Insight数: {report.metadata.insight_count}</span>
        <span>
          生成日: {new Date(report.created_at).toLocaleDateString("ja-JP")}
        </span>
      </div>

      {/* 要約 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">要約</h3>
        <p className="text-sm text-gray-700">{report.summary}</p>
      </div>

      {/* 洞察の統合 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          得られた洞察
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {report.insights_summary}
          </p>
        </div>
      </div>

      {/* 文脈分析 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          あなたへの関連付け
        </h3>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {report.context_analysis}
          </p>
        </div>
      </div>

      {/* 公開設定（あなたへの関連付けの下に配置） */}
      {showVisibilityControl && onVisibilityChange && (
        <div className="border-t border-gray-200 pt-4">
          <ReportVisibilitySelector
            currentVisibility={report.visibility ?? "private"}
            includeContextAnalysis={report.include_context_analysis ?? false}
            onVisibilityChange={onVisibilityChange}
          />
        </div>
      )}
    </div>
  );
}
