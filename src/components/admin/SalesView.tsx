"use client";

import React, { useMemo } from "react";
import { categoryLabel } from "@/lib/sales/labels";
import { Card, CardHeader, EmptyState, Icon, Skeleton, formatVnd, secondaryButton } from "./ui";

export interface SalesRow {
  soldOn: string;
  category: string;
  qty: number;
  amount: number;
}

export interface SalesData {
  rows: SalesRow[];
  ready: boolean;
}

const formatDay = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

export default function SalesView({
  data,
  loading,
  error,
  onRefresh,
}: {
  data: SalesData | null;
  loading: boolean;
  error: string;
  onRefresh: () => void;
}) {
  const days = useMemo(() => {
    const byDay = new Map<string, SalesRow[]>();
    for (const r of data?.rows ?? []) byDay.set(r.soldOn, [...(byDay.get(r.soldOn) ?? []), r]);
    return [...byDay.entries()].map(([soldOn, rows]) => ({
      soldOn,
      rows,
      qty: rows.reduce((n, r) => n + r.qty, 0),
      amount: rows.reduce((n, r) => n + r.amount, 0),
    }));
  }, [data]);

  const totals = useMemo(() => {
    const byCategory = new Map<string, { qty: number; amount: number }>();
    for (const r of data?.rows ?? []) {
      const slot = byCategory.get(r.category) ?? { qty: 0, amount: 0 };
      slot.qty += r.qty;
      slot.amount += r.amount;
      byCategory.set(r.category, slot);
    }
    return [...byCategory.entries()].map(([category, v]) => ({ category, ...v })).sort((a, b) => b.amount - a.amount);
  }, [data]);

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
          title="Chưa tạo bảng stall_sales"
          hint="Chạy các mục 9 đến 13 trong supabase/schema.sql ở Supabase SQL Editor, rồi tải lại trang."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
    {totals.length > 0 && (
      <Card>
        <CardHeader title="Tổng cả đợt theo sản phẩm" subtitle="Cộng cả 3 ngày, theo nhóm sản phẩm trong sheet" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-120 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Sản phẩm</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Số lượng</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {totals.map((t) => (
                <tr key={t.category}>
                  <td className="px-5 py-2.5 text-slate-700">{categoryLabel(t.category)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{t.qty}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{formatVnd(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    )}
    <Card>
      <CardHeader
        title="Bán hàng tại gian hàng"
        subtitle="Theo ngày và nhóm sản phẩm (không gồm tiền ủng hộ)"
        action={
          <button type="button" onClick={onRefresh} disabled={loading} className={secondaryButton}>
            <Icon name="refresh" className="text-[18px]" />
            Làm mới
          </button>
        }
      />
      {days.length === 0 ? (
        <EmptyState icon="storefront" title="Chưa có dữ liệu bán hàng" hint="Chạy scripts/seed-sales.ts để nhập từ sheet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-120 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Ngày / nhóm sản phẩm</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Số lượng</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Thành tiền</th>
              </tr>
            </thead>
            {days.map((day) => (
              <tbody key={day.soldOn} className="divide-y divide-slate-100 border-t border-slate-200">
                {day.rows.map((r) => (
                  <tr key={r.category}>
                    <td className="px-5 py-2.5 pl-8 text-slate-700">{categoryLabel(r.category)}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{r.qty}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{formatVnd(r.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-semibold text-slate-900">
                  <th scope="row" className="px-5 py-3 text-left">Tổng ngày {formatDay(day.soldOn)}</th>
                  <td className="px-5 py-3 text-right tabular-nums">{day.qty}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatVnd(day.amount)}</td>
                </tr>
              </tbody>
            ))}
          </table>
        </div>
      )}
    </Card>
    </div>
  );
}
