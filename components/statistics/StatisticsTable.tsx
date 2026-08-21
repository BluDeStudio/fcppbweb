"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

import type {
  StatisticsPlayer,
} from "@/lib/getStatisticsPlayers";

import styles from "./StatisticsTable.module.css";

type TeamFilter =
  | "all"
  | "a"
  | "b";

type PeriodFilter =
  | "current"
  | "previous"
  | "total";

type SortKey =
  | "matches"
  | "goals"
  | "assists"
  | "rating"
  | "attendance";

export function StatisticsTable({
  players,
  season,
}: {
  players:
    StatisticsPlayer[];

  season: string;
}) {
  const [
    team,
    setTeam,
  ] =
    useState<TeamFilter>(
      "all",
    );

  const [
    period,
    setPeriod,
  ] =
    useState<PeriodFilter>(
      "current",
    );

  const [
    sortKey,
    setSortKey,
  ] =
    useState<SortKey>(
      "goals",
    );

  const [
    descending,
    setDescending,
  ] =
    useState(true);

  const visiblePlayers =
    useMemo(() => {
      const filtered =
        players.filter(
          (
            player,
          ) => {
            if (
              !isVisibleForPeriod(
                player,
                period,
              )
            ) {
              return false;
            }

            if (
              team ===
              "all"
            ) {
              return true;
            }

            return hasTeamStats(
              player,
              period,
              team,
            );
          },
        );

      return filtered.sort(
        (
          a,
          b,
        ) => {
          const aStats =
            getPeriodStats(
              a,
              period,
              team,
            );

          const bStats =
            getPeriodStats(
              b,
              period,
              team,
            );

          const aValue =
            getSortValue(
              aStats,
              sortKey,
            );

          const bValue =
            getSortValue(
              bStats,
              sortKey,
            );

          if (
            aValue !==
            bValue
          ) {
            return descending
              ? bValue -
                  aValue
              : aValue -
                  bValue;
          }

          return a.name.localeCompare(
            b.name,
            "cs",
          );
        },
      );
    }, [
      players,
      team,
      period,
      sortKey,
      descending,
    ]);

  function changeSort(
    key: SortKey,
  ) {
    if (
      sortKey === key
    ) {
      setDescending(
        (
          current,
        ) =>
          !current,
      );

      return;
    }

    setSortKey(
      key,
    );

    setDescending(
      true,
    );
  }

  return (
    <>
      <div
        className={
          styles.controls
        }
      >
        <div
          className={
            styles.controlGroup
          }
        >
          <span>
            Tým
          </span>

          <div
            className={
              styles.segment
            }
          >
            <FilterButton
              active={
                team ===
                "all"
              }
              onClick={() =>
                setTeam(
                  "all",
                )
              }
            >
              Všichni
            </FilterButton>

            <FilterButton
              active={
                team ===
                "a"
              }
              onClick={() =>
                setTeam(
                  "a",
                )
              }
            >
              A-tým
            </FilterButton>

            <FilterButton
              active={
                team ===
                "b"
              }
              onClick={() =>
                setTeam(
                  "b",
                )
              }
            >
              B-tým
            </FilterButton>
          </div>
        </div>

        <div
          className={
            styles.controlGroup
          }
        >
          <span>
            Období
          </span>

          <div
            className={
              styles.segment
            }
          >
            <FilterButton
              active={
                period ===
                "current"
              }
              onClick={() =>
                setPeriod(
                  "current",
                )
              }
            >
              2026/27
            </FilterButton>

            <FilterButton
              active={
                period ===
                "previous"
              }
              onClick={() =>
                setPeriod(
                  "previous",
                )
              }
            >
              2025/26
            </FilterButton>

            <FilterButton
              active={
                period ===
                "total"
              }
              onClick={() =>
                setPeriod(
                  "total",
                )
              }
            >
              Celkem
            </FilterButton>
          </div>
        </div>
      </div>

      <div
        className={
          styles.sortHint
        }
      >
        Kliknutím na název
        statistiky tabulku
        seřadíš.
      </div>

      <div
        className={
          styles.tableWrap
        }
      >
        <div
          className={
            styles.header
          }
        >
          <span>
            #
          </span>

          <span>
            Hráč
          </span>

          <span>
            Tým
          </span>

          <SortButton
            label="Zápasy"
            sortKey="matches"
            activeKey={
              sortKey
            }
            descending={
              descending
            }
            onClick={
              changeSort
            }
          />

          <SortButton
            label="Góly"
            sortKey="goals"
            activeKey={
              sortKey
            }
            descending={
              descending
            }
            onClick={
              changeSort
            }
          />

          <SortButton
            label="Asistence"
            sortKey="assists"
            activeKey={
              sortKey
            }
            descending={
              descending
            }
            onClick={
              changeSort
            }
          />

          <SortButton
            label="Známka"
            sortKey="rating"
            activeKey={
              sortKey
            }
            descending={
              descending
            }
            onClick={
              changeSort
            }
          />

          <SortButton
            label="Docházka"
            sortKey="attendance"
            activeKey={
              sortKey
            }
            descending={
              descending
            }
            onClick={
              changeSort
            }
          />
        </div>

        <div
          className={
            styles.rows
          }
        >
          {visiblePlayers.map(
            (
              player,
              index,
            ) => {
              const stats =
                getPeriodStats(
                  player,
                  period,
                  team,
                );

              return (
                <Link
                  key={
                    player.id
                  }
                  href={`/hrac/${player.id}`}
                  className={
                    styles.row
                  }
                >
                  <span
                    className={
                      styles.rank
                    }
                  >
                    {index +
                      1}
                  </span>

                  <div
                    className={
                      styles.player
                    }
                  >
                    <strong>
                      {
                        player.name
                      }
                    </strong>

                    <small>
                      {player.number !==
                      null
                        ? `#${player.number}`
                        : "bez čísla"}
                    </small>
                  </div>

                  <span
                    className={
                      styles.team
                    }
                  >
                    {formatTeam(
                      player.team,
                    )}
                  </span>

                  <strong
                    className={
                      styles.number
                    }
                  >
                    {
                      stats.matches
                    }
                  </strong>

                  <strong
                    className={
                      styles.number
                    }
                  >
                    {
                      stats.goals
                    }
                  </strong>

                  <strong
                    className={
                      styles.number
                    }
                  >
                    {
                      stats.assists
                    }
                  </strong>

                  <span>
                    <RatingBadge
                      rating={
                        stats.rating
                      }
                    />
                  </span>

                  <strong
                    className={
                      styles.attendance
                    }
                  >
                    {stats.attendance !==
                    null
                      ? `${stats.attendance} %`
                      : "—"}
                  </strong>
                </Link>
              );
            },
          )}

          {visiblePlayers.length ===
            0 && (
            <div
              className={
                styles.empty
              }
            >
              Pro tento výběr
              zatím nejsou
              dostupná data.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;

  onClick: () => void;

  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={
        active
          ? styles.filterActive
          : styles.filter
      }
      onClick={
        onClick
      }
    >
      {children}
    </button>
  );
}

function SortButton({
  label,
  sortKey,
  activeKey,
  descending,
  onClick,
}: {
  label: string;

  sortKey: SortKey;

  activeKey: SortKey;

  descending: boolean;

  onClick:
    (
      key: SortKey,
    ) => void;
}) {
  const active =
    sortKey ===
    activeKey;

  return (
    <button
      type="button"
      className={
        active
          ? styles.sortActive
          : styles.sort
      }
      onClick={() =>
        onClick(
          sortKey,
        )
      }
    >
      {label}

      <span>
        {active
          ? descending
            ? "↓"
            : "↑"
          : "↕"}
      </span>
    </button>
  );
}

function RatingBadge({
  rating,
}: {
  rating: number | null;
}) {
  if (
    rating === null
  ) {
    return (
      <span
        className={
          styles.ratingEmpty
        }
      >
        —
      </span>
    );
  }

  return (
    <span
      className={`${styles.rating} ${getRatingClass(
        rating,
      )}`}
    >
      {rating.toFixed(
        1,
      )}
    </span>
  );
}

function getRatingClass(
  rating: number,
): string {
  if (
    rating >= 8
  ) {
    return styles.ratingExcellent;
  }

  if (
    rating >= 7
  ) {
    return styles.ratingGood;
  }

  if (
    rating >= 6.5
  ) {
    return styles.ratingAverage;
  }

  if (
    rating >= 6
  ) {
    return styles.ratingWeak;
  }

  return styles.ratingBad;
}


function isVisibleForPeriod(
  player: StatisticsPlayer,
  period: PeriodFilter,
): boolean {
  if (
    period === "current"
  ) {
    return player.currentVisible;
  }

  if (
    period === "previous"
  ) {
    return player.previousVisible;
  }

  return true;
}

function hasTeamStats(
  player: StatisticsPlayer,
  period: PeriodFilter,
  team:
    "a" |
    "b",
): boolean {
  if (
    period ===
    "previous"
  ) {
    return (
      player.previousTeams[
        team
      ] !==
      null
    );
  }

  if (
    period ===
    "current"
  ) {
    return (
      player.currentTeams[
        team
      ] !==
      null ||
      player.team ===
        team ||
      player.team ===
        "both"
    );
  }

  return (
    player.team ===
      team ||
    player.team ===
      "both"
  );
}

function getPeriodStats(
  player: StatisticsPlayer,
  period: PeriodFilter,
  team: TeamFilter = "all",
): StatisticsPlayer["current"] {
  if (
    period ===
    "previous"
  ) {
    if (
      team ===
        "a" &&
      player.previousTeams.a
    ) {
      return player.previousTeams.a;
    }

    if (
      team ===
        "b" &&
      player.previousTeams.b
    ) {
      return player.previousTeams.b;
    }

    return player.previous;
  }

  if (
    period ===
    "current"
  ) {
    if (
      team ===
        "a" &&
      player.currentTeams.a
    ) {
      return player.currentTeams.a;
    }

    if (
      team ===
        "b" &&
      player.currentTeams.b
    ) {
      return player.currentTeams.b;
    }

    return player.current;
  }

  return player.total;
}

function getSortValue(
  stats: StatisticsPlayer["current"],
  key: SortKey,
): number {
  const value =
    stats[key];

  if (
    value === null
  ) {
    return -1;
  }

  return Number(
    value,
  );
}

function formatTeam(
  team:
    StatisticsPlayer["team"],
): string {
  if (
    team === "a"
  ) {
    return "A-tým";
  }

  if (
    team === "b"
  ) {
    return "B-tým";
  }

  return "A + B";
}
