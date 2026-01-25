"use client";

import { MoodComparison, MoodMetrics } from "@/lib/types";

interface Props {
  comparison: MoodComparison;
}

const METRICS_CONFIG: Record<keyof MoodMetrics, { label: string; color: string }> = {
  energy: { label: "活力", color: "#f59e0b" },
  positivity: { label: "気分", color: "#10b981" },
  clarity: { label: "明晰さ", color: "#3b82f6" },
  motivation: { label: "意欲", color: "#8b5cf6" },
  openness: { label: "開放性", color: "#ec4899" },
};

export function MoodChart({ comparison }: Props) {
  const { before_mood, after_mood, changes } = comparison;

  // データがない場合
  if (!before_mood && !after_mood) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>心境データがまだ記録されていません</p>
      </div>
    );
  }

  const metrics = Object.keys(METRICS_CONFIG) as Array<keyof MoodMetrics>;

  return (
    <div className="space-y-6">
      {/* レーダーチャート風の可視化 */}
      <div className="flex justify-center">
        <RadarChart
          beforeMetrics={before_mood?.metrics}
          afterMetrics={after_mood?.metrics}
        />
      </div>

      {/* 変化量の表示 */}
      {changes && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">
            読書による変化
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {metrics.map((key) => {
              const change = changes[key];
              const isPositive = change > 0;
              const isNegative = change < 0;
              return (
                <div
                  key={key}
                  className="flex flex-col items-center text-center"
                >
                  <span className="text-xs text-gray-500 mb-1">
                    {METRICS_CONFIG[key].label}
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      isPositive
                        ? "text-green-600"
                        : isNegative
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {change}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* バー形式の比較 */}
      <div className="space-y-3">
        {metrics.map((key) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-gray-600">
                {METRICS_CONFIG[key].label}
              </span>
              <span className="text-gray-400">
                {before_mood?.metrics[key] ?? "-"} → {after_mood?.metrics[key] ?? "-"}
              </span>
            </div>
            <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
              {/* Before */}
              {before_mood && (
                <div
                  className="absolute top-0 h-3 rounded-full opacity-60 transition-all"
                  style={{
                    width: `${(before_mood.metrics[key] / 5) * 100}%`,
                    backgroundColor: METRICS_CONFIG[key].color,
                  }}
                />
              )}
              {/* After */}
              {after_mood && (
                <div
                  className="absolute bottom-0 h-3 rounded-full transition-all"
                  style={{
                    width: `${(after_mood.metrics[key] / 5) * 100}%`,
                    backgroundColor: METRICS_CONFIG[key].color,
                  }}
                />
              )}
            </div>
          </div>
        ))}
        <div className="flex justify-center gap-6 text-xs text-gray-500 mt-2">
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 bg-gray-400 rounded opacity-60" />
            読書前
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 bg-gray-400 rounded" />
            読了後
          </span>
        </div>
      </div>

      {/* 感情の変化 */}
      {(before_mood?.dominant_emotion || after_mood?.dominant_emotion) && (
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <h4 className="text-sm font-semibold text-blue-700 mb-2">
            感情の変化
          </h4>
          <div className="flex items-center justify-center gap-4">
            {before_mood?.dominant_emotion && (
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200">
                {before_mood.dominant_emotion}
              </span>
            )}
            {before_mood?.dominant_emotion && after_mood?.dominant_emotion && (
              <span className="text-gray-400">→</span>
            )}
            {after_mood?.dominant_emotion && (
              <span className="px-3 py-1 bg-blue-600 rounded-full text-sm text-white">
                {after_mood.dominant_emotion}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// レーダーチャートコンポーネント（SVG）
function RadarChart({
  beforeMetrics,
  afterMetrics,
}: {
  beforeMetrics?: MoodMetrics;
  afterMetrics?: MoodMetrics;
}) {
  const size = 200;
  const center = size / 2;
  const maxRadius = 80;
  const metrics = Object.keys(METRICS_CONFIG) as Array<keyof MoodMetrics>;
  const angleStep = (2 * Math.PI) / metrics.length;

  // 値から座標を計算
  const getPoint = (value: number, index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const radius = (value / 5) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // ポリゴンのパスを生成
  const createPath = (metricsData: MoodMetrics) => {
    return metrics
      .map((key, i) => {
        const point = getPoint(metricsData[key], i);
        return `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`;
      })
      .join(" ") + " Z";
  };

  // グリッド線を生成
  const gridLines = [1, 2, 3, 4, 5].map((level) => {
    const points = metrics.map((_, i) => {
      const point = getPoint(level, i);
      return `${point.x},${point.y}`;
    });
    return points.join(" ");
  });

  // 軸線を生成
  const axisLines = metrics.map((_, i) => {
    const point = getPoint(5, i);
    return { x1: center, y1: center, x2: point.x, y2: point.y };
  });

  // ラベル位置
  const labels = metrics.map((key, i) => {
    const point = getPoint(6, i);
    return { key, ...point, label: METRICS_CONFIG[key].label };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* グリッド */}
      {gridLines.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}

      {/* 軸線 */}
      {axisLines.map((line, i) => (
        <line
          key={i}
          {...line}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}

      {/* Before データ */}
      {beforeMetrics && (
        <path
          d={createPath(beforeMetrics)}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="4 4"
        />
      )}

      {/* After データ */}
      {afterMetrics && (
        <path
          d={createPath(afterMetrics)}
          fill="rgba(16, 185, 129, 0.2)"
          stroke="#10b981"
          strokeWidth={2}
        />
      )}

      {/* データポイント */}
      {beforeMetrics &&
        metrics.map((key, i) => {
          const point = getPoint(beforeMetrics[key], i);
          return (
            <circle
              key={`before-${key}`}
              cx={point.x}
              cy={point.y}
              r={3}
              fill="#3b82f6"
            />
          );
        })}
      {afterMetrics &&
        metrics.map((key, i) => {
          const point = getPoint(afterMetrics[key], i);
          return (
            <circle
              key={`after-${key}`}
              cx={point.x}
              cy={point.y}
              r={4}
              fill="#10b981"
            />
          );
        })}

      {/* ラベル */}
      {labels.map(({ key, x, y, label }) => (
        <text
          key={key}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fill="#6b7280"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}
