import { supabase } from "@/lib/supabase";

export async function updateAccount(
  id: string,
  payload: {
    name?: string;
    code?: string;
    price?: number;
    status?: string;
    hero_count?: number;
    skin_count?: number;
  }
) {
  const { error } = await supabase
    .from("accounts")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("UPDATE ERROR:", error.message);
    return false;
  }

  return true;
}