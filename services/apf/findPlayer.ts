import {
  clubConfig,
} from "@/config/club";

import {
  getPlayerMeta,
} from "@/data/playerMeta";

import {
  getSupabaseAdmin,
} from "@/lib/supabaseAdmin";

import {
  getSquad,
} from "./getSquad";

import type {
  SquadPlayer,
} from "@/types/player";

type AppPlayerRow = {
  id: string;
  name: string;
  number: number | null;
  position: string | null;
  apf_player_id: number | null;
  is_active: boolean | null;
};

type WebPlayerRow = {
  id: string;
  name: string;
  team: "a" | "b" | "both";
  position: "player" | "goalkeeper";
  status: "club" | "loan";
  shirt_number: number | null;
  image_url: string | null;
  apf_player_id: number | null;
  app_player_id: string | null;
  active: boolean;
};

function clean(
  value: string,
): string {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "");
}

/*
 * APF má slug typicky ve formátu:
 * prijmeni-jmeno
 *
 * STATPPKA ale často ukládá:
 * Jméno Příjmení
 *
 * Proto slova otočíme.
 */
function buildApfSlug(
  name: string,
): string {
  const parts =
    clean(name)
      .split(" ")
      .filter(Boolean);

  if (
    parts.length < 2
  ) {
    return slugify(name);
  }

  return slugify(
    [
      parts[
        parts.length - 1
      ],
      ...parts.slice(
        0,
        -1,
      ),
    ].join(" "),
  );
}

function inferPosition(
  value:
    string |
    null,
): "player" | "goalkeeper" {
  const normalized =
    (value ?? "")
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLowerCase();

  return (
    normalized.includes(
      "brankar",
    ) ||
    normalized.includes(
      "goalkeeper",
    )
  )
    ? "goalkeeper"
    : "player";
}

export async function findPlayer(
  playerId: number,
): Promise<
  SquadPlayer | null
> {
  const aTeam =
    clubConfig.teams.aTeam;

  const bTeam =
    clubConfig.teams.bTeam;

  /*
   * ========================================
   * 1) NEJDŘÍV KLASICKÁ APF SOUPISKA
   * ========================================
   */

  const [
    aPlayers,
    bPlayers,
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
    ]);

  const squadPlayer =
    aPlayers.find(
      (
        player,
      ) =>
        player.id ===
        playerId,
    ) ??
    bPlayers.find(
      (
        player,
      ) =>
        player.id ===
        playerId,
    ) ??
    null;

  if (
    squadPlayer
  ) {
    return squadPlayer;
  }

  /*
   * ========================================
   * 2) FALLBACK — WEB_PLAYER_PROFILES
   * ========================================
   *
   * Nová posila může mít platný APF profil,
   * ale ještě nemusí být v týmové tabulce APF.
   */

  const supabase =
    getSupabaseAdmin();

  const {
    data:
      webData,
    error:
      webError,
  } =
    await supabase
      .from(
        "web_player_profiles",
      )
      .select(
        [
          "id",
          "name",
          "team",
          "position",
          "status",
          "shirt_number",
          "image_url",
          "apf_player_id",
          "app_player_id",
          "active",
        ].join(", "),
      )
      .eq(
        "apf_player_id",
        playerId,
      )
      .maybeSingle();

  if (
    webError
  ) {
    console.error(
      `findPlayer web profile ${playerId}:`,
      webError,
    );
  }

  const webPlayer =
    webData
      ? (
          webData as unknown as
            WebPlayerRow
        )
      : null;

  /*
   * ========================================
   * 3) FALLBACK — STATPPKA PLAYERS
   * ========================================
   */

  const {
    data:
      appData,
    error:
      appError,
  } =
    await supabase
      .from(
        "players",
      )
      .select(
        [
          "id",
          "name",
          "number",
          "position",
          "apf_player_id",
          "is_active",
        ].join(", "),
      )
      .eq(
        "apf_player_id",
        playerId,
      )
      .maybeSingle();

  if (
    appError
  ) {
    console.error(
      `findPlayer STATPPKA ${playerId}:`,
      appError,
    );
  }

  const appPlayer =
    appData
      ? (
          appData as unknown as
            AppPlayerRow
        )
      : null;

  if (
    !webPlayer &&
    !appPlayer
  ) {
    return null;
  }

  const meta =
    getPlayerMeta(
      playerId,
    );

  const name =
    clean(
      webPlayer?.name ??
      appPlayer?.name ??
      "",
    );

  if (
    !name
  ) {
    return null;
  }

  const team =
    webPlayer?.team ??
    meta.team;

  const position =
    webPlayer?.position ??
    (
      appPlayer
        ? inferPosition(
            appPlayer.position,
          )
        : meta.position
    );

  const status =
    webPlayer?.status ??
    meta.status;

  const shirtNumber =
    webPlayer?.shirt_number ??
    appPlayer?.number ??
    meta.shirtNumber;

  const imageUrl =
    webPlayer?.image_url ??
    `/images/${playerId}.jpg`;

  return {
    id:
      playerId,

    name,

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

    imageUrl,

    position,

    team,

    status,

    shirtNumber,

    /*
     * Důležité:
     * pro nového hráče slug sestavíme
     * z jeho jména. getPlayerProfile
     * navíc zkusí i obrácenou variantu.
     */
    apfSlug:
      buildApfSlug(
        name,
      ),
  };
}
