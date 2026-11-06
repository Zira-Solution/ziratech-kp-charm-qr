"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import type { GiftProductView, IssuedCodes } from "@/types/gift-order";
import { EMAIL_SENDING_ENABLED } from "@/config/features";
import { Card, CardHeader, Field, Icon, inputClass, primaryButton } from "./ui";

export interface CreatedOrder {
  order: GiftProductView;
  codes: IssuedCodes | null;
}

interface Props {
  onCreated: (created: CreatedOrder) => void;
}

/** The web records no money: staff only enter the buyer's email, and the codes are mailed to it. */
export default function PosView({ onCreated }: Props) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError("");

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Vui lòng nhập email hợp lệ để gửi mã cho khách.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/create-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerEmail: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Không thể tạo vòng");

      confetti({ particleCount: 80, spread: 65, origin: { y: 0.7 }, colors: ["#721a28", "#d99b26", "#fea095"] });
      setEmail("");
      onCreated({ order: data.product, codes: data.issuedCodes ?? null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo vòng");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-xl pb-16 lg:pb-0">
      <Card>
        <CardHeader title="Tạo vòng" subtitle={
            EMAIL_SENDING_ENABLED
              ? "Nhập email của khách. Mã thiệp và OTP tạo thiệp sẽ được gửi về email này."
              : "Nhập email của khách. Đang tạm tắt gửi email: mã sẽ hiện trên màn hình để bạn đưa cho khách."
          } />
        <div className="space-y-4 p-5">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200"
            >
              <Icon name="error" className="mt-0.5 text-[18px]" />
              <span>{error}</span>
            </div>
          )}
          <Field label="Email nhận mã" htmlFor="pos-email" required>
            <input
              id="pos-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              autoFocus
              placeholder="thuha.fpt@gmail.com"
              className={inputClass}
            />
          </Field>
          <button type="submit" disabled={submitting} className={`${primaryButton} w-full py-3`}>
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang tạo...
              </>
            ) : (
              <>
                <Icon name="send" className="text-[18px]" />
                {EMAIL_SENDING_ENABLED ? "Tạo vòng & gửi mã" : "Tạo vòng"}
              </>
            )}
          </button>
        </div>
      </Card>
    </form>
  );
}
