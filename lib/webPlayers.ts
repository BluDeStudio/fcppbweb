import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export type WebPlayerProfile = {
  id: string;
  name: string;
  team: "a" | "b";
  position: "player" | "goalkeeper";
  status: "club" | "loan";
  shirtNumber: number | null;
  imageUrl: string | null;
  apfPlayerId: number | null;
  appPlayerId: string | null;
  active: boolean;
};

type WebPlayerRow = {
  id: string;
  name: string;
  team: "a" | "b";
  position: "player" | "goalkeeper";
  status: "club" | "loan";
  shirt_number: number | null;
  image_url: string | null;
  apf_player_id: number | null;
  app_player_id: string | null;
  active: boolean;
};

function mapRow(row: WebPlayerRow): WebPlayerProfile {
  return {
    id: row.id,
    name: row.name,
    team: row.team,
    position: row.position,
    status: row.status,
    shirtNumber: row.shirt_number,
    imageUrl: row.image_url,
    apfPlayerId: row.apf_player_id,
    appPlayerId: row.app_player_id,
    active: row.active,
  };
}

export async function getWebPlayers(): Promise<WebPlayerProfile[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("web_player_profiles")
    .select("*")
    .order("active", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("Web players:", error);
    return [];
  }

  return (data ?? []).map((row) => mapRow(row as WebPlayerRow));
}
