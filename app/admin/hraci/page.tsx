import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getWebPlayers } from "@/lib/webPlayers";

import { AdminShell } from "@/components/admin/AdminShell";
import { PlayersAdmin } from "@/components/admin/PlayersAdmin";

export default async function AdminPlayersPage() {
  await requireAdmin();

  const supabase = getSupabaseAdmin();

  const [players, appResponse] = await Promise.all([
    getWebPlayers(),
    supabase
      .from("players")
      .select("id, name, number")
      .order("name", { ascending: true }),
  ]);

  const appPlayers = (appResponse.data ?? []).map((player) => ({
    id: String(player.id),
    name: String(player.name),
    number: Number(player.number),
  }));

  return (
    <AdminShell title="Hráči">
      <PlayersAdmin players={players} appPlayers={appPlayers} />
    </AdminShell>
  );
}
