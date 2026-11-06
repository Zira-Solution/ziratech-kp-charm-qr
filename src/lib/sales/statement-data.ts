// Pure verified sales & statement dataset for K&P Atelier 20/10 charity stall.
// Sourced directly from data/doanh-thu.csv and verified against the stall records.

export interface StatementItem {
  id: string;
  soldOn: string;
  sourceRow: number;
  name: string;
  category: string;
  categoryLabel: string;
  isDonation: boolean;
  amount: number;
  note: string | null;
}

export interface StatementDay {
  soldOn: string;
  dayLabel: string;
  dayShort: string;
  salesAmount: number;
  salesCount: number;
  donationAmount: number;
  donationCount: number;
  total: number;
  percentage: number;
}

export interface StatementCategory {
  category: string;
  label: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface StatementSummary {
  totalRevenue: number;
  stallSalesAmount: number;
  stallSalesCount: number;
  donationAmount: number;
  donationCount: number;
  transferredAmount: number;
  transferRecipient: string;
  transferStatus: string;
  transferredAt?: string;
  proofPath?: string;
  acknowledgmentPath?: string;
}

export const STATEMENT_SUMMARY: StatementSummary = {
  totalRevenue: 2234000,
  stallSalesAmount: 1974000,
  stallSalesCount: 65,
  donationAmount: 260000,
  donationCount: 9,
  transferredAmount: 1800000,
  transferRecipient: "Trạm cứu hộ Sân Nhà Nhiều Chó",
  transferStatus: "Đã hoàn tất",
  transferredAt: "2026-10-25T22:18:00+07:00",
  proofPath: "/images/proof_chuyen_khoan_san_nha_nhieu_cho.jpg",
  acknowledgmentPath: "/images/xac_nhan_san_nha_nhieu_cho.jpg",
};

export const STATEMENT_DAYS: StatementDay[] = [
  {
    "soldOn": "2026-10-17",
    "dayLabel": "Thứ Sáu, 17/10/2026",
    "dayShort": "17/10",
    "salesAmount": 729000,
    "salesCount": 25,
    "donationAmount": 15000,
    "donationCount": 1,
    "total": 744000,
    "percentage": 33.3
  },
  {
    "soldOn": "2026-10-19",
    "dayLabel": "Chủ Nhật, 19/10/2026",
    "dayShort": "19/10",
    "salesAmount": 415000,
    "salesCount": 18,
    "donationAmount": 155000,
    "donationCount": 6,
    "total": 570000,
    "percentage": 25.5
  },
  {
    "soldOn": "2026-10-20",
    "dayLabel": "Thứ Hai, 20/10/2026",
    "dayShort": "20/10",
    "salesAmount": 830000,
    "salesCount": 22,
    "donationAmount": 90000,
    "donationCount": 2,
    "total": 920000,
    "percentage": 41.2
  }
];

export const STATEMENT_CATEGORIES: StatementCategory[] = [
  {
    "category": "bracelet",
    "label": "Vòng tay",
    "count": 19,
    "amount": 585000,
    "percentage": 29.6
  },
  {
    "category": "flower",
    "label": "Bông",
    "count": 7,
    "amount": 440000,
    "percentage": 22.3
  },
  {
    "category": "keychain",
    "label": "Móc khoá",
    "count": 15,
    "amount": 320000,
    "percentage": 16.2
  },
  {
    "category": "keychain_phone",
    "label": "Móc khoá điện thoại",
    "count": 7,
    "amount": 190000,
    "percentage": 9.6
  },
  {
    "category": "diy",
    "label": "DIY",
    "count": 3,
    "amount": 163000,
    "percentage": 8.3
  },
  {
    "category": "combo",
    "label": "Combo nhiều món",
    "count": 3,
    "amount": 138000,
    "percentage": 7
  },
  {
    "category": "bear_mini",
    "label": "Gấu mini",
    "count": 9,
    "amount": 125000,
    "percentage": 6.3
  },
  {
    "category": "bear",
    "label": "Gấu bông",
    "count": 1,
    "amount": 10000,
    "percentage": 0.5
  },
  {
    "category": "card",
    "label": "Thiệp",
    "count": 1,
    "amount": 3000,
    "percentage": 0.2
  }
];

export const STATEMENT_TRANSACTIONS: StatementItem[] = [
  {
    "id": "sale-2026-10-17-4",
    "soldOn": "2026-10-17",
    "sourceRow": 4,
    "name": "Vòng đeo tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 40000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-5",
    "soldOn": "2026-10-17",
    "sourceRow": 5,
    "name": "móc khoá",
    "category": "keychain",
    "categoryLabel": "Móc khoá",
    "isDonation": false,
    "amount": 20000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-6",
    "soldOn": "2026-10-17",
    "sourceRow": 6,
    "name": "móc khoá",
    "category": "keychain",
    "categoryLabel": "Móc khoá",
    "isDonation": false,
    "amount": 20000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-7",
    "soldOn": "2026-10-17",
    "sourceRow": 7,
    "name": "móc khoá vòng tay",
    "category": "combo",
    "categoryLabel": "Combo nhiều món",
    "isDonation": false,
    "amount": 60000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-8",
    "soldOn": "2026-10-17",
    "sourceRow": 8,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 40000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-9",
    "soldOn": "2026-10-17",
    "sourceRow": 9,
    "name": "móc khoá",
    "category": "keychain",
    "categoryLabel": "Móc khoá",
    "isDonation": false,
    "amount": 20000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-10",
    "soldOn": "2026-10-17",
    "sourceRow": 10,
    "name": "gấu bông",
    "category": "bear",
    "categoryLabel": "Gấu bông",
    "isDonation": false,
    "amount": 10000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-11",
    "soldOn": "2026-10-17",
    "sourceRow": 11,
    "name": "móc treo đt",
    "category": "keychain_phone",
    "categoryLabel": "Móc khoá điện thoại",
    "isDonation": false,
    "amount": 30000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-12",
    "soldOn": "2026-10-17",
    "sourceRow": 12,
    "name": "móc khoá",
    "category": "keychain",
    "categoryLabel": "Móc khoá",
    "isDonation": false,
    "amount": 20000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-13",
    "soldOn": "2026-10-17",
    "sourceRow": 13,
    "name": "DIY",
    "category": "diy",
    "categoryLabel": "DIY",
    "isDonation": false,
    "amount": 78000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-14",
    "soldOn": "2026-10-17",
    "sourceRow": 14,
    "name": "gấu mini",
    "category": "bear_mini",
    "categoryLabel": "Gấu mini",
    "isDonation": false,
    "amount": 10000,
    "note": "sài tiền mặt( đã chuyển)"
  },
  {
    "id": "sale-2026-10-17-15",
    "soldOn": "2026-10-17",
    "sourceRow": 15,
    "name": "gấu mini",
    "category": "bear_mini",
    "categoryLabel": "Gấu mini",
    "isDonation": false,
    "amount": 10000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-16",
    "soldOn": "2026-10-17",
    "sourceRow": 16,
    "name": "gấu mini",
    "category": "bear_mini",
    "categoryLabel": "Gấu mini",
    "isDonation": false,
    "amount": 10000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-17",
    "soldOn": "2026-10-17",
    "sourceRow": 17,
    "name": "DIY",
    "category": "diy",
    "categoryLabel": "DIY",
    "isDonation": false,
    "amount": 60000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-18",
    "soldOn": "2026-10-17",
    "sourceRow": 18,
    "name": "thiệp",
    "category": "card",
    "categoryLabel": "Thiệp",
    "isDonation": false,
    "amount": 3000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-19",
    "soldOn": "2026-10-17",
    "sourceRow": 19,
    "name": "DIY, gấu bông",
    "category": "combo",
    "categoryLabel": "Combo nhiều món",
    "isDonation": false,
    "amount": 43000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-20",
    "soldOn": "2026-10-17",
    "sourceRow": 20,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 40000,
    "note": null
  },
  {
    "id": "don-2026-10-17-21",
    "soldOn": "2026-10-17",
    "sourceRow": 21,
    "name": "donate",
    "category": "donation",
    "categoryLabel": "Quyên góp",
    "isDonation": true,
    "amount": 15000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-22",
    "soldOn": "2026-10-17",
    "sourceRow": 22,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 30000,
    "note": "tiền hỗ trợ"
  },
  {
    "id": "sale-2026-10-17-23",
    "soldOn": "2026-10-17",
    "sourceRow": 23,
    "name": "gấu mini",
    "category": "bear_mini",
    "categoryLabel": "Gấu mini",
    "isDonation": false,
    "amount": 15000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-24",
    "soldOn": "2026-10-17",
    "sourceRow": 24,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 30000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-25",
    "soldOn": "2026-10-17",
    "sourceRow": 25,
    "name": "gấu mini",
    "category": "bear_mini",
    "categoryLabel": "Gấu mini",
    "isDonation": false,
    "amount": 15000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-26",
    "soldOn": "2026-10-17",
    "sourceRow": 26,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 30000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-27",
    "soldOn": "2026-10-17",
    "sourceRow": 27,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 30000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-28",
    "soldOn": "2026-10-17",
    "sourceRow": 28,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 30000,
    "note": null
  },
  {
    "id": "sale-2026-10-17-29",
    "soldOn": "2026-10-17",
    "sourceRow": 29,
    "name": "móc treo đt",
    "category": "keychain_phone",
    "categoryLabel": "Móc khoá điện thoại",
    "isDonation": false,
    "amount": 35000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-4",
    "soldOn": "2026-10-19",
    "sourceRow": 4,
    "name": "gấu mini",
    "category": "bear_mini",
    "categoryLabel": "Gấu mini",
    "isDonation": false,
    "amount": 20000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-5",
    "soldOn": "2026-10-19",
    "sourceRow": 5,
    "name": "móc khoá",
    "category": "keychain",
    "categoryLabel": "Móc khoá",
    "isDonation": false,
    "amount": 20000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-6",
    "soldOn": "2026-10-19",
    "sourceRow": 6,
    "name": "gấu mini",
    "category": "bear_mini",
    "categoryLabel": "Gấu mini",
    "isDonation": false,
    "amount": 15000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-7",
    "soldOn": "2026-10-19",
    "sourceRow": 7,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 30000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-8",
    "soldOn": "2026-10-19",
    "sourceRow": 8,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 30000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-9",
    "soldOn": "2026-10-19",
    "sourceRow": 9,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 30000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-10",
    "soldOn": "2026-10-19",
    "sourceRow": 10,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 30000,
    "note": null
  },
  {
    "id": "don-2026-10-19-11",
    "soldOn": "2026-10-19",
    "sourceRow": 11,
    "name": "donate",
    "category": "donation",
    "categoryLabel": "Quyên góp",
    "isDonation": true,
    "amount": 40000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-12",
    "soldOn": "2026-10-19",
    "sourceRow": 12,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 15000,
    "note": null
  },
  {
    "id": "don-2026-10-19-13",
    "soldOn": "2026-10-19",
    "sourceRow": 13,
    "name": "donate",
    "category": "donation",
    "categoryLabel": "Quyên góp",
    "isDonation": true,
    "amount": 15000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-14",
    "soldOn": "2026-10-19",
    "sourceRow": 14,
    "name": "gấu bông với móc khoá",
    "category": "combo",
    "categoryLabel": "Combo nhiều món",
    "isDonation": false,
    "amount": 35000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-15",
    "soldOn": "2026-10-19",
    "sourceRow": 15,
    "name": "DIY",
    "category": "diy",
    "categoryLabel": "DIY",
    "isDonation": false,
    "amount": 25000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-16",
    "soldOn": "2026-10-19",
    "sourceRow": 16,
    "name": "móc khoá",
    "category": "keychain",
    "categoryLabel": "Móc khoá",
    "isDonation": false,
    "amount": 15000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-17",
    "soldOn": "2026-10-19",
    "sourceRow": 17,
    "name": "gấu mini",
    "category": "bear_mini",
    "categoryLabel": "Gấu mini",
    "isDonation": false,
    "amount": 15000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-18",
    "soldOn": "2026-10-19",
    "sourceRow": 18,
    "name": "móc khoá",
    "category": "keychain",
    "categoryLabel": "Móc khoá",
    "isDonation": false,
    "amount": 15000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-19",
    "soldOn": "2026-10-19",
    "sourceRow": 19,
    "name": "móc khoá",
    "category": "keychain",
    "categoryLabel": "Móc khoá",
    "isDonation": false,
    "amount": 15000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-20",
    "soldOn": "2026-10-19",
    "sourceRow": 20,
    "name": "móc khoá mu ro di",
    "category": "keychain",
    "categoryLabel": "Móc khoá",
    "isDonation": false,
    "amount": 40000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-21",
    "soldOn": "2026-10-19",
    "sourceRow": 21,
    "name": "móc khoá",
    "category": "keychain",
    "categoryLabel": "Móc khoá",
    "isDonation": false,
    "amount": 15000,
    "note": null
  },
  {
    "id": "don-2026-10-19-22",
    "soldOn": "2026-10-19",
    "sourceRow": 22,
    "name": "donate",
    "category": "donation",
    "categoryLabel": "Quyên góp",
    "isDonation": true,
    "amount": 15000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-23",
    "soldOn": "2026-10-19",
    "sourceRow": 23,
    "name": "móc khoá",
    "category": "keychain",
    "categoryLabel": "Móc khoá",
    "isDonation": false,
    "amount": 20000,
    "note": null
  },
  {
    "id": "don-2026-10-19-24",
    "soldOn": "2026-10-19",
    "sourceRow": 24,
    "name": "donate",
    "category": "donation",
    "categoryLabel": "Quyên góp",
    "isDonation": true,
    "amount": 15000,
    "note": null
  },
  {
    "id": "sale-2026-10-19-25",
    "soldOn": "2026-10-19",
    "sourceRow": 25,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 30000,
    "note": null
  },
  {
    "id": "don-2026-10-19-26",
    "soldOn": "2026-10-19",
    "sourceRow": 26,
    "name": "donate",
    "category": "donation",
    "categoryLabel": "Quyên góp",
    "isDonation": true,
    "amount": 20000,
    "note": null
  },
  {
    "id": "don-2026-10-19-27",
    "soldOn": "2026-10-19",
    "sourceRow": 27,
    "name": "donate",
    "category": "donation",
    "categoryLabel": "Quyên góp",
    "isDonation": true,
    "amount": 50000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-4",
    "soldOn": "2026-10-20",
    "sourceRow": 4,
    "name": "bông",
    "category": "flower",
    "categoryLabel": "Bông",
    "isDonation": false,
    "amount": 260000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-5",
    "soldOn": "2026-10-20",
    "sourceRow": 5,
    "name": "móc khoá đt",
    "category": "keychain_phone",
    "categoryLabel": "Móc khoá điện thoại",
    "isDonation": false,
    "amount": 25000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-6",
    "soldOn": "2026-10-20",
    "sourceRow": 6,
    "name": "móc khoá",
    "category": "keychain",
    "categoryLabel": "Móc khoá",
    "isDonation": false,
    "amount": 25000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-7",
    "soldOn": "2026-10-20",
    "sourceRow": 7,
    "name": "móc khoá",
    "category": "keychain",
    "categoryLabel": "Móc khoá",
    "isDonation": false,
    "amount": 25000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-8",
    "soldOn": "2026-10-20",
    "sourceRow": 8,
    "name": "bông",
    "category": "flower",
    "categoryLabel": "Bông",
    "isDonation": false,
    "amount": 60000,
    "note": null
  },
  {
    "id": "don-2026-10-20-9",
    "soldOn": "2026-10-20",
    "sourceRow": 9,
    "name": "donate",
    "category": "donation",
    "categoryLabel": "Quyên góp",
    "isDonation": true,
    "amount": 30000,
    "note": null
  },
  {
    "id": "don-2026-10-20-10",
    "soldOn": "2026-10-20",
    "sourceRow": 10,
    "name": "donate",
    "category": "donation",
    "categoryLabel": "Quyên góp",
    "isDonation": true,
    "amount": 60000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-11",
    "soldOn": "2026-10-20",
    "sourceRow": 11,
    "name": "móc khoá",
    "category": "keychain",
    "categoryLabel": "Móc khoá",
    "isDonation": false,
    "amount": 25000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-12",
    "soldOn": "2026-10-20",
    "sourceRow": 12,
    "name": "bông",
    "category": "flower",
    "categoryLabel": "Bông",
    "isDonation": false,
    "amount": 20000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-13",
    "soldOn": "2026-10-20",
    "sourceRow": 13,
    "name": "bông",
    "category": "flower",
    "categoryLabel": "Bông",
    "isDonation": false,
    "amount": 20000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-14",
    "soldOn": "2026-10-20",
    "sourceRow": 14,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 30000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-15",
    "soldOn": "2026-10-20",
    "sourceRow": 15,
    "name": "móc khoá",
    "category": "keychain",
    "categoryLabel": "Móc khoá",
    "isDonation": false,
    "amount": 25000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-16",
    "soldOn": "2026-10-20",
    "sourceRow": 16,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 30000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-17",
    "soldOn": "2026-10-20",
    "sourceRow": 17,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 30000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-18",
    "soldOn": "2026-10-20",
    "sourceRow": 18,
    "name": "bông",
    "category": "flower",
    "categoryLabel": "Bông",
    "isDonation": false,
    "amount": 40000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-19",
    "soldOn": "2026-10-20",
    "sourceRow": 19,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 30000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-20",
    "soldOn": "2026-10-20",
    "sourceRow": 20,
    "name": "bông",
    "category": "flower",
    "categoryLabel": "Bông",
    "isDonation": false,
    "amount": 20000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-21",
    "soldOn": "2026-10-20",
    "sourceRow": 21,
    "name": "móc khoá đt",
    "category": "keychain_phone",
    "categoryLabel": "Móc khoá điện thoại",
    "isDonation": false,
    "amount": 25000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-22",
    "soldOn": "2026-10-20",
    "sourceRow": 22,
    "name": "bông",
    "category": "flower",
    "categoryLabel": "Bông",
    "isDonation": false,
    "amount": 20000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-23",
    "soldOn": "2026-10-20",
    "sourceRow": 23,
    "name": "gấu mini",
    "category": "bear_mini",
    "categoryLabel": "Gấu mini",
    "isDonation": false,
    "amount": 15000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-24",
    "soldOn": "2026-10-20",
    "sourceRow": 24,
    "name": "móc khoá đt",
    "category": "keychain_phone",
    "categoryLabel": "Móc khoá điện thoại",
    "isDonation": false,
    "amount": 25000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-25",
    "soldOn": "2026-10-20",
    "sourceRow": 25,
    "name": "móc khoá đt",
    "category": "keychain_phone",
    "categoryLabel": "Móc khoá điện thoại",
    "isDonation": false,
    "amount": 25000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-26",
    "soldOn": "2026-10-20",
    "sourceRow": 26,
    "name": "vòng tay",
    "category": "bracelet",
    "categoryLabel": "Vòng tay",
    "isDonation": false,
    "amount": 30000,
    "note": null
  },
  {
    "id": "sale-2026-10-20-27",
    "soldOn": "2026-10-20",
    "sourceRow": 27,
    "name": "móc khoá đt",
    "category": "keychain_phone",
    "categoryLabel": "Móc khoá điện thoại",
    "isDonation": false,
    "amount": 25000,
    "note": null
  }
];

/** Builds a downloadable UTF-8 CSV string with BOM for Excel compatibility. */
export function buildStatementCsv(): string {
  const header = "Ngày,Dòng trong bảng,Nội dung giao dịch,Phân loại,Số tiền (VNĐ),Ghi chú";
  const rows = STATEMENT_TRANSACTIONS.map((tx) => {
    const escapedName = tx.name.includes(",") ? `"${tx.name.replace(/"/g, '""')}"` : tx.name;
    const escapedNote = tx.note
      ? tx.note.includes(",")
        ? `"${tx.note.replace(/"/g, '""')}"`
        : tx.note
      : "";
    return [tx.soldOn, tx.sourceRow, escapedName, tx.categoryLabel, tx.amount, escapedNote].join(",");
  });
  return "\uFEFF" + [header, ...rows].join("\r\n");
}
