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

  currentVisible: boolean;

  previousVisible: boolean;

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
  is_active: boolean | null;
};

type UnifiedPlayerRow = {
  name: string;
  number: number | null;
  apf_player_id: number;
  active: boolean;
};

type WebProfileRow = {
  name: string;
  team: StatisticsTeam;
  shirt_number: number | null;
  apf_player_id: number | null;
  app_player_id: string | null;
  active: boolean;
  inactive_from: string | null;
};

type TransferRow = {
  direction: "arrival" | "departure";
  player_id: number | null;
  player_name: string;
  occurred_on: string;
};

type MembershipWindow = {
  from: string | null;
  to: string | null;
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
    webProfilesResult,
    transfersResult,
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
          "name, number, apf_player_id, is_active",
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

      supabase
        .from(
          "web_player_profiles",
        )
        .select(
          "name, team, shirt_number, apf_player_id, app_player_id, active, inactive_from",
        ),

      supabase
        .from(
          "club_transfers",
        )
        .select(
          "direction, player_id, player_name, occurred_on",
        )
        .order(
          "occurred_on",
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

  const appPlayers =
    (
      playersResult.data ??
      []
    ) as PlayerDbRow[];

  const webProfiles =
    (webProfilesResult.data ??
      []) as WebProfileRow[];

  /*
   * ========================================
   * SJEDNOCENÝ REGISTR HRÁČŮ PRO STATISTIKY
   * ========================================
   *
   * Statistiky nesmí stát jen na tabulce players.
   * Historický nebo ručně spravovaný hráč může být
   * už jen ve web_player_profiles.
   *
   * Klíč je APF ID. Pokud je hráč v obou zdrojích,
   * webový profil má přednost pro číslo a aktivitu.
   */
  const unifiedByApfId =
    new Map<number, UnifiedPlayerRow>();

  appPlayers.forEach((player) => {
    if (player.apf_player_id === null) {
      return;
    }

    const apfId = Number(player.apf_player_id);

    if (!Number.isFinite(apfId)) {
      return;
    }

    unifiedByApfId.set(apfId, {
      name: player.name,
      number: player.number,
      apf_player_id: apfId,
      active: player.is_active !== false,
    });
  });

  webProfiles.forEach((profile) => {
    if (profile.apf_player_id === null) {
      return;
    }

    const apfId = Number(profile.apf_player_id);

    if (!Number.isFinite(apfId)) {
      return;
    }

    const existing = unifiedByApfId.get(apfId);

    unifiedByApfId.set(apfId, {
      name: profile.name || existing?.name || `Hráč ${apfId}`,
      number: profile.shirt_number ?? existing?.number ?? null,
      apf_player_id: apfId,
      active: profile.active,
    });
  });

  const players = Array.from(
    unifiedByApfId.values(),
  ).sort((a, b) =>
    a.name.localeCompare(b.name, "cs"),
  );

  const transferRows =
    (transfersResult.data ??
      []) as TransferRow[];

  const profileByApfId =
    new Map<number, WebProfileRow>();

  const profileByName =
    new Map<string, WebProfileRow>();

  webProfiles.forEach(
    (profile) => {
      if (
        profile.apf_player_id !==
        null
      ) {
        profileByApfId.set(
          Number(
            profile.apf_player_id,
          ),
          profile,
        );
      }

      profileByName.set(
        normalizePlayerName(
          profile.name,
        ),
        profile,
      );
    },
  );

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

          const webProfile =
            profileByApfId.get(
              playerId,
            ) ??
            profileByName.get(
              normalizePlayerName(
                player.name,
              ),
            ) ??
            null;

          const membershipWindows =
            buildMembershipWindows(
              transferRows,
              playerId,
              player.name,
              webProfile?.inactive_from ??
                null,
            );

          const currentMembershipVisible =
            isSeasonVisible(
              CURRENT_SEASON,
              membershipWindows,
              webProfile,
            );

          const previousMembershipVisible =
            isSeasonVisible(
              PREVIOUS_SEASON,
              membershipWindows,
              webProfile,
            );

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
              await getPlayerProfile(
                playerId,
                apfSlug ??
                  buildApfSlug(
                    player.name,
                  ),
              );

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
                  CURRENT_SEASON &&
                  isDateInMembership(
                    match.date,
                    membershipWindows,
                  ),
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
             * Aktivní hráč je v aktuální sezoně vidět i s nulami.
             * Neaktivní/odešlý hráč zůstane v aktuální sezoně pouze
             * pokud v ní skutečně odehrál alespoň jeden zápas.
             * Tím zmizí hráči, kteří skončili před ostrou sezonou,
             * ale jejich odchod byl administrativně zapsán až v srpnu.
             */
            const currentVisible =
              currentMembershipVisible &&
              (player.active || current.matches > 0);

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
                  PREVIOUS_SEASON &&
                  isDateInMembership(
                    match.date,
                    membershipWindows,
                  ),
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

            const previousVisible =
              previousMembershipVisible &&
              (
                previous.matches > 0 ||
                manual !== null ||
                previousMatches.length > 0
              );

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
                webProfile?.team ??
                  meta.team,
                currentA,
                currentB,
              );

            const hasAnyData =
              current.matches > 0 ||
              previous.matches > 0 ||
              total.matches > 0 ||
              manual !== null;

            if (
              !hasAnyData &&
              !currentVisible &&
              !previousVisible
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

              currentVisible,

              previousVisible,

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

function buildApfSlug(
  value: string,
): string {
  const parts = String(value ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const ordered =
    parts.length > 1
      ? [
          parts[parts.length - 1],
          ...parts.slice(0, -1),
        ]
      : parts;

  return ordered
    .join(" " )
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePlayerName(
  value: string,
): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function buildMembershipWindows(
  transfers: TransferRow[],
  playerId: number,
  playerName: string,
  inactiveFrom: string | null,
): MembershipWindow[] {
  const normalizedName =
    normalizePlayerName(
      playerName,
    );

  const rows =
    transfers
      .filter(
        (row) =>
          (
            row.player_id !== null &&
            Number(row.player_id) ===
              playerId
          ) ||
          normalizePlayerName(
            row.player_name,
          ) === normalizedName,
      )
      .sort(
        (a, b) =>
          normalizeDate(
            a.occurred_on,
          ).localeCompare(
            normalizeDate(
              b.occurred_on,
            ),
          ),
      );

  const windows:
    MembershipWindow[] = [];

  let openFrom:
    string | null = null;

  rows.forEach(
    (row) => {
      const date =
        normalizeDate(
          row.occurred_on,
        );

      if (!date) {
        return;
      }

      if (
        row.direction ===
        "arrival"
      ) {
        if (
          openFrom !== null
        ) {
          windows.push({
            from: openFrom,
            to: null,
          });
        }

        openFrom = date;
        return;
      }

      if (
        openFrom !== null
      ) {
        windows.push({
          from: openFrom,
          to: date,
        });

        openFrom = null;
        return;
      }

      /*
       * Historický odchod bez zapsaného
       * příchodu: považujeme hráče za člena
       * od začátku evidence do data odchodu.
       */
      windows.push({
        from: null,
        to: date,
      });
    },
  );

  if (
    openFrom !== null
  ) {
    windows.push({
      from: openFrom,
      to: null,
    });
  }

  const inactiveDate =
    normalizeDate(
      inactiveFrom,
    );

  if (
    inactiveDate
  ) {
    let applied = false;

    for (
      let index =
        windows.length - 1;
      index >= 0;
      index -= 1
    ) {
      if (
        windows[index].to ===
        null
      ) {
        windows[index] = {
          ...windows[index],
          to: inactiveDate,
        };

        applied = true;
        break;
      }
    }

    if (
      !applied
    ) {
      windows.push({
        from: null,
        to: inactiveDate,
      });
    }
  }

  return windows;
}

function isDateInMembership(
  value: string,
  windows: MembershipWindow[],
): boolean {
  const date =
    normalizeDate(value);

  if (!date) {
    return false;
  }

  if (
    windows.length === 0
  ) {
    return true;
  }

  return windows.some(
    (window) => {
      const afterStart =
        !window.from ||
        date >= window.from;

      const beforeEnd =
        !window.to ||
        date <= window.to;

      return (
        afterStart &&
        beforeEnd
      );
    },
  );
}

function getSeasonRange(
  season: string,
): {
  start: string;
  end: string;
} | null {
  const match =
    normalizeSeason(
      season,
    ).match(
      /^(\d{4})\/(\d{2})$/,
    );

  if (!match) {
    return null;
  }

  const startYear =
    Number(match[1]);

  const endYear =
    startYear + 1;

  return {
    start:
      `${startYear}-08-01`,
    end:
      `${endYear}-07-31`,
  };
}

function isSeasonVisible(
  season: string,
  windows: MembershipWindow[],
  profile: WebProfileRow | null,
): boolean {
  const range =
    getSeasonRange(season);

  if (!range) {
    return true;
  }

  if (
    windows.length === 0
  ) {
    if (
      !profile
    ) {
      return true;
    }

    const inactiveFrom =
      normalizeDate(
        profile.inactive_from,
      );

    if (
      inactiveFrom &&
      inactiveFrom < range.start
    ) {
      return false;
    }

    return true;
  }

  return windows.some(
    (window) => {
      const from =
        window.from ??
        "0000-01-01";

      const to =
        window.to ??
        "9999-12-31";

      return (
        from <= range.end &&
        to >= range.start
      );
    },
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
