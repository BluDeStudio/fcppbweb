import { HomeDashboard } from "@/components/home/HomeDashboard";
import type { PlayerOfMatch } from "@/components/home/HomeDashboard";

import { clubConfig } from "@/config/club";

import { getPlayerAppStats } from "@/lib/getPlayerAppStats";
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
import type { PlayerAppMatch } from "@/types/playerAppStats";
import type { ClubTransfer } from "@/types/transfer";

export default async function HomePage() {
  await testSupabaseConnection();

  const a =
    clubConfig.teams.aTeam;

  const b =
    clubConfig.teams.bTeam;

  let aLeagueTable: LeagueRow[] = [];
  let bLeagueTable: LeagueRow[] = [];

  let aMatches: MatchResult[] = [];
  let bMatches: MatchResult[] = [];

  let aNextMatch: NextMatch | null =
    null;

  let bNextMatch: NextMatch | null =
    null;

  let aPlayers: SquadPlayer[] = [];
  let bPlayers: SquadPlayer[] = [];

  let transfers: ClubTransfer[] = [];

  let aPlayerOfMatch:
    PlayerOfMatch | null = null;

  let bPlayerOfMatch:
    PlayerOfMatch | null = null;

  try {
    [
      aLeagueTable,
      bLeagueTable,
    ] = await Promise.all([
      getLeagueTable({
        competitionId:
          a.competition.id,
        competitionSlug:
          a.competition.slug,
        teamName:
          a.teamName,
      }),

      getLeagueTable({
        competitionId:
          b.competition.id,
        competitionSlug:
          b.competition.slug,
        teamName:
          b.teamName,
      }),
    ]);
  } catch (error) {
    console.error(
      "Tabulky APF:",
      error,
    );
  }

  try {
    [
      aMatches,
      bMatches,
    ] = await Promise.all([
      getMatchResults({
        competitionId:
          a.competition.id,
        competitionSlug:
          a.competition.slug,
        teamName:
          a.teamName,
      }),

      getMatchResults({
        competitionId:
          b.competition.id,
        competitionSlug:
          b.competition.slug,
        teamName:
          b.teamName,
      }),
    ]);
  } catch (error) {
    console.error(
      "Výsledky APF:",
      error,
    );
  }

  try {
    [
      aNextMatch,
      bNextMatch,
    ] = await Promise.all([
      getNextMatch({
        competitionId:
          a.competition.id,
        competitionSlug:
          a.competition.slug,
        teamName:
          a.teamName,
      }),

      getNextMatch({
        competitionId:
          b.competition.id,
        competitionSlug:
          b.competition.slug,
        teamName:
          b.teamName,
      }),
    ]);
  } catch (error) {
    console.error(
      "Rozpis APF:",
      error,
    );
  }

  try {
    const [
      aSquad,
      bSquad,
    ] = await Promise.all([
      getSquad({
        teamId:
          a.teamId,
        teamSlug:
          a.teamSlug,
        team:
          "a",
      }),

      getSquad({
        teamId:
          b.teamId,
        teamSlug:
          b.teamSlug,
        team:
          "b",
      }),
    ]);

    const map =
      new Map<
        number,
        SquadPlayer
      >();

    [
      ...aSquad,
      ...bSquad,
    ].forEach(
      (
        player,
      ) => {
        const old =
          map.get(
            player.id,
          );

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
      },
    );

    const all =
      [
        ...map.values(),
      ];

    aPlayers =
      all.filter(
        (
          player,
        ) =>
          player.team ===
          "a",
      );

    bPlayers =
      all.filter(
        (
          player,
        ) =>
          player.team ===
          "b",
      );
  } catch (error) {
    console.error(
      "Soupisky APF:",
      error,
    );
  }

  try {
    const [
      published,
      departed,
    ] = await Promise.all([
      getPublishedTransfers(),
      getDepartedPlayerIds(),
    ]);

    transfers =
      published;

    aPlayers =
      aPlayers.filter(
        (
          player,
        ) =>
          !departed.has(
            player.id,
          ),
      );

    bPlayers =
      bPlayers.filter(
        (
          player,
        ) =>
          !departed.has(
            player.id,
          ),
      );
  } catch (error) {
    console.error(
      "Přestupy:",
      error,
    );
  }

  /*
   * ========================================
   * HRÁČ ZÁPASU
   * ========================================
   *
   * Vítěze už NEPOČÍTÁ web podle známky.
   *
   * Web respektuje přímo výsledek,
   * který uložila aplikace:
   *
   * is_player_of_the_match = true
   *
   * getPlayerAppStats tuto hodnotu převede na:
   *
   * isPlayerOfTheMatch = true
   * ========================================
   */

  try {
    [
      aPlayerOfMatch,
      bPlayerOfMatch,
    ] = await Promise.all([
      getLatestPlayerOfMatch(
        aPlayers,
        "A",
      ),

      getLatestPlayerOfMatch(
        bPlayers,
        "B",
      ),
    ]);
  } catch (error) {
    console.error(
      "Hráč zápasu:",
      error,
    );
  }

  return (
    <>
      <HomeDashboard
        aNextMatch={
          aNextMatch
        }
        bNextMatch={
          bNextMatch
        }
        aMatches={
          aMatches
        }
        bMatches={
          bMatches
        }
        aLeagueTable={
          aLeagueTable
        }
        bLeagueTable={
          bLeagueTable
        }
        aPlayers={
          aPlayers
        }
        bPlayers={
          bPlayers
        }
        aPlayerOfMatch={
          aPlayerOfMatch
        }
        bPlayerOfMatch={
          bPlayerOfMatch
        }
        transfers={
          transfers
        }
      />
    </>
  );
}

async function getLatestPlayerOfMatch(
  players: SquadPlayer[],
  team: "A" | "B",
): Promise<PlayerOfMatch | null> {
  if (
    players.length ===
    0
  ) {
    return null;
  }

  const rows =
    await Promise.all(
      players.map(
        async (
          player,
        ) => {
          try {
            const stats =
              await getPlayerAppStats(
                player.id,
              );

            const matches =
              (
                stats?.matches ??
                []
              ).filter(
                (
                  match,
                ) =>
                  normalizeTeam(
                    match.team,
                  ) ===
                  team,
              );

            return matches.map(
              (
                match,
              ) => ({
                player,
                match,
              }),
            );
          } catch (
            error
          ) {
            console.error(
              `Hráč zápasu – ${player.name}:`,
              error,
            );

            return [];
          }
        },
      ),
    );

  const all =
    rows.flat();

  if (
    all.length ===
    0
  ) {
    return null;
  }

  /*
   * ========================================
   * POSLEDNÍ DOKONČENÝ ZÁPAS TÝMU
   * ========================================
   */

  const latest =
    all.reduce(
      (
        best,
        current,
      ) => {
        return getMatchTime(
          current.match,
        ) >
        getMatchTime(
          best.match,
        )
          ? current
          : best;
      },
    );

  const latestMatchId =
    latest.match.matchId;

  /*
   * ========================================
   * VÍTĚZ PODLE APLIKACE
   * ========================================
   *
   * ŽÁDNÉ:
   * - řazení podle známky
   * - rozhodování podle gólů
   * - rozhodování podle asistencí
   *
   * Pouze hráč označený aplikací jako HZ.
   * ========================================
   */

  const winner =
    all.find(
      (
        row,
      ) =>
        row.match.matchId ===
          latestMatchId &&
        row.match.isPlayerOfTheMatch ===
          true,
    );

  if (
    !winner
  ) {
    return null;
  }

  return {
    id:
      winner.player.id,

    name:
      winner.player.name,

    goals:
      winner.match.goals,

    assists:
      winner.match.assists,

    rating:
      winner.match.averageRating,

    ratingVotes:
      winner.match.ratingVotes,

    matchId:
      winner.match.matchId,

    matchTitle:
      winner.match.matchTitle,

    matchDate:
      winner.match.date,
  };
}

function getMatchTime(
  match: PlayerAppMatch,
): number {
  const value =
    match.finishedAt ??
    match.date;

  const time =
    new Date(
      value,
    ).getTime();

  return Number.isFinite(
    time,
  )
    ? time
    : 0;
}

function normalizeTeam(
  value: string,
): "A" | "B" | string {
  const raw =
    String(
      value ??
        "",
    )
      .trim()
      .toUpperCase();

  if (
    raw === "A" ||
    raw.includes(
      "A-TÝM",
    ) ||
    raw.includes(
      "A-TYM",
    )
  ) {
    return "A";
  }

  if (
    raw === "B" ||
    raw.includes(
      "B-TÝM",
    ) ||
    raw.includes(
      "B-TYM",
    )
  ) {
    return "B";
  }

  return raw;
}