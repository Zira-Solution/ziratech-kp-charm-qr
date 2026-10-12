"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { GiftProductView } from "@/types/gift-order";
import { Card, EmptyState, Icon, Skeleton, StatusBadge, focusRing, formatVnd, inputClass } from "./ui";

type Filter = "all" | "pending" | "completed";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ soạn" },
  { id: "completed", label: "Đã xong" },
];

interface Props {
  orders: GiftProductView[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onResend: (token: string) => void;
  resendingToken: string | null;
  onCopyLink: (token: string) => void;
}

const iconButton =
  `inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 ` +
  `hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

function RowActions({
  order,
  onResend,
  resendingToken,
  onCopyLink,
}: {
  order: GiftProductView;
  onResend: Props["onResend"];
  resendingToken: string | null;
  onCopyLink: Props["onCopyLink"];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" className={iconButton} title="Copy link tạo thiệp" aria-label={`Copy link tạo thiệp ${order.token}`} onClick={() => onCopyLink(order.token)}>
        <Icon name="link" className="text-[18px]" />
      </button>
      <button
        type="button"
        className={iconButton}
        title="Cấp lại mật khẩu tạo thiệp & gửi email"
        aria-label={`Cấp lại mật khẩu và gửi email cho ${order.token}`}
        disabled={resendingToken === order.token}
        onClick={() => onResend(order.token)}
      >
        <Icon name={resendingToken === order.token ? "hourglass_top" : "mail"} className="text-[18px]" />
      </button>
      <Link href={`/create/${order.token}`} target="_blank" className={iconButton} title="Mở studio tạo thiệp (cần mật khẩu tạo thiệp)" aria-label={`Mở studio tạo thiệp ${order.token}`}>
        <Icon name="edit" className="text-[18px]" />
      </Link>
      {order.status === "completed" && (
        <Link href={`/g/${order.token}`} target="_blank" className={iconButton} title="Xem thiệp (cần PIN mở quà)" aria-label={`Xem thiệp ${order.token}`}>
          <Icon name="open_in_new" className="text-[18px]" />
        </Link>
      )}
    </div>
  );
}

export default function OrdersView({ orders, loading, error, onRefresh, onResend, resendingToken, onCopyLink }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesFilter = filter === "all" || o.status === filter;
      const matchesQuery =
        !q ||
        o.token.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        (o.customerPhone ?? "").toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [orders, query, filter]);

  // Charms are bought separately at the counter; their money is whatever the total adds to the chain price.
  const charmText = (o: GiftProductView) => {
    const charmMoney = Math.max(0, (o.totalPrice || 0) - (o.chainPrice || 0));
    return charmMoney > 0 ? `Dây ${formatVnd(o.chainPrice)} + charm ${formatVnd(charmMoney)}` : `Dây ${formatVnd(o.chainPrice)}`;
  };

  return (
    <Card>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <label htmlFor="orders-search" className="sr-only">
            Tìm đơn hàng
          </label>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400" />
          <input
            id="orders-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm mã, tên, email, SĐT..."
            className={`${inputClass} pl-9`}
          />
        </div>

        <div className="flex items-center gap-2">
          <div role="group" aria-label="Lọc theo trạng thái" className="inline-flex rounded-lg border border-slate-300 p-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${focusRing} ${
                  filter === f.id ? "bg-primary-container text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={onRefresh} className={iconButton} title="Tải lại" aria-label="Tải lại danh sách">
            <Icon name="refresh" className={`text-[18px] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Body */}
      {error ? (
        <div role="alert" className="flex items-center justify-between gap-3 px-5 py-6 text-sm text-rose-700">
          <span>{error}</span>
          <button type="button" onClick={onRefresh} className="font-semibold underline">
            Thử lại
          </button>
        </div>
      ) : loading && orders.length === 0 ? (
        <Skeleton rows={5} />
      ) : orders.length === 0 ? (
        <EmptyState icon="receipt_long" title="Chưa có đơn hàng nào" hint="Các đơn tạo ở mục “Tạo đơn” sẽ hiện ở đây." />
      ) : visible.length === 0 ? (
        <EmptyState icon="search_off" title="Không có đơn phù hợp" hint="Thử đổi từ khóa hoặc bộ lọc." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">Mã</th>
                  <th scope="col" className="px-3 py-3">Khách hàng</th>
                  <th scope="col" className="px-3 py-3">Sản phẩm</th>
                  <th scope="col" className="px-3 py-3 text-right">Tổng tiền</th>
                  <th scope="col" className="px-3 py-3">Thiệp</th>
                  <th scope="col" className="px-5 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((o) => (
                  <tr key={o.id} className="align-top hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-800">{o.token}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="font-medium text-slate-900">{o.customerName}</p>
                      <p className="text-xs text-slate-500">{o.customerEmail}</p>
                      {o.customerPhone && <p className="text-xs text-slate-500">{o.customerPhone}</p>}
                    </td>
                    <td className="max-w-64 px-3 py-3.5">
                      <p className="text-slate-900">{o.chainName}</p>
                      <p className="line-clamp-2 text-xs text-slate-500">{charmText(o)}</p>
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <p className="font-semibold text-slate-900">{formatVnd(o.totalPrice)}</p>
                      <p className="text-xs text-slate-500">{o.paymentMethod === "transfer" ? "Chuyển khoản" : "Tiền mặt"}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge completed={o.status === "completed"} />
                    </td>
                    <td className="px-5 py-3.5">
                      <RowActions order={o} onResend={onResend} resendingToken={resendingToken} onCopyLink={onCopyLink} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-slate-100 md:hidden">
            {visible.map((o) => (
              <li key={o.id} className="space-y-2.5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-800">{o.token}</span>
                  <StatusBadge completed={o.status === "completed"} />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{o.customerName}</p>
                    <p className="truncate text-xs text-slate-500">{o.customerEmail}</p>
                  </div>
                  <p className="shrink-0 font-semibold text-slate-900">{formatVnd(o.totalPrice)}</p>
                </div>
                <p className="text-xs text-slate-500">
                  {o.chainName} · {charmText(o)}
                </p>
                <RowActions order={o} onResend={onResend} resendingToken={resendingToken} onCopyLink={onCopyLink} />
              </li>
            ))}
          </ul>

          <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Hiển thị {visible.length} / {orders.length} đơn
          </p>
        </>
      )}
    </Card>
  );
}
