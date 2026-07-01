import { supabase } from "@/lib/supabase";

export async function createAccount(payload: {
  name: string;
  code: string;
  price: number;
  image?: string;
}) {
  const { data, error } = await supabase.from("accounts").insert([
    {
      name: payload.name,
      code: payload.code,
      price: payload.price,
      image: payload.image || "",
      hero_count: 0,
      skin_count: 0,
      status: "Available",
    },
  ]);

  if (error) {
    console.error("CREATE ERROR:", error.message);
    return null;
  }

  return data;
}