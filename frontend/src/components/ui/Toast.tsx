"use client";

import { useEffect, useState } from "react";

export interface ToastData {
  id: string;
  message: string;
  type?: "success" | "info" | "warning" | "error";
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // アニメーション用に少し遅らせて表示
    const showTimeout = setTimeout(() => setIsVisible(true), 10);

    // 自動で消える
    const duration = toast.duration ?? 3000;
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(toast.id), 300); // アニメーション後に削除
    }, duration);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, [toast, onDismiss]);

  const bgColor = {
    success: "bg-green-500",
    info: "bg-blue-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
  }[toast.type ?? "info"];

  const icon = {
    success: "✓",
    info: "ℹ",
    warning: "⚠",
    error: "✕",
  }[toast.type ?? "info"];

  return (
    <div
      className={`
        flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm
        transform transition-all duration-300 ease-out
        ${bgColor}
        ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}
      `}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{toast.message}</span>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// トースト管理用のカスタムフック
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (
    message: string,
    type: ToastData["type"] = "info",
    duration?: number
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    showToast,
    dismissToast,
  };
}
