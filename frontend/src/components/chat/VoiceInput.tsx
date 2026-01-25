"use client";

import { useCallback } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: Props) {
  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const handleToggle = useCallback(() => {
    if (isListening) {
      stopListening();
      // 確定したテキストを親に送る
      if (transcript) {
        onTranscript(transcript);
        resetTranscript();
      }
    } else {
      resetTranscript();
      startListening();
    }
  }, [
    isListening,
    transcript,
    onTranscript,
    startListening,
    stopListening,
    resetTranscript,
  ]);

  const handleCancel = useCallback(() => {
    stopListening();
    resetTranscript();
  }, [stopListening, resetTranscript]);

  const handleConfirm = useCallback(() => {
    stopListening();
    if (transcript) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, onTranscript, stopListening, resetTranscript]);

  if (!isSupported) {
    return (
      <div className="text-xs text-gray-400">
        このブラウザは音声入力に対応していません
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* リアルタイム表示エリア（録音中のみ表示） */}
      {isListening && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs text-gray-500">録音中...</span>
          </div>
          <p className="text-sm text-gray-700 min-h-[2em]">
            {transcript}
            <span className="text-gray-400">{interimTranscript}</span>
            {!transcript && !interimTranscript && (
              <span className="text-gray-400">話しかけてください...</span>
            )}
          </p>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded">
          {error}
        </div>
      )}

      {/* コントロールボタン */}
      <div className="flex gap-2">
        {!isListening ? (
          <button
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="音声入力を開始"
          >
            <MicIcon className="w-4 h-4" />
            <span className="text-sm">音声入力</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              aria-label="確定"
            >
              <CheckIcon className="w-4 h-4" />
              <span className="text-sm">確定</span>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              aria-label="キャンセル"
            >
              <XIcon className="w-4 h-4" />
              <span className="text-sm">取消</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// アイコンコンポーネント
function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
