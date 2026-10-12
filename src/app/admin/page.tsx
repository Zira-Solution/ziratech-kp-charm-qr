"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { GiftProductView, CharmOrderItem, IssuedCodes } from "@/types/gift-order";
import { AdminUser, StaffRole } from "@/types/admin-auth";

// Available Chains
const CHAINS = [
  {
    id: "silver",
    name: "Bạc Ý S925 Thanh Mảnh",
    price: 45000,
    color: "#DCC0C0",
    desc: "Sáng bóng, tinh xảo, thanh lịch",
  },
  {
    id: "rose",
    name: "Vàng Hồng 14K Ấm Áp",
    price: 49000,
    color: "#FEA095",
    desc: "Ngọt ngào, tôn da phái đẹp",
  },
  {
    id: "pearl",
    name: "Ngọc Trai Nước Ngọt Mini",
    price: 55000,
    color: "#FAF0ED",
    desc: "Dịu dàng, quý phái, tự nhiên",
  },
  {
    id: "cord",
    name: "Dây Dù Kỷ Niệm Bền Bỉ",
    price: 35000,
    color: "#897172",
    desc: "Trẻ trung, cá tính sinh viên",
  },
];

// Available Charms
const CHARMS = [
  { id: "c1", name: "Trái Tim Ánh Hồng", price: 12000, icon: "favorite", meaning: "Tình yêu chân thành" },
  { id: "c2", name: "Hướng Dương Rạng Rỡ", price: 10000, icon: "sunny", meaning: "Năng lượng tích cực" },
  { id: "c3", name: "Ngôi Sao Tri Kỷ", price: 10000, icon: "hotel_class", meaning: "Đồng hành qua thử thách" },
  { id: "c4", name: "Ly Trà Sữa Deadline", price: 8000, icon: "local_cafe", meaning: "Kỷ niệm ôn thi FPT" },
  { id: "c5", name: "Cỏ Bốn Lá May Mắn", price: 10000, icon: "potted_plant", meaning: "Bình an & may mắn" },
  { id: "c6", name: "Trang Sách Tri Ân", price: 10000, icon: "auto_stories", meaning: "Biết ơn Thầy Cô" },
  { id: "c7", name: "Bàn Chân Cún Cứu Hộ", price: 12000, icon: "pets", meaning: "Gây quỹ Sân Nhà Nhiều Chó" },
  { id: "c8", name: "Chữ Cái Khắc Tên Nàng", price: 10000, icon: "draw", meaning: "Dấu ấn cá nhân độc bản" },
];

export default function AdminCounterPosPage() {
  // Authentication & RBAC State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [sessionToken, setSessionToken] = useState<string>("");
  const [authIdentifier, setAuthIdentifier] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isCheckingInitialAuth, setIsCheckingInitialAuth] = useState<boolean>(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"pos" | "orders" | "analytics" | "rbac">("pos");

  // POS Form State
  const [selectedChain, setSelectedChain] = useState(CHAINS[0]);
  const [selectedCharms, setSelectedCharms] = useState<CharmOrderItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("transfer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Success Modal State
  const [createdOrder, setCreatedOrder] = useState<GiftProductView | null>(null);
  const [issuedCodes, setIssuedCodes] = useState<IssuedCodes | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reissuedKey, setReissuedKey] = useState<{ token: string; creatorKey: string } | null>(null);
  const [copiedReissued, setCopiedReissued] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Orders List State
  const [orders, setOrders] = useState<GiftProductView[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [resendingToken, setResendingToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Analytics State
  const [analyticsStats, setAnalyticsStats] = useState<{
    totalOrders: number;
    totalRevenue: number;
    cashRevenue: number;
    transferRevenue: number;
    pendingCount: number;
    completedCount: number;
    topCharms: Array<{ id: string; name: string; count: number; icon: string }>;
  } | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    async function checkCurrentSession() {
      setIsCheckingInitialAuth(true);
      try {
        const savedToken = sessionStorage.getItem("kp_admin_token");
        const res = await fetch("/api/admin/auth/me", {
          headers: savedToken ? { "x-admin-token": savedToken } : {},
        });
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          if (savedToken) setSessionToken(savedToken);
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setIsCheckingInitialAuth(false);
      }
    }
    checkCurrentSession();
  }, []);

  // Fetch orders when tab is orders
  const fetchOrders = async () => {
    if (!currentUser) return;
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/admin/products", {
        headers: sessionToken ? { "x-admin-token": sessionToken } : {},
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setOrders(data.products);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách đơn:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    if (!currentUser || !currentUser.permissions.canViewAnalytics) return;
    setLoadingAnalytics(true);
    try {
      const res = await fetch("/api/admin/analytics", {
        headers: sessionToken ? { "x-admin-token": sessionToken } : {},
      });
      const data = await res.json();
      if (data.success && data.stats) {
        setAnalyticsStats(data.stats);
      }
    } catch (err) {
      console.error("Lỗi lấy thống kê:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      if (activeTab === "orders") {
        fetchOrders();
      } else if (activeTab === "analytics") {
        fetchAnalytics();
      }
    }
  }, [activeTab, currentUser]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const id = authIdentifier.trim();
    const pass = authPassword.trim();
    if (!id || !pass) {
      setAuthError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: id, password: pass }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        if (data.token) {
          setSessionToken(data.token);
          sessionStorage.setItem("kp_admin_token", data.token);
        }
        setAuthError("");
        setNotification(`Đăng nhập thành công! Xin chào ${data.user.name} (${data.user.roleTitle})`);
        setTimeout(() => setNotification(null), 4000);
      } else {
        setAuthError(data.error || "Tài khoản hoặc mật khẩu không đúng.");
      }
    } catch {
      setAuthError("Lỗi kết nối khi gửi yêu cầu đăng nhập.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Quick Preset Credential Fill (Dành cho kiểm thử bàn giao nhanh)
  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout request error:", e);
    }
    sessionStorage.removeItem("kp_admin_token");
    setCurrentUser(null);
    setSessionToken("");
    setAuthIdentifier("");
    setAuthPassword("");
    setNotification("Đã đăng xuất khỏi phiên làm việc POS an toàn.");
    setTimeout(() => setNotification(null), 3000);
  };

  // Calculate Total Price
  const charmsPrice = selectedCharms.reduce((sum, c) => sum + c.price, 0);
  const totalPrice = selectedChain.price + charmsPrice;

  // Add Charm
  const handleAddCharm = (charm: (typeof CHARMS)[0]) => {
    if (!currentUser?.permissions.canCreateOrder) {
      alert("Tài khoản của bạn không có phân quyền tạo/thêm đơn hàng tại quầy POS!");
      return;
    }
    if (selectedCharms.length >= 7) {
      alert("Mỗi vòng gắn tối đa 7 hạt charm để đảm bảo thẩm mỹ.");
      return;
    }
    setSelectedCharms((prev) => [
      ...prev,
      { id: charm.id, name: charm.name, price: charm.price, icon: charm.icon },
    ]);
  };

  // Remove Charm
  const handleRemoveCharm = (index: number) => {
    setSelectedCharms((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Create Product & Issue Token to Email
  const handleCreateProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    // RBAC Check on Client
    if (!currentUser?.permissions.canCreateOrder) {
      setErrorMessage(
        `Từ chối thao tác: Vai trò của bạn là "${currentUser?.roleTitle}". Bạn không có quyền thêm mới đơn hàng POS!`
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage("Vui lòng nhập họ tên khách hàng mua tại quầy.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      setErrorMessage("Vui lòng nhập địa chỉ Gmail hợp lệ để gửi mã định danh.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/create-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { "x-admin-token": sessionToken } : {}),
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim() || undefined,
          chainId: selectedChain.id,
          chainName: selectedChain.name,
          chainPrice: selectedChain.price,
          charms: selectedCharms,
          totalPrice,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể tạo sản phẩm");
      }

      setCreatedOrder(data.product);
      setIssuedCodes(data.issuedCodes ?? null);
      setShowSuccessModal(true);

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#721a28", "#ffd700", "#fea095", "#ffffff"],
      });

      // Reset form
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setSelectedCharms([]);
    } catch (err: any) {
      setErrorMessage(err.message || "Đã xảy ra lỗi khi tạo sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend Email
  const handleResendEmail = async (token: string) => {
    if (!currentUser?.permissions.canResendEmail) {
      alert("Tài khoản của bạn không có quyền gửi lại email!");
      return;
    }
    setResendingToken(token);
    try {
      const res = await fetch("/api/admin/resend-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { "x-admin-token": sessionToken } : {}),
        },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.creatorKey) {
        // Email was not actually delivered: show the new key once so staff can hand it over.
        setReissuedKey({ token, creatorKey: data.creatorKey });
        setCopiedReissued(false);
      }
      if (data.success) {
        setNotification(data.simulated ? `✓ Đã cấp lại mật khẩu tạo thiệp cho mã ${token} (chế độ mô phỏng, chưa gửi email thật)` : `✓ Đã cấp lại mật khẩu tạo thiệp & gửi email cho mã ${token}`);
        setTimeout(() => setNotification(null), 4000);
      } else if (!data.creatorKey) {
        alert(data.error || "Lỗi gửi lại email");
      }
    } catch {
      alert("Lỗi kết nối khi gửi lại email");
    } finally {
      setResendingToken(null);
    }
  };

  const copyToClipboard = (text: string, type: "token" | "link") => {
    navigator.clipboard.writeText(text);
    if (type === "token") {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get Role Badge Color
  const getRoleBadge = (role: StaffRole) => {
    switch (role) {
      case "admin":
        return {
          bg: "bg-amber-100 text-amber-900 border-amber-300",
          icon: "👑",
          label: "Quản Trị Viên (Admin Lead)",
        };
      case "cashier":
        return {
          bg: "bg-emerald-100 text-emerald-900 border-emerald-300",
          icon: "💳",
          label: "Nhân Viên Thu Ngân POS",
        };
      case "viewer":
        return {
          bg: "bg-sky-100 text-sky-900 border-sky-300",
          icon: "👁️",
          label: "Kiểm Toán / Chỉ Xem (No Add)",
        };
    }
  };

  // =========================================================
  // 1. INITIAL LOADING SCREEN
  // =========================================================
  if (isCheckingInitialAuth) {
    return (
      <div className="min-h-screen bg-linear-to-b from-rose-cream via-blush-light to-surface-container flex flex-col items-center justify-center p-4 font-serif">
        <div className="w-12 h-12 rounded-2xl bg-primary text-amber-300 flex items-center justify-center animate-bounce mb-3 shadow-lg">
          <span className="material-symbols-outlined text-2xl">point_of_sale</span>
        </div>
        <p className="text-sm font-sans font-bold text-primary">Đang khởi tạo cổng quản trị POS...</p>
      </div>
    );
  }

  // =========================================================
  // 2. AUTHENTICATION & LOGIN GATE (ĐĂNG NHẬP & PHÂN QUYỀN)
  // =========================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-linear-to-b from-rose-cream via-blush-light to-surface-container flex flex-col items-center justify-center p-4 sm:p-6 font-serif">
        <div className="w-full max-w-lg p-6 sm:p-10 rounded-4xl liquid-glass bg-white/95 border-2 border-white/90 shadow-2xl text-center relative overflow-hidden">
          
          {/* Decorative Corner Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-gold/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-primary-container/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top Logo Icon */}
          <div className="w-16 h-16 rounded-2xl bg-primary text-amber-300 flex items-center justify-center mx-auto mb-4 shadow-xl border border-white/80">
            <span className="material-symbols-outlined text-[32px]">shield_person</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill text-primary text-[11px] font-bold shadow-xs mb-2 border border-white/95">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>K&amp;P ATELIER • CỔNG QUẢN TRỊ &amp; POS</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-primary">
            Đăng Nhập Quầy Bán Hàng
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant font-sans mt-2 mb-6 leading-relaxed">
            Hệ thống phân quyền nội bộ dành cho Quản trị viên và Nhân viên trực quầy 20/10. Vui lòng xác thực tài khoản để truy cập chức năng tạo đơn.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-100 text-rose-800 text-xs font-sans font-bold border border-rose-300 shadow-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-lg shrink-0 text-rose-700">warning</span>
                <span>{authError}</span>
              </div>
            )}

            {/* Field 1: Identifier */}
            <div>
              <label className="block text-xs font-sans font-bold text-primary mb-1.5">
                TÀI KHOẢN HOẶC GMAIL NHÂN VIÊN:
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-lg text-secondary">
                  badge
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: admin hoặc cashier1"
                  value={authIdentifier}
                  onChange={(e) => setAuthIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl liquid-glass-input font-sans font-bold text-sm text-primary border border-white/90 focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                  autoFocus
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div>
              <label className="block text-xs font-sans font-bold text-primary mb-1.5">
                MẬT KHẨU BẢO MẬT:
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-lg text-secondary">
                  key
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Nhập mật khẩu..."
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl liquid-glass-input font-mono font-bold text-sm text-primary border border-white/90 focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-secondary hover:text-primary p-0.5 cursor-pointer"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl liquid-glass-btn-primary text-white font-serif font-bold text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
            >
              {isLoggingIn ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang Kiểm Tra Phân Quyền...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg text-amber-300">lock_open</span>
                  <span>ĐĂNG NHẬP VÀO HỆ THỐNG POS</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-3 border-t border-white/60 text-center">
            <Link
              href="/"
              className="text-xs font-sans text-warm-neutral hover:text-primary inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Quay lại trang chủ khách hàng</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // 3. LOGGED-IN ADMIN PORTAL
  // =========================================================
  const badge = getRoleBadge(currentUser.role);
  const canAddOrder = currentUser.permissions.canCreateOrder;

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-cream via-blush-light to-surface-container py-6 sm:py-10 px-3 sm:px-6 lg:px-8 pb-28 lg:pb-12 font-serif">
      <div className="max-w-340 mx-auto">
        
        {/* ========================================================= */}
        {/* TOP BAR: USER INFO & SHIFT STATUS */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 mb-6 border-b border-white/80 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill text-primary text-[11px] font-bold shadow-xs border border-white/95">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>HỆ THỐNG POS QUẦY • K&amp;P ATELIER 20/10</span>
              </div>

              {/* Active User Badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-xs ${badge.bg}`}>
                <span>{badge.icon}</span>
                <span>{currentUser.name}</span>
                <span>•</span>
                <span>{currentUser.roleTitle}</span>
              </div>

              {/* Order Creation Permission Indicator */}
              {canAddOrder ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                  <span>Quyền Add Đơn: Cho Phép</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                  <span className="material-symbols-outlined text-[13px]">block</span>
                  <span>Quyền Add Đơn: Bị Khóa</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-primary tracking-tight">
              Bàn Làm Việc Nhân Viên Quầy Bán Hàng
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-sans">
              Tạo sản phẩm vòng charm vật lý đã bán tại booth, sinh mã định danh và cấp mã về Gmail cho khách tự tay tạo thiệp số.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-3 sm:px-4 py-2 rounded-xl liquid-glass-pill text-primary text-xs font-bold border border-white/80 hover:bg-white flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-base">visibility</span>
              <span className="hidden sm:inline">Trang Khách</span>
            </Link>

            <Link
              href="/claim"
              target="_blank"
              className="px-3 sm:px-4 py-2 rounded-xl liquid-glass-btn-secondary text-primary text-xs font-bold border border-white/90 hover:bg-white flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-base">key</span>
              <span>Trang Nhập Mã</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 rounded-xl liquid-glass-pill text-rose-700 hover:bg-rose-50 text-xs font-bold border border-rose-200 flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              title="Đăng xuất khỏi hệ thống"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {notification && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-800 text-white text-xs font-sans font-bold flex items-center justify-between shadow-lg animate-in fade-in">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* ========================================================= */}
        {/* NAVIGATION TABS */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8 overflow-x-auto pb-1">
          {/* TAB 1: POS COUNTER */}
          <button
            onClick={() => setActiveTab("pos")}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "pos"
                ? "liquid-glass-btn-primary text-white shadow-md scale-[1.02]"
                : "liquid-glass-pill text-primary border border-white/80 hover:bg-white"
            }`}
          >
            <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
            <span>Bàn POS (Tạo Đơn Quầy)</span>
            {!canAddOrder && (
              <span className="px-1.5 py-0.5 rounded-md bg-rose-200 text-rose-900 text-[9px] font-sans font-bold">
                Khóa Add
              </span>
            )}
          </button>

          {/* TAB 2: ORDERS LIST */}
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "orders"
                ? "liquid-glass-btn-primary text-white shadow-md scale-[1.02]"
                : "liquid-glass-pill text-primary border border-white/80 hover:bg-white"
            }`}
          >
            <span className="material-symbols-outlined text-lg">list_alt</span>
            <span>Danh Sách Đơn Quầy</span>
            {orders.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px]">
                {orders.length}
              </span>
            )}
          </button>

          {/* TAB 3: ANALYTICS (Dành cho Admin & Viewer) */}
          {currentUser.permissions.canViewAnalytics && (
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "analytics"
                  ? "liquid-glass-btn-primary text-white shadow-md scale-[1.02]"
                  : "liquid-glass-pill text-primary border border-white/80 hover:bg-white"
              }`}
            >
              <span className="material-symbols-outlined text-lg">analytics</span>
              <span>Báo Cáo &amp; Doanh Thu</span>
            </button>
          )}

          {/* TAB 4: RBAC PERMISSIONS MATRIX */}
          <button
            onClick={() => setActiveTab("rbac")}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "rbac"
                ? "liquid-glass-btn-primary text-white shadow-md scale-[1.02]"
                : "liquid-glass-pill text-primary border border-white/80 hover:bg-white"
            }`}
          >
            <span className="material-symbols-outlined text-lg">security</span>
            <span>Ma Trận Phân Quyền</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: POS FAST COUNTER FORM */}
        {/* ========================================================= */}
        {activeTab === "pos" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* LEFT: Product Configuration Form (8 cols) */}
            <form onSubmit={handleCreateProduct} className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Permission Restriction Notice if user cannot add */}
              {!canAddOrder && (
                <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-900 shadow-md">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[28px] text-rose-700 shrink-0">
                      lock_person
                    </span>
                    <div>
                      <h4 className="font-serif text-base font-bold text-rose-900">
                        KHÓA QUYỀN TẠO ĐƠN THEO PHÂN QUYỀN HỆ THỐNG (RBAC)
                      </h4>
                      <p className="text-xs font-sans text-rose-800 mt-1 leading-relaxed">
                        Tài khoản hiện tại của bạn là <strong>{currentUser.name}</strong> mang vai trò <strong>{currentUser.roleTitle}</strong>. 
                        Theo chính sách bảo mật, vai trò này <strong>KHÔNG CÓ QUYỀN THÊM/TẠO ĐƠN HÀNG MỚI</strong> tại quầy POS.
                        Chỉ <strong>Quản Trị Viên (Admin)</strong> hoặc <strong>Nhân Viên Thu Ngân (Cashier)</strong> mới được cấp quyền tạo đơn.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-100 text-rose-800 text-xs font-sans font-bold border border-rose-300 shadow-xs">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* STEP 1: Choose Chain */}
              <div className={`p-4 sm:p-6 rounded-3xl liquid-glass border border-white/90 shadow-sm ${!canAddOrder ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-primary text-amber-300 text-xs font-bold flex items-center justify-center">1</span>
                    <h3 className="font-serif text-base font-bold text-primary">
                      Chọn Loại Dây Vòng Khách Mua
                    </h3>
                  </div>
                  <span className="text-xs text-secondary font-sans">Chọn 1 loại</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CHAINS.map((chain) => {
                    const isSelected = selectedChain.id === chain.id;
                    return (
                      <div
                        key={chain.id}
                        onClick={() => canAddOrder && setSelectedChain(chain)}
                        className={`p-3.5 rounded-2xl transition-all border min-h-16 flex flex-col justify-between ${
                          canAddOrder ? "cursor-pointer" : "cursor-not-allowed"
                        } ${
                          isSelected
                            ? "liquid-glass bg-white/95 border-amber-400 ring-2 ring-primary-container/20 shadow-md"
                            : "liquid-glass-card hover:bg-white/80 border-white/70"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-sm font-bold text-primary">
                            {chain.name}
                          </span>
                          <span className="font-mono text-xs font-bold text-primary-container">
                            {chain.price.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-sans mt-1">
                          {chain.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: Add Charms */}
              <div className={`p-4 sm:p-6 rounded-3xl liquid-glass border border-white/90 shadow-sm ${!canAddOrder ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-secondary text-amber-300 text-xs font-bold flex items-center justify-center">2</span>
                    <h3 className="font-serif text-base font-bold text-primary">
                      Chọn Các Hạt Charm Đính Kèm
                    </h3>
                  </div>
                  <span className="text-xs font-sans text-primary-container font-semibold">
                    Đã chọn: {selectedCharms.length} / 7 hạt
                  </span>
                </div>

                {/* Selected Charms Tray */}
                {selectedCharms.length > 0 ? (
                  <div className="mb-4 p-3.5 rounded-2xl bg-white/80 border border-white/90 flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-sans font-bold text-primary mr-1">Vòng gồm:</span>
                    {selectedCharms.map((charm, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-sans shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[13px] text-amber-300">{charm.icon}</span>
                        <span>{charm.name}</span>
                        {canAddOrder && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCharm(idx)}
                            className="ml-1 text-white/70 hover:text-white cursor-pointer font-bold p-0.5"
                            title="Xóa charm này"
                          >
                            ✕
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4 p-3 rounded-xl bg-white/50 text-xs font-sans text-warm-neutral italic text-center">
                    Chưa chọn hạt charm nào (bấm vào các hạt bên dưới để thêm vào vòng)
                  </div>
                )}

                {/* Available Charms Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CHARMS.map((charm) => (
                    <button
                      type="button"
                      key={charm.id}
                      onClick={() => handleAddCharm(charm)}
                      disabled={!canAddOrder}
                      className={`p-3.5 rounded-2xl liquid-glass-card text-left transition-all border border-white/80 group flex flex-col justify-between min-h-20.5 ${
                        canAddOrder
                          ? "hover:bg-white cursor-pointer active:scale-[0.97]"
                          : "opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="material-symbols-outlined text-xl text-secondary group-hover:scale-110 transition-transform">
                          {charm.icon}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-primary-container">
                          +{charm.price.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <span className="text-xs font-serif font-bold text-primary block line-clamp-1">
                        {charm.name}
                      </span>
                      <span className="text-[10px] font-sans text-warm-neutral block line-clamp-1 mt-0.5">
                        {charm.meaning}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 3: Customer Information */}
              <div className={`p-4 sm:p-6 rounded-3xl liquid-glass border border-white/90 shadow-sm ${!canAddOrder ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-lg bg-primary-container text-amber-300 text-xs font-bold flex items-center justify-center">3</span>
                  <h3 className="font-serif text-base font-bold text-primary">
                    Thông Tin Khách Hàng (Nhận Mã Định Danh Qua Gmail)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans font-bold text-primary mb-1.5">
                      Họ và Tên Khách Hàng <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!canAddOrder}
                      placeholder="Ví dụ: Nguyễn Thu Hà"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-base sm:text-xs font-sans font-medium text-espresso border border-white/90 focus:outline-none focus:ring-2 focus:ring-primary-container/30 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-primary mb-1.5">
                      Địa Chỉ Gmail Khách Nhận Mã <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      disabled={!canAddOrder}
                      placeholder="Ví dụ: thuha.fpt@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-base sm:text-xs font-sans font-medium text-espresso border border-white/90 focus:outline-none focus:ring-2 focus:ring-primary-container/30 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-primary mb-1.5">
                      Số Điện Thoại Khách (Tùy chọn)
                    </label>
                    <input
                      type="tel"
                      disabled={!canAddOrder}
                      placeholder="Ví dụ: 0912 345 678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-base sm:text-xs font-sans font-medium text-espresso border border-white/90 focus:outline-none focus:ring-2 focus:ring-primary-container/30 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-primary mb-1.5">
                      Phương Thức Thanh Toán Tại Quầy
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={!canAddOrder}
                        onClick={() => setPaymentMethod("transfer")}
                        className={`py-2 px-3 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-all border min-h-11 ${
                          paymentMethod === "transfer"
                            ? "liquid-glass-btn-primary text-white border-white/60 shadow-xs"
                            : "liquid-glass-pill text-primary border-white/80 hover:bg-white"
                        } ${!canAddOrder ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                      >
                        <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                        <span>CK Ngân Hàng QR</span>
                      </button>

                      <button
                        type="button"
                        disabled={!canAddOrder}
                        onClick={() => setPaymentMethod("cash")}
                        className={`py-2 px-3 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-all border min-h-11 ${
                          paymentMethod === "cash"
                            ? "liquid-glass-btn-primary text-white border-white/60 shadow-xs"
                            : "liquid-glass-pill text-primary border-white/80 hover:bg-white"
                        } ${!canAddOrder ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                      >
                        <span className="material-symbols-outlined text-base">payments</span>
                        <span>Tiền Mặt</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* DESKTOP SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting || !canAddOrder}
                className="hidden lg:flex w-full py-4 rounded-2xl liquid-glass-btn-primary text-white font-serif font-bold text-sm sm:text-base shadow-xl items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transform hover:scale-[1.01] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang Tạo Sản Phẩm &amp; Gửi Email...</span>
                  </>
                ) : !canAddOrder ? (
                  <>
                    <span className="material-symbols-outlined text-xl text-rose-300">lock</span>
                    <span>BỊ KHÓA QUYỀN TẠO ĐƠN (CHỈ DÀNH CHO ADMIN &amp; THU NGÂN)</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl text-amber-300">send</span>
                    <span>TẠO SẢN PHẨM &amp; CẤP MÃ ĐỊNH DANH VỀ GMAIL KHÁCH HÀNG</span>
                  </>
                )}
              </button>

            </form>

            {/* RIGHT: Live POS Counter Receipt Summary (4 cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-8 flex flex-col gap-4">
              <div className="p-4 sm:p-6 rounded-3xl liquid-glass border-2 border-white/95 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-white/80">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-secondary">receipt_long</span>
                    <h3 className="font-serif text-sm font-bold text-primary">
                      Hóa Đơn Tại Quầy
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Trực Tiếp
                  </span>
                </div>

                {/* Items Breakdown */}
                <div className="py-4 space-y-2.5 text-xs font-sans">
                  <div className="flex justify-between items-center text-espresso">
                    <span>{selectedChain.name}</span>
                    <span className="font-mono font-bold text-primary">
                      {selectedChain.price.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  {selectedCharms.length > 0 && (
                    <div className="pl-2 border-l-2 border-secondary/30 space-y-1.5 my-2">
                      {selectedCharms.map((c, i) => (
                        <div key={i} className="flex justify-between text-on-surface-variant text-[11px]">
                          <span>+ {c.name}</span>
                          <span className="font-mono">{c.price.toLocaleString("vi-VN")}đ</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-primary-container pt-2 border-t border-white/80">
                    <span className="flex items-center gap-1 font-semibold">
                      <span>✨ Thiệp Kỷ Niệm 20/10</span>
                    </span>
                    <span className="font-bold text-emerald-700 uppercase text-[11px]">Tặng Kèm 0đ</span>
                  </div>
                  <div className="flex justify-between items-center text-primary-container">
                    <span className="flex items-center gap-1 font-semibold">
                      <span>🎫 Thẻ Nhung Khắc QR Ép Kim</span>
                    </span>
                    <span className="font-bold text-emerald-700 uppercase text-[11px]">Tặng Kèm 0đ</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-3 border-t-2 border-primary/20 flex items-baseline justify-between">
                  <span className="font-serif font-bold text-sm text-primary">TỔNG THU:</span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-primary-container">
                    {totalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                {/* Cashier Audit Footnote */}
                <div className="mt-4 p-3 rounded-2xl bg-white/70 border border-white/90 text-[11px] font-sans text-on-surface-variant space-y-1">
                  <div className="flex items-center gap-1 font-bold text-primary">
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    <span>Nhân viên ca trực:</span>
                  </div>
                  <div className="text-espresso font-medium">
                    {currentUser.name} ({currentUser.roleTitle})
                  </div>
                </div>

                {/* Explanation Box */}
                <div className="mt-3 p-3 rounded-2xl bg-surface-container-low border border-rose-petal text-[11px] font-sans text-warm-neutral leading-relaxed">
                  💡 <strong>Quy trình:</strong> Hệ thống tự động sinh mã <strong>KP-2010-XXXX</strong> và gửi email cho khách. Khách có thể mở Gmail hoặc vào web nhập mã để tự tay thiết kế thiệp!
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ORDERS LIST AT COUNTER */}
        {/* ========================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <div className="p-4 rounded-3xl liquid-glass border border-white/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-lg text-warm-neutral">search</span>
                <input
                  type="text"
                  placeholder="Tìm mã KP, tên, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl liquid-glass-input text-base sm:text-xs font-sans text-espresso border border-white/90 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
                <span className="text-xs font-sans text-primary font-bold shrink-0">Lọc:</span>
                {(["all", "pending", "completed"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      statusFilter === filter
                        ? "liquid-glass-btn-primary text-white shadow-xs"
                        : "liquid-glass-pill text-primary border border-white/80 hover:bg-white"
                    }`}
                  >
                    {filter === "all" ? "Tất Cả" : filter === "pending" ? "🟡 Chờ Soạn" : "🟢 Đã Xong"}
                  </button>
                ))}

                <button
                  onClick={fetchOrders}
                  className="p-2 rounded-xl liquid-glass-pill text-primary border border-white/80 hover:bg-white cursor-pointer ml-auto sm:ml-1 shrink-0"
                  title="Tải lại danh sách"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                </button>
              </div>
            </div>

            {/* Orders Container */}
            <div className="rounded-3xl liquid-glass border border-white/90 shadow-md overflow-hidden">
              {loadingOrders ? (
                <div className="p-12 text-center text-xs font-sans text-warm-neutral">
                  <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block mb-2" />
                  <p>Đang tải danh sách đơn hàng tại quầy...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-xs font-sans text-warm-neutral">
                  Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                </div>
              ) : (
                <>
                  {/* MOBILE CARDS VIEW */}
                  <div className="block md:hidden divide-y divide-white/80">
                    {filteredOrders.map((order) => {
                      const isCompleted = order.status === "completed";
                      const activationUrl = typeof window !== "undefined"
                        ? `${window.location.origin}/create/${order.token}`
                        : `/create/${order.token}`;

                      return (
                        <div key={order.id} className="p-4 space-y-3 bg-white/40">
                          {/* Top Row: Token & Status */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-primary bg-surface-container px-2.5 py-1 rounded-lg border border-rose-petal text-xs">
                              {order.token}
                            </span>
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                ✓ Đã xong thiệp
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                🟡 Chờ khách soạn
                              </span>
                            )}
                          </div>

                          {/* Customer & Product details */}
                          <div className="space-y-1 text-xs font-sans">
                            <div className="flex items-baseline justify-between">
                              <span className="font-bold text-espresso text-sm">{order.customerName}</span>
                              <span className="font-mono font-bold text-primary-container text-sm">
                                {order.totalPrice?.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                            <div className="text-warm-neutral text-[11px]">{order.customerEmail}</div>
                            <div className="text-on-surface-variant font-serif text-[11px]">
                              {order.chainName} • {order.charms?.length || 0} charm ({order.charms?.map((c) => c.name).join(", ") || "Không"})
                            </div>
                          </div>

                          {/* Mobile Action Buttons */}
                          <div className="pt-2 border-t border-white/60 flex items-center justify-between gap-2">
                            <button
                              onClick={() => copyToClipboard(activationUrl, "link")}
                              className="px-3 py-1.5 rounded-xl liquid-glass-pill hover:bg-white text-primary text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px]">content_copy</span>
                              <span>Copy link</span>
                            </button>

                            {currentUser.permissions.canResendEmail && (
                              <button
                                onClick={() => handleResendEmail(order.token)}
                                disabled={resendingToken === order.token}
                                className="px-3 py-1.5 rounded-xl liquid-glass-pill hover:bg-white text-primary text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                              >
                                <span className="material-symbols-outlined text-[15px]">mail</span>
                                <span>Gửi lại</span>
                              </button>
                            )}

                            <Link
                              href={`/create/${order.token}`}
                              target="_blank"
                              className="px-3 py-1.5 rounded-xl liquid-glass-btn-secondary text-primary text-[11px] font-bold flex items-center gap-1 ml-auto"
                            >
                              <span>Soạn</span>
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </Link>

                            {isCompleted && (
                              <Link
                                href={`/g/${order.token}`}
                                target="_blank"
                                className="px-3 py-1.5 rounded-xl liquid-glass-btn-primary text-white text-[11px] font-bold flex items-center gap-1"
                              >
                                <span>Xem</span>
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DESKTOP TABLE VIEW */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-sans">
                      <thead>
                        <tr className="border-b border-white/80 bg-white/40 text-primary font-serif font-bold">
                          <th className="p-3.5 pl-5">MÃ ĐỊNH DANH</th>
                          <th className="p-3.5">KHÁCH HÀNG</th>
                          <th className="p-3.5">SẢN PHẨM VẬT LÝ</th>
                          <th className="p-3.5">TỔNG TIỀN</th>
                          <th className="p-3.5">TRẠNG THÁI THIỆP</th>
                          <th className="p-3.5 pr-5 text-right">THAO TÁC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/60">
                        {filteredOrders.map((order) => {
                          const isCompleted = order.status === "completed";
                          const activationUrl = typeof window !== "undefined"
                            ? `${window.location.origin}/create/${order.token}`
                            : `/create/${order.token}`;

                          return (
                            <tr key={order.id} className="hover:bg-white/50 transition-colors">
                              {/* Token & 2 Codes */}
                              <td className="p-3.5 pl-5">
                                <span className="font-mono font-bold text-primary bg-surface-container px-2.5 py-1 rounded-lg border border-rose-petal inline-block mb-1">
                                  {order.token}
                                </span>
                              </td>

                              {/* Customer */}
                              <td className="p-3.5">
                                <span className="font-bold text-espresso block">{order.customerName}</span>
                                <span className="text-[11px] text-warm-neutral block">{order.customerEmail}</span>
                                {order.customerPhone && (
                                  <span className="text-[10px] text-outline font-mono">{order.customerPhone}</span>
                                )}
                              </td>

                              {/* Product */}
                              <td className="p-3.5">
                                <span className="font-serif font-bold text-primary block">{order.chainName}</span>
                                <span className="text-[11px] text-on-surface-variant block">
                                  {order.charms?.length || 0} charm ({order.charms?.map((c) => c.name).join(", ") || "Không charm"})
                                </span>
                              </td>

                              {/* Total & Payment */}
                              <td className="p-3.5">
                                <span className="font-mono font-bold text-primary-container block">
                                  {order.totalPrice?.toLocaleString("vi-VN")}đ
                                </span>
                                <span className="text-[10px] text-warm-neutral uppercase">
                                  {order.paymentMethod === "transfer" ? "CK QR" : "Tiền mặt"}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="p-3.5">
                                {isCompleted ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    <span>✓ Đã xong thiệp</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                    <span>🟡 Chờ khách soạn</span>
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="p-3.5 pr-5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => copyToClipboard(activationUrl, "link")}
                                    className="p-1.5 rounded-lg liquid-glass-pill hover:bg-white text-primary cursor-pointer"
                                    title="Copy link tạo thiệp cho khách"
                                  >
                                    <span className="material-symbols-outlined text-base">content_copy</span>
                                  </button>

                                  {currentUser.permissions.canResendEmail && (
                                    <button
                                      onClick={() => handleResendEmail(order.token)}
                                      disabled={resendingToken === order.token}
                                      className="p-1.5 rounded-lg liquid-glass-pill hover:bg-white text-primary cursor-pointer disabled:opacity-40"
                                      title="Gửi lại Gmail chứa mã"
                                    >
                                      <span className="material-symbols-outlined text-base">mail</span>
                                    </button>
                                  )}

                                  <Link
                                    href={`/create/${order.token}`}
                                    target="_blank"
                                    className="px-2.5 py-1 rounded-lg liquid-glass-btn-secondary text-primary text-[11px] font-bold flex items-center gap-1"
                                    title="Mở trang tạo thiệp của khách"
                                  >
                                    <span>Tạo thiệp</span>
                                    <span className="material-symbols-outlined text-[13px]">edit</span>
                                  </Link>

                                  {isCompleted && (
                                    <Link
                                      href={`/g/${order.token}`}
                                      target="_blank"
                                      className="px-2.5 py-1 rounded-lg liquid-glass-btn-primary text-white text-[11px] font-bold flex items-center gap-1"
                                      title="Xem thiệp đã kích hoạt"
                                    >
                                      <span>Xem thiệp</span>
                                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                                    </Link>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ANALYTICS & REVENUE REPORT */}
        {/* ========================================================= */}
        {activeTab === "analytics" && currentUser.permissions.canViewAnalytics && (
          <div className="space-y-6">
            {loadingAnalytics ? (
              <div className="p-12 text-center text-xs font-sans text-warm-neutral">
                <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block mb-2" />
                <p>Đang tổng hợp báo cáo tài chính ca trực...</p>
              </div>
            ) : analyticsStats ? (
              <>
                {/* 4 Overview Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Metric 1 */}
                  <div className="p-5 rounded-3xl liquid-glass border border-white/90 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-warm-neutral text-xs font-sans">
                      <span>TỔNG DOANH THU QUẦY</span>
                      <span className="material-symbols-outlined text-xl text-amber-600">payments</span>
                    </div>
                    <div className="mt-3">
                      <span className="font-mono text-2xl sm:text-3xl font-black text-primary">
                        {analyticsStats.totalRevenue.toLocaleString("vi-VN")}đ
                      </span>
                      <p className="text-[10px] text-emerald-700 font-sans font-bold mt-1">
                        Từ {analyticsStats.totalOrders} đơn hàng đã bán
                      </p>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="p-5 rounded-3xl liquid-glass border border-white/90 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-warm-neutral text-xs font-sans">
                      <span>CHUYỂN KHOẢN NGÂN HÀNG (QR)</span>
                      <span className="material-symbols-outlined text-xl text-blue-600">qr_code_scanner</span>
                    </div>
                    <div className="mt-3">
                      <span className="font-mono text-2xl font-black text-blue-900">
                        {analyticsStats.transferRevenue.toLocaleString("vi-VN")}đ
                      </span>
                      <p className="text-[10px] text-warm-neutral font-sans mt-1">
                        Chiếm {analyticsStats.totalRevenue > 0 ? Math.round((analyticsStats.transferRevenue / analyticsStats.totalRevenue) * 100) : 0}% tổng thu
                      </p>
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="p-5 rounded-3xl liquid-glass border border-white/90 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-warm-neutral text-xs font-sans">
                      <span>TIỀN MẶT TẠI BOOTH</span>
                      <span className="material-symbols-outlined text-xl text-emerald-600">point_of_sale</span>
                    </div>
                    <div className="mt-3">
                      <span className="font-mono text-2xl font-black text-emerald-900">
                        {analyticsStats.cashRevenue.toLocaleString("vi-VN")}đ
                      </span>
                      <p className="text-[10px] text-warm-neutral font-sans mt-1">
                        Chiếm {analyticsStats.totalRevenue > 0 ? Math.round((analyticsStats.cashRevenue / analyticsStats.totalRevenue) * 100) : 0}% tổng thu
                      </p>
                    </div>
                  </div>

                  {/* Metric 4 */}
                  <div className="p-5 rounded-3xl liquid-glass border border-white/90 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-warm-neutral text-xs font-sans">
                      <span>TỶ LỆ KHÁCH SOẠN THIỆP SỐ</span>
                      <span className="material-symbols-outlined text-xl text-purple-600">auto_awesome</span>
                    </div>
                    <div className="mt-3">
                      <span className="font-mono text-2xl font-black text-purple-900">
                        {analyticsStats.completedCount} / {analyticsStats.totalOrders}
                      </span>
                      <p className="text-[10px] text-purple-700 font-sans font-bold mt-1">
                        {analyticsStats.pendingCount} khách đang chờ soạn thiệp
                      </p>
                    </div>
                  </div>

                </div>

                {/* Top Charms Ranking */}
                <div className="p-6 rounded-3xl liquid-glass border border-white/90 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-xl text-secondary">favorite</span>
                    <h3 className="font-serif text-base font-bold text-primary">
                      Bảng Xếp Hạng Hạt Charm Bán Chạy Nhất Tại Quầy
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {analyticsStats.topCharms.slice(0, 8).map((c, idx) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-2xl bg-white/70 border border-white/80 flex items-center justify-between shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-primary text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="text-xs font-serif font-bold text-primary block">
                              {c.name}
                            </span>
                            <span className="text-[10px] text-warm-neutral font-sans">
                              ID: {c.id}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-sm font-bold text-primary-container">
                            {c.count}
                          </span>
                          <span className="text-[10px] text-warm-neutral block">hạt</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-xs font-sans text-warm-neutral">
                Chưa có dữ liệu thống kê. Hãy tạo đơn hàng đầu tiên!
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: RBAC PERMISSIONS MATRIX */}
        {/* ========================================================= */}
        {activeTab === "rbac" && (
          <div className="space-y-6">
            
            {/* RBAC Header Explainer */}
            <div className="p-6 rounded-3xl liquid-glass border border-white/90 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[28px] text-primary">policy</span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary">
                    Ma Trận Phân Quyền Vai Trò (Role-Based Access Control)
                  </h3>
                  <p className="text-xs font-sans text-on-surface-variant mt-1 leading-relaxed">
                    Hệ thống K&amp;P Atelier áp dụng nguyên tắc đặc quyền tối thiểu (Least Privilege). Chỉ các vai trò có thẩm quyền mới được phép tạo đơn, xem báo cáo doanh thu tài chính hoặc quản trị nhân sự.
                  </p>
                </div>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="rounded-3xl liquid-glass border border-white/90 shadow-md overflow-hidden">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-white/80 bg-white/50 text-primary font-serif font-bold">
                    <th className="p-4 pl-6">HÀNH ĐỘNG / TÍNH NĂNG</th>
                    <th className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 text-amber-900">
                        👑 QUẢN TRỊ VIÊN (ADMIN)
                      </span>
                    </th>
                    <th className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-900">
                        💳 NHÂN VIÊN THU NGÂN (CASHIER)
                      </span>
                    </th>
                    <th className="p-4 text-center pr-6">
                      <span className="inline-flex items-center gap-1 text-sky-900">
                        👁️ GIÁM SÁT / KIỂM TOÁN (VIEWER)
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/60">
                  
                  {/* Row 1 */}
                  <tr className="hover:bg-white/40">
                    <td className="p-4 pl-6 font-bold text-espresso">
                      <div>Tạo đơn hàng POS tại quầy (Add order)</div>
                      <div className="text-[11px] font-normal text-warm-neutral">Chọn dây, chọn charm, cấp mã quà tặng số</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        ✓ ĐƯỢC PHÉP
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        ✓ ĐƯỢC PHÉP
                      </span>
                    </td>
                    <td className="p-4 text-center pr-6">
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                        ⛔ BỊ KHÓA
                      </span>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-white/40">
                    <td className="p-4 pl-6 font-bold text-espresso">
                      <div>Tra cứu danh sách đơn hàng đã bán</div>
                      <div className="text-[11px] font-normal text-warm-neutral">Tìm kiếm theo mã token, khách hàng, số điện thoại</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        ✓ ĐƯỢC PHÉP
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        ✓ ĐƯỢC PHÉP
                      </span>
                    </td>
                    <td className="p-4 text-center pr-6">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        ✓ ĐƯỢC PHÉP
                      </span>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-white/40">
                    <td className="p-4 pl-6 font-bold text-espresso">
                      <div>Gửi lại Gmail kích hoạt thiệp số</div>
                      <div className="text-[11px] font-normal text-warm-neutral">Hỗ trợ khách khi bị thất lạc email</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        ✓ ĐƯỢC PHÉP
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        ✓ ĐƯỢC PHÉP
                      </span>
                    </td>
                    <td className="p-4 text-center pr-6">
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                        ⛔ BỊ KHÓA
                      </span>
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-white/40">
                    <td className="p-4 pl-6 font-bold text-espresso">
                      <div>Xem báo cáo doanh thu &amp; tài chính ca trực</div>
                      <div className="text-[11px] font-normal text-warm-neutral">Tổng tiền mặt, chuyển khoản QR ngân hàng</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        ✓ ĐƯỢC PHÉP
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                        ⛔ BỊ KHÓA
                      </span>
                    </td>
                    <td className="p-4 text-center pr-6">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        ✓ ĐƯỢC PHÉP
                      </span>
                    </td>
                  </tr>

                  {/* Row 5 */}
                  <tr className="hover:bg-white/40">
                    <td className="p-4 pl-6 font-bold text-espresso">
                      <div>Quản lý phân quyền &amp; tài khoản nhân sự</div>
                      <div className="text-[11px] font-normal text-warm-neutral">Cấp phát quyền và phân ca trực</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        ✓ ĐƯỢC PHÉP
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                        ⛔ BỊ KHÓA
                      </span>
                    </td>
                    <td className="p-4 text-center pr-6">
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                        ⛔ BỊ KHÓA
                      </span>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Sample Accounts List */}
            <div className="p-6 rounded-3xl liquid-glass border border-white/90 shadow-sm">
              <h4 className="font-serif text-base font-bold text-primary mb-3">
                Danh Sách Nhân Sự &amp; Tài Khoản Đã Cấu Hình
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
                
                <div className="p-3.5 rounded-2xl bg-white/70 border border-amber-200">
                  <div className="font-bold text-primary flex items-center gap-1.5">
                    <span>👑</span>
                    <span>Trần Anh Quân</span>
                  </div>
                  <div className="text-[11px] text-warm-neutral mt-1">Username: <strong>admin</strong></div>
                  <div className="text-[10px] text-amber-900 font-bold mt-1">Vai trò: Quản Trị Viên (Admin Lead)</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/70 border border-emerald-200">
                  <div className="font-bold text-primary flex items-center gap-1.5">
                    <span>💳</span>
                    <span>Lê Minh Thảo</span>
                  </div>
                  <div className="text-[11px] text-warm-neutral mt-1">Username: <strong>cashier1</strong></div>
                  <div className="text-[10px] text-emerald-900 font-bold mt-1">Vai trò: Nhân Viên Thu Ngân POS</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/70 border border-sky-200">
                  <div className="font-bold text-primary flex items-center gap-1.5">
                    <span>👁️</span>
                    <span>Phạm Thùy Linh</span>
                  </div>
                  <div className="text-[11px] text-warm-neutral mt-1">Username: <strong>viewer</strong></div>
                  <div className="text-[10px] text-sky-900 font-bold mt-1">Vai trò: Giám Sát / Chỉ Xem</div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* MOBILE STICKY BOTTOM ACTION BAR (lg:hidden) */}
        {/* ========================================================= */}
        {activeTab === "pos" && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md p-3.5 border-t border-rose-petal shadow-[0_-4px_25px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] text-warm-neutral font-sans truncate max-w-42.5">
                {selectedChain.name} (+{selectedCharms.length} charm)
              </div>
              <div className="text-base font-black font-mono text-primary-container">
                {totalPrice.toLocaleString("vi-VN")}đ
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCreateProduct()}
              disabled={isSubmitting || !canAddOrder}
              className="px-4 py-3 rounded-xl liquid-glass-btn-primary text-white text-xs font-bold font-serif shadow-md flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang Gửi...</span>
                </>
              ) : !canAddOrder ? (
                <>
                  <span className="material-symbols-outlined text-base text-rose-300">lock</span>
                  <span>KHÓA ADD</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base text-amber-300">send</span>
                  <span>CẤP MÃ CHO KHÁCH</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUCCESS POPUP MODAL */}
        {/* ========================================================= */}
        {reissuedKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md p-6 rounded-4xl liquid-glass bg-white/95 border-2 border-white/90 shadow-2xl text-center">
              <span className="text-[11px] uppercase font-bold tracking-wider text-secondary">Cấp lại mật khẩu tạo thiệp</span>
              <h3 className="font-serif text-lg font-bold text-primary mt-1">Mã vòng {reissuedKey.token}</h3>
              <p className="text-xs font-sans text-on-surface-variant mt-1">
                Email chưa được gửi thật. Mật khẩu cũ đã bị vô hiệu, hãy đưa mật khẩu mới này cho khách. Mã chỉ hiện một lần.
              </p>
              <div className="my-4 p-3 rounded-xl bg-amber-50 border border-amber-300 font-mono text-lg font-bold text-primary select-all">
                {reissuedKey.creatorKey}
              </div>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(reissuedKey.creatorKey);
                    setCopiedReissued(true);
                  }}
                  className="flex-1 py-3 rounded-xl liquid-glass-btn-secondary text-primary font-serif font-bold text-xs border border-white/90 cursor-pointer"
                >
                  {copiedReissued ? "Đã copy ✓" : "Copy mật khẩu"}
                </button>
                <button
                  type="button"
                  onClick={() => setReissuedKey(null)}
                  className="flex-1 py-3 rounded-xl liquid-glass-btn-primary text-white font-serif font-bold text-xs shadow-md cursor-pointer"
                >
                  Đã ghi lại, đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccessModal && createdOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-4xl liquid-glass bg-white/95 border-2 border-white/90 shadow-2xl">
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-sm border border-emerald-300">
                  <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>

                <span className="text-[11px] uppercase font-bold tracking-wider text-secondary">
                  TẠO ĐƠN THÀNH CÔNG • K&amp;P ATELIER
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-primary mt-1">
                  Đã Cấp Mã Định Danh Cho Khách!
                </h3>
                {createdOrder.emailSent ? (
                  <p className="text-xs font-sans text-on-surface-variant mt-1">
                    Email kèm mã và link tạo thiệp đã được gửi tới: <strong>{createdOrder.customerEmail}</strong>
                  </p>
                ) : (
                  <p className="text-xs font-sans font-bold text-rose-700 mt-1">
                    Chưa gửi được email tới {createdOrder.customerEmail}. Hãy đọc mã bên dưới trực tiếp cho khách.
                  </p>
                )}
              </div>

              {/* 2 CODES DISPLAY BOXES */}
              <div className="my-5 space-y-3">
                {/* Bracelet Token */}
                <div className="p-3 rounded-2xl bg-surface-container-low border-2 border-dashed border-primary-container text-center">
                  <span className="text-[10px] font-sans font-bold text-primary-container uppercase block mb-0.5">
                    MÃ VÒNG TAY (TOKEN SẢN PHẨM):
                  </span>
                  <div className="font-mono text-2xl font-black text-primary tracking-widest">
                    {createdOrder.token}
                  </div>
                </div>

                {/* Grid 2 Separate Codes */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  {/* Code 1: Creator Key */}
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300">
                    <span className="text-[10px] font-sans font-bold text-amber-900 uppercase block mb-1">
                      ✍️ MÃ 1: TẠO THIỆP (GMAIL)
                    </span>
                    <div className="font-mono text-base font-bold text-primary bg-white/80 py-1 px-2 rounded-lg border border-amber-200">
                      {issuedCodes?.creatorKey ?? "—"}
                    </div>
                    <span className="text-[9px] text-warm-neutral font-sans mt-1 block">
                      Dành cho người mua
                    </span>
                  </div>

                  {/* Code 2: Unlock PIN */}
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300">
                    <span className="text-[10px] font-sans font-bold text-emerald-900 uppercase block mb-1">
                      🎁 MÃ 2: MỞ QUÀ (PIN THẺ)
                    </span>
                    <div className="font-mono text-base font-bold text-emerald-900 bg-white/80 py-1 px-2 rounded-lg border border-emerald-200">
                      {issuedCodes?.unlockPin ?? "—"}
                    </div>
                    <span className="text-[9px] text-warm-neutral font-sans mt-1 block">
                      In trên thẻ người nhận
                    </span>
                  </div>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const summary = `K&P Atelier - Quà Tặng 20/10\nMã Vòng: ${createdOrder.token}\nMã 1 (Mật khẩu tạo thiệp): ${issuedCodes?.creatorKey ?? ""}\nMã 2 (Mã mở quà cho người nhận): ${issuedCodes?.unlockPin ?? ""}\nCổng nhập mã: ${typeof window !== "undefined" ? window.location.origin : ""}/gift`;
                      copyToClipboard(summary, "token");
                    }}
                    className="text-xs font-sans font-bold text-secondary hover:text-primary inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                    <span>{copiedToken ? "Đã copy toàn bộ thông tin ✓" : "Copy toàn bộ 2 mã cho khách"}</span>
                  </button>
                </div>
              </div>

              {/* Order Info Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 text-xs font-sans space-y-1 text-on-surface-variant mb-6">
                <div className="flex justify-between">
                  <span>Khách hàng:</span>
                  <strong className="text-espresso">{createdOrder.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Sản phẩm:</span>
                  <span>{createdOrder.chainName} ({createdOrder.charms.length} charm)</span>
                </div>
                <div className="flex justify-between">
                  <span>Tổng tiền đã thu:</span>
                  <strong className="text-primary-container font-mono">{createdOrder.totalPrice.toLocaleString("vi-VN")}đ</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full sm:flex-1 py-3 rounded-xl liquid-glass-btn-primary text-white font-serif font-bold text-xs shadow-md cursor-pointer"
                >
                  Tạo Đơn Tiếp Theo (+ Mới)
                </button>

                <Link
                  href={`/gift?token=${createdOrder.token}&tab=create`}
                  target="_blank"
                  className="w-full sm:flex-1 py-3 rounded-xl liquid-glass-btn-secondary text-primary font-serif font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-white/90"
                >
                  <span>Mở Cổng /gift Ngay</span>
                  <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                </Link>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
