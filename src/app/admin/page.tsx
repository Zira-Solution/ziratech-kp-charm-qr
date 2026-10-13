"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { GiftProductView } from "@/types/gift-order";
import AdminLogin, { type AdminUser } from "@/components/admin/AdminLogin";
import AdminShell, { type AdminTab } from "@/components/admin/AdminShell";
import PosView, { type CreatedOrder } from "@/components/admin/PosView";
import OrdersView from "@/components/admin/OrdersView";
import ReportsView, { type AnalyticsStats } from "@/components/admin/ReportsView";
import ProductsView from "@/components/admin/ProductsView";
import type { StoredChain } from "@/lib/supabase/chains";
import { OrderCreatedDialog, ReissuedKeyDialog } from "@/components/admin/AdminDialogs";
import { ConfirmDialog, adminFontStyle, formatVnd } from "@/components/admin/ui";

export default function AdminPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<AdminTab>("pos");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [orders, setOrders] = useState<GiftProductView[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [trash, setTrash] = useState(false); // showing soft-deleted orders
  const [softDeleteReady, setSoftDeleteReady] = useState(true);
  const [activeCount, setActiveCount] = useState(0); // sidebar badge: active orders only
  const [busyToken, setBusyToken] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<GiftProductView | null>(null);

  const [chains, setChains] = useState<StoredChain[]>([]);
  const [chainsEditable, setChainsEditable] = useState(true);
  const [chainsLoading, setChainsLoading] = useState(false);
  const [chainsError, setChainsError] = useState("");

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
      const res = await fetch(`/api/admin/products${trash ? "?trash=1" : ""}`);
      if (res.status === 401) return handleExpired();
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.products)) throw new Error(data.error || "Không tải được danh sách đơn.");
      setOrders(data.products);
      setSoftDeleteReady(data.softDeleteReady !== false);
      if (!trash) setActiveCount(data.products.length);
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : "Không tải được danh sách đơn.");
    } finally {
      setOrdersLoading(false);
    }
  }, [handleExpired, trash]);

  const loadChains = useCallback(async () => {
    setChainsLoading(true);
    setChainsError("");
    try {
      const res = await fetch("/api/admin/chains");
      if (res.status === 401) return handleExpired();
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.chains)) throw new Error(data.error || "Không tải được danh sách dây vòng.");
      setChains(data.chains);
      setChainsEditable(data.editable !== false);
    } catch (err) {
      setChainsError(err instanceof Error ? err.message : "Không tải được danh sách dây vòng.");
    } finally {
      setChainsLoading(false);
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
    if (tab === "pos" || tab === "products" || chains.length === 0) loadChains();
    if (tab === "reports") loadStats();
  }, [user, tab, trash]);

  const logout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // The local state is cleared either way.
    }
    setUser(null);
    setOrders([]);
    setStats(null);
    setChains([]);
    setTrash(false);
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
            ? `Đã cấp lại OTP tạo thiệp cho ${token} (chế độ mô phỏng, chưa gửi email thật)`
            : `Đã cấp lại OTP tạo thiệp và gửi email cho ${token}`
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

  const setDeleted = async (token: string, deleted: boolean) => {
    setBusyToken(token);
    try {
      const res = await fetch(`/api/admin/orders/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted }),
      });
      if (res.status === 401) return handleExpired();
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Không cập nhật được đơn hàng.");
      notify(deleted ? `Đã chuyển đơn ${token} vào thùng rác.` : `Đã khôi phục đơn ${token}.`);
      await loadOrders();
      if (trash && !deleted) setActiveCount((n) => n + 1); // restored into the active list
    } catch (err) {
      notify(err instanceof Error ? err.message : "Không cập nhật được đơn hàng.");
    } finally {
      setBusyToken(null);
      setOrderToDelete(null);
    }
  };

  const copyLink = async (token: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/gift?token=${token}`);
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
      orderCount={activeCount}
      toast={toast}
      onDismissToast={() => setToast(null)}
    >
      {tab === "pos" && (
        <PosView
          chains={chains.filter((c) => c.active)}
          chainsLoading={chainsLoading}
          onGoProducts={() => setTab("products")}
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
          trash={trash}
          onToggleTrash={setTrash}
          softDeleteReady={softDeleteReady}
          busyToken={busyToken}
          onDelete={setOrderToDelete}
          onRestore={(token) => setDeleted(token, false)}
        />
      )}
      {tab === "products" && (
        <ProductsView
          chains={chains}
          editable={chainsEditable}
          loading={chainsLoading}
          error={chainsError}
          onChanged={loadChains}
          onNotify={notify}
          onExpired={handleExpired}
        />
      )}
      {tab === "reports" && <ReportsView stats={stats} loading={statsLoading} error={statsError} onRetry={loadStats} />}

      {orderToDelete && (
        <ConfirmDialog
          title="Xóa đơn hàng này?"
          confirmLabel="Chuyển vào thùng rác"
          busy={busyToken === orderToDelete.token}
          onConfirm={() => setDeleted(orderToDelete.token, true)}
          onCancel={() => setOrderToDelete(null)}
          message={
            <>
              <p>
                Đơn <strong>{orderToDelete.token}</strong> của <strong>{orderToDelete.customerName}</strong> (
                {formatVnd(orderToDelete.totalPrice)}) sẽ chuyển vào Thùng rác.
              </p>
              <p className="mt-2">
                Đơn không còn tính vào báo cáo và thiệp của đơn này tạm thời không mở được. Bạn có thể khôi phục lại bất cứ lúc nào.
              </p>
            </>
          }
        />
      )}

      {created && <OrderCreatedDialog created={created} onClose={() => setCreated(null)} />}
      {reissued && <ReissuedKeyDialog token={reissued.token} creatorKey={reissued.creatorKey} onClose={() => setReissued(null)} />}
    </AdminShell>
  );
}
