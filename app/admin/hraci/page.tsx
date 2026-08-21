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

type TransferMarker = {
  player_id: number | null;
  player_name: string;
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
  hasArrival: boolean;
  source: "app" | "web" | "web+app";
};

type AppPlayerOption = {
  id: string;
  name: string;
  number: number;
  position: string | null;
  apfPlayerId: number | null;
  active: boolean;
};

function normalizeName(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .trim()
    .toLowerCase();
}

function inferPosition(
  value: string | null,
): PlayerPosition {
  const normalized =
    (value ?? "")
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLowerCase();

  if (
    normalized.includes("brankar") ||
    normalized.includes("goalkeeper")
  ) {
    return "goalkeeper";
  }

  return "player";
}

export default async function AdminPlayersPage() {
  await requireAdmin();

  const supabase =
    getSupabaseAdmin();

  /*
   * ========================================
   * NAČTENÍ DAT
   * ========================================
   */

  const [
    webPlayers,
    appResponse,
    arrivalsResponse,
  ] = await Promise.all([
    getWebPlayers(),

    supabase
      .from("players")
      .select(
        "id, name, number, position, apf_player_id, is_active",
      )
      .order(
        "name",
        {
          ascending: true,
        },
      ),

    supabase
      .from("club_transfers")
      .select(
        "player_id, player_name",
      )
      .eq(
        "direction",
        "arrival",
      ),
  ]);

  /*
   * ========================================
   * KONTROLA CHYB
   * ========================================
   */

  if (appResponse.error) {
    console.error(
      "ADMIN HRÁČI - chyba při načítání players:",
      appResponse.error,
    );
  }

  if (arrivalsResponse.error) {
    console.error(
      "ADMIN HRÁČI - chyba při načítání příchodů:",
      arrivalsResponse.error,
    );
  }

  /*
   * ========================================
   * HRÁČI Z APLIKACE
   * ========================================
   */

  const appPlayerRows =
    (appResponse.data ?? []) as AppPlayerRow[];

  const appPlayers: AppPlayerOption[] =
    appPlayerRows.map(
      (player) => ({
        id:
          String(
            player.id,
          ),

        name:
          String(
            player.name,
          ),

        number:
          player.number === null
            ? 0
            : Number(
                player.number,
              ),

        position:
          player.position,

        apfPlayerId:
          player.apf_player_id === null
            ? null
            : Number(
                player.apf_player_id,
              ),

        active:
          player.is_active !== false,
      }),
    );

  /*
   * ========================================
   * EXISTUJÍCÍ PŘÍCHODY
   * ========================================
   */

  const arrivalIds =
    new Set<number>();

  const arrivalNames =
    new Set<string>();

  const arrivalRows =
    (arrivalsResponse.data ?? []) as TransferMarker[];

  arrivalRows.forEach(
    (row) => {
      if (
        row.player_id !== null
      ) {
        arrivalIds.add(
          Number(
            row.player_id,
          ),
        );
      }

      if (
        row.player_name
      ) {
        arrivalNames.add(
          normalizeName(
            String(
              row.player_name,
            ),
          ),
        );
      }
    },
  );

  /*
   * ========================================
   * INDEX WEB HRÁČŮ PODLE APP ID
   * ========================================
   */

  const webByAppId =
    new Map(
      webPlayers
        .filter(
          (player) =>
            player.appPlayerId !== null &&
            player.appPlayerId !== undefined,
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

  /*
   * ========================================
   * INDEX WEB HRÁČŮ PODLE APF ID
   * ========================================
   */

  const webByApfId =
    new Map(
      webPlayers
        .filter(
          (player) =>
            player.apfPlayerId !== null,
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

  /*
   * ========================================
   * INDEX WEB HRÁČŮ PODLE JMÉNA
   * ========================================
   */

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

  /*
   * ========================================
   * POUŽITÉ WEB PROFILY
   * ========================================
   */

  const usedWebIds =
    new Set<string>();

  /*
   * ========================================
   * SPOJENÍ APLIKACE + WEB
   * ========================================
   */

  const mergedPlayers: AdminPlayer[] =
    appPlayers.map(
      (appPlayer): AdminPlayer => {
        const webPlayerByApp =
          webByAppId.get(
            appPlayer.id,
          );

        const webPlayerByApf =
          appPlayer.apfPlayerId !== null
            ? webByApfId.get(
                appPlayer.apfPlayerId,
              )
            : undefined;

        const webPlayerByName =
          webByName.get(
            normalizeName(
              appPlayer.name,
            ),
          );

        const webPlayer =
          webPlayerByApp ??
          webPlayerByApf ??
          webPlayerByName ??
          null;

        if (webPlayer) {
          usedWebIds.add(
            webPlayer.id,
          );
        }

        /*
         * ========================================
         * APF ID
         * ========================================
         */

        const apfPlayerId =
          webPlayer?.apfPlayerId ??
          appPlayer.apfPlayerId ??
          null;

        /*
         * ========================================
         * LEGACY META
         * ========================================
         */

        const legacyMeta =
          apfPlayerId !== null
            ? getPlayerMeta(
                apfPlayerId,
              )
            : null;

        /*
         * ========================================
         * TÝM
         * ========================================
         */

        const team: PlayerTeam =
          webPlayer?.team ??
          legacyMeta?.team ??
          "b";

        /*
         * ========================================
         * POZICE
         * ========================================
         */

        const position: PlayerPosition =
          webPlayer?.position ??
          legacyMeta?.position ??
          inferPosition(
            appPlayer.position,
          );

        /*
         * ========================================
         * STATUS
         * ========================================
         */

        const status: PlayerStatus =
          webPlayer?.status ??
          legacyMeta?.status ??
          "club";

        /*
         * ========================================
         * ČÍSLO DRESU
         * ========================================
         */

        let shirtNumber:
          number | null =
            null;

        if (
          webPlayer?.shirtNumber !== null &&
          webPlayer?.shirtNumber !== undefined
        ) {
          shirtNumber =
            webPlayer.shirtNumber;
        } else if (
          appPlayer.number > 0
        ) {
          shirtNumber =
            appPlayer.number;
        } else if (
          legacyMeta?.shirtNumber !== null &&
          legacyMeta?.shirtNumber !== undefined
        ) {
          shirtNumber =
            legacyMeta.shirtNumber;
        }

        /*
         * ========================================
         * AKTIVNÍ
         * ========================================
         */

        const active =
          webPlayer?.active ??
          appPlayer.active;

        /*
         * ========================================
         * FOTKA
         * ========================================
         */

        let imageUrl:
          string | null =
            webPlayer?.imageUrl ??
            null;

        if (
          !imageUrl &&
          apfPlayerId !== null
        ) {
          imageUrl =
            `/images/${apfPlayerId}.jpg`;
        }

        /*
         * ========================================
         * PŘÍCHOD
         * ========================================
         */

        const hasArrivalById =
          apfPlayerId !== null &&
          arrivalIds.has(
            apfPlayerId,
          );

        const hasArrivalByName =
          arrivalNames.has(
            normalizeName(
              appPlayer.name,
            ),
          );

        const hasArrival =
          hasArrivalById ||
          hasArrivalByName;

        /*
         * ========================================
         * VÝSLEDNÝ HRÁČ
         * ========================================
         */

        return {
          id:
            webPlayer?.id ??
            `app:${appPlayer.id}`,

          webProfileId:
            webPlayer?.id ??
            null,

          name:
            webPlayer?.name ??
            appPlayer.name,

          team,

          position,

          status,

          shirtNumber,

          imageUrl,

          apfPlayerId,

          /*
           * Hráč pochází z players,
           * takže jeho APP UUID známe.
           */
          appPlayerId:
            appPlayer.id,

          active,

          hasArrival,

          source:
            webPlayer
              ? "web+app"
              : "app",
        };
      },
    );

  /*
   * ========================================
   * HRÁČI, KTEŘÍ JSOU JEN NA WEBU
   * ========================================
   */

  const webOnlyPlayers =
    webPlayers.filter(
      (player) =>
        !usedWebIds.has(
          player.id,
        ),
    );

  webOnlyPlayers.forEach(
    (player) => {
      const hasArrivalById =
        player.apfPlayerId !== null &&
        arrivalIds.has(
          player.apfPlayerId,
        );

      const hasArrivalByName =
        arrivalNames.has(
          normalizeName(
            player.name,
          ),
        );

      const hasArrival =
        hasArrivalById ||
        hasArrivalByName;

      let imageUrl:
        string | null =
          player.imageUrl ??
          null;

      if (
        !imageUrl &&
        player.apfPlayerId !== null
      ) {
        imageUrl =
          `/images/${player.apfPlayerId}.jpg`;
      }

      const adminPlayer:
        AdminPlayer = {
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

          imageUrl,

          apfPlayerId:
            player.apfPlayerId,

          /*
           * Web-only hráč nemusí
           * mít APP vazbu.
           */
          appPlayerId:
            player.appPlayerId ??
            null,

          active:
            player.active,

          hasArrival,

          source:
            "web",
        };

      mergedPlayers.push(
        adminPlayer,
      );
    },
  );

  /*
   * ========================================
   * ŘAZENÍ
   * ========================================
   */

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

  /*
   * ========================================
   * DEBUG
   * ========================================
   */

  console.log(
    "ADMIN HRÁČI:",
    {
      statppka:
        appPlayers.length,

      web:
        webPlayers.length,

      webOnly:
        webOnlyPlayers.length,

      merged:
        mergedPlayers.length,

      appError:
        appResponse.error?.message ??
        null,

      arrivalsError:
        arrivalsResponse.error?.message ??
        null,
    },
  );

  /*
   * ========================================
   * VYKRESLENÍ
   * ========================================
   */

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