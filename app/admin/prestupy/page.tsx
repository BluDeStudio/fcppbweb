import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

import { AdminShell } from "@/components/admin/AdminShell";
import { TransferAdminForm } from "@/components/admin/TransferAdminForm";
import {
  TransfersAdmin,
  type AdminTransfer,
} from "@/components/admin/TransfersAdmin";

import { clubConfig } from "@/config/club";
import { getSquad } from "@/services/apf/getSquad";

type TransferRow = {
  id: string;
  direction: "arrival" | "departure";
  movement_type: "transfer" | "loan";
  player_id: number | null;
  player_name: string;
  description: string | null;
  image_url: string | null;
  other_club: string | null;
  other_club_apf_id: number | null;
  other_club_logo_url: string | null;
  occurred_on: string;
  published: boolean;
};

export default async function AdminTransfersPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
}) {
  await requireAdmin();

  const params = await searchParams;

  const aTeam = clubConfig.teams.aTeam;
  const bTeam = clubConfig.teams.bTeam;

  const [
    squadResult,
    transferResult,
  ] = await Promise.all([
    Promise.all([
      getSquad({
        teamId: aTeam.teamId,
        teamSlug: aTeam.teamSlug,
        team: "a",
      }),
      getSquad({
        teamId: bTeam.teamId,
        teamSlug: bTeam.teamSlug,
        team: "b",
      }),
    ]),

    getSupabaseAdmin()
      .from("club_transfers")
      .select(
        [
          "id",
          "direction",
          "movement_type",
          "player_id",
          "player_name",
          "description",
          "image_url",
          "other_club",
          "other_club_apf_id",
          "other_club_logo_url",
          "occurred_on",
          "published",
        ].join(", "),
      )
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const playerMap =
    new Map<
      number,
      {
        id: number;
        name: string;
      }
    >();

  const [
    aPlayers,
    bPlayers,
  ] = squadResult;

  [
    ...aPlayers,
    ...bPlayers,
  ].forEach((player) => {
    playerMap.set(player.id, {
      id: player.id,
      name: player.name,
    });
  });

  const players =
    Array.from(
      playerMap.values(),
    ).sort((a, b) =>
      a.name.localeCompare(
        b.name,
        "cs",
      ),
    );

  if (transferResult.error) {
    console.error(
      "Admin transfers:",
      transferResult.error,
    );
  }

  const transfers:
    AdminTransfer[] =
    (
      transferResult.data ??
      []
    ).map((row) => {
      const item =
        row as unknown as TransferRow;

      return {
        id: item.id,
        direction: item.direction,
        movementType: item.movement_type,
        playerId: item.player_id,
        playerName: item.player_name,
        description: item.description,
        imageUrl: item.image_url,
        otherClub: item.other_club,
        otherClubApfId: item.other_club_apf_id,
        otherClubLogoUrl: item.other_club_logo_url,
        occurredOn: item.occurred_on,
        published: item.published,
      };
    });

  return (
    <AdminShell title="Přestupy">
      {params.success && (
        <p
          style={{
            color:
              "var(--primary)",
          }}
        >
          ✅ Změna byla uložena.
        </p>
      )}

      {params.error && (
        <p
          style={{
            color:
              "#ff7474",
          }}
        >
          ❌ Chyba:{" "}
          {params.error}
        </p>
      )}

      <TransferAdminForm
        players={players}
      />

      <TransfersAdmin
        transfers={transfers}
      />
    </AdminShell>
  );
}
