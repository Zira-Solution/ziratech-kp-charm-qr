"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Dialog, Icon, formatVnd, primaryButton, secondaryButton } from "./ui";
import type { CreatedOrder } from "./PosView";

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
    } catch {
      setCopied(null);
    }
  };
  return { copied, copy };
}

function CodeBox({
  label,
  hint,
  value,
  copied,
  onCopy,
}: {
  label: string;
  hint: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <code className="select-all font-mono text-lg font-bold text-slate-900">{value}</code>
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copy ${label}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
        >
          <Icon name={copied ? "check" : "content_copy"} className="text-[14px]" />
          {copied ? "Đã copy" : "Copy"}
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export function OrderCreatedDialog({ created, onClose }: { created: CreatedOrder; onClose: () => void }) {
  const { order, codes } = created;
  const { copied, copy } = useCopy();
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const summary = [
    "K&P Atelier - Quà Tặng 20/10",
    `Mã thiệp: ${order.token}`,
    `OTP tạo thiệp (cho người mua): ${codes?.creatorKey ?? ""}`,
    `OTP xem thiệp (cho người nhận): ${codes?.unlockPin ?? ""}`,
    `Tạo thiệp (người mua): ${origin}/gift`,
    `Xem thiệp (người nhận): nhập mã thiệp và OTP xem thiệp tại ${origin}`,
  ].join("\n");

  return (
    <Dialog
      eyebrow="Tạo đơn thành công"
      title="Đã cấp mã cho khách"
      footer={
        <>
          <button type="button" onClick={onClose} className={`${primaryButton} sm:flex-1`}>
            Đã ghi lại mã, tạo đơn tiếp
          </button>
          <Link href="/gift" target="_blank" className={`${secondaryButton} sm:flex-1`}>
            Mở trang tạo thiệp
            <Icon name="open_in_new" className="text-[16px]" />
          </Link>
        </>
      }
    >
      {order.emailSent ? (
        <p className="mb-4 flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 ring-1 ring-emerald-200">
          <Icon name="mark_email_read" className="mt-0.5 text-[18px]" />
          Email kèm mã đã gửi tới {order.customerEmail}.
        </p>
      ) : (
        <p role="alert" className="mb-4 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-800 ring-1 ring-rose-200">
          <Icon name="warning" className="mt-0.5 text-[18px]" />
          Chưa gửi được email tới {order.customerEmail}. Hãy đưa mã dưới đây trực tiếp cho khách.
        </p>
      )}

      <div className="space-y-3">
        <CodeBox label="Mã thiệp" hint="In trên thẻ nhung." value={order.token} copied={copied === "token"} onCopy={() => copy("token", order.token)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <CodeBox
            label="OTP tạo thiệp"
            hint="Dành cho người mua."
            value={codes?.creatorKey ?? "—"}
            copied={copied === "creator"}
            onCopy={() => codes && copy("creator", codes.creatorKey)}
          />
          <CodeBox
            label="OTP xem thiệp"
            hint="In trên thẻ, dành cho người nhận."
            value={codes?.unlockPin ?? "—"}
            copied={copied === "pin"}
            onCopy={() => codes && copy("pin", codes.unlockPin)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => copy("all", summary)}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-container hover:underline"
      >
        <Icon name={copied === "all" ? "check" : "content_copy"} className="text-[16px]" />
        {copied === "all" ? "Đã copy toàn bộ" : "Copy toàn bộ thông tin cho khách"}
      </button>

      <p className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800 ring-1 ring-amber-200">
        <Icon name="lock" className="mt-0.5 text-[16px]" />
        Mã được mã hóa và chỉ hiện lần này. Hãy in OTP xem thiệp lên thẻ hoặc đưa cho khách trước khi đóng.
      </p>

      <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Khách hàng</dt>
          <dd className="font-medium text-slate-900">{order.customerName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Sản phẩm</dt>
          <dd className="text-right text-slate-900">{order.chainName}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Tiền charm</dt>
          <dd className="text-slate-900">{formatVnd(Math.max(0, order.totalPrice - order.chainPrice))}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Đã thu</dt>
          <dd className="font-semibold text-primary-container">{formatVnd(order.totalPrice)}</dd>
        </div>
      </dl>
    </Dialog>
  );
}

export function ReissuedKeyDialog({
  token,
  creatorKey,
  onClose,
}: {
  token: string;
  creatorKey: string;
  onClose: () => void;
}) {
  const { copied, copy } = useCopy();
  return (
    <Dialog
      eyebrow="Cấp lại OTP tạo thiệp"
      title={`Mã thiệp ${token}`}
      footer={
        <button type="button" onClick={onClose} className={`${primaryButton} sm:flex-1`}>
          Đã ghi lại, đóng
        </button>
      }
    >
      <p className="mb-4 text-sm text-slate-600">
        Email chưa được gửi thật. OTP cũ đã bị vô hiệu, hãy đưa OTP mới này cho khách. Mã chỉ hiện một lần.
      </p>
      <CodeBox
        label="OTP tạo thiệp mới"
        hint="Dành cho người mua."
        value={creatorKey}
        copied={copied === "creator"}
        onCopy={() => copy("creator", creatorKey)}
      />
    </Dialog>
  );
}
