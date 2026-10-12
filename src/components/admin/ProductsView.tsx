"use client";

import React, { useState } from "react";
import type { StoredChain } from "@/lib/supabase/chains";
import { Card, CardHeader, EmptyState, Field, Icon, Skeleton, focusRing, formatVnd, inputClass, primaryButton, secondaryButton } from "./ui";

interface Props {
  chains: StoredChain[];
  editable: boolean;
  loading: boolean;
  error: string;
  onChanged: () => void;
  onNotify: (message: string) => void;
  onExpired: () => void;
}

const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, 8);
const money = (digits: string) => (digits ? new Intl.NumberFormat("vi-VN").format(Number(digits)) : "");

const iconButton =
  `inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 ` +
  `hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

export default function ProductsView({ chains, editable, loading, error, onChanged, onNotify, onExpired }: Props) {
  // add form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");

  // inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", price: "", description: "" });
  const [busyId, setBusyId] = useState<string | null>(null);

  const call = async (url: string, method: "POST" | "PATCH", body: unknown) => {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.status === 401) {
      onExpired();
      throw new Error("Phiên đăng nhập đã hết hạn");
    }
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Có lỗi xảy ra");
    return data;
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adding) return;
    setFormError("");
    if (!name.trim()) return setFormError("Vui lòng nhập tên dây vòng.");
    if (!price || Number(price) < 1) return setFormError("Vui lòng nhập giá hợp lệ.");

    setAdding(true);
    try {
      await call("/api/admin/chains", "POST", { name: name.trim(), price: Number(price), description: description.trim() });
      setName("");
      setPrice("");
      setDescription("");
      onNotify("Đã thêm dây vòng mới.");
      onChanged();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Không thêm được dây vòng.");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (c: StoredChain) => {
    setEditingId(c.id);
    setDraft({ name: c.name, price: String(c.price), description: c.desc });
  };

  const saveEdit = async (id: string) => {
    if (!draft.name.trim()) return onNotify("Tên dây vòng không được để trống.");
    if (!draft.price || Number(draft.price) < 1) return onNotify("Giá không hợp lệ.");
    setBusyId(id);
    try {
      await call(`/api/admin/chains/${id}`, "PATCH", {
        name: draft.name.trim(),
        price: Number(draft.price),
        description: draft.description.trim(),
      });
      setEditingId(null);
      onNotify("Đã lưu thay đổi. Các đơn đã bán giữ nguyên giá cũ.");
      onChanged();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : "Không lưu được.");
    } finally {
      setBusyId(null);
    }
  };

  const toggle = async (c: StoredChain) => {
    setBusyId(c.id);
    try {
      await call(`/api/admin/chains/${c.id}`, "PATCH", { active: !c.active });
      onNotify(c.active ? `Đã ẩn "${c.name}" khỏi màn hình tạo đơn.` : `Đã bán lại "${c.name}".`);
      onChanged();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : "Không cập nhật được.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {!editable && (
        <div role="alert" className="flex items-start gap-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          <Icon name="warning" className="mt-0.5 text-[20px]" />
          <div>
            <p className="font-semibold">Chưa tạo bảng dây vòng trong database</p>
            <p className="mt-0.5">
              Đang hiển thị danh sách mặc định (chỉ xem). Để thêm/sửa dây vòng, mở Supabase → SQL Editor và chạy lại file{" "}
              <code className="rounded bg-amber-100 px-1">supabase/schema.sql</code>, rồi tải lại trang.
            </p>
          </div>
        </div>
      )}

      {/* Add */}
      <Card>
        <CardHeader title="Thêm dây vòng" subtitle="Chỉ cần tên và giá. Dây mới sẽ hiện ngay ở màn hình Tạo đơn." />
        <form onSubmit={add} noValidate className="space-y-4 p-5">
          {formError && (
            <div role="alert" className="rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-rose-200">
              {formError}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <Field label="Tên dây vòng" htmlFor="chain-name" required>
              <input
                id="chain-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                autoComplete="off"
                placeholder="Ví dụ: Dây Bạc Thanh Mảnh"
                disabled={!editable}
                className={inputClass}
              />
            </Field>
            <Field label="Giá (đồng)" htmlFor="chain-price" required>
              <div className="relative">
                <input
                  id="chain-price"
                  inputMode="numeric"
                  value={money(price)}
                  onChange={(e) => setPrice(digitsOnly(e.target.value))}
                  autoComplete="off"
                  placeholder="45.000"
                  disabled={!editable}
                  className={`${inputClass} pr-8 text-right`}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500">đ</span>
              </div>
            </Field>
          </div>
          <Field label="Mô tả ngắn" htmlFor="chain-desc" hint="Không bắt buộc">
            <input
              id="chain-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={160}
              autoComplete="off"
              placeholder="Ví dụ: Sáng bóng, tinh xảo, thanh lịch"
              disabled={!editable}
              className={inputClass}
            />
          </Field>
          <button type="submit" disabled={adding || !editable} className={primaryButton}>
            <Icon name="add" className="text-[18px]" />
            {adding ? "Đang thêm..." : "Thêm dây vòng"}
          </button>
        </form>
      </Card>

      {/* List */}
      <Card>
        <CardHeader title="Danh sách dây vòng" subtitle={`${chains.filter((c) => c.active).length} đang bán, ${chains.filter((c) => !c.active).length} đã ẩn`} />
        {error ? (
          <p role="alert" className="px-5 py-6 text-sm text-rose-700">{error}</p>
        ) : loading && chains.length === 0 ? (
          <Skeleton rows={3} />
        ) : chains.length === 0 ? (
          <EmptyState icon="diamond" title="Chưa có dây vòng nào" hint="Dùng form phía trên để thêm dây vòng đầu tiên." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {chains.map((c) => {
              const editing = editingId === c.id;
              const busy = busyId === c.id;
              return (
                <li key={c.id} className={`p-4 sm:px-5 ${c.active ? "" : "bg-slate-50"}`}>
                  {editing ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
                        <input
                          aria-label="Tên dây vòng"
                          value={draft.name}
                          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                          maxLength={80}
                          className={inputClass}
                        />
                        <div className="relative">
                          <input
                            aria-label="Giá (đồng)"
                            inputMode="numeric"
                            value={money(draft.price)}
                            onChange={(e) => setDraft({ ...draft, price: digitsOnly(e.target.value) })}
                            className={`${inputClass} pr-8 text-right`}
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500">đ</span>
                        </div>
                      </div>
                      <input
                        aria-label="Mô tả ngắn"
                        value={draft.description}
                        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                        maxLength={160}
                        placeholder="Mô tả ngắn (không bắt buộc)"
                        className={inputClass}
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => saveEdit(c.id)} disabled={busy} className={primaryButton}>
                          {busy ? "Đang lưu..." : "Lưu"}
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} disabled={busy} className={secondaryButton}>
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <span
                        className="hidden h-9 w-9 shrink-0 rounded-full border border-slate-200 sm:block"
                        style={{ backgroundColor: c.color }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium ${c.active ? "text-slate-900" : "text-slate-500"}`}>{c.name}</p>
                        {c.desc && <p className="truncate text-sm text-slate-500">{c.desc}</p>}
                      </div>
                      <p className={`text-base font-semibold sm:w-28 sm:text-right ${c.active ? "text-primary-container" : "text-slate-400"}`}>
                        {formatVnd(c.price)}
                      </p>
                      <span
                        className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                          c.active ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-500 ring-slate-200"
                        }`}
                      >
                        {c.active ? "Đang bán" : "Đã ẩn"}
                      </span>
                      {editable && (
                        <div className="flex gap-1.5">
                          <button type="button" onClick={() => startEdit(c)} disabled={busy} className={iconButton} aria-label={`Sửa ${c.name}`}>
                            <Icon name="edit" className="text-[16px]" />
                            Sửa
                          </button>
                          <button type="button" onClick={() => toggle(c)} disabled={busy} className={iconButton} aria-label={`${c.active ? "Ẩn" : "Bán lại"} ${c.name}`}>
                            <Icon name={c.active ? "visibility_off" : "visibility"} className="text-[16px]" />
                            {c.active ? "Ẩn" : "Bán lại"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
