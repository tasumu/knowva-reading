"use client";

const MOTIVATION_OPTIONS = [
  { value: "skill", label: "仕事に活かす知識・スキルを得たい" },
  { value: "perspective", label: "視野を広げ、新しい考え方に触れたい" },
  { value: "relax", label: "リラックス・気分転換" },
  { value: "culture", label: "教養を身につけたい" },
  { value: "self_reflection", label: "自分自身を見つめ直したい" },
  { value: "problem_solving", label: "特定の課題を解決したい" },
];

interface StepReadingMotivationProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepReadingMotivation({
  value,
  onChange,
}: StepReadingMotivationProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          読書の目的は？
        </h2>
        <p className="text-sm text-gray-600">
          一番近いものを選んでください。
        </p>
      </div>
      <div className="grid gap-2">
        {MOTIVATION_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`w-full px-4 py-3 text-left rounded-lg border transition-colors ${
              value === option.value
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export { MOTIVATION_OPTIONS };
