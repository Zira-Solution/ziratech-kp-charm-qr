"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Field, Icon, adminFontStyle, inputClass, primaryButton } from "./ui";

export interface AdminUser {
  id: string;
  email: string;
}

export default function AdminLogin({ onLoggedIn }: { onLoggedIn: (user: AdminUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setPassword("");
        onLoggedIn(data.user);
      } else {
        setError(data.error || "Tên đăng nhập hoặc mật khẩu không đúng.");
      }
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10" style={adminFontStyle}>
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <Icon name="storefront" className="text-[26px]" />
          </span>
          <h1 className="text-xl font-semibold text-slate-900">K&amp;P Atelier</h1>
          <p className="mt-1 text-sm text-slate-500">Đăng nhập khu vực quản trị quầy</p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6" noValidate>
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-rose-200"
            >
              <Icon name="error" className="mt-0.5 text-[18px]" />
              <span>{error}</span>
            </div>
          )}

          <Field label="Tên đăng nhập" htmlFor="admin-email">
            <input
              id="admin-email"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tên đăng nhập hoặc email"
              className={inputClass}
            />
          </Field>

          <Field label="Mật khẩu" htmlFor="admin-password">
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[20px]" />
              </button>
            </div>
          </Field>

          <button type="submit" disabled={loading} className={`${primaryButton} w-full`}>
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm">
          <Link href="/" className="text-slate-500 hover:text-slate-800">
            ← Về trang khách hàng
          </Link>
        </p>
      </div>
    </main>
  );
}
