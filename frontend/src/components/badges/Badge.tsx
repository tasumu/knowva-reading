"use client";

import type { BadgeDefinition, UserBadge } from "@/lib/types";

// Tailwind色名からクラスへのマッピング
const colorClasses: Record<string, string> = {
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  amber: "bg-amber-100 text-amber-700",
  pink: "bg-pink-100 text-pink-700",
  gray: "bg-gray-100 text-gray-700",
};

// 未獲得バッジ用のスタイル
const unearnedClass = "bg-gray-100 text-gray-400";

interface BadgeProps {
  definition: BadgeDefinition;
  userBadge?: UserBadge;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
}

export function Badge({
  definition,
  userBadge,
  size = "md",
  showDescription = false,
}: BadgeProps) {
  const earned = !!userBadge;
  const colorClass = earned
    ? colorClasses[definition.color] || colorClasses.gray
    : unearnedClass;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <div className="inline-flex flex-col items-start">
      <span
        className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${colorClass}`}
        title={definition.description}
      >
        {definition.name}
        {earned && <span className="opacity-60">✓</span>}
      </span>
      {showDescription && (
        <span className="text-xs text-gray-500 mt-1">
          {definition.description}
        </span>
      )}
    </div>
  );
}
