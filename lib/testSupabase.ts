import { supabase } from "./supabase";

export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from("players")
    .select("id, name, number, position, apf_player_id")
    .eq("apf_player_id", 3937)
    .maybeSingle();

  if (error) {
    console.error("SUPABASE CHYBA:", error);
    return null;
  }

  console.log("SUPABASE TEST:", data);

  return data;
}
