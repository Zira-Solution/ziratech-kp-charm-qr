"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { CHAINS, CHARMS, MAX_CHARMS, type Charm } from "@/config/catalog";
import type { GiftProductView, IssuedCodes } from "@/types/gift-order";
import { Card, CardHeader, Field, Icon, focusRing, formatVnd, inputClass, primaryButton } from "./ui";

export interface CreatedOrder {
  order: GiftProductView;
  codes: IssuedCodes | null;
}

export default function PosView({ onCreated }: { onCreated: (created: CreatedOrder) => void }) {
  const [chainId, setChainId] = useState<string>(CHAINS[0].id);
  const [charms, setCharms] = useState<Charm[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState<"cash" | "transfer">("cash");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const chain = CHAINS.find((c) => c.id === chainId)!;
  const total = chain.price + charms.reduce((sum, c) => sum + c.price, 0);
  const atLimit = charms.length >= MAX_CHARMS;

  // Group repeated charms for the invoice: [{ charm, qty }]
  const grouped = charms.reduce<Array<{ charm: Charm; qty: number }>>((acc, c) => {
    const hit = acc.find((g) => g.charm.id === c.id);
    if (hit) hit.qty += 1;
    else acc.push({ charm: c, qty: 1 });
    return acc;
  }, []);

  const addCharm = (charm: Charm) => {
    if (!atLimit) setCharms((prev) => [...prev, charm]);
  };
  const removeOne = (id: string) => {
    setCharms((prev) => {
      const idx = prev.map((c) => c.id).lastIndexOf(id);
      return idx < 0 ? prev : prev.filter((_, i) => i !== idx);
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
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
          chainId,
          charms: charms.map((c) => ({ id: c.id })),
          paymentMethod: payment,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Không thể tạo đơn");

      confetti({ particleCount: 80, spread: 65, origin: { y: 0.7 }, colors: ["#721a28", "#d99b26", "#fea095"] });
      setName("");
      setEmail("");
      setPhone("");
      setCharms([]);
      onCreated({ order: data.product, codes: data.issuedCodes ?? null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo đơn");
    } finally {
      setSubmitting(false);
    }
  };

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
          <CardHeader title="1. Chọn dây vòng" subtitle="Chọn 1 loại dây khách mua." />
          <div role="radiogroup" aria-label="Loại dây vòng" className="grid gap-3 p-5 sm:grid-cols-2">
            {CHAINS.map((c) => {
              const selected = c.id === chainId;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setChainId(c.id)}
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
                    <span className="block text-xs text-slate-500">{c.desc}</span>
                    <span className="mt-1 block text-sm font-semibold text-primary-container">{formatVnd(c.price)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* 2. Charms */}
        <Card>
          <CardHeader
            title="2. Hạt charm đính kèm"
            subtitle="Bấm vào hạt để thêm. Có thể chọn một hạt nhiều lần."
            action={
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  atLimit ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" : "bg-slate-100 text-slate-600"
                }`}
              >
                {charms.length}/{MAX_CHARMS} hạt
              </span>
            }
          />
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 xl:grid-cols-4">
            {CHARMS.map((charm) => {
              const qty = charms.filter((c) => c.id === charm.id).length;
              return (
                <div key={charm.id} className="relative">
                  <button
                    type="button"
                    onClick={() => addCharm(charm)}
                    disabled={atLimit}
                    aria-label={`Thêm ${charm.name}, ${formatVnd(charm.price)}${qty ? `, đã chọn ${qty}` : ""}`}
                    className={`flex h-full w-full flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${
                      qty ? "border-primary-container bg-primary-container/5" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Icon name={charm.icon} className="text-[22px] text-primary-container" />
                    <span className="text-sm font-medium leading-snug text-slate-900">{charm.name}</span>
                    <span className="text-xs text-slate-500">{charm.meaning}</span>
                    <span className="mt-auto pt-1 text-xs font-semibold text-slate-700">+{formatVnd(charm.price)}</span>
                  </button>
                  {qty > 0 && (
                    <span className="pointer-events-none absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-container px-1 text-xs font-semibold text-white">
                      {qty}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* 3. Customer */}
        <Card>
          <CardHeader title="3. Thông tin khách hàng" subtitle="Mã tạo thiệp sẽ được gửi về email này." />
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
              <span className="text-slate-700">{chain.name}</span>
              <span className="shrink-0 font-medium text-slate-900">{formatVnd(chain.price)}</span>
            </div>

            {grouped.length === 0 ? (
              <p className="text-slate-400">Chưa có hạt charm nào.</p>
            ) : (
              <ul className="space-y-2">
                {grouped.map(({ charm, qty }) => (
                  <li key={charm.id} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-slate-700">
                      <button
                        type="button"
                        onClick={() => removeOne(charm.id)}
                        aria-label={`Bớt một ${charm.name}`}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:bg-slate-100 ${focusRing}`}
                      >
                        <Icon name="remove" className="text-[14px]" />
                      </button>
                      <span className="truncate">
                        {charm.name} {qty > 1 && <span className="text-slate-400">×{qty}</span>}
                      </span>
                    </span>
                    <span className="shrink-0 text-slate-900">{formatVnd(charm.price * qty)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="font-semibold text-slate-900">Tổng thu</span>
              <span className="text-xl font-bold text-primary-container">{formatVnd(total)}</span>
            </div>
            <p className="text-xs text-slate-500">
              Thanh toán: {payment === "cash" ? "Tiền mặt tại quầy" : "Chuyển khoản"}. Tặng kèm thiệp số và thẻ nhung QR.
            </p>

            <button type="submit" disabled={submitting} className={`${primaryButton} w-full py-3`}>
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
        <button type="submit" disabled={submitting} className={`${primaryButton} px-5`}>
          {submitting ? "Đang tạo..." : "Tạo đơn"}
        </button>
      </div>
    </form>
  );
}
