"use client";

import type { BadgeDefinition, UserBadge } from "@/lib/types";
import { Badge } from "./Badge";

interface BadgeListProps {
  definitions: BadgeDefinition[];
  userBadges: UserBadge[];
  showAll?: boolean; // 未獲得バッジも表示するか
  showDescription?: boolean;
  size?: "sm" | "md" | "lg";
}

export function BadgeList({
  definitions,
  userBadges,
  showAll = false,
  showDescription = false,
  size = "md",
}: BadgeListProps) {
  // ユーザーが獲得しているバッジIDのセット
  const earnedBadgeIds = new Set(userBadges.map((b) => b.badge_id));

  // 表示するバッジを決定
  const badgesToShow = showAll
    ? definitions
    : definitions.filter((d) => earnedBadgeIds.has(d.id));

  if (badgesToShow.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        まだバッジを獲得していません
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badgesToShow.map((definition) => {
        const userBadge = userBadges.find((b) => b.badge_id === definition.id);
        return (
          <Badge
            key={definition.id}
            definition={definition}
            userBadge={userBadge}
            size={size}
            showDescription={showDescription}
          />
        );
      })}
    </div>
  );
}
