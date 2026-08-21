import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getWebPlayers } from "@/lib/webPlayers";
import { getPlayerMeta } from "@/data/playerMeta";

import { AdminShell } from "@/components/admin/AdminShell";
import { PlayersAdmin } from "@/components/admin/PlayersAdmin";

import type {
  PlayerPosition,
  PlayerStatus,
  PlayerTeam,
} from "@/types/player";

type AppPlayerRow = {
  id: string;
  name: string;
  number: number | null;
  position: string | null;
  apf_player_id: number | null;
  is_active: boolean | null;
};

type TransferRow = {
  id: string;
  direction: "arrival" | "departure";
  movement_detail: string | null;
  player_id: number | null;
  player_name: string;
  other_club: string | null;
  occurred_on: string;
  season: string | null;
};

type AdminMovement = {
  id: string;
  direction: "arrival" | "departure";
  detail: string | null;
  date: string;
  season: string | null;
  otherClub: string | null;
};

type AdminPlayer = {
  id: string;
  webProfileId: string | null;
  name: string;
  team: PlayerTeam;
  position: PlayerPosition;
  status: PlayerStatus;
  shirtNumber: number | null;
  imageUrl: string | null;
  apfPlayerId: number | null;
  appPlayerId: string | null;
  active: boolean;
  inactiveFrom: string | null;
  source: "app" | "web" | "web+app";
  clubFrom: string | null;
  clubTo: string | null;
  movements: AdminMovement[];
};

type AppPlayerOption = {
  id: string;
  name: string;
  number: number;
  position: string | null;
  apfPlayerId: number | null;
  active: boolean;
};

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function inferPosition(
  value: string | null,
): PlayerPosition {
  const normalized =
    (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  return normalized.includes("brankar") ||
    normalized.includes("goalkeeper")
    ? "goalkeeper"
    : "player";
}

function sortMovements(
  movements: AdminMovement[],
): AdminMovement[] {
  return [...movements].sort(
    (a, b) =>
      a.date.localeCompare(b.date),
  );
}

function getCurrentPeriod(
  movements: AdminMovement[],
): {
  clubFrom: string | null;
  clubTo: string | null;
} {
  const sorted =
    sortMovements(movements);

  let clubFrom: string | null =
    null;

  let clubTo: string | null =
    null;

  sorted.forEach(
    (movement) => {
      if (
        movement.direction ===
        "arrival"
      ) {
        clubFrom =
          movement.date;

        clubTo =
          null;
      } else {
        clubTo =
          movement.date;
      }
    },
  );

  return {
    clubFrom,
    clubTo,
  };
}

export default async function AdminPlayersPage() {
  await requireAdmin();

  const supabase =
    getSupabaseAdmin();

  const [
    webPlayers,
    appResponse,
    transfersResponse,
  ] = await Promise.all([
    getWebPlayers(),

    supabase
      .from("players")
      .select(
        "id, name, number, position, apf_player_id, is_active",
      )
      .order("name", {
        ascending: true,
      }),

    supabase
      .from("club_transfers")
      .select(
        "id, direction, movement_detail, player_id, player_name, other_club, occurred_on, season",
      )
      .order("occurred_on", {
        ascending: true,
      }),
  ]);

  if (appResponse.error) {
    console.error(
      "ADMIN HRÁČI - players:",
      appResponse.error,
    );
  }

  if (transfersResponse.error) {
    console.error(
      "ADMIN HRÁČI - transfers:",
      transfersResponse.error,
    );
  }

  const appPlayerRows =
    (appResponse.data ??
      []) as AppPlayerRow[];

  const appPlayers:
    AppPlayerOption[] =
    appPlayerRows.map(
      (player) => ({
        id:
          String(player.id),

        name:
          String(player.name),

        number:
          player.number === null
            ? 0
            : Number(
                player.number,
              ),

        position:
          player.position,

        apfPlayerId:
          player.apf_player_id ===
          null
            ? null
            : Number(
                player.apf_player_id,
              ),

        active:
          player.is_active !==
          false,
      }),
    );

  const transferRows =
    (transfersResponse.data ??
      []) as TransferRow[];

  const movementsByApfId =
    new Map<
      number,
      AdminMovement[]
    >();

  const movementsByName =
    new Map<
      string,
      AdminMovement[]
    >();

  transferRows.forEach(
    (row) => {
      const movement:
        AdminMovement = {
          id:
            String(row.id),

          direction:
            row.direction,

          detail:
            row.movement_detail,

          date:
            row.occurred_on,

          season:
            row.season,

          otherClub:
            row.other_club,
        };

      if (
        row.player_id !==
        null
      ) {
        const playerId =
          Number(
            row.player_id,
          );

        const current =
          movementsByApfId.get(
            playerId,
          ) ?? [];

        current.push(
          movement,
        );

        movementsByApfId.set(
          playerId,
          current,
        );
      }

      const key =
        normalizeName(
          String(
            row.player_name,
          ),
        );

      const currentByName =
        movementsByName.get(
          key,
        ) ?? [];

      currentByName.push(
        movement,
      );

      movementsByName.set(
        key,
        currentByName,
      );
    },
  );

  const webByAppId =
    new Map(
      webPlayers
        .filter(
          (player) =>
            Boolean(
              player.appPlayerId,
            ),
        )
        .map(
          (player) => [
            String(
              player.appPlayerId,
            ),
            player,
          ],
        ),
    );

  const webByApfId =
    new Map(
      webPlayers
        .filter(
          (player) =>
            player.apfPlayerId !==
            null,
        )
        .map(
          (player) => [
            Number(
              player.apfPlayerId,
            ),
            player,
          ],
        ),
    );

  const webByName =
    new Map(
      webPlayers.map(
        (player) => [
          normalizeName(
            player.name,
          ),
          player,
        ],
      ),
    );

  const usedWebIds =
    new Set<string>();

  function getMovements(
    name: string,
    apfPlayerId:
      number | null,
  ): AdminMovement[] {
    const byId =
      apfPlayerId !== null
        ? movementsByApfId.get(
            apfPlayerId,
          ) ?? []
        : [];

    const byName =
      movementsByName.get(
        normalizeName(name),
      ) ?? [];

    const deduped =
      new Map<
        string,
        AdminMovement
      >();

    [
      ...byId,
      ...byName,
    ].forEach(
      (movement) => {
        deduped.set(
          movement.id,
          movement,
        );
      },
    );

    return sortMovements(
      Array.from(
        deduped.values(),
      ),
    );
  }

  const mergedPlayers:
    AdminPlayer[] =
    appPlayers.map(
      (
        appPlayer,
      ): AdminPlayer => {
        const webPlayer =
          webByAppId.get(
            appPlayer.id,
          ) ??
          (
            appPlayer.apfPlayerId !==
            null
              ? webByApfId.get(
                  appPlayer.apfPlayerId,
                )
              : undefined
          ) ??
          webByName.get(
            normalizeName(
              appPlayer.name,
            ),
          ) ??
          null;

        if (webPlayer) {
          usedWebIds.add(
            webPlayer.id,
          );
        }

        const apfPlayerId =
          webPlayer?.apfPlayerId ??
          appPlayer.apfPlayerId ??
          null;

        const legacyMeta =
          apfPlayerId !== null
            ? getPlayerMeta(
                apfPlayerId,
              )
            : null;

        const team:
          PlayerTeam =
          webPlayer?.team ??
          legacyMeta?.team ??
          "b";

        const position:
          PlayerPosition =
          webPlayer?.position ??
          legacyMeta?.position ??
          inferPosition(
            appPlayer.position,
          );

        const status:
          PlayerStatus =
          webPlayer?.status ??
          legacyMeta?.status ??
          "club";

        const shirtNumber =
          webPlayer?.shirtNumber ??
          (
            appPlayer.number > 0
              ? appPlayer.number
              : null
          ) ??
          legacyMeta?.shirtNumber ??
          null;

        const active =
          webPlayer?.active ??
          appPlayer.active;

        const imageUrl =
          webPlayer?.imageUrl ??
          (
            apfPlayerId !== null
              ? `/images/${apfPlayerId}.jpg`
              : null
          );

        const name =
          webPlayer?.name ??
          appPlayer.name;

        const movements =
          getMovements(
            name,
            apfPlayerId,
          );

        const {
          clubFrom,
          clubTo,
        } =
          getCurrentPeriod(
            movements,
          );

        return {
          id:
            webPlayer?.id ??
            `app:${appPlayer.id}`,

          webProfileId:
            webPlayer?.id ??
            null,

          name,
          team,
          position,
          status,
          shirtNumber,
          imageUrl,
          apfPlayerId,

          appPlayerId:
            appPlayer.id,

          active,

          inactiveFrom:
            webPlayer?.inactiveFrom ??
            null,

          source:
            webPlayer
              ? "web+app"
              : "app",

          clubFrom,
          clubTo,
          movements,
        };
      },
    );

  webPlayers
    .filter(
      (player) =>
        !usedWebIds.has(
          player.id,
        ),
    )
    .forEach(
      (player) => {
        const movements =
          getMovements(
            player.name,
            player.apfPlayerId,
          );

        const {
          clubFrom,
          clubTo,
        } =
          getCurrentPeriod(
            movements,
          );

        mergedPlayers.push({
          id:
            player.id,

          webProfileId:
            player.id,

          name:
            player.name,

          team:
            player.team,

          position:
            player.position,

          status:
            player.status,

          shirtNumber:
            player.shirtNumber,

          imageUrl:
            player.imageUrl ??
            (
              player.apfPlayerId !==
              null
                ? `/images/${player.apfPlayerId}.jpg`
                : null
            ),

          apfPlayerId:
            player.apfPlayerId,

          appPlayerId:
            player.appPlayerId ??
            null,

          active:
            player.active,

          inactiveFrom:
            player.inactiveFrom ??
            null,

          source:
            "web",

          clubFrom,
          clubTo,
          movements,
        });
      },
    );

  mergedPlayers.sort(
    (a, b) => {
      if (
        a.active !==
        b.active
      ) {
        return a.active
          ? -1
          : 1;
      }

      return a.name.localeCompare(
        b.name,
        "cs",
      );
    },
  );

  return (
    <AdminShell title="Hráči">
      <PlayersAdmin
        players={
          mergedPlayers
        }
        appPlayers={
          appPlayers
        }
      />
    </AdminShell>
  );
}
