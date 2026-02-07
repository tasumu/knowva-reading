"use client";

import { useState } from "react";
import type { InsightVisibility } from "@/lib/types";

interface ReportVisibilitySelectorProps {
  currentVisibility: InsightVisibility;
  includeContextAnalysis: boolean;
  onVisibilityChange: (
    visibility: InsightVisibility,
    includeContextAnalysis: boolean
  ) => Promise<void>;
  disabled?: boolean;
}

const VISIBILITY_OPTIONS: {
  value: InsightVisibility;
  label: string;
  shortLabel: string;
}[] = [
  {
    value: "private",
    label: "非公開",
    shortLabel: "非公開",
  },
  {
    value: "public",
    label: "公開",
    shortLabel: "公開",
  },
  {
    value: "anonymous",
    label: "匿名公開",
    shortLabel: "匿名公開",
  },
];

export default function ReportVisibilitySelector({
  currentVisibility,
  includeContextAnalysis,
  onVisibilityChange,
  disabled = false,
}: ReportVisibilitySelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingValue, setUpdatingValue] = useState<InsightVisibility | null>(
    null
  );
  const [localIncludeContext, setLocalIncludeContext] =
    useState(includeContextAnalysis);

  // isPublicを削除（未使用になったため）

  const handleVisibilityChange = async (visibility: InsightVisibility) => {
    if (visibility === currentVisibility || isUpdating || disabled) return;

    setIsUpdating(true);
    setUpdatingValue(visibility);
    try {
      await onVisibilityChange(visibility, localIncludeContext);
    } catch (error) {
      console.error("Failed to update visibility:", error);
    } finally {
      setIsUpdating(false);
      setUpdatingValue(null);
    }
  };

  const handleIncludeContextChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (isUpdating || disabled) return;
    const newValue = e.target.checked;
    setLocalIncludeContext(newValue);

    // 非公開の場合はAPIコールしない
    if (currentVisibility === "private") return;

    setIsUpdating(true);
    try {
      await onVisibilityChange(currentVisibility, newValue);
    } catch (error) {
      console.error("Failed to update visibility:", error);
      setLocalIncludeContext(!newValue); // ロールバック
    } finally {
      setIsUpdating(false);
    }
  };

  const getButtonStyle = (value: InsightVisibility) => {
    const isSelected = currentVisibility === value;
    const isLoading = updatingValue === value;

    if (isSelected) {
      switch (value) {
        case "private":
          return "bg-gray-600 text-white border-gray-600";
        case "public":
          return "bg-green-600 text-white border-green-600";
        case "anonymous":
          return "bg-blue-600 text-white border-blue-600";
      }
    }

    if (isLoading) {
      return "bg-gray-100 text-gray-400 border-gray-200";
    }

    return "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700";
  };

  return (
    <div className="space-y-3">
      {/* 公開設定ボタン */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">POP公開:</span>
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          {VISIBILITY_OPTIONS.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleVisibilityChange(option.value)}
              disabled={disabled || isUpdating}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${getButtonStyle(option.value)} ${
                index !== 0 ? "border-l" : ""
              } ${disabled || isUpdating ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              title={option.label}
            >
              {updatingValue === option.value ? (
                <span className="inline-flex items-center gap-1">
                  <svg
                    className="w-3 h-3 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </span>
              ) : (
                option.shortLabel
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 「あなたへの関連付け」を含めるかのチェックボックス */}
      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          checked={localIncludeContext}
          onChange={handleIncludeContextChange}
          disabled={disabled || isUpdating}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
        />
        <span>POP公開時に「あなたへの関連付け」を含める</span>
      </label>
    </div>
  );
}
