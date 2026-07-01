export type AccountStatus = "Available" | "Reserved" | "Sold";
export type Rank = "Epic" | "Legend" | "Mythic" | "Mythic Immortal";

export interface Account {
  id: string;
  name: string;
  code: string;
  image: string;
  price: number;
  rank: Rank;
  heroCount: number;
  skinCount: number;
  status: AccountStatus;
}

export interface Order {
  id: string;
  customer: string;
  account: string;
  price: number;
  paymentStatus: "Paid" | "Pending" | "Refunded";
  orderStatus: "New" | "Processing" | "Completed" | "Rejected";
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
}

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=400&q=60`;

export const accounts: Account[] = [
  { id: "ACC-001", name: "Xavier Kolektor", code: "ML-197576", image: img("1542751371-adc38448a05e"), price: 1299000, rank: "Mythic Immortal", heroCount: 132, skinCount: 377, status: "Available" },
  { id: "ACC-002", name: "Fanny Sultan", code: "ML-204311", image: img("1511512578047-dfb367046420"), price: 2499000, rank: "Mythic Immortal", heroCount: 118, skinCount: 412, status: "Available" },
  { id: "ACC-003", name: "Ling Pro", code: "ML-188022", image: img("1538481199705-c710c4e965fc"), price: 899000, rank: "Mythic", heroCount: 96, skinCount: 210, status: "Reserved" },
  { id: "ACC-004", name: "Gusion Master", code: "ML-179845", image: img("1606318801954-d46d46d3360a"), price: 750000, rank: "Mythic", heroCount: 88, skinCount: 175, status: "Sold" },
  { id: "ACC-005", name: "Chou Megah", code: "ML-211900", image: img("1556438064-2d7646166914"), price: 450000, rank: "Legend", heroCount: 72, skinCount: 120, status: "Available" },
  { id: "ACC-006", name: "Lancelot Gagah", code: "ML-220114", image: img("1593305841991-05c297ba4575"), price: 320000, rank: "Epic", heroCount: 55, skinCount: 80, status: "Available" },
];

export const orders: Order[] = [
  { id: "ORD-1042", customer: "Andika P.", account: "Xavier Kolektor", price: 1299000, paymentStatus: "Paid", orderStatus: "Completed", date: "2026-06-22" },
  { id: "ORD-1043", customer: "Rizki M.", account: "Fanny Sultan", price: 2499000, paymentStatus: "Pending", orderStatus: "New", date: "2026-06-23" },
  { id: "ORD-1044", customer: "Dewi L.", account: "Ling Pro", price: 899000, paymentStatus: "Paid", orderStatus: "Processing", date: "2026-06-24" },
  { id: "ORD-1045", customer: "Bagas T.", account: "Chou Megah", price: 450000, paymentStatus: "Paid", orderStatus: "Completed", date: "2026-06-24" },
  { id: "ORD-1046", customer: "Sinta R.", account: "Lancelot Gagah", price: 320000, paymentStatus: "Refunded", orderStatus: "Rejected", date: "2026-06-25" },
];

export const customers: Customer[] = [
  { id: "CUS-01", name: "Andika Pratama", email: "andika@mail.com", orders: 4, spent: 3850000 },
  { id: "CUS-02", name: "Rizki Maulana", email: "rizki@mail.com", orders: 2, spent: 2899000 },
  { id: "CUS-03", name: "Dewi Lestari", email: "dewi@mail.com", orders: 6, spent: 5120000 },
  { id: "CUS-04", name: "Bagas Tirta", email: "bagas@mail.com", orders: 1, spent: 450000 },
  { id: "CUS-05", name: "Sinta Rahma", email: "sinta@mail.com", orders: 3, spent: 1980000 },
];

export const recentActivity = [
  { id: 1, text: "New account 'Fanny Sultan' added to stock", time: "2m ago", type: "add" as const },
  { id: 2, text: "Order ORD-1045 marked as completed", time: "18m ago", type: "order" as const },
  { id: 3, text: "Stock updated — 'Ling Pro' reserved", time: "1h ago", type: "stock" as const },
  { id: 4, text: "New customer Sinta Rahma registered", time: "3h ago", type: "customer" as const },
  { id: 5, text: "Revenue milestone: Rp 50.000.000 reached", time: "yesterday", type: "revenue" as const },
];

export const formatIDR = (n: number) =>
  "Rp " + n.toLocaleString("id-ID");
