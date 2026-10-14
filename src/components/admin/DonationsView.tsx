"use client";

import React, { useMemo, useState } from "react";
import { Card, CardHeader, EmptyState, Icon, Skeleton, formatVnd, inputClass, secondaryButton } from "./ui";

export interface DonationRow {
  id: string;
  sepayId: number;
  gateway: string;
  accountNumber: string;
  amount: number;
  content: string;
  referenceCode: string;
  transactionDate: string;
}

export interface DonationsData {
  donations: DonationRow[];
  ready: boolean;
  total: number;
  count: number;
}

const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(
    new Date(iso)
  );

export default function DonationsView({
  data,
  loading,
  error,
  onRefresh,
}: {
  data: DonationsData | null;
  loading: boolean;
  error: string;
  onRefresh: () => void;
}) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data.donations;
    return data.donations.filter((d) =>
      [d.content, d.referenceCode, d.gateway, String(d.amount)].some((v) => v.toLowerCase().includes(q))
    );
  }, [data, query]);

  if (error) {
    return (
      <Card>
        <div role="alert" className="flex items-center justify-between gap-3 px-5 py-6 text-sm text-rose-700">
          <span>{error}</span>
          <button type="button" onClick={onRefresh} className="font-semibold underline">
            Thử lại
          </button>
        </div>
      </Card>
    );
  }
  if (loading && !data) {
    return (
      <Card>
        <Skeleton rows={5} />
      </Card>
    );
  }
  if (!data) return null;
  if (!data.ready) {
    return (
      <Card>
        <EmptyState
          icon="database"
          title="Chưa tạo bảng donations"
          hint="Chạy mục 8 trong supabase/schema.sql ở Supabase SQL Editor, rồi tải lại trang."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Tổng tiền quỹ đã nhận</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatVnd(data.total)}</p>
          <p className="mt-3 text-xs text-slate-500">Cộng tự động từ các khoản chuyển khoản vào tài khoản quỹ</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Số lượt chuyển khoản</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{data.count}</p>
          <p className="mt-3 text-xs text-slate-500">Cập nhật ngay khi SePay báo có tiền vào</p>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Sao kê quỹ"
          subtitle={`${data.donations.length} giao dịch gần nhất`}
          action={
            <button type="button" onClick={onRefresh} disabled={loading} className={secondaryButton}>
              <Icon name="refresh" className="text-[18px]" />
              Làm mới
            </button>
          }
        />
        <div className="border-b border-slate-100 p-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo nội dung, mã tham chiếu, số tiền..."
            aria-label="Tìm giao dịch"
            className={inputClass}
          />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon="account_balance"
            title={data.donations.length === 0 ? "Chưa có khoản nào" : "Không có giao dịch khớp"}
            hint={
              data.donations.length === 0
                ? "Khi có người chuyển khoản vào tài khoản quỹ, SePay sẽ báo về và khoản đó hiện ở đây."
                : "Thử từ khóa khác."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Thời gian</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Số tiền</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Nội dung chuyển khoản</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Ngân hàng</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Mã tham chiếu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDateTime(d.transactionDate)}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-right font-semibold text-emerald-700">
                      +{formatVnd(d.amount)}
                    </td>
                    <td className="max-w-80 px-5 py-3 text-slate-800">{d.content || "—"}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">{d.gateway || "—"}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-500">
                      {d.referenceCode || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
