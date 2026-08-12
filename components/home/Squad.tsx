"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { SectionHeader } from "@/components/ui/SectionHeader";

import { getPlayerAppStats } from "@/lib/getPlayerAppStats";

import type {
  SquadPlayer,
} from "@/types/player";

import { PlayerCard } from "./PlayerCard";

import styles from "./Squad.module.css";

type TeamView =
  | "a"
  | "b";

type SquadProps = {
  aPlayers:
    SquadPlayer[];

  bPlayers:
    SquadPlayer[];
};

type CurrentTeamStats = {
  matches: number;

  goals: number;

  assists: number;
};

const CURRENT_SEASON =
  "2026/27";

export function Squad({
  aPlayers,
  bPlayers,
}: SquadProps) {
  const [
    team,
    setTeam,
  ] =
    useState<TeamView>(
      "a",
    );

  const [
    liveStats,
    setLiveStats,
  ] =
    useState<
      Record<
        string,
        CurrentTeamStats
      >
    >({});

  const [
    statsLoaded,
    setStatsLoaded,
  ] =
    useState(false);

  const players =
    team === "a"
      ? aPlayers
      : bPlayers;

  const allPlayers =
    useMemo(
      () => {
        const map =
          new Map<
            number,
            SquadPlayer
          >();

        [
          ...aPlayers,
          ...bPlayers,
        ].forEach(
          (
            player,
          ) => {
            map.set(
              player.id,
              player,
            );
          },
        );

        return Array.from(
          map.values(),
        );
      },
      [
        aPlayers,
        bPlayers,
      ],
    );

  useEffect(
    () => {
      let cancelled =
        false;

      async function loadCurrentStats() {
        setStatsLoaded(
          false,
        );

        const entries =
          await Promise.all(
            allPlayers.map(
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
                        getSeasonFromDate(
                          match.date,
                        ) ===
                        CURRENT_SEASON,
                    );

                  return [
                    player.id,
                    {
                      a:
                        summarizeTeam(
                          matches,
                          "a",
                        ),

                      b:
                        summarizeTeam(
                          matches,
                          "b",
                        ),
                    },
                  ] as const;
                } catch (
                  error
                ) {
                  console.error(
                    `Nepodařilo se načíst aktuální statistiky hráče ${player.name}:`,
                    error,
                  );

                  return [
                    player.id,
                    {
                      a:
                        emptyStats(),

                      b:
                        emptyStats(),
                    },
                  ] as const;
                }
              },
            ),
          );

        if (
          cancelled
        ) {
          return;
        }

        const next:
          Record<
            string,
            CurrentTeamStats
          > = {};

        entries.forEach(
          ([
            playerId,
            teamStats,
          ]) => {
            next[
              `${playerId}-a`
            ] =
              teamStats.a;

            next[
              `${playerId}-b`
            ] =
              teamStats.b;
          },
        );

        setLiveStats(
          next,
        );

        setStatsLoaded(
          true,
        );
      }

      loadCurrentStats();

      return () => {
        cancelled =
          true;
      };
    },
    [
      allPlayers,
    ],
  );

  return (
    <section
      id="soupiska"
      className={
        styles.section
      }
    >
      <div
        className={
          styles.container
        }
      >
        <SectionHeader
          number="05"
          label="Soupiska"
          title="Naši hráči."
          secondLine={
            team === "a"
              ? "A-tým FC PPB."
              : "B-tým FC PPB."
          }
          meta={`Sezóna ${CURRENT_SEASON}`}
        />

        <div
          className={
            styles.toolbar
          }
        >
          <div
            className={
              styles.switch
            }
          >
            <button
              type="button"
              className={
                team === "a"
                  ? styles.active
                  : undefined
              }
              onClick={() =>
                setTeam(
                  "a",
                )
              }
            >
              A-tým
            </button>

            <button
              type="button"
              className={
                team === "b"
                  ? styles.active
                  : undefined
              }
              onClick={() =>
                setTeam(
                  "b",
                )
              }
            >
              B-tým
            </button>
          </div>
        </div>

        {players.length >
        0 ? (
          <div
            key={team}
            className={
              styles.grid
            }
          >
            {players.map(
              (
                player,
              ) => (
                <PlayerCard
                  key={
                    player.id
                  }
                  player={
                    player
                  }
                  team={
                    team
                  }
                  stats={
                    liveStats[
                      `${player.id}-${team}`
                    ] ??
                    emptyStats()
                  }
                  statsLoaded={
                    statsLoaded
                  }
                />
              ),
            )}
          </div>
        ) : (
          <div
            className={
              styles.empty
            }
          >
            Soupiska není
            dostupná.
          </div>
        )}
      </div>
    </section>
  );
}

function summarizeTeam(
  matches: Array<{
    team: string;

    goals: number;

    assists: number;
  }>,
  team:
    "a" |
    "b",
): CurrentTeamStats {
  const wanted =
    team.toUpperCase();

  const teamMatches =
    matches.filter(
      (
        match,
      ) =>
        normalizeTeam(
          match.team,
        ) ===
        wanted,
    );

  return {
    matches:
      teamMatches.length,

    goals:
      teamMatches.reduce(
        (
          total,
          match,
        ) =>
          total +
          Number(
            match.goals ??
              0,
          ),
        0,
      ),

    assists:
      teamMatches.reduce(
        (
          total,
          match,
        ) =>
          total +
          Number(
            match.assists ??
              0,
          ),
        0,
      ),
  };
}

function normalizeTeam(
  value: string,
): string {
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

function getSeasonFromDate(
  value: string,
): string | null {
  const date =
    normalizeDate(
      value,
    );

  if (
    !date
  ) {
    return null;
  }

  const [
    yearText,
    monthText,
  ] =
    date.split(
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
  if (
    !value
  ) {
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

function emptyStats():
CurrentTeamStats {
  return {
    matches: 0,

    goals: 0,

    assists: 0,
  };
}
