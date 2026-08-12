import { supabase } from "@/lib/supabase";
import type { ClubTransfer } from "@/types/transfer";

type TransferRow = {
  id: string;
  direction: "arrival" | "departure";
  movement_type: "transfer" | "loan";
  player_id: number | null;
  player_name: string;
  description: string | null;
  image_url: string | null;
  other_club: string | null;
  occurred_on: string;
  published: boolean;
};

export async function getPublishedTransfers(): Promise<ClubTransfer[]> {
  const { data, error } = await supabase
    .from("club_transfers")
    .select("id, direction, movement_type, player_id, player_name, description, image_url, other_club, occurred_on, published")
    .eq("published", true)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Nepodařilo se načíst přestupy:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const item = row as unknown as TransferRow;
    return {
      id: item.id,
      direction: item.direction,
      movementType: item.movement_type,
      playerId: item.player_id,
      playerName: item.player_name,
      description: item.description,
      imageUrl: item.image_url,
      otherClub: item.other_club,
      occurredOn: item.occurred_on,
      published: item.published,
    };
  });
}
