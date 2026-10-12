"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { GiftProductView } from "@/types/gift-order";
import AdminLogin, { type AdminUser } from "@/components/admin/AdminLogin";
import AdminShell, { type AdminTab } from "@/components/admin/AdminShell";
import PosView, { type CreatedOrder } from "@/components/admin/PosView";
import OrdersView from "@/components/admin/OrdersView";
import ReportsView, { type AnalyticsStats } from "@/components/admin/ReportsView";
import { OrderCreatedDialog, ReissuedKeyDialog } from "@/components/admin/AdminDialogs";
import { adminFontStyle } from "@/components/admin/ui";

export default function AdminPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<AdminTab>("pos");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [orders, setOrders] = useState<GiftProductView[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  const [created, setCreated] = useState<CreatedOrder | null>(null);
  const [reissued, setReissued] = useState<{ token: string; creatorKey: string } | null>(null);
  const [resendingToken, setResendingToken] = useState<string | null>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }, []);

  /** Session expired or revoked: return to the login screen. */
  const handleExpired = useCallback(() => {
    setUser(null);
    notify("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }, [notify]);

  // Restore an existing session (httpOnly cookie) on first load.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/auth/me");
        const data = await res.json();
        if (data.success && data.user) setUser(data.user);
      } catch {
        // Stay on the login screen.
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const res = await fetch("/api/admin/products");
      if (res.status === 401) return handleExpired();
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.products)) throw new Error(data.error || "Không tải được danh sách đơn.");
      setOrders(data.products);
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : "Không tải được danh sách đơn.");
    } finally {
      setOrdersLoading(false);
    }
  }, [handleExpired]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError("");
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.status === 401) return handleExpired();
      const data = await res.json();
      if (!res.ok || !data.stats) throw new Error(data.error || "Không tải được báo cáo.");
      setStats(data.stats);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : "Không tải được báo cáo.");
    } finally {
      setStatsLoading(false);
    }
  }, [handleExpired]);

  // Keep the orders count in the sidebar fresh, and load the report when it is opened.
  useEffect(() => {
    if (!user) return;
    if (tab === "orders" || orders.length === 0) loadOrders();
    if (tab === "reports") loadStats();
  }, [user, tab]);

  const logout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // The local state is cleared either way.
    }
    setUser(null);
    setOrders([]);
    setStats(null);
    setTab("pos");
    notify("Đã đăng xuất.");
  };

  const resend = async (token: string) => {
    setResendingToken(token);
    try {
      const res = await fetch("/api/admin/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.status === 401) return handleExpired();
      const data = await res.json();
      if (data.creatorKey) setReissued({ token, creatorKey: data.creatorKey });
      if (data.success) {
        notify(
          data.simulated
            ? `Đã cấp lại mật khẩu cho ${token} (chế độ mô phỏng, chưa gửi email thật)`
            : `Đã cấp lại mật khẩu và gửi email cho ${token}`
        );
      } else if (!data.creatorKey) {
        notify(data.error || "Không gửi lại được email.");
      }
    } catch {
      notify("Lỗi kết nối khi gửi lại email.");
    } finally {
      setResendingToken(null);
    }
  };

  const copyLink = async (token: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/gift?tab=create&token=${token}`);
      notify("Đã copy link tạo thiệp.");
    } catch {
      notify("Không copy được. Hãy sao chép thủ công.");
    }
  };

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100" style={adminFontStyle}>
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" aria-label="Đang tải" />
      </main>
    );
  }

  if (!user) {
    return (
      <>
        <AdminLogin onLoggedIn={setUser} />
        {toast && (
          <div role="status" style={adminFontStyle} className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
            {toast}
          </div>
        )}
      </>
    );
  }

  return (
    <AdminShell
      tab={tab}
      onTab={setTab}
      user={user}
      onLogout={logout}
      orderCount={orders.length}
      toast={toast}
      onDismissToast={() => setToast(null)}
    >
      {tab === "pos" && (
        <PosView
          onCreated={(c) => {
            setCreated(c);
            loadOrders();
          }}
        />
      )}
      {tab === "orders" && (
        <OrdersView
          orders={orders}
          loading={ordersLoading}
          error={ordersError}
          onRefresh={loadOrders}
          onResend={resend}
          resendingToken={resendingToken}
          onCopyLink={copyLink}
        />
      )}
      {tab === "reports" && <ReportsView stats={stats} loading={statsLoading} error={statsError} onRetry={loadStats} />}

      {created && <OrderCreatedDialog created={created} onClose={() => setCreated(null)} />}
      {reissued && <ReissuedKeyDialog token={reissued.token} creatorKey={reissued.creatorKey} onClose={() => setReissued(null)} />}
    </AdminShell>
  );
}
