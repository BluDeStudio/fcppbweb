import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getWebPlayers } from "@/lib/webPlayers";

import { AdminShell } from "@/components/admin/AdminShell";
import { PlayersAdmin } from "@/components/admin/PlayersAdmin";

type TransferMarker = {
  player_id: number | null;
  player_name: string;
};

export default async function AdminPlayersPage() {
  await requireAdmin();

  const supabase =
    getSupabaseAdmin();

  const [
    players,
    appResponse,
    arrivalsResponse,
  ] =
    await Promise.all([
      getWebPlayers(),

      supabase
        .from("players")
        .select(
          "id, name, number",
        )
        .order(
          "name",
          {
            ascending:
              true,
          },
        ),

      supabase
        .from(
          "club_transfers",
        )
        .select(
          "player_id, player_name",
        )
        .eq(
          "direction",
          "arrival",
        ),
    ]);

  const appPlayers =
    (
      appResponse.data ??
      []
    ).map(
      (
        player,
      ) => ({
        id:
          String(
            player.id,
          ),

        name:
          String(
            player.name,
          ),

        number:
          Number(
            player.number,
          ),
      }),
    );

  const arrivalIds =
    new Set<
      number
    >();

  const arrivalNames =
    new Set<
      string
    >();

  (
    arrivalsResponse.data ??
    []
  ).forEach(
    (
      row,
    ) => {
      const item =
        row as TransferMarker;

      if (
        item.player_id !==
        null
      ) {
        arrivalIds.add(
          Number(
            item.player_id,
          ),
        );
      }

      arrivalNames.add(
        String(
          item.player_name,
        )
          .trim()
          .toLocaleLowerCase(
            "cs-CZ",
          ),
      );
    },
  );

  const playersWithTransferState =
    players.map(
      (
        player,
      ) => ({
        ...player,

        hasArrival:
          (
            player.apfPlayerId !==
              null &&
            arrivalIds.has(
              player.apfPlayerId,
            )
          ) ||
          arrivalNames.has(
            player.name
              .trim()
              .toLocaleLowerCase(
                "cs-CZ",
              ),
          ),
      }),
    );

  return (
    <AdminShell title="Hráči">
      <PlayersAdmin
        players={
          playersWithTransferState
        }
        appPlayers={
          appPlayers
        }
      />
    </AdminShell>
  );
}
