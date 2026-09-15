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
  playerOfTheMatchNumber: number | null;
};

type PlayerMatchStatRow = {
  finishedMatchId: string;
  playerNumber: number;
  playerId: string | null;
  goals: number;
  assists: number;
  averageRating: number | null;
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

  let aLastFinishedMatchId: string | null = null;
  let bLastFinishedMatchId: string | null = null;

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
   * Soupisky používáme dál pro ostatní části homepage.
   *
   * HRÁČ UTKÁNÍ už ale na soupisce NEZÁVISÍ.
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
   * DŮLEŽITÉ:
   *
   * HZ už NEHLEDÁME přes APF soupisku.
   *
   * Data jdou přímo:
   *
   * finished_matches
   *        ↓
   * finished_match_player_stats
   *        ↓
   * is_player_of_the_match = true
   *        ↓
   * player_id
   *        ↓
   * players
   *
   * Takže hráč může:
   *
   * - být členem A-týmu
   * - nastoupit za B-tým
   * - nebýt ve staré soupisce webu
   *
   * a homepage ho přesto správně najde.
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
   * INTERNÍ ID POSLEDNÍCH ODEHRANÝCH ZÁPASŮ
   * ============================================================
   *
   * Tohle ID používá webový DETAIL ZÁPASU.
   * Pokud jsme už stejné utkání načetli jako Hráče utkání,
   * vezmeme jeho matchId bez dalšího dotazu.
   * ============================================================
   */

  try {
    const [
      aFallbackMatchId,
      bFallbackMatchId,
    ] = await Promise.all([
      aPlayerOfMatch
        ? Promise.resolve(null)
        : getLatestFinishedMatchId("A"),

      bPlayerOfMatch
        ? Promise.resolve(null)
        : getLatestFinishedMatchId("B"),
    ]);

    aLastFinishedMatchId =
      aPlayerOfMatch?.matchId ??
      aFallbackMatchId;

    bLastFinishedMatchId =
      bPlayerOfMatch?.matchId ??
      bFallbackMatchId;
  } catch (error) {
    console.error(
      "ID posledních dokončených zápasů:",
      error,
    );
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
        aLastFinishedMatchId={aLastFinishedMatchId}
        bLastFinishedMatchId={bLastFinishedMatchId}
        transfers={transfers}
      />
    </>
  );
}

/*
 * ============================================================
 * INTERNÍ ID POSLEDNÍHO DOKONČENÉHO ZÁPASU
 * ============================================================
 */

async function getLatestFinishedMatchId(
  team: "A" | "B",
): Promise<string | null> {
  const {
    data,
    error,
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
        "player_of_the_match_number",
      ].join(", "),
    )
    .eq("team", team);

  if (error) {
    console.error(
      `Nepodařilo se načíst poslední zápas ${team}-týmu:`,
      error,
    );

    return null;
  }

  const matches =
    (data ?? [])
      .map((row) =>
        parseFinishedMatch(row),
      )
      .filter(
        (
          value,
        ): value is FinishedMatchRow =>
          value !== null,
      )
      .sort(
        (
          left,
          right,
        ) =>
          getFinishedMatchTimestamp(
            right,
          ) -
          getFinishedMatchTimestamp(
            left,
          ),
      );

  return (
    matches[0]?.id ??
    null
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
   * 1. POSLEDNÍ DOKONČENÝ ZÁPAS
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
        "player_of_the_match_number",
      ].join(", "),
    )
    .eq("team", team);

  if (matchesError) {
    console.error(
      `HZ ${team} – chyba při načítání posledního zápasu:`,
      matchesError,
    );

    return null;
  }

  const parsedMatches =
    (matchesData ?? [])
      .map((raw) =>
        parseFinishedMatch(raw),
      )
      .filter(
        (
          value,
        ): value is FinishedMatchRow =>
          value !== null,
      )
      .sort(
        (
          left,
          right,
        ) =>
          getFinishedMatchTimestamp(
            right,
          ) -
          getFinishedMatchTimestamp(
            left,
          ),
      );

  const match =
    parsedMatches[0] ??
    null;

  if (!match) {
    console.warn(
      `HZ ${team} – žádný dokončený zápas.`,
    );

    return null;
  }

  /*
   * ------------------------------------------------------------
   * 2. ŘÁDEK HRÁČE UTKÁNÍ
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
        "player_number",
        "player_id",
        "goals",
        "assists",
        "average_rating",
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
      `HZ ${team} – chyba při načítání vítěze:`,
      winnerStatsError,
    );

    return null;
  }

  let winnerStat:
    PlayerMatchStatRow | null =
      null;

  const winnerRaw =
    winnerStatsData?.[0];

  if (winnerRaw) {
    winnerStat =
      parsePlayerMatchStat(
        winnerRaw,
      );
  }

  /*
   * ------------------------------------------------------------
   * FALLBACK:
   *
   * Pokud starší zápas nemá
   * is_player_of_the_match,
   * použijeme player_of_the_match_number
   * z finished_matches.
   * ------------------------------------------------------------
   */

  if (
    !winnerStat &&
    match.playerOfTheMatchNumber !== null
  ) {
    const {
      data: fallbackStatsData,
      error: fallbackStatsError,
    } = await supabase
      .from(
        "finished_match_player_stats",
      )
      .select(
        [
          "finished_match_id",
          "player_number",
          "player_id",
          "goals",
          "assists",
          "average_rating",
          "is_player_of_the_match",
        ].join(", "),
      )
      .eq(
        "finished_match_id",
        match.id,
      )
      .eq(
        "player_number",
        match.playerOfTheMatchNumber,
      )
      .limit(1);

    if (fallbackStatsError) {
      console.error(
        `HZ ${team} – fallback podle čísla hráče selhal:`,
        fallbackStatsError,
      );
    }

    const fallbackRaw =
      fallbackStatsData?.[0];

    if (fallbackRaw) {
      winnerStat =
        parsePlayerMatchStat(
          fallbackRaw,
        );
    }
  }

  if (!winnerStat) {
    console.warn(
      `HZ ${team} – zápas "${match.matchTitle}" nemá hráče utkání.`,
    );

    return null;
  }

  /*
   * ------------------------------------------------------------
   * 3. NAČTENÍ HRÁČE PODLE PLAYER_ID
   * ------------------------------------------------------------
   */

  let player:
    AppPlayerRow | null =
      null;

  if (winnerStat.playerId) {
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
    }

    if (playerData) {
      player =
        parseAppPlayer(
          playerData,
        );
    }
  }

  /*
   * ------------------------------------------------------------
   * FALLBACK PODLE ČÍSLA HRÁČE
   * ------------------------------------------------------------
   *
   * Hodí se pro starší zápasy,
   * kde player_id nemuselo být uložené.
   * ------------------------------------------------------------
   */

  if (!player) {
    const {
      data: playerByNumberData,
      error: playerByNumberError,
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
        "club_id",
        match.clubId,
      )
      .eq(
        "number",
        winnerStat.playerNumber,
      )
      .limit(1);

    if (playerByNumberError) {
      console.error(
        `HZ ${team} – chyba při načítání hráče podle čísla:`,
        playerByNumberError,
      );
    }

    const playerRaw =
      playerByNumberData?.[0];

    if (playerRaw) {
      player =
        parseAppPlayer(
          playerRaw,
        );
    }
  }

  if (!player) {
    console.warn(
      `HZ ${team} – hráč utkání byl nalezen ve statistikách, ale nepodařilo se najít jeho profil.`,
    );

    return null;
  }

  /*
   * ------------------------------------------------------------
   * 4. HODNOCENÍ
   * ------------------------------------------------------------
   *
   * Aplikace už ukládá výslednou známku přímo do:
   *
   * finished_match_player_stats.average_rating
   *
   * Tohle je stejná známka, kterou vidíme ve statistikách.
   * Např. pro poslední zápasy:
   *
   * Jan Jebas = 8.9
   * Vojtěch Kselík = 7.1
   *
   * Proto ji používáme jako hlavní zdroj pro kartu HRÁČ UTKÁNÍ.
   * Raw hlasování v match_player_ratings je pouze fallback,
   * kdyby average_rating u staršího zápasu nebylo uložené.
   * ------------------------------------------------------------
   */

  let rating =
    winnerStat.averageRating;

  let ratingVotes = 0;

  if (
    rating === null &&
    winnerStat.playerId
  ) {
    const ratingResult =
      await loadPlayerRating({
        matchId:
          match.id,

        playerId:
          winnerStat.playerId,

        playerNumber:
          null,
      });

    rating =
      ratingResult.rating;

    ratingVotes =
      ratingResult.votes;
  }

  /*
   * ------------------------------------------------------------
   * 5. APF ID
   * ------------------------------------------------------------
   *
   * Homepage používá APF ID jako číselné ID
   * hráče – mimo jiné pro jeho fotku.
   * ------------------------------------------------------------
   */

  if (
    player.apfPlayerId ===
    null
  ) {
    console.warn(
      `HZ ${team} – ${player.name} nemá v databázi nastavené apf_player_id.`,
    );

    return null;
  }

  /*
   * ------------------------------------------------------------
   * 6. HOTOVÝ HRÁČ UTKÁNÍ
   * ------------------------------------------------------------
   */

  return {
    id:
      player.apfPlayerId,

    name:
      player.name,

    goals:
      winnerStat.goals,

    assists:
      winnerStat.assists,

    rating,

    ratingVotes,

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
 * ČAS DOKONČENÉHO ZÁPASU
 * ============================================================
 *
 * finished_matches.date je historicky uložené v různých
 * formátech, takže ho NESMÍME řadit textově v Supabase.
 * ============================================================
 */

function getFinishedMatchTimestamp(
  match: FinishedMatchRow,
): number {
  const parsedDate =
    parseMatchDateTime(
      match.date,
      match.time,
    );

  if (
    parsedDate !== null
  ) {
    return parsedDate;
  }

  if (
    match.finishedAt
  ) {
    const finishedAt =
      new Date(
        match.finishedAt,
      ).getTime();

    if (
      Number.isFinite(
        finishedAt,
      )
    ) {
      return finishedAt;
    }
  }

  return 0;
}

function parseMatchDateTime(
  dateValue: string,
  timeValue: string | null,
): number | null {
  const raw =
    String(
      dateValue ?? "",
    ).trim();

  if (!raw) {
    return null;
  }

  const isoMatch =
    raw.match(
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

    const fallbackTime =
      String(
        timeValue ?? "",
      ).match(
        /^(\d{1,2}):(\d{2})/,
      );

    const hour =
      Number(
        isoMatch[4] ??
        fallbackTime?.[1] ??
        0,
      );

    const minute =
      Number(
        isoMatch[5] ??
        fallbackTime?.[2] ??
        0,
      );

    return new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      0,
      0,
    ).getTime();
  }

  const czMatch =
    raw.match(
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/,
    );

  if (czMatch) {
    const day =
      Number(
        czMatch[1],
      );

    const month =
      Number(
        czMatch[2],
      );

    const year =
      Number(
        czMatch[3],
      );

    const fallbackTime =
      String(
        timeValue ?? "",
      ).match(
        /^(\d{1,2}):(\d{2})/,
      );

    const hour =
      Number(
        czMatch[4] ??
        fallbackTime?.[1] ??
        0,
      );

    const minute =
      Number(
        czMatch[5] ??
        fallbackTime?.[2] ??
        0,
      );

    return new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      0,
      0,
    ).getTime();
  }

  const nativeTime =
    new Date(
      raw,
    ).getTime();

  return Number.isFinite(
    nativeTime,
  )
    ? nativeTime
    : null;
}

/*
 * ============================================================
 * NAČTENÍ PRŮMĚRNÉHO HODNOCENÍ
 * ============================================================
 */

async function loadPlayerRating({
  matchId,
  playerId,
  playerNumber,
}: {
  matchId: string;
  playerId: string | null;
  playerNumber: number | null;
}): Promise<{
  rating: number | null;
  votes: number;
}> {
  let query = supabase
    .from(
      "match_player_ratings",
    )
    .select("rating")
    .eq(
      "finished_match_id",
      matchId,
    );

  if (playerId) {
    query =
      query.eq(
        "player_id",
        playerId,
      );
  } else if (
    playerNumber !== null
  ) {
    query =
      query.eq(
        "player_number",
        playerNumber,
      );
  } else {
    return {
      rating: null,
      votes: 0,
    };
  }

  const {
    data,
    error,
  } =
    await query;

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

    playerOfTheMatchNumber:
      toNumber(
        getObjectValue(
          raw,
          "player_of_the_match_number",
        ),
      ),
  };
}

/*
 * ============================================================
 * PARSER – MATCH PLAYER STAT
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

  const playerNumber =
    toNumber(
      getObjectValue(
        raw,
        "player_number",
      ),
    );

  if (
    !finishedMatchId ||
    playerNumber === null
  ) {
    return null;
  }

  return {
    finishedMatchId,

    playerNumber,

    playerId:
      toNullableString(
        getObjectValue(
          raw,
          "player_id",
        ),
      ),

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

    averageRating:
      toNumber(
        getObjectValue(
          raw,
          "average_rating",
        ),
      ),

    isPlayerOfTheMatch:
      getObjectValue(
        raw,
        "is_player_of_the_match",
      ) === true,
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
    return String(value);
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
      Number(trimmed);

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