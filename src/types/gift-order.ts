export interface CharmOrderItem {
  id: string;
  name: string;
  price: number;
  icon: string;
}

/** Full record as stored. Contains secret hashes - server-side only, never send it to a client. */
export interface GiftProductOrder {
  id: string;
  token: string;              // Mã thiệp (e.g. KP-2010-XXXXXX)
  creatorKeyHash: string;     // OTP tạo thiệp, cho người mua (băm scrypt)
  unlockPinHash: string;      // OTP xem thiệp, cho người nhận (băm scrypt)
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  chainId: string;
  chainName: string;
  chainPrice: number;
  charms: CharmOrderItem[];
  totalPrice: number;
  paymentMethod: "cash" | "transfer";
  status: "pending" | "completed"; // pending = chưa tạo thiệp, completed = khách đã tạo thiệp
  giftData?: Record<string, any>;  // Lưu dữ liệu thiệp do khách tự custom
  emailSent: boolean;
  createdAt: string;
  completedAt?: string;
  deletedAt?: string;         // set when the order was soft-deleted
}

/** Order as shown to staff: no secret hashes. */
export type GiftProductView = Omit<GiftProductOrder, "creatorKeyHash" | "unlockPinHash">;

/** Order as shown to a buyer in the studio: no secrets, no customer contact details. */
export type PublicGiftProduct = Omit<GiftProductView, "customerEmail" | "customerPhone">;

/** Plaintext codes. Returned exactly once, when an order is created. */
export interface IssuedCodes {
  creatorKey: string;
  unlockPin: string;
}

export interface CreateProductPayload {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  chainId: string;
  chainName: string;
  chainPrice: number;
  charms: CharmOrderItem[];
  totalPrice: number;
  paymentMethod: "cash" | "transfer";
}
