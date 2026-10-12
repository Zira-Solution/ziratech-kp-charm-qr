import "server-only";
import { AdminUser, StaffPermission, StaffRole } from "@/types/admin-auth";
import { safeEqual, signPayload, verifyPayload } from "@/lib/auth/crypto";

// Role-based permission templates
export const ROLE_PERMISSIONS: Record<StaffRole, StaffPermission> = {
  admin: {
    canCreateOrder: true,
    canViewOrders: true,
    canResendEmail: true,
    canViewAnalytics: true,
    canManageStaff: true,
  },
  cashier: {
    canCreateOrder: true,
    canViewOrders: true,
    canResendEmail: true,
    canViewAnalytics: false,
    canManageStaff: false,
  },
  viewer: {
    canCreateOrder: false, // Bị khóa quyền add đơn POS
    canViewOrders: true,
    canResendEmail: false,
    canViewAnalytics: true,
    canManageStaff: false,
  },
};

interface StaffAccountDef {
  id: string;
  username: string;
  email: string;
  name: string;
  passwordEnv: string; // name of the env var that holds this account's password
  role: StaffRole;
  roleTitle: string;
  avatar: string;
}

const STAFF_ACCOUNT_DEFS: StaffAccountDef[] = [
  {
    id: "usr_admin_01",
    username: "admin",
    email: "admin@kp-atelier.vn",
    name: "Trần Anh Quân (Quản Trị Booth)",
    passwordEnv: "ADMIN_PASSWORD",
    role: "admin",
    roleTitle: "Quản Trị Viên (Admin Lead)",
    avatar: "👑",
  },
  {
    id: "usr_cashier_01",
    username: "cashier1",
    email: "cashier1@kp-atelier.vn",
    name: "Lê Minh Thảo (Thu Ngân Ca Sáng)",
    passwordEnv: "CASHIER_PASSWORD",
    role: "cashier",
    roleTitle: "Nhân Viên Thu Ngân POS",
    avatar: "💳",
  },
  {
    id: "usr_cashier_02",
    username: "cashier2",
    email: "cashier2@kp-atelier.vn",
    name: "Hoàng Gia Huy (Thu Ngân Ca Chiều)",
    passwordEnv: "CASHIER_PASSWORD",
    role: "cashier",
    roleTitle: "Nhân Viên Thu Ngân POS",
    avatar: "💳",
  },
  {
    id: "usr_viewer_01",
    username: "viewer",
    email: "viewer@kp-atelier.vn",
    name: "Phạm Thùy Linh (Kiểm Toán & Giám Sát)",
    passwordEnv: "VIEWER_PASSWORD",
    role: "viewer",
    roleTitle: "Giám Sát / Chỉ Xem (No Add)",
    avatar: "👁️",
  },
];

const MIN_PASSWORD_LENGTH = 8;

/** Accounts whose password env var is set. An account without a configured password cannot log in. */
function getStaffAccounts(): Array<StaffAccountDef & { password: string }> {
  const accounts: Array<StaffAccountDef & { password: string }> = [];
  for (const def of STAFF_ACCOUNT_DEFS) {
    const password = process.env[def.passwordEnv];
    if (password && password.length >= MIN_PASSWORD_LENGTH) {
      accounts.push({ ...def, password });
    }
  }
  return accounts;
}

function toAdminUser(account: StaffAccountDef): AdminUser {
  return {
    id: account.id,
    username: account.username,
    name: account.name,
    email: account.email,
    role: account.role,
    roleTitle: account.roleTitle,
    avatar: account.avatar,
    permissions: ROLE_PERMISSIONS[account.role],
  };
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function signSessionToken(user: AdminUser, expiresInMs = SESSION_TTL_MS): string {
  return signPayload({ sub: user.id, username: user.username, role: user.role }, expiresInMs);
}

export function verifySessionToken(token: string): { userId: string; role: StaffRole } | null {
  const payload = verifyPayload<{ sub: string; role: StaffRole }>(token);
  return payload ? { userId: payload.sub, role: payload.role } : null;
}

/** Matches username or email and checks the password in constant time. */
export function authenticateWithCredentials(identifier: string, password: string): AdminUser | null {
  const cleanId = identifier.trim().toLowerCase();
  let match: AdminUser | null = null;

  // Compare against every account so response time does not reveal which usernames exist.
  for (const account of getStaffAccounts()) {
    const idMatches = account.username.toLowerCase() === cleanId || account.email.toLowerCase() === cleanId;
    const passwordMatches = safeEqual(account.password, password);
    if (idMatches && passwordMatches) match = toAdminUser(account);
  }

  return match;
}

/** Resolves the signed session token from the cookie or the Authorization / x-admin-token header. */
export function getAuthenticatedUser(headers: Headers, cookieToken?: string | null): AdminUser | null {
  let token = cookieToken;

  if (!token) {
    const authHeader = headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) token = authHeader.substring(7).trim();
  }
  if (!token) token = headers.get("x-admin-token") || undefined;
  if (!token) return null;

  const verified = verifySessionToken(token);
  if (!verified) return null;

  // Only accounts that are still configured keep access.
  const account = getStaffAccounts().find((a) => a.id === verified.userId);
  return account ? toAdminUser(account) : null;
}
