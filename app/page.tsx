import { HomeDashboard } from "@/components/home/HomeDashboard";
import type { PlayerOfMatch } from "@/components/home/HomeDashboard";

import { clubConfig } from "@/config/club";

import { supabase } from "@/lib/supabase";
import { testSupabaseConnection } from "@/lib/testSupabase";

import {
  getDepartedPlayerIds,
  getPublishedTransfers,
} from "@/lib/getTransfers";

import { getLeagueTable } from "@/services/apf/getLeagueTable";
import { getMatchResults } from "@/services/apf/getMatchResults";
import { getNextMatch } from "@/services/apf/getNextMatch";
import { getSquad } from "@/services/apf/getSquad";

import type { LeagueRow } from "@/types/league";
import type { MatchResult } from "@/types/match";
import type { NextMatch } from "@/types/nextMatch";
import type { SquadPlayer } from "@/types/player";
import type { ClubTransfer } from "@/types/transfer";

/*
 * ============================================================
 * INTERNÍ TYPY PRO DATA ZE SUPABASE
 * ============================================================
 */

type FinishedMatchRow = {
  id: string;
  clubId: string;
  matchTitle: string;
  team: string;
  date: string;
  time: string | null;
  finishedAt: string | null;
};

type PlayerMatchStatRow = {
  finishedMatchId: string;
  playerId: string;
  goals: number;
  assists: number;
  isPlayerOfTheMatch: boolean;
};

type AppPlayerRow = {
  id: string;
  clubId: string;
  name: string;
  number: number;
  apfPlayerId: number | null;
};

export default async function HomePage() {
  await testSupabaseConnection();

  const a = clubConfig.teams.aTeam;
  const b = clubConfig.teams.bTeam;

  let aLeagueTable: LeagueRow[] = [];
  let bLeagueTable: LeagueRow[] = [];

  let aMatches: MatchResult[] = [];
  let bMatches: MatchResult[] = [];

  let aNextMatch: NextMatch | null = null;
  let bNextMatch: NextMatch | null = null;

  let aPlayers: SquadPlayer[] = [];
  let bPlayers: SquadPlayer[] = [];

  let transfers: ClubTransfer[] = [];

  let aPlayerOfMatch: PlayerOfMatch | null = null;
  let bPlayerOfMatch: PlayerOfMatch | null = null;

  /*
   * ============================================================
   * TABULKY
   * ============================================================
   */

  try {
    [aLeagueTable, bLeagueTable] = await Promise.all([
      getLeagueTable({
        competitionId: a.competition.id,
        competitionSlug: a.competition.slug,
        teamName: a.teamName,
      }),

      getLeagueTable({
        competitionId: b.competition.id,
        competitionSlug: b.competition.slug,
        teamName: b.teamName,
      }),
    ]);
  } catch (error) {
    console.error("Tabulky APF:", error);
  }

  /*
   * ============================================================
   * ODEHRANÉ ZÁPASY
   * ============================================================
   */

  try {
    [aMatches, bMatches] = await Promise.all([
      getMatchResults({
        competitionId: a.competition.id,
        competitionSlug: a.competition.slug,
        teamName: a.teamName,
      }),

      getMatchResults({
        competitionId: b.competition.id,
        competitionSlug: b.competition.slug,
        teamName: b.teamName,
      }),
    ]);
  } catch (error) {
    console.error("Výsledky APF:", error);
  }

  /*
   * ============================================================
   * NÁSLEDUJÍCÍ ZÁPASY
   * ============================================================
   */

  try {
    [aNextMatch, bNextMatch] = await Promise.all([
      getNextMatch({
        competitionId: a.competition.id,
        competitionSlug: a.competition.slug,
        teamName: a.teamName,
      }),

      getNextMatch({
        competitionId: b.competition.id,
        competitionSlug: b.competition.slug,
        teamName: b.teamName,
      }),
    ]);
  } catch (error) {
    console.error("Rozpis APF:", error);
  }

  /*
   * ============================================================
   * SOUPISKY
   * ============================================================
   *
   * Soupisky používáme pro ostatní části homepage.
   *
   * HRÁČ UTKÁNÍ NA SOUPISCE NEZÁVISÍ.
   * ============================================================
   */

  try {
    const [aSquad, bSquad] = await Promise.all([
      getSquad({
        teamId: a.teamId,
        teamSlug: a.teamSlug,
        team: "a",
      }),

      getSquad({
        teamId: b.teamId,
        teamSlug: b.teamSlug,
        team: "b",
      }),
    ]);

    const map = new Map<number, SquadPlayer>();

    [...aSquad, ...bSquad].forEach((player) => {
      const old = map.get(player.id);

      map.set(
        player.id,
        old
          ? {
              ...old,
              ...player,
              shirtNumber:
                player.shirtNumber ??
                old.shirtNumber,
            }
          : player,
      );
    });

    const all = [...map.values()];

    aPlayers = all.filter(
      (player) =>
        player.team === "a",
    );

    bPlayers = all.filter(
      (player) =>
        player.team === "b",
    );
  } catch (error) {
    console.error("Soupisky APF:", error);
  }

  /*
   * ============================================================
   * PŘESTUPY
   * ============================================================
   */

  try {
    const [published, departed] =
      await Promise.all([
        getPublishedTransfers(),
        getDepartedPlayerIds(),
      ]);

    transfers = published;

    aPlayers = aPlayers.filter(
      (player) =>
        !departed.has(player.id),
    );

    bPlayers = bPlayers.filter(
      (player) =>
        !departed.has(player.id),
    );
  } catch (error) {
    console.error("Přestupy:", error);
  }

  /*
   * ============================================================
   * HRÁČI UTKÁNÍ
   * ============================================================
   *
   * DATA JDOU:
   *
   * finished_matches
   *        ↓
   * skutečně nejnovější zápas podle data
   *        ↓
   * finished_match_player_stats
   *        ↓
   * is_player_of_the_match = true
   *        ↓
   * player_id
   *        ↓
   * players.id
   *
   * ŽÁDNÉ hledání podle čísla dresu.
   * ============================================================
   */

  try {
    [aPlayerOfMatch, bPlayerOfMatch] =
      await Promise.all([
        getLatestPlayerOfMatchFromApp("A"),
        getLatestPlayerOfMatchFromApp("B"),
      ]);
  } catch (error) {
    console.error("Hráči utkání:", error);
  }

  /*
   * ============================================================
   * HOMEPAGE
   * ============================================================
   */

  return (
    <>
      <HomeDashboard
        aNextMatch={aNextMatch}
        bNextMatch={bNextMatch}
        aMatches={aMatches}
        bMatches={bMatches}
        aLeagueTable={aLeagueTable}
        bLeagueTable={bLeagueTable}
        aPlayers={aPlayers}
        bPlayers={bPlayers}
        aPlayerOfMatch={aPlayerOfMatch}
        bPlayerOfMatch={bPlayerOfMatch}
        transfers={transfers}
      />
    </>
  );
}

/*
 * ============================================================
 * NAČTENÍ POSLEDNÍHO HRÁČE UTKÁNÍ PŘÍMO ZE SUPABASE
 * ============================================================
 */

async function getLatestPlayerOfMatchFromApp(
  team: "A" | "B",
): Promise<PlayerOfMatch | null> {
  /*
   * ------------------------------------------------------------
   * 1. NAČTEME DOKONČENÉ ZÁPASY DANÉHO TÝMU
   * ------------------------------------------------------------
   *
   * NEDĚLÁME:
   *
   * .order("date")
   *
   * protože date může být v databázi uložené jako text.
   *
   * Zápasy načteme a správné datum vyhodnotíme až v JS.
   * ------------------------------------------------------------
   */

  const {
    data: matchesData,
    error: matchesError,
  } = await supabase
    .from("finished_matches")
    .select(
      [
        "id",
        "club_id",
        "match_title",
        "team",
        "date",
        "time",
        "finished_at",
      ].join(", "),
    )
    .eq("team", team)
    .limit(100);

  if (matchesError) {
    console.error(
      `HZ ${team} – chyba při načítání zápasů:`,
      matchesError,
    );

    return null;
  }

  const matches =
    (matchesData ?? [])
      .map((raw) =>
        parseFinishedMatch(raw),
      )
      .filter(
        (
          match,
        ): match is FinishedMatchRow =>
          match !== null,
      );

  if (matches.length === 0) {
    console.warn(
      `HZ ${team} – nebyl nalezen žádný dokončený zápas.`,
    );

    return null;
  }

  /*
   * ------------------------------------------------------------
   * 2. VYBEREME SKUTEČNĚ NEJNOVĚJŠÍ ZÁPAS
   * ------------------------------------------------------------
   */

  const matchesWithTimestamp =
    matches
      .map((match) => ({
        match,
        timestamp:
          getFinishedMatchTimestamp(
            match,
          ),
      }))
      .filter(
        (
          item,
        ): item is {
          match: FinishedMatchRow;
          timestamp: number;
        } =>
          item.timestamp !== null,
      )
      .sort(
        (a, b) =>
          b.timestamp -
          a.timestamp,
      );

  const latest =
    matchesWithTimestamp[0];

  if (!latest) {
    console.warn(
      `HZ ${team} – žádný zápas nemá platné datum.`,
    );

    return null;
  }

  const match =
    latest.match;

  console.log(
    `HZ ${team} – vybraný poslední zápas:`,
    {
      id: match.id,
      title:
        match.matchTitle,
      date:
        match.date,
      time:
        match.time,
    },
  );

  /*
   * ------------------------------------------------------------
   * 3. NAJDEME HRÁČE UTKÁNÍ
   * ------------------------------------------------------------
   *
   * Pouze:
   *
   * is_player_of_the_match = true
   *
   * a následně player_id.
   *
   * ŽÁDNÝ fallback přes player_number.
   * ------------------------------------------------------------
   */

  const {
    data: winnerStatsData,
    error: winnerStatsError,
  } = await supabase
    .from(
      "finished_match_player_stats",
    )
    .select(
      [
        "finished_match_id",
        "player_id",
        "goals",
        "assists",
        "is_player_of_the_match",
      ].join(", "),
    )
    .eq(
      "finished_match_id",
      match.id,
    )
    .eq(
      "is_player_of_the_match",
      true,
    )
    .limit(1);

  if (winnerStatsError) {
    console.error(
      `HZ ${team} – chyba při načítání hráče utkání:`,
      winnerStatsError,
    );

    return null;
  }

  const winnerRaw =
    winnerStatsData?.[0];

  if (!winnerRaw) {
    console.warn(
      `HZ ${team} – zápas "${match.matchTitle}" nemá označeného hráče utkání.`,
    );

    return null;
  }

  const winnerStat =
    parsePlayerMatchStat(
      winnerRaw,
    );

  if (!winnerStat) {
    console.warn(
      `HZ ${team} – hráč utkání nemá platné player_id.`,
    );

    return null;
  }

  /*
   * ------------------------------------------------------------
   * 4. NAČTENÍ HRÁČE VÝHRADNĚ PODLE PLAYER_ID
   * ------------------------------------------------------------
   *
   * finished_match_player_stats.player_id
   *                 ↓
   * players.id
   *
   * ČÍSLO DRESU SE PRO IDENTIFIKACI NEPOUŽÍVÁ.
   * ------------------------------------------------------------
   */

  const {
    data: playerData,
    error: playerError,
  } = await supabase
    .from("players")
    .select(
      [
        "id",
        "club_id",
        "name",
        "number",
        "apf_player_id",
      ].join(", "),
    )
    .eq(
      "id",
      winnerStat.playerId,
    )
    .maybeSingle();

  if (playerError) {
    console.error(
      `HZ ${team} – chyba při načítání hráče podle player_id:`,
      playerError,
    );

    return null;
  }

  if (!playerData) {
    console.warn(
      `HZ ${team} – pro player_id "${winnerStat.playerId}" nebyl nalezen hráč v tabulce players.`,
    );

    return null;
  }

  const player =
    parseAppPlayer(
      playerData,
    );

  if (!player) {
    console.warn(
      `HZ ${team} – profil hráče se nepodařilo zpracovat.`,
    );

    return null;
  }

  /*
   * ------------------------------------------------------------
   * 5. HODNOCENÍ – TAKÉ VÝHRADNĚ PODLE PLAYER_ID
   * ------------------------------------------------------------
   */

  const ratingResult =
    await loadPlayerRating({
      matchId:
        match.id,

      playerId:
        winnerStat.playerId,
    });

  /*
   * ------------------------------------------------------------
   * 6. APF ID
   * ------------------------------------------------------------
   */

  if (
    player.apfPlayerId ===
    null
  ) {
    console.warn(
      `HZ ${team} – ${player.name} nemá nastavené apf_player_id.`,
    );

    return null;
  }

  /*
   * ------------------------------------------------------------
   * 7. HOTOVÝ HRÁČ UTKÁNÍ
   * ------------------------------------------------------------
   */

  console.log(
    `HZ ${team} – nalezen hráč utkání:`,
    {
      playerId:
        player.id,
      name:
        player.name,
      apfPlayerId:
        player.apfPlayerId,
      match:
        match.matchTitle,
    },
  );

  return {
    id:
      player.apfPlayerId,

    name:
      player.name,

    goals:
      winnerStat.goals,

    assists:
      winnerStat.assists,

    rating:
      ratingResult.rating,

    ratingVotes:
      ratingResult.votes,

    matchId:
      match.id,

    matchTitle:
      match.matchTitle,

    matchDate:
      match.date,
  };
}

/*
 * ============================================================
 * NAČTENÍ PRŮMĚRNÉHO HODNOCENÍ
 * ============================================================
 *
 * Pouze přes:
 *
 * finished_match_id
 * +
 * player_id
 *
 * ŽÁDNÉ player_number.
 * ============================================================
 */

async function loadPlayerRating({
  matchId,
  playerId,
}: {
  matchId: string;
  playerId: string;
}): Promise<{
  rating: number | null;
  votes: number;
}> {
  const {
    data,
    error,
  } = await supabase
    .from(
      "match_player_ratings",
    )
    .select("rating")
    .eq(
      "finished_match_id",
      matchId,
    )
    .eq(
      "player_id",
      playerId,
    );

  if (error) {
    console.error(
      "Nepodařilo se načíst hodnocení hráče:",
      error,
    );

    return {
      rating: null,
      votes: 0,
    };
  }

  const values =
    (data ?? [])
      .map(
        (row) =>
          toNumber(
            getObjectValue(
              row,
              "rating",
            ),
          ),
      )
      .filter(
        (
          value,
        ): value is number =>
          value !== null,
      );

  if (
    values.length ===
    0
  ) {
    return {
      rating: null,
      votes: 0,
    };
  }

  const average =
    values.reduce(
      (
        sum,
        value,
      ) =>
        sum + value,
      0,
    ) /
    values.length;

  return {
    rating:
      roundToOne(
        average,
      ),

    votes:
      values.length,
  };
}

/*
 * ============================================================
 * URČENÍ ČASU ZÁPASU PRO ŘAZENÍ
 * ============================================================
 */

function getFinishedMatchTimestamp(
  match: FinishedMatchRow,
): number | null {
  const matchTimestamp =
    parseMatchDateTimestamp(
      match.date,
      match.time,
    );

  if (
    matchTimestamp !== null
  ) {
    return matchTimestamp;
  }

  /*
   * Pokud by byl historický záznam s nečitelným date,
   * můžeme jako poslední možnost použít finished_at.
   */

  if (match.finishedAt) {
    const finishedTimestamp =
      Date.parse(
        match.finishedAt,
      );

    if (
      Number.isFinite(
        finishedTimestamp,
      )
    ) {
      return finishedTimestamp;
    }
  }

  return null;
}

/*
 * ============================================================
 * PARSOVÁNÍ DATA ZÁPASU
 * ============================================================
 *
 * Podporujeme například:
 *
 * 2026-09-06
 * 2026-09-06 12:00
 * 2026-09-06T12:00
 * 06.09.2026
 * 6.9.2026
 * 06.09.2026 12:00
 *
 * Pokud čas není součástí date,
 * použije se sloupec time.
 * ============================================================
 */

function parseMatchDateTimestamp(
  dateValue: string,
  timeValue: string | null,
): number | null {
  const date =
    dateValue.trim();

  /*
   * ------------------------------------------------------------
   * YYYY-MM-DD
   * ------------------------------------------------------------
   */

  const isoMatch =
    date.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{2}))?/,
    );

  if (isoMatch) {
    const year =
      Number(
        isoMatch[1],
      );

    const month =
      Number(
        isoMatch[2],
      );

    const day =
      Number(
        isoMatch[3],
      );

    const dateHour =
      isoMatch[4]
        ? Number(
            isoMatch[4],
          )
        : null;

    const dateMinute =
      isoMatch[5]
        ? Number(
            isoMatch[5],
          )
        : null;

    const parsedTime =
      getHoursAndMinutes(
        timeValue,
      );

    const hour =
      dateHour ??
      parsedTime.hour;

    const minute =
      dateMinute ??
      parsedTime.minute;

    return createTimestamp({
      year,
      month,
      day,
      hour,
      minute,
    });
  }

  /*
   * ------------------------------------------------------------
   * DD.MM.YYYY
   * ------------------------------------------------------------
   */

  const czechMatch =
    date.match(
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/,
    );

  if (czechMatch) {
    const day =
      Number(
        czechMatch[1],
      );

    const month =
      Number(
        czechMatch[2],
      );

    const year =
      Number(
        czechMatch[3],
      );

    const dateHour =
      czechMatch[4]
        ? Number(
            czechMatch[4],
          )
        : null;

    const dateMinute =
      czechMatch[5]
        ? Number(
            czechMatch[5],
          )
        : null;

    const parsedTime =
      getHoursAndMinutes(
        timeValue,
      );

    const hour =
      dateHour ??
      parsedTime.hour;

    const minute =
      dateMinute ??
      parsedTime.minute;

    return createTimestamp({
      year,
      month,
      day,
      hour,
      minute,
    });
  }

  return null;
}

/*
 * ============================================================
 * PARSOVÁNÍ ČASU
 * ============================================================
 */

function getHoursAndMinutes(
  value: string | null,
): {
  hour: number;
  minute: number;
} {
  if (!value) {
    return {
      hour: 0,
      minute: 0,
    };
  }

  const match =
    value
      .trim()
      .match(
        /^(\d{1,2}):(\d{2})/,
      );

  if (!match) {
    return {
      hour: 0,
      minute: 0,
    };
  }

  const hour =
    Number(
      match[1],
    );

  const minute =
    Number(
      match[2],
    );

  if (
    !Number.isInteger(
      hour,
    ) ||
    !Number.isInteger(
      minute,
    ) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return {
      hour: 0,
      minute: 0,
    };
  }

  return {
    hour,
    minute,
  };
}

/*
 * ============================================================
 * VYTVOŘENÍ TIMESTAMP
 * ============================================================
 */

function createTimestamp({
  year,
  month,
  day,
  hour,
  minute,
}: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}): number | null {
  if (
    !Number.isInteger(
      year,
    ) ||
    !Number.isInteger(
      month,
    ) ||
    !Number.isInteger(
      day,
    ) ||
    !Number.isInteger(
      hour,
    ) ||
    !Number.isInteger(
      minute,
    )
  ) {
    return null;
  }

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const timestamp =
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      0,
      0,
    );

  const check =
    new Date(
      timestamp,
    );

  if (
    check.getUTCFullYear() !==
      year ||
    check.getUTCMonth() !==
      month - 1 ||
    check.getUTCDate() !==
      day ||
    check.getUTCHours() !==
      hour ||
    check.getUTCMinutes() !==
      minute
  ) {
    return null;
  }

  return timestamp;
}

/*
 * ============================================================
 * PARSER – FINISHED MATCH
 * ============================================================
 */

function parseFinishedMatch(
  raw: unknown,
): FinishedMatchRow | null {
  const id =
    toStringValue(
      getObjectValue(
        raw,
        "id",
      ),
    );

  const clubId =
    toStringValue(
      getObjectValue(
        raw,
        "club_id",
      ),
    );

  const matchTitle =
    toStringValue(
      getObjectValue(
        raw,
        "match_title",
      ),
    );

  const team =
    toStringValue(
      getObjectValue(
        raw,
        "team",
      ),
    );

  const date =
    toStringValue(
      getObjectValue(
        raw,
        "date",
      ),
    );

  if (
    !id ||
    !clubId ||
    !matchTitle ||
    !team ||
    !date
  ) {
    return null;
  }

  return {
    id,

    clubId,

    matchTitle,

    team,

    date,

    time:
      toNullableString(
        getObjectValue(
          raw,
          "time",
        ),
      ),

    finishedAt:
      toNullableString(
        getObjectValue(
          raw,
          "finished_at",
        ),
      ),
  };
}

/*
 * ============================================================
 * PARSER – HRÁČ UTKÁNÍ
 * ============================================================
 */

function parsePlayerMatchStat(
  raw: unknown,
): PlayerMatchStatRow | null {
  const finishedMatchId =
    toStringValue(
      getObjectValue(
        raw,
        "finished_match_id",
      ),
    );

  const playerId =
    toStringValue(
      getObjectValue(
        raw,
        "player_id",
      ),
    );

  const isPlayerOfTheMatch =
    getObjectValue(
      raw,
      "is_player_of_the_match",
    ) === true;

  /*
   * Bez player_id tento záznam NEPOUŽIJEME.
   *
   * Žádné dohledávání podle čísla dresu.
   */

  if (
    !finishedMatchId ||
    !playerId ||
    !isPlayerOfTheMatch
  ) {
    return null;
  }

  return {
    finishedMatchId,

    playerId,

    goals:
      toNumber(
        getObjectValue(
          raw,
          "goals",
        ),
      ) ?? 0,

    assists:
      toNumber(
        getObjectValue(
          raw,
          "assists",
        ),
      ) ?? 0,

    isPlayerOfTheMatch,
  };
}

/*
 * ============================================================
 * PARSER – PLAYER
 * ============================================================
 */

function parseAppPlayer(
  raw: unknown,
): AppPlayerRow | null {
  const id =
    toStringValue(
      getObjectValue(
        raw,
        "id",
      ),
    );

  const clubId =
    toStringValue(
      getObjectValue(
        raw,
        "club_id",
      ),
    );

  const name =
    toStringValue(
      getObjectValue(
        raw,
        "name",
      ),
    );

  const number =
    toNumber(
      getObjectValue(
        raw,
        "number",
      ),
    );

  if (
    !id ||
    !clubId ||
    !name ||
    number === null
  ) {
    return null;
  }

  return {
    id,

    clubId,

    name,

    number,

    apfPlayerId:
      toNumber(
        getObjectValue(
          raw,
          "apf_player_id",
        ),
      ),
  };
}

/*
 * ============================================================
 * BEZPEČNÉ ČTENÍ OBJEKTU
 * ============================================================
 */

function getObjectValue(
  value: unknown,
  key: string,
): unknown {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return undefined;
  }

  return (
    value as Record<
      string,
      unknown
    >
  )[key];
}

/*
 * ============================================================
 * PŘEVOD NA STRING
 * ============================================================
 */

function toStringValue(
  value: unknown,
): string | null {
  if (
    typeof value ===
    "string"
  ) {
    const trimmed =
      value.trim();

    return trimmed.length >
      0
      ? trimmed
      : null;
  }

  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return String(
      value,
    );
  }

  return null;
}

/*
 * ============================================================
 * NULLABLE STRING
 * ============================================================
 */

function toNullableString(
  value: unknown,
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  return toStringValue(
    value,
  );
}

/*
 * ============================================================
 * PŘEVOD NA NUMBER
 * ============================================================
 */

function toNumber(
  value: unknown,
): number | null {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
  }

  if (
    typeof value ===
    "string"
  ) {
    const trimmed =
      value.trim();

    if (
      trimmed ===
      ""
    ) {
      return null;
    }

    const number =
      Number(
        trimmed,
      );

    return Number.isFinite(
      number,
    )
      ? number
      : null;
  }

  return null;
}

/*
 * ============================================================
 * ZAOKROUHLENÍ HODNOCENÍ
 * ============================================================
 */

function roundToOne(
  value: number,
): number {
  return (
    Math.round(
      value * 10,
    ) / 10
  );
}