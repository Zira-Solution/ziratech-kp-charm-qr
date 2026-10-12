export type StaffRole = "admin" | "cashier" | "viewer";

export interface StaffPermission {
  canCreateOrder: boolean;   // Quyền vào add / tạo đơn hàng POS
  canViewOrders: boolean;    // Quyền tra cứu danh sách đơn hàng
  canResendEmail: boolean;   // Quyền gửi lại email kích hoạt thiệp số
  canViewAnalytics: boolean; // Quyền xem thống kê doanh thu & báo cáo ca trực
  canManageStaff: boolean;   // Quyền xem danh sách phân quyền nhân sự
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: StaffRole;
  roleTitle: string;
  avatar?: string;
  permissions: StaffPermission;
}

export interface AuthSession {
  user: AdminUser;
  token: string;
  expiresAt: number;
}

export interface LoginResponse {
  success: boolean;
  user?: AdminUser;
  token?: string;
  error?: string;
}
