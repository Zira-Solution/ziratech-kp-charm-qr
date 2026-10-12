"use client";

import React from "react";
import Link from "next/link";
import { Icon, adminFontStyle, focusRing } from "./ui";
import type { AdminUser } from "./AdminLogin";

export type AdminTab = "pos" | "orders" | "products" | "reports";

const NAV: Array<{ id: AdminTab; label: string; title: string; icon: string }> = [
  { id: "pos", label: "Tạo đơn", title: "Tạo đơn tại quầy", icon: "add_shopping_cart" },
  { id: "orders", label: "Đơn hàng", title: "Danh sách đơn hàng", icon: "receipt_long" },
  { id: "products", label: "Sản phẩm", title: "Dây vòng đang bán", icon: "diamond" },
  { id: "reports", label: "Báo cáo", title: "Báo cáo doanh thu", icon: "bar_chart" },
];

interface Props {
  tab: AdminTab;
  onTab: (tab: AdminTab) => void;
  user: AdminUser;
  onLogout: () => void;
  orderCount: number;
  toast: string | null;
  onDismissToast: () => void;
  children: React.ReactNode;
}

export default function AdminShell({ tab, onTab, user, onLogout, orderCount, toast, onDismissToast, children }: Props) {
  const current = NAV.find((n) => n.id === tab)!;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900" style={adminFontStyle}>
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-primary text-white lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <Icon name="storefront" className="text-[22px]" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">K&amp;P Atelier</p>
            <p className="text-xs text-white/60">Quản trị quầy 20/10</p>
          </div>
        </div>

        <nav aria-label="Điều hướng chính" className="flex-1 space-y-1 px-3 py-2">
          {NAV.map((item) => {
            const active = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTab(item.id)}
                aria-current={active ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${focusRing} ${
                  active ? "bg-white text-primary" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon name={item.icon} className="text-[20px]" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === "orders" && orderCount > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-primary/10 text-primary" : "bg-white/15 text-white"}`}
                  >
                    {orderCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-white/10 px-3 py-4">
          <Link
            href="/"
            target="_blank"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white ${focusRing}`}
          >
            <Icon name="public" className="text-[18px]" />
            Trang khách hàng
          </Link>
          <Link
            href="/gift"
            target="_blank"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white ${focusRing}`}
          >
            <Icon name="key" className="text-[18px]" />
            Cổng nhập mã
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white lg:hidden">
              <Icon name="storefront" className="text-[20px]" />
            </span>
            <h1 className="text-lg font-semibold text-slate-900">{current.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="max-w-56 truncate text-sm font-medium text-slate-800">{user.email}</p>
              <p className="text-xs text-slate-500">Quản trị viên</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 ${focusRing}`}
            >
              <Icon name="logout" className="text-[18px]" />
              <span className="hidden sm:inline">Đăng xuất</span>
              <span className="sr-only sm:hidden">Đăng xuất</span>
            </button>
          </div>
        </header>

        <main className="px-4 py-6 pb-24 sm:px-6 lg:pb-8">{children}</main>
      </div>

      {/* Bottom tabs (mobile) */}
      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white lg:hidden"
      >
        {NAV.map((item) => {
          const active = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTab(item.id)}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${focusRing} ${
                active ? "text-primary-container" : "text-slate-500"
              }`}
            >
              <Icon name={item.icon} className="text-[22px]" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 z-40 flex max-w-[92vw] -translate-x-1/2 items-center gap-3 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg lg:bottom-6"
        >
          <span>{toast}</span>
          <button type="button" onClick={onDismissToast} aria-label="Đóng thông báo" className="text-white/70 hover:text-white">
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      )}
    </div>
  );
}
