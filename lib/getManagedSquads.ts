import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  getWebPlayers,
  type WebPlayerProfile,
} from "@/lib/webPlayers";

import { clubConfig } from "@/config/club";

import { getSquad } from "@/services/apf/getSquad";

import type {
  SquadPlayer,
} from "@/types/player";

type AppPlayerLink = {
  id: string;
  apf_player_id: number | null;
  number: number | null;
};

export type ManagedSquads = {
  aPlayers: SquadPlayer[];
  bPlayers: SquadPlayer[];
};

export async function getManagedSquads(): Promise<ManagedSquads> {
  const aTeam =
    clubConfig.teams.aTeam;

  const bTeam =
    clubConfig.teams.bTeam;

  const [
    aApf,
    bApf,
    webProfiles,
  ] =
    await Promise.all([
      getSquad({
        teamId:
          aTeam.teamId,
        teamSlug:
          aTeam.teamSlug,
        team:
          "a",
      }),

      getSquad({
        teamId:
          bTeam.teamId,
        teamSlug:
          bTeam.teamSlug,
        team:
          "b",
      }),

      getWebPlayers(),
    ]);

  const appLinks =
    await loadAppLinks(
      webProfiles,
    );

  /*
   * ========================================
   * WEB PROFILY PODLE APF ID
   * ========================================
   */

  const profileByApfId =
    new Map<
      number,
      WebPlayerProfile
    >();

  webProfiles.forEach(
    (
      profile,
    ) => {
      const resolved =
        resolveApfId(
          profile,
          appLinks,
        );

      if (
        resolved !==
        null
      ) {
        profileByApfId.set(
          resolved,
          profile,
        );
      }
    },
  );

  /*
   * ========================================
   * APF HRÁČI — ZACHOVÁME I BĚHEM MIGRACE
   * ========================================
   *
   * Dokud hráče nepřevedeš do ADMIN → HRÁČI,
   * zůstane fungovat starý APF/playerMeta stav.
   *
   * Jakmile pro něj existuje web_player_profile:
   * - ADMIN rozhoduje A/B,
   * - ADMIN rozhoduje aktivní/neaktivní,
   * - ADMIN rozhoduje pozici, status, číslo a fotku.
   * ========================================
   */

  const rawById =
    new Map<
      number,
      SquadPlayer
    >();

  [
    ...aApf,
    ...bApf,
  ].forEach(
    (
      raw,
    ) => {
      const existing =
        rawById.get(
          raw.id,
        );

      if (
        !existing
      ) {
        rawById.set(
          raw.id,
          raw,
        );

        return;
      }

      rawById.set(
        raw.id,
        {
          ...existing,

          matches:
            Math.max(
              existing.matches,
              raw.matches,
            ),

          goals:
            Math.max(
              existing.goals,
              raw.goals,
            ),

          assists:
            Math.max(
              existing.assists,
              raw.assists,
            ),

          yellowCards:
            Math.max(
              existing.yellowCards,
              raw.yellowCards,
            ),

          redCards:
            Math.max(
              existing.redCards,
              raw.redCards,
            ),
        },
      );
    },
  );

  const managed =
    new Map<
      number,
      SquadPlayer
    >();

  rawById.forEach(
    (
      raw,
      playerId,
    ) => {
      const profile =
        profileByApfId.get(
          playerId,
        );

      /*
       * Pokud hráče v ADMINU označíš jako
       * NEAKTIVNÍ, z aktuální soupisky zmizí,
       * i když ho APF ještě pořád zobrazuje.
       */
      if (
        profile &&
        !profile.active
      ) {
        return;
      }

      managed.set(
        playerId,
        profile
          ? mergeProfile(
              raw,
              profile,
              playerId,
              appLinks,
            )
          : raw,
      );
    },
  );

  /*
   * ========================================
   * RUČNĚ PŘIDANÍ HRÁČI
   * ========================================
   *
   * Hráč může být v ADMINU aktivní dříve,
   * než ho APF přidá do týmové soupisky.
   *
   * Pokud máme APF ID (ručně nebo přes
   * propojenou STATPPKA), vytvoříme mu
   * kartu s nulovými APF statistikami.
   * ========================================
   */

  webProfiles.forEach(
    (
      profile,
    ) => {
      if (
        !profile.active
      ) {
        return;
      }

      const playerId =
        resolveApfId(
          profile,
          appLinks,
        );

      if (
        playerId ===
        null ||
        managed.has(
          playerId,
        )
      ) {
        return;
      }

      managed.set(
        playerId,
        createManualPlayer(
          profile,
          playerId,
          appLinks,
        ),
      );
    },
  );

  const allPlayers =
    Array.from(
      managed.values(),
    );

  const aPlayers =
    allPlayers
      .filter(
        (
          player,
        ) =>
          player.team ===
            "a" ||
          player.team ===
            "both",
      )
      .sort(
        sortPlayers,
      );

  const bPlayers =
    allPlayers
      .filter(
        (
          player,
        ) =>
          player.team ===
            "b" ||
          player.team ===
            "both",
      )
      .sort(
        sortPlayers,
      );

  return {
    aPlayers,
    bPlayers,
  };
}

async function loadAppLinks(
  profiles:
    WebPlayerProfile[],
): Promise<
  Map<
    string,
    AppPlayerLink
  >
> {
  const ids =
    Array.from(
      new Set(
        profiles
          .map(
            (
              profile,
            ) =>
              profile.appPlayerId,
          )
          .filter(
            (
              id,
            ): id is string =>
              Boolean(id),
          ),
      ),
    );

  const map =
    new Map<
      string,
      AppPlayerLink
    >();

  if (
    ids.length ===
    0
  ) {
    return map;
  }

  const {
    data,
    error,
  } =
    await getSupabaseAdmin()
      .from(
        "players",
      )
      .select(
        "id, apf_player_id, number",
      )
      .in(
        "id",
        ids,
      );

  if (
    error
  ) {
    console.error(
      "Načtení vazeb STATPPKA hráčů:",
      error,
    );

    return map;
  }

  (
    data ??
    []
  ).forEach(
    (
      row,
    ) => {
      map.set(
        String(
          row.id,
        ),
        {
          id:
            String(
              row.id,
            ),

          apf_player_id:
            row.apf_player_id ===
            null
              ? null
              : Number(
                  row.apf_player_id,
                ),

          number:
            row.number ===
            null
              ? null
              : Number(
                  row.number,
                ),
        },
      );
    },
  );

  return map;
}

function resolveApfId(
  profile:
    WebPlayerProfile,
  appLinks:
    Map<
      string,
      AppPlayerLink
    >,
): number | null {
  if (
    profile.apfPlayerId !==
    null
  ) {
    return profile.apfPlayerId;
  }

  if (
    !profile.appPlayerId
  ) {
    return null;
  }

  const app =
    appLinks.get(
      profile.appPlayerId,
    );

  const id =
    app?.apf_player_id ??
    null;

  return (
    id !== null &&
    Number.isFinite(id)
  )
    ? id
    : null;
}

function mergeProfile(
  raw:
    SquadPlayer,
  profile:
    WebPlayerProfile,
  playerId:
    number,
  appLinks:
    Map<
      string,
      AppPlayerLink
    >,
): SquadPlayer {
  return {
    ...raw,

    id:
      playerId,

    name:
      profile.name ||
      raw.name,

    profileUrl:
      `/hrac/${playerId}`,

    imageUrl:
      profile.imageUrl ||
      raw.imageUrl ||
      `/images/${playerId}.jpg`,

    position:
      profile.position,

    team:
      profile.team,

    status:
      profile.status,

    shirtNumber:
      profile.shirtNumber ??
      getAppNumber(
        profile,
        appLinks,
      ) ??
      raw.shirtNumber,
  };
}

function createManualPlayer(
  profile:
    WebPlayerProfile,
  playerId:
    number,
  appLinks:
    Map<
      string,
      AppPlayerLink
    >,
): SquadPlayer {
  return {
    id:
      playerId,

    name:
      profile.name,

    matches:
      0,

    goals:
      0,

    assists:
      0,

    yellowCards:
      0,

    redCards:
      0,

    profileUrl:
      `/hrac/${playerId}`,

    imageUrl:
      profile.imageUrl ||
      `/images/${playerId}.jpg`,

    position:
      profile.position,

    team:
      profile.team,

    status:
      profile.status,

    shirtNumber:
      profile.shirtNumber ??
      getAppNumber(
        profile,
        appLinks,
      ),

    /*
     * Dokud APF hráče nepřidá do týmové
     * tabulky, slug nemusíme znát pro kartu.
     * Profil /hrac/[id] ho později dohledá
     * přes existující APF služby.
     */
    apfSlug:
      "",
  };
}

function getAppNumber(
  profile:
    WebPlayerProfile,
  appLinks:
    Map<
      string,
      AppPlayerLink
    >,
): number | null {
  if (
    !profile.appPlayerId
  ) {
    return null;
  }

  return (
    appLinks.get(
      profile.appPlayerId,
    )?.number ??
    null
  );
}

function sortPlayers(
  a:
    SquadPlayer,
  b:
    SquadPlayer,
): number {
  if (
    a.position !==
    b.position
  ) {
    return a.position ===
      "goalkeeper"
      ? -1
      : 1;
  }

  return a.name.localeCompare(
    b.name,
    "cs",
  );
}
