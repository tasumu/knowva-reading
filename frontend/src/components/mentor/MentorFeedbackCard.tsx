import type { MentorFeedback } from "@/lib/types";

interface Props {
  feedback: MentorFeedback;
}

export function MentorFeedbackCard({ feedback }: Props) {
  const isWeekly = feedback.feedback_type === "weekly";

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isWeekly
              ? "bg-blue-100 text-blue-800"
              : "bg-indigo-100 text-indigo-800"
          }`}
        >
          {isWeekly ? "📅 週次" : "📆 月次"}フィードバック
        </span>
        <span className="text-xs text-gray-500">
          {new Date(feedback.created_at).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {feedback.period_start && feedback.period_end && (
        <div className="text-xs text-gray-400 mb-2">
          対象期間:{" "}
          {new Date(feedback.period_start).toLocaleDateString("ja-JP")} 〜{" "}
          {new Date(feedback.period_end).toLocaleDateString("ja-JP")}
        </div>
      )}

      <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
        {feedback.content}
      </p>
    </div>
  );
}
