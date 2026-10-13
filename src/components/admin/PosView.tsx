"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import type { Chain } from "@/config/catalog";
import type { GiftProductView, IssuedCodes } from "@/types/gift-order";
import { Card, CardHeader, EmptyState, Field, Icon, focusRing, formatVnd, inputClass, primaryButton, secondaryButton } from "./ui";

export interface CreatedOrder {
  order: GiftProductView;
  codes: IssuedCodes | null;
}

interface Props {
  chains: Chain[];
  chainsLoading: boolean;
  onCreated: (created: CreatedOrder) => void;
  onGoProducts: () => void;
}

/** Keeps digits only, so the amount box accepts "10.000", "10,000" or "10000" alike. */
const digitsOnly = (value: string) => value.replace(/\D/g, "");

export default function PosView({ chains, chainsLoading, onCreated, onGoProducts }: Props) {
  const [pickedId, setPickedId] = useState<string>("");
  const [charmAmount, setCharmAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState<"cash" | "transfer">("cash");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Falls back to the first chain when nothing is picked yet or the picked one was hidden.
  const chain = chains.find((c) => c.id === pickedId) ?? chains[0];
  const charmMoney = charmAmount ? Number(charmAmount) : 0;
  const total = (chain?.price ?? 0) + charmMoney;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !chain) return;
    setError("");

    if (!name.trim()) return setError("Vui lòng nhập họ tên khách hàng.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Vui lòng nhập email hợp lệ để gửi mã cho khách.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/create-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim() || undefined,
          chainId: chain.id,
          charmAmount: charmMoney,
          paymentMethod: payment,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Không thể tạo đơn");

      confetti({ particleCount: 80, spread: 65, origin: { y: 0.7 }, colors: ["#721a28", "#d99b26", "#fea095"] });
      setName("");
      setEmail("");
      setPhone("");
      setCharmAmount("");
      onCreated({ order: data.product, codes: data.issuedCodes ?? null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo đơn");
    } finally {
      setSubmitting(false);
    }
  };

  if (!chainsLoading && chains.length === 0) {
    return (
      <Card>
        <EmptyState
          icon="diamond"
          title="Chưa có dây vòng nào để bán"
          hint="Thêm ít nhất một dây vòng (tên và giá) trước khi tạo đơn."
        />
        <div className="flex justify-center pb-8">
          <button type="button" onClick={onGoProducts} className={primaryButton}>
            <Icon name="add" className="text-[18px]" />
            Thêm dây vòng
          </button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid items-start gap-6 pb-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:pb-0">
      <div className="space-y-6">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200"
          >
            <Icon name="error" className="mt-0.5 text-[18px]" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Chain */}
        <Card>
          <CardHeader
            title="1. Chọn dây vòng"
            subtitle="Chọn 1 loại dây khách mua."
            action={
              <button type="button" onClick={onGoProducts} className={`${secondaryButton} px-3 py-1.5`}>
                Quản lý dây vòng
              </button>
            }
          />
          {chainsLoading && chains.length === 0 ? (
            <div className="p-5" aria-busy="true">
              <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
            </div>
          ) : (
            <div role="radiogroup" aria-label="Loại dây vòng" className="grid gap-3 p-5 sm:grid-cols-2">
              {chains.map((c) => {
                const selected = c.id === chain?.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPickedId(c.id)}
                    className={`flex items-start gap-3 rounded-lg border p-3.5 text-left transition-colors ${focusRing} ${
                      selected
                        ? "border-primary-container bg-primary-container/5 ring-1 ring-primary-container"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className="mt-0.5 h-8 w-8 shrink-0 rounded-full border border-slate-200"
                      style={{ backgroundColor: c.color }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900">{c.name}</span>
                        {selected && <Icon name="check_circle" className="text-[18px] text-primary-container" />}
                      </span>
                      {c.desc && <span className="block text-xs text-slate-500">{c.desc}</span>}
                      <span className="mt-1 block text-sm font-semibold text-primary-container">{formatVnd(c.price)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* 2. Charm money */}
        <Card>
          <CardHeader
            title="2. Tiền charm"
            subtitle="Charm khách tự mua thêm tại quầy. Nhập tổng tiền charm khách đã mua (để trống nếu không mua)."
          />
          <div className="p-5">
            <Field label="Số tiền charm (đồng)" htmlFor="pos-charm" hint="Ví dụ: 30000 cho 3 hạt charm 10.000đ">
              <div className="relative sm:max-w-xs">
                <input
                  id="pos-charm"
                  inputMode="numeric"
                  autoComplete="off"
                  value={charmAmount ? new Intl.NumberFormat("vi-VN").format(Number(charmAmount)) : ""}
                  onChange={(e) => setCharmAmount(digitsOnly(e.target.value).slice(0, 9))}
                  placeholder="0"
                  className={`${inputClass} pr-8 text-right`}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500">đ</span>
              </div>
            </Field>
          </div>
        </Card>

        {/* 3. Customer */}
        <Card>
          <CardHeader title="3. Thông tin khách hàng" subtitle="Mã thiệp và OTP tạo thiệp sẽ được gửi về email này." />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Họ và tên" htmlFor="pos-name" required>
              <input
                id="pos-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                placeholder="Nguyễn Thu Hà"
                className={inputClass}
              />
            </Field>
            <Field label="Email nhận mã" htmlFor="pos-email" required>
              <input
                id="pos-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                placeholder="thuha.fpt@gmail.com"
                className={inputClass}
              />
            </Field>
            <Field label="Số điện thoại" htmlFor="pos-phone" hint="Không bắt buộc">
              <input
                id="pos-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="off"
                placeholder="0912 345 678"
                className={inputClass}
              />
            </Field>

            <fieldset>
              <legend className="mb-1.5 block text-sm font-medium text-slate-700">Hình thức thanh toán</legend>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "cash", label: "Tiền mặt", icon: "payments" },
                    { id: "transfer", label: "Chuyển khoản", icon: "qr_code_2" },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-container ${
                      payment === opt.id
                        ? "border-primary-container bg-primary-container/5 text-primary-container ring-1 ring-primary-container"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.id}
                      checked={payment === opt.id}
                      onChange={() => setPayment(opt.id)}
                      className="sr-only"
                    />
                    <Icon name={opt.icon} className="text-[18px]" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </Card>
      </div>

      {/* Invoice */}
      <aside className="lg:sticky lg:top-20">
        <Card>
          <CardHeader title="Hóa đơn" />
          <div className="space-y-3 p-5 text-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-700">{chain ? chain.name : "Chưa chọn dây vòng"}</span>
              <span className="shrink-0 font-medium text-slate-900">{formatVnd(chain?.price ?? 0)}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-700">Tiền charm</span>
              <span className={`shrink-0 ${charmMoney ? "font-medium text-slate-900" : "text-slate-400"}`}>
                {formatVnd(charmMoney)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="font-semibold text-slate-900">Tổng thu</span>
              <span className="text-xl font-bold text-primary-container">{formatVnd(total)}</span>
            </div>
            <p className="text-xs text-slate-500">
              Thanh toán: {payment === "cash" ? "Tiền mặt tại quầy" : "Chuyển khoản"}. Tặng kèm thiệp số và thẻ nhung QR.
            </p>

            <button type="submit" disabled={submitting || !chain} className={`${primaryButton} w-full py-3`}>
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang tạo đơn...
                </>
              ) : (
                <>
                  <Icon name="send" className="text-[18px]" />
                  Tạo đơn &amp; cấp mã
                </>
              )}
            </button>
          </div>
        </Card>
      </aside>

      {/* Mobile quick bar: keeps the total and the submit button in reach on long forms */}
      <div className="fixed inset-x-0 bottom-14 z-20 flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-2.5 lg:hidden">
        <div className="leading-tight">
          <p className="text-xs text-slate-500">Tổng thu</p>
          <p className="text-lg font-bold text-primary-container">{formatVnd(total)}</p>
        </div>
        <button type="submit" disabled={submitting || !chain} className={`${primaryButton} px-5`}>
          {submitting ? "Đang tạo..." : "Tạo đơn"}
        </button>
      </div>
    </form>
  );
}
