"use client";

import React, { useEffect, useRef } from "react";

// Small building blocks shared by the admin screens (admin-template look: flat cards, thin borders).

// The site theme maps font-sans to a serif face; the admin area uses the system UI font instead.
export const adminFontStyle: React.CSSProperties = {
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
};

export const formatVnd = (amount: number) =>
  `${new Intl.NumberFormat("vi-VN").format(Math.round(amount || 0))}đ`;

export function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined leading-none ${className}`}>
      {name}
    </span>
  );
}

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container";

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 " +
  "focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20";

export const primaryButton =
  `inline-flex items-center justify-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 text-sm font-semibold text-white ` +
  `transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const secondaryButton =
  `inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold ` +
  `text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`rounded-xl border border-slate-200 bg-white ${className}`}>{children}</section>;
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function StatusBadge({ completed }: { completed: boolean }) {
  return completed ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
      <Icon name="check_circle" className="text-[14px]" />
      Đã xong thiệp
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
      <Icon name="schedule" className="text-[14px]" />
      Chờ khách soạn
    </span>
  );
}

export function EmptyState({ icon, title, hint }: { icon: string; title: string; hint?: string }) {
  return (
    <div role="status" className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon name={icon} className="text-[26px]" />
      </span>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-slate-500">{hint}</p>}
    </div>
  );
}

export function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-5" aria-busy="true" aria-label="Đang tải">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
      ))}
    </div>
  );
}

/**
 * Modal dialog. These dialogs show one-time secrets, so they are NOT dismissed by the backdrop or Esc:
 * the user must press an explicit button.
 */
export function Dialog({
  title,
  eyebrow,
  children,
  footer,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("button, a, input")?.focus();
    return () => previous?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" style={adminFontStyle}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
      >
        <div className="border-b border-slate-100 px-6 py-4">
          {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-primary-container">{eyebrow}</p>}
          <h2 id="admin-dialog-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
        </div>
        <div className="px-6 py-5">{children}</div>
        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row-reverse">
          {footer}
        </div>
      </div>
    </div>
  );
}

/** Confirmation for destructive actions. Unlike Dialog, Esc and the Cancel button dismiss it. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus(); // focus the safe choice first
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" style={adminFontStyle}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <div id="confirm-message" className="mt-2 text-sm text-slate-600">
          {message}
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button ref={cancelRef} type="button" onClick={onCancel} disabled={busy} className={secondaryButton}>
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
          >
            {busy ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
