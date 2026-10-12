"use client";

import React from "react";
import { Card, CardHeader, EmptyState, Icon, Skeleton, formatVnd } from "./ui";

export interface AnalyticsStats {
  totalOrders: number;
  totalRevenue: number;
  cashRevenue: number;
  transferRevenue: number;
  pendingCount: number;
  completedCount: number;
  topCharms: Array<{ id: string; name: string; count: number; icon: string }>;
}

function StatCard({ label, value, note, icon }: { label: string; value: string; note: string; icon: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container/10 text-primary-container">
          <Icon name={icon} className="text-[22px]" />
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{note}</p>
    </Card>
  );
}

export default function ReportsView({
  stats,
  loading,
  error,
  onRetry,
}: {
  stats: AnalyticsStats | null;
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  if (error) {
    return (
      <Card>
        <div role="alert" className="flex items-center justify-between gap-3 px-5 py-6 text-sm text-rose-700">
          <span>{error}</span>
          <button type="button" onClick={onRetry} className="font-semibold underline">
            Thử lại
          </button>
        </div>
      </Card>
    );
  }
  if (loading && !stats) {
    return (
      <Card>
        <Skeleton rows={4} />
      </Card>
    );
  }
  if (!stats) return null;
  if (stats.totalOrders === 0) {
    return (
      <Card>
        <EmptyState icon="bar_chart" title="Chưa có số liệu" hint="Báo cáo sẽ hiện khi quầy có đơn hàng đầu tiên." />
      </Card>
    );
  }

  const pct = (part: number) => (stats.totalRevenue > 0 ? Math.round((part / stats.totalRevenue) * 100) : 0);
  const topCharms = stats.topCharms.slice(0, 8);
  const maxCount = Math.max(1, ...topCharms.map((c) => c.count));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="payments" label="Tổng doanh thu" value={formatVnd(stats.totalRevenue)} note={`Từ ${stats.totalOrders} đơn hàng`} />
        <StatCard icon="qr_code_2" label="Chuyển khoản" value={formatVnd(stats.transferRevenue)} note={`Chiếm ${pct(stats.transferRevenue)}% tổng thu`} />
        <StatCard icon="point_of_sale" label="Tiền mặt tại quầy" value={formatVnd(stats.cashRevenue)} note={`Chiếm ${pct(stats.cashRevenue)}% tổng thu`} />
        <StatCard
          icon="auto_awesome"
          label="Khách đã soạn thiệp"
          value={`${stats.completedCount}/${stats.totalOrders}`}
          note={`${stats.pendingCount} khách đang chờ soạn`}
        />
      </div>

      <Card>
        <CardHeader title="Hạt charm bán chạy" subtitle="Xếp theo số lượng đã bán." />
        {topCharms.length === 0 ? (
          <EmptyState icon="diamond" title="Chưa có hạt charm nào được bán" />
        ) : (
          <ol className="divide-y divide-slate-100">
            {topCharms.map((c, i) => (
              <li key={c.id} className="flex items-center gap-4 px-5 py-3">
                <span className="w-5 text-sm font-semibold text-slate-400">{i + 1}</span>
                <Icon name={c.icon} className="text-[22px] text-primary-container" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{c.name}</p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-primary-container" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-slate-700">{c.count} hạt</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
