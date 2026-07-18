// ============================================
// FILE: lib/accounts.ts - FULL (DENGAN IMAGES ARRAY)
// ============================================

import { supabase } from "./supabase";

// ================= RANK FF =================
export const ffRanks = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Heroic",
  "Elite Heroic",
  "Master",
  "Elite Master",
  "Grandmaster",
] as const;

export type FFRank = (typeof ffRanks)[number];

// ================= RANK MLBB =================
export const mlbbRanks = [
  "Warrior",
  "Elite",
  "Master",
  "Grandmaster",
  "Epic",
  "Legend",
  "Mythic",
  "Mythic Honor",
  "Mythic Glory",
  "Mythic Immortal",
] as const;

export type MLBBRank = (typeof mlbbRanks)[number];

export type AccountRank = MLBBRank | FFRank;

export const gameTypes = ["Free Fire", "Mobile Legends"] as const;
export type GameType = (typeof gameTypes)[number];

export const loginMethods = ["Google", "Facebook", "VK", "Apple", "Email"] as const;
export type LoginMethod = (typeof loginMethods)[number];

// ================= INTERFACE ACCOUNT =================
export interface Account {
  id: string;
  name: string;
  code: string;
  price: number;
  originalPrice?: number;
  rank: string;
  game_type: GameType;
  // FF Fields
  level: number;
  rank_br: FFRank;
  rank_cs: FFRank;
  evo_gun: number;
  bundle: number;
  emote: number;
  elite_pass: number;
  login_method: LoginMethod;
  // MLBB Fields
  hero_count: number;
  skin_count: number;
  heroes: number;
  skins: number;
  // Common
  status: "Available" | "Reserved" | "Sold";
  image: string | null;
  images: string[]; // ← TAMBAH! Array of image URLs
  description: string | null;
  category: string;
  title: string;
  emoji: string;
  cover: string;
  highlights: string[];
  available: boolean;
  created_at: string;
  updated_at: string;
}

// ================= RANK COLORS =================
const ffRankColors: Record<string, string> = {
  Bronze: "text-amber-600",
  Silver: "text-gray-400",
  Gold: "text-yellow-400",
  Platinum: "text-cyan-400",
  Diamond: "text-blue-400",
  Heroic: "text-purple-400",
  "Elite Heroic": "text-purple-300",
  Master: "text-red-400",
  "Elite Master": "text-red-300",
  Grandmaster: "text-orange-400",
};

const mlbbRankColors: Record<string, string> = {
  Warrior: "text-gray-400",
  Elite: "text-slate-300",
  Master: "text-cyan-400",
  Grandmaster: "text-green-400",
  Epic: "text-red-400",
  Legend: "text-orange-400",
  Mythic: "text-purple-400",
  "Mythic Honor": "text-purple-300",
  "Mythic Glory": "text-yellow-400",
  "Mythic Immortal": "text-amber-400",
};

const ffRankBadgeColors: Record<string, string> = {
  Bronze: "border-amber-600/30 bg-amber-600/10 text-amber-400",
  Silver: "border-gray-400/30 bg-gray-400/10 text-gray-300",
  Gold: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
  Platinum: "border-cyan-400/30 bg-cyan-400/10 text-cyan-400",
  Diamond: "border-blue-400/30 bg-blue-400/10 text-blue-400",
  Heroic: "border-purple-400/30 bg-purple-400/10 text-purple-400",
  "Elite Heroic": "border-purple-300/30 bg-purple-300/10 text-purple-300",
  Master: "border-red-400/30 bg-red-400/10 text-red-400",
  "Elite Master": "border-red-300/30 bg-red-300/10 text-red-300",
  Grandmaster: "border-orange-400/30 bg-orange-400/10 text-orange-400",
};

const mlbbRankBadgeColors: Record<string, string> = {
  Warrior: "border-gray-500/30 bg-gray-500/10 text-gray-400",
  Elite: "border-slate-400/30 bg-slate-400/10 text-slate-300",
  Master: "border-cyan-400/30 bg-cyan-400/10 text-cyan-400",
  Grandmaster: "border-green-400/30 bg-green-400/10 text-green-400",
  Epic: "border-red-400/30 bg-red-400/10 text-red-400",
  Legend: "border-orange-400/30 bg-orange-400/10 text-orange-400",
  Mythic: "border-purple-400/30 bg-purple-400/10 text-purple-400",
  "Mythic Honor": "border-purple-300/30 bg-purple-300/10 text-purple-300",
  "Mythic Glory": "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
  "Mythic Immortal": "border-amber-400/30 bg-amber-400/10 text-amber-400",
};

export function getRankColor(rank: string, gameType?: string): string {
  if (gameType === "Free Fire") {
    return ffRankColors[rank] || "text-muted-foreground";
  }
  return mlbbRankColors[rank] || "text-muted-foreground";
}

export function getRankBadge(rank: string, gameType?: string): string {
  if (gameType === "Free Fire") {
    return ffRankBadgeColors[rank] || "border-border bg-card/50 text-muted-foreground";
  }
  return mlbbRankBadgeColors[rank] || "border-border bg-card/50 text-muted-foreground";
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ================= MAP ACCOUNT =================
function mapAccount(data: any): Account {
  const isFF = data.game_type === "Free Fire" || !data.game_type;
  
  return {
    id: data.id,
    name: data.name || "Unnamed Account",
    code: data.code || "N/A",
    price: data.price || 0,
    originalPrice: data.original_price || undefined,
    rank: data.rank || (isFF ? data.rank_br : "Epic"),
    game_type: data.game_type || "Free Fire",
    level: data.level || 0,
    rank_br: data.rank_br || "Bronze",
    rank_cs: data.rank_cs || "Bronze",
    evo_gun: data.evo_gun || 0,
    bundle: data.bundle || 0,
    emote: data.emote || 0,
    elite_pass: data.elite_pass || 0,
    login_method: data.login_method || "Google",
    hero_count: data.hero_count || 0,
    skin_count: data.skin_count || 0,
    heroes: data.hero_count || 0,
    skins: data.skin_count || 0,
    status: data.status || "Available",
    image: data.image || null,
    images: data.images || (data.image ? [data.image] : []), // ← TAMBAH!
    description: data.description || null,
    category: data.category || "epic",
    title: data.title || getTitle(data),
    emoji: data.emoji || getEmoji(data),
    cover: data.cover || getCover(data),
    highlights: data.highlights || getDefaultHighlights(data),
    available: data.status === "Available",
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

function getTitle(data: any): string {
  if (data.game_type === "Free Fire") {
    return `${data.rank_br || "Bronze"} · Lv.${data.level || 0}`;
  }
  return data.rank || "Epic";
}

function getEmoji(data: any): string {
  if (data.game_type === "Free Fire") return "🔥";
  return "⚔️";
}

function getCover(data: any): string {
  if (data.game_type === "Free Fire") {
    return "from-orange-900/80 via-red-800/60 to-orange-950/80";
  }
  return "from-indigo-900/80 via-purple-800/60 to-indigo-950/80";
}

function getDefaultHighlights(data: any): string[] {
  if (data.game_type === "Free Fire") {
    return [
      `Level ${data.level || 0}`,
      `Rank BR: ${data.rank_br || "Bronze"}`,
      `Evo Gun: ${data.evo_gun || 0}`,
      `Bundle: ${data.bundle || 0}`,
      `Emote: ${data.emote || 0}`,
    ];
  }
  return [
    `Rank ${data.rank || "Epic"}`,
    `${data.hero_count || 0} Heroes`,
    `${data.skin_count || 0} Skins`,
  ];
}

// ================= GET ACCOUNTS =================
export async function getAccounts(): Promise<Account[]> {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching accounts:", error);
      return [];
    }
    return (data || []).map(mapAccount);
  } catch (error) {
    console.error("Error in getAccounts:", error);
    return [];
  }
}

export async function getAccountsByGame(gameType: "Free Fire" | "Mobile Legends"): Promise<Account[]> {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("game_type", gameType)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching accounts by game:", error);
      return [];
    }
    return (data || []).map(mapAccount);
  } catch (error) {
    console.error("Error in getAccountsByGame:", error);
    return [];
  }
}

export async function getAccount(id: string): Promise<Account | null> {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return mapAccount(data);
  } catch (error) {
    console.error("Error in getAccount:", error);
    return null;
  }
}

export function buildWhatsAppUrl(account: Account, whatsappNumber?: string): string {
  const phone = whatsappNumber?.replace(/[^0-9]/g, '') || '628571767780';
  const isFF = account.game_type === "Free Fire";
  
  let message = `Halo Kivora Point, saya tertarik dengan akun berikut:\n\n`;
  message += `📌 *${account.name}* (${account.code})\n`;
  message += `🎮 Game: ${account.game_type}\n`;
  
  if (isFF) {
    message += `📊 Level: ${account.level}\n`;
    message += `🏆 Rank BR: ${account.rank_br}\n`;
    message += `🏆 Rank CS: ${account.rank_cs}\n`;
    message += `🔫 Evo Gun: ${account.evo_gun}\n`;
    message += `🎒 Bundle: ${account.bundle}\n`;
    message += `💃 Emote: ${account.emote}\n`;
    message += `🎖️ Elite Pass: ${account.elite_pass}\n`;
    message += `🔑 Login: ${account.login_method}\n`;
  } else {
    message += `🏆 Rank: ${account.rank}\n`;
    message += `⚔️ Heroes: ${account.heroes}\n`;
    message += `✨ Skins: ${account.skins}\n`;
  }
  
  message += `💰 Harga: ${formatIDR(account.price)}\n\n`;
  message += `Saya siap melakukan pembayaran.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}