import {
  getSeason2025_26Player,
} from "@/data/season2025_26";

import {
  getPlayerMeta,
} from "@/data/playerMeta";

import { supabase } from "@/lib/supabase";
import { getPlayerAppStats } from "@/lib/getPlayerAppStats";

import { getSquad } from "@/services/apf/getSquad";
import { getPlayerProfile } from "@/services/apf/getPlayerProfile";

export type StatisticsTeam =
  | "a"
  | "b"
  | "both";

export type StatisticsPeriodStats = {
  matches: number;

  goals: number;

  assists: number;

  yellowCards: number;

  redCards: number;

  rating: number | null;

  attendance: number | null;

  awards: number;
};

export type StatisticsTeamStats = {
  matches: number;

  goals: number;

  assists: number;

  yellowCards: number;

  redCards: number;

  rating: number | null;

  attendance: number | null;

  awards: number;
};

export type StatisticsPlayer = {
  id: number;

  name: string;

  number: number | null;

  team: StatisticsTeam;

  /*
   * 2026/27
   * Zdroj hráčských výkonů:
   * naše aplikace od 1. 8. 2026.
   */
  current:
    StatisticsPeriodStats;

  currentTeams: {
    a: StatisticsTeamStats | null;

    b: StatisticsTeamStats | null;
  };

  /*
   * 2025/26
   * Zápasy / góly / asistence / karty /
   * ocenění = ručně uzamčený Excel.
   *
   * Známka / docházka = aplikace.
   */
  previous:
    StatisticsPeriodStats;

  previousTeams: {
    a: StatisticsTeamStats | null;

    b: StatisticsTeamStats | null;
  };

  /*
   * Kariéra = APF profil hráče.
   */
  total:
    StatisticsPeriodStats;
};

type PlayerDbRow = {
  name: string;

  number: number | null;

  apf_player_id: number | null;
};

const CURRENT_SEASON =
  "2026/27";

const PREVIOUS_SEASON =
  "2025/26";

export async function getStatisticsPlayers(): Promise<
  StatisticsPlayer[]
> {
  /*
   * Týmové stránky APF tu používáme
   * hlavně kvůli APF slugu pro kariérní profil.
   *
   * 2025/26 už z nich STATISTIKY NEBEREME.
   */
  const [
    aSquad,
    bSquad,
    playersResult,
  ] =
    await Promise.all([
      getSquad({
        teamId: 269,
        teamSlug: "fc-ppb",
        team: "a",
      }),

      getSquad({
        teamId: 271,
        teamSlug: "fc-ppb-b",
        team: "b",
      }),

      supabase
        .from(
          "players",
        )
        .select(
          "name, number, apf_player_id",
        )
        .not(
          "apf_player_id",
          "is",
          null,
        )
        .order(
          "name",
          {
            ascending: true,
          },
        ),
    ]);

  if (
    playersResult.error
  ) {
    console.error(
      "Nepodařilo se načíst hráče pro statistiky:",
      playersResult.error,
    );

    return [];
  }

  const players =
    (
      playersResult.data ??
      []
    ) as PlayerDbRow[];

  const aById =
    new Map(
      aSquad.map(
        (player) => [
          player.id,
          player,
        ],
      ),
    );

  const bById =
    new Map(
      bSquad.map(
        (player) => [
          player.id,
          player,
        ],
      ),
    );

  const rows =
    await Promise.all(
      players.map(
        async (
          player,
        ): Promise<StatisticsPlayer | null> => {
          const playerId =
            Number(
              player.apf_player_id,
            );

          if (
            !Number.isFinite(
              playerId,
            )
          ) {
            return null;
          }

          try {
            const appStats =
              await getPlayerAppStats(
                playerId,
              );

            const aPlayer =
              aById.get(
                playerId,
              ) ??
              null;

            const bPlayer =
              bById.get(
                playerId,
              ) ??
              null;

            const apfSlug =
              aPlayer?.apfSlug ??
              bPlayer?.apfSlug ??
              null;

            const profile =
              apfSlug
                ? await getPlayerProfile(
                    playerId,
                    apfSlug,
                  )
                : null;

            const meta =
              getPlayerMeta(
                playerId,
              );

            const displayName =
              appStats?.name ??
              profile?.name ??
              player.name;

            /*
             * ==================================
             * 2026/27 — APLIKACE
             * ==================================
             */

            const currentMatches =
              (
                appStats?.matches ??
                []
              ).filter(
                (
                  match,
                ) =>
                  getSeasonFromDate(
                    match.date,
                  ) ===
                  CURRENT_SEASON,
              );

            const currentAppSeason =
              findAppSeason(
                appStats?.seasons ??
                  [],
                CURRENT_SEASON,
              );

            const currentA =
              buildAppTeamStats(
                currentMatches,
                "A",
                currentAppSeason?.attendancePercentage ??
                  null,
              );

            const currentB =
              buildAppTeamStats(
                currentMatches,
                "B",
                currentAppSeason?.attendancePercentage ??
                  null,
              );

            const current =
              buildAppPeriodStats(
                currentMatches,
                currentAppSeason?.attendancePercentage ??
                  null,
              );

            /*
             * ==================================
             * 2025/26 — MANUÁLNĚ UZAMČENO
             * ==================================
             */

            const manual =
              getSeason2025_26Player(
                displayName,
              ) ??
              getSeason2025_26Player(
                player.name,
              );

            const previousAppSeason =
              findAppSeason(
                appStats?.seasons ??
                  [],
                PREVIOUS_SEASON,
              );

            const previousMatches =
              (
                appStats?.matches ??
                []
              ).filter(
                (
                  match,
                ) =>
                  getSeasonFromDate(
                    match.date,
                  ) ===
                  PREVIOUS_SEASON,
              );

            const previousARating =
              calculateTeamRating(
                previousMatches,
                "A",
              );

            const previousBRating =
              calculateTeamRating(
                previousMatches,
                "B",
              );

            const previousA:
              StatisticsTeamStats | null =
              manual &&
              hasManualTeamData(
                manual.a,
              )
                ? {
                    matches:
                      manual.a.matches,

                    goals:
                      manual.a.goals,

                    assists:
                      manual.a.assists,

                    yellowCards: 0,

                    redCards: 0,

                    rating:
                      previousARating,

                    attendance:
                      previousAppSeason?.attendancePercentage ??
                      null,

                    awards:
                      manual.a.awards,
                  }
                : null;

            const previousB:
              StatisticsTeamStats | null =
              manual &&
              hasManualTeamData(
                manual.b,
              )
                ? {
                    matches:
                      manual.b.matches,

                    goals:
                      manual.b.goals,

                    assists:
                      manual.b.assists,

                    yellowCards: 0,

                    redCards: 0,

                    rating:
                      previousBRating,

                    attendance:
                      previousAppSeason?.attendancePercentage ??
                      null,

                    awards:
                      manual.b.awards,
                  }
                : null;

            const previous:
              StatisticsPeriodStats = {
                matches:
                  manual?.total.matches ??
                  0,

                goals:
                  manual?.total.goals ??
                  0,

                assists:
                  manual?.total.assists ??
                  0,

                yellowCards:
                  manual?.total.yellowCards ??
                  0,

                redCards:
                  manual?.total.redCards ??
                  0,

                rating:
                  previousAppSeason?.averageRating ??
                  null,

                attendance:
                  previousAppSeason?.attendancePercentage ??
                  null,

                awards:
                  manual?.total.awards ??
                  0,
              };

            /*
             * ==================================
             * KARIÉRA
             * ==================================
             */

            const total:
              StatisticsPeriodStats = {
                matches:
                  Number(
                    profile?.career.matches ??
                      0,
                  ),

                goals:
                  Number(
                    profile?.career.goals ??
                      0,
                  ),

                assists:
                  Number(
                    profile?.career.assists ??
                      0,
                  ) +
                  Number(
                    appStats?.totals.assists ??
                      0,
                  ),

                yellowCards: 0,

                redCards: 0,

                rating:
                  appStats?.averageRating ??
                  null,

                attendance:
                  appStats?.attendancePercentage ??
                  null,

                awards: 0,
              };

            const team:
              StatisticsTeam =
              resolveCurrentTeam(
                meta.team,
                currentA,
                currentB,
              );

            const hasAnyData =
              current.matches >
                0 ||
              previous.matches >
                0 ||
              total.matches >
                0 ||
              manual !==
                null;

            if (
              !hasAnyData
            ) {
              return null;
            }

            return {
              id:
                playerId,

              name:
                displayName,

              number:
                appStats?.number ??
                player.number ??
                meta.shirtNumber ??
                null,

              team,

              current,

              currentTeams: {
                a:
                  currentA,

                b:
                  currentB,
              },

              previous,

              previousTeams: {
                a:
                  previousA,

                b:
                  previousB,
              },

              total,
            };
          } catch (
            error
          ) {
            console.error(
              `Nepodařilo se sestavit statistiky hráče ${player.name}:`,
              error,
            );

            return null;
          }
        },
      ),
    );

  return rows.filter(
    (
      row,
    ): row is StatisticsPlayer =>
      row !== null,
  );
}

function hasManualTeamData(
  stats: {
    matches: number;

    goals: number;

    assists: number;

    awards: number;
  },
): boolean {
  return (
    stats.matches >
      0 ||
    stats.goals >
      0 ||
    stats.assists >
      0 ||
    stats.awards >
      0
  );
}

function resolveCurrentTeam(
  fallback:
    "a" |
    "b" |
    "both",
  a:
    StatisticsTeamStats |
    null,
  b:
    StatisticsTeamStats |
    null,
): StatisticsTeam {
  if (
    a &&
    b
  ) {
    return "both";
  }

  if (a) {
    return "a";
  }

  if (b) {
    return "b";
  }

  return fallback;
}

function buildAppPeriodStats(
  matches: Array<{
    team: string;

    goals: number;

    assists: number;

    yellowCards: number;

    redCards: number;

    averageRating: number | null;

    ratingVotes: number;
  }>,
  attendance:
    number | null,
): StatisticsPeriodStats {
  return {
    matches:
      matches.length,

    goals:
      sum(
        matches.map(
          (match) =>
            match.goals,
        ),
      ),

    assists:
      sum(
        matches.map(
          (match) =>
            match.assists,
        ),
      ),

    yellowCards:
      sum(
        matches.map(
          (match) =>
            match.yellowCards,
        ),
      ),

    redCards:
      sum(
        matches.map(
          (match) =>
            match.redCards,
        ),
      ),

    rating:
      calculateWeightedRating(
        matches,
      ),

    attendance,

    awards:
      matches.filter(
        (match: any) =>
          Boolean(
            match.isPlayerOfTheMatch,
          ),
      ).length,
  };
}

function buildAppTeamStats(
  matches: Array<any>,
  team:
    "A" |
    "B",
  attendance:
    number | null,
): StatisticsTeamStats | null {
  const teamMatches =
    matches.filter(
      (
        match,
      ) =>
        normalizeTeam(
          match.team,
        ) ===
        team,
    );

  if (
    teamMatches.length ===
    0
  ) {
    return null;
  }

  return {
    matches:
      teamMatches.length,

    goals:
      sum(
        teamMatches.map(
          (
            match,
          ) =>
            Number(
              match.goals ??
                0,
            ),
        ),
      ),

    assists:
      sum(
        teamMatches.map(
          (
            match,
          ) =>
            Number(
              match.assists ??
                0,
            ),
        ),
      ),

    yellowCards:
      sum(
        teamMatches.map(
          (
            match,
          ) =>
            Number(
              match.yellowCards ??
                0,
            ),
        ),
      ),

    redCards:
      sum(
        teamMatches.map(
          (
            match,
          ) =>
            Number(
              match.redCards ??
                0,
            ),
        ),
      ),

    rating:
      calculateWeightedRating(
        teamMatches,
      ),

    attendance,

    awards:
      teamMatches.filter(
        (
          match,
        ) =>
          Boolean(
            match.isPlayerOfTheMatch,
          ),
      ).length,
  };
}

function calculateTeamRating(
  matches: Array<any>,
  team:
    "A" |
    "B",
): number | null {
  return calculateWeightedRating(
    matches.filter(
      (
        match,
      ) =>
        normalizeTeam(
          match.team,
        ) ===
        team,
    ),
  );
}

function calculateWeightedRating(
  matches: Array<any>,
): number | null {
  let weighted = 0;
  let votes = 0;

  for (
    const match of
    matches
  ) {
    const rating =
      match.averageRating;

    const matchVotes =
      Number(
        match.ratingVotes ??
          0,
      );

    if (
      rating ===
        null ||
      rating ===
        undefined ||
      matchVotes <=
        0
    ) {
      continue;
    }

    weighted +=
      Number(
        rating,
      ) *
      matchVotes;

    votes +=
      matchVotes;
  }

  if (
    votes ===
    0
  ) {
    return null;
  }

  return Math.round(
    (
      weighted /
      votes
    ) *
      10,
  ) /
    10;
}

function sum(
  values: number[],
): number {
  return values.reduce(
    (
      total,
      value,
    ) =>
      total +
      Number(
        value ??
          0,
      ),
    0,
  );
}

function normalizeTeam(
  value: string,
):
  | "A"
  | "B"
  | "" {
  const raw =
    String(
      value ??
        "",
    )
      .trim()
      .toUpperCase();

  if (
    raw ===
      "A" ||
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
    raw ===
      "B" ||
    raw.includes(
      "B-TÝM",
    ) ||
    raw.includes(
      "B-TYM",
    )
  ) {
    return "B";
  }

  return "";
}

function findAppSeason(
  seasons: Array<{
    season: string;

    assists: number;

    averageRating:
      number | null;

    attendancePercentage:
      number | null;
  }>,
  wantedSeason: string,
) {
  const wanted =
    normalizeSeason(
      wantedSeason,
    );

  return (
    seasons.find(
      (
        season,
      ) =>
        normalizeSeason(
          season.season,
        ) ===
        wanted,
    ) ??
    null
  );
}

function getSeasonFromDate(
  value: string,
): string | null {
  const normalized =
    normalizeDate(
      value,
    );

  if (!normalized) {
    return null;
  }

  const [
    yearText,
    monthText,
  ] =
    normalized.split(
      "-",
    );

  const year =
    Number(
      yearText,
    );

  const month =
    Number(
      monthText,
    );

  if (
    !Number.isFinite(
      year,
    ) ||
    !Number.isFinite(
      month,
    )
  ) {
    return null;
  }

  const startYear =
    month >= 8
      ? year
      : year - 1;

  return `${startYear}/${String(
    startYear + 1,
  ).slice(
    -2,
  )}`;
}

function normalizeDate(
  value?: string | null,
): string {
  if (!value) {
    return "";
  }

  const trimmed =
    value.trim();

  if (
    /^\d{4}-\d{2}-\d{2}/.test(
      trimmed,
    )
  ) {
    return trimmed.slice(
      0,
      10,
    );
  }

  if (
    /^\d{2}\.\d{2}\.\d{4}/.test(
      trimmed,
    )
  ) {
    const [
      day,
      month,
      year,
    ] =
      trimmed
        .slice(
          0,
          10,
        )
        .split(
          ".",
        );

    return `${year}-${month}-${day}`;
  }

  const parsed =
    new Date(
      trimmed,
    );

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return "";
  }

  const year =
    parsed.getFullYear();

  const month =
    String(
      parsed.getMonth() +
        1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      parsed.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

function normalizeSeason(
  value: string,
): string {
  const raw =
    String(
      value ??
        "",
    )
      .trim()
      .replace(
        /\s+/g,
        "",
      );

  const long =
    raw.match(
      /(\d{4})\/(\d{2,4})/,
    );

  if (long) {
    return `${long[1]}/${long[2].slice(
      -2,
    )}`;
  }

  const short =
    raw.match(
      /(\d{2})\/(\d{2})/,
    );

  if (short) {
    return `20${short[1]}/${short[2]}`;
  }

  return raw;
}
