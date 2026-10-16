"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

export type ToastType = "error" | "success" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: React.ReactNode;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: React.ReactNode, type?: ToastType, duration?: number) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, string> = {
  error: "error",
  success: "check_circle",
  warning: "warning",
  info: "info",
};

const STYLES: Record<
  ToastType,
  {
    container: string;
    iconBg: string;
    text: string;
  }
> = {
  error: {
    container: "border-rose-200/90 bg-white/95 text-rose-950 shadow-rose-950/10",
    iconBg: "bg-rose-100 text-rose-700",
    text: "text-rose-950",
  },
  success: {
    container: "border-emerald-200/90 bg-white/95 text-emerald-950 shadow-emerald-950/10",
    iconBg: "bg-emerald-100 text-emerald-700",
    text: "text-emerald-950",
  },
  warning: {
    container: "border-amber-200/90 bg-white/95 text-amber-950 shadow-amber-950/10",
    iconBg: "bg-amber-100 text-amber-700",
    text: "text-amber-950",
  },
  info: {
    container: "border-rose-petal bg-white/95 text-on-surface shadow-primary/10",
    iconBg: "bg-surface-container text-primary-container",
    text: "text-on-surface",
  },
};

export function useToastState() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: React.ReactNode, type: ToastType = "info", duration = 4000) => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((prev) => {
        // Limit to max 3 concurrent toasts
        const next = [...prev, { id, type, message, duration }];
        return next.slice(-3);
      });

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
      return id;
    },
    [dismissToast]
  );

  return { toasts, showToast, dismissToast };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, showToast, dismissToast } = useToastState();

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Thông báo"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex w-full max-w-[92vw] flex-col items-center gap-2 pointer-events-none sm:max-w-md"
    >
      {toasts.map((toast) => {
        const style = STYLES[toast.type];
        const isAlert = toast.type === "error" || toast.type === "warning";

        return (
          <div
            key={toast.id}
            role={isAlert ? "alert" : "status"}
            aria-live={isAlert ? "assertive" : "polite"}
            className={`pointer-events-auto flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${style.container}`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}
              >
                <span className="material-symbols-outlined text-[20px]">{ICONS[toast.type]}</span>
              </span>
              <div className={`text-sm font-semibold leading-relaxed break-words ${style.text}`}>
                {toast.message}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Đóng thông báo"
              className="shrink-0 rounded-lg p-1 text-on-surface-variant/70 transition-colors hover:bg-black/5 hover:text-on-surface cursor-pointer"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
