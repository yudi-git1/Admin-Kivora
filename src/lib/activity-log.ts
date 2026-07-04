// ============================================
// FILE: lib/activity-log.ts
// ============================================

import { supabase } from "./supabase";

export async function logActivity(
  action: string,
  details?: Record<string, any>
) {
  try {
    // Ambil user saat ini
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("admin_logs").insert({
      admin_id: user?.id || null,
      action: action,
      details: details || {},
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

export async function getActivityLogs(limit: number = 50) {
  const { data, error } = await supabase
    .from("admin_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch activity logs:", error);
    return [];
  }

  return data || [];
}