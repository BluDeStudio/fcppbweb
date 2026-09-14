"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

import styles from "./Teams.module.css";

type TeamKey =
  | "a"
  | "b"
  | "all";

type SquadTeam =
  | "a"
  | "b";

type SortKey =
  | "matches"
  | "goals"
  | "assists"
  | "points"
  | "playerOfMatch"
  | "rating";

type SortDirection =
  | "asc"
  | "desc";

type Player = {
  id: number;
  name: string;
  number: number | null;
  position: string;
  team: SquadTeam;
  imageUrl?: string | null;
};

type PlayerStats = {
  playerId: number;
  team: SquadTeam;

  matches: number;
  goals: number;
  assists: number;
  playerOfMatch: number;

  rating: number | null;
};

const PLAYERS: Player[] = [
  {
    id: 2945,
    name: "Radim Červeňák",
    number: null,
    position: "HRÁČ",
    team: "a",
  },
  {
    id: 6703,
    name: "Michal Himmer",
    number: null,
    position: "HRÁČ",
    team: "a",
  },
  {
    id: 7040,
    name: "David Chlupáč",
    number: null,
    position: "HRÁČ",
    team: "a",
  },
  {
    id: 1385,
    name: "Jan Jebas",
    number: null,
    position: "BRANKÁŘ",
    team: "a",
  },
  {
    id: 6209,
    name: "Petr Jelínek",
    number: null,
    position: "HRÁČ",
    team: "a",
  },
  {
    id: 4397,
    name: "Martin Kopřiva",
    number: null,
    position: "HRÁČ",
    team: "a",
  },
  {
    id: 6919,
    name: "Jan Koutecki",
    number: null,
    position: "HRÁČ",
    team: "a",
  },
  {
    id: 1562,
    name: "Petr Porada",
    number: null,
    position: "HRÁČ",
    team: "a",
  },
  {
    id: 5143,
    name: "Aleš Psohlavec",
    number: null,
    position: "HRÁČ",
    team: "a",
  },
  {
    id: 3746,
    name: "Vojtěch Suchý",
    number: null,
    position: "HRÁČ",
    team: "a",
  },
  {
    id: 963,
    name: "Jan Šebek",
    number: null,
    position: "HRÁČ",
    team: "a",
  },
  {
    id: 6700,
    name: "Jan Vlček",
    number: null,
    position: "HRÁČ",
    team: "a",
  },

  {
    id: 532,
    name: "David Bass",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 2024,
    name: "Jiří Bešta",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 2947,
    name: "Radek Červeňák",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 6917,
    name: "František Husák",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 4455,
    name: "David Kolářský",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 6615,
    name: "Peter Kotlár",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 6616,
    name: "Vojtěch Kselík",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 4637,
    name: "Maxim Negru",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 6946,
    name: "Adam Nekola",
    number: null,
    position: "BRANKÁŘ",
    team: "b",
  },
  {
    id: 3389,
    name: "Jakub Onody",
    number: null,
    position: "BRANKÁŘ",
    team: "b",
  },
  {
    id: 4247,
    name: "Michaela Onody Šloufová",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 6959,
    name: "Karel Pejšek",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 6387,
    name: "David Pelikán",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 5161,
    name: "Vojtěch Plaček",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 1743,
    name: "Jiří Rajtolar",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 1744,
    name: "Stanislav Rajtolar",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 3937,
    name: "David Schmirler",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 997,
    name: "Jiří Stehlík",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
  {
    id: 3931,
    name: "Lukáš Tintěra",
    number: null,
    position: "HRÁČ",
    team: "b",
  },
];

/*
  DOČASNÉ STATISTIKY

  Až napojíme data z aplikace / Supabase,
  tahle konstanta zmizí a nahradí ji fetch/service.

  Struktura už je ale připravená.
*/

const PLAYER_STATS: PlayerStats[] = [
  {
    playerId: 1385,
    team: "a",
    matches: 2,
    goals: 0,
    assists: 0,
    playerOfMatch: 1,
    rating: 9.5,
  },
  {
    playerId: 7040,
    team: "a",
    matches: 2,
    goals: 3,
    assists: 0,
    playerOfMatch: 1,
    rating: 9.6,
  },
  {
    playerId: 3746,
    team: "a",
    matches: 2,
    goals: 1,
    assists: 0,
    playerOfMatch: 1,
    rating: 9.5,
  },
  {
    playerId: 6616,
    team: "b",
    matches: 2,
    goals: 0,
    assists: 0,
    playerOfMatch: 1,
    rating: 8.8,
  },
];

export default function TeamsPage() {
  const [
    squadTeam,
    setSquadTeam,
  ] =
    useState<SquadTeam>("a");

  const [
    statsTeam,
    setStatsTeam,
  ] =
    useState<TeamKey>("a");

  const [
    sortKey,
    setSortKey,
  ] =
    useState<SortKey>(
      "points",
    );

  const [
    sortDirection,
    setSortDirection,
  ] =
    useState<SortDirection>(
      "desc",
    );

  const squadPlayers =
    useMemo(() => {
      return PLAYERS.filter(
        (player) =>
          player.team ===
          squadTeam,
      );
    }, [squadTeam]);

  const statsRows =
    useMemo(() => {
      const map =
        new Map<
          number,
          {
            player: Player;
            matches: number;
            goals: number;
            assists: number;
            points: number;
            playerOfMatch: number;
            rating: number | null;
            ratingCount: number;
          }
        >();

      for (
        const player of PLAYERS
      ) {
        map.set(
          player.id,
          {
            player,
            matches: 0,
            goals: 0,
            assists: 0,
            points: 0,
            playerOfMatch: 0,
            rating: null,
            ratingCount: 0,
          },
        );
      }

      for (
        const stat of PLAYER_STATS
      ) {
        const row =
          map.get(
            stat.playerId,
          );

        if (!row) {
          continue;
        }

        if (
          statsTeam !==
            "all" &&
          stat.team !==
            statsTeam
        ) {
          continue;
        }

        row.matches +=
          stat.matches;

        row.goals +=
          stat.goals;

        row.assists +=
          stat.assists;

        row.points =
          row.goals +
          row.assists;

        row.playerOfMatch +=
          stat.playerOfMatch;

        if (
          stat.rating !==
          null
        ) {
          const previousSum =
            row.rating !==
            null
              ? row.rating *
                row.ratingCount
              : 0;

          row.ratingCount +=
            1;

          row.rating =
            (
              previousSum +
              stat.rating
            ) /
            row.ratingCount;
        }
      }

      let result =
        Array.from(
          map.values(),
        );

      if (
        statsTeam !==
        "all"
      ) {
        result =
          result.filter(
            (row) =>
              row.player
                .team ===
              statsTeam,
          );
      }

      result.sort(
        (
          first,
          second,
        ) => {
          const firstValue =
            getSortValue(
              first,
              sortKey,
            );

          const secondValue =
            getSortValue(
              second,
              sortKey,
            );

          if (
            firstValue ===
            secondValue
          ) {
            return first.player.name.localeCompare(
              second.player.name,
              "cs",
            );
          }

          if (
            sortDirection ===
            "desc"
          ) {
            return (
              secondValue -
              firstValue
            );
          }

          return (
            firstValue -
            secondValue
          );
        },
      );

      return result;
    }, [
      statsTeam,
      sortKey,
      sortDirection,
    ]);

  function handleSort(
    key: SortKey,
  ) {
    if (
      sortKey === key
    ) {
      setSortDirection(
        (current) =>
          current ===
          "desc"
            ? "asc"
            : "desc",
      );

      return;
    }

    setSortKey(key);
    setSortDirection(
      "desc",
    );
  }

  return (
    <main
      className={
        styles.page
      }
    >
      <section
        className={
          styles.hero
        }
      >
        <div
          className={
            styles.heroGlow
          }
        />

        <div
          className={
            styles.heroInner
          }
        >
          <span
            className={
              styles.heroEyebrow
            }
          >
            FC PPB · FUTSAL PLZEŇ
          </span>

          <h1>
            TÝMY.
          </h1>

          <p>
            SOUPISKA · STATISTIKY · VÝKONY
          </p>
        </div>
      </section>

      <div
        className={
          styles.shell
        }
      >
        {/* =================================================
            SOUPISKA
        ================================================= */}

        <section
          className={
            styles.section
          }
        >
          <div
            className={
              styles.sectionHeader
            }
          >
            <SectionTitle
              title="SOUPISKA HRÁČŮ."
            />

            <TeamToggle
              value={
                squadTeam
              }
              options={[
                {
                  value: "a",
                  label: "A-TÝM",
                },
                {
                  value: "b",
                  label: "B-TÝM",
                },
              ]}
              onChange={(
                value,
              ) =>
                setSquadTeam(
                  value as SquadTeam,
                )
              }
            />
          </div>

          <div
            className={
              styles.squadGrid
            }
          >
            {squadPlayers.map(
              (player) => (
                <PlayerCard
                  key={
                    player.id
                  }
                  player={
                    player
                  }
                />
              ),
            )}
          </div>
        </section>

        {/* =================================================
            STATISTIKY
        ================================================= */}

        <section
          className={
            styles.section
          }
        >
          <div
            className={
              styles.sectionHeader
            }
          >
            <SectionTitle
              title="STATISTIKY."
            />

            <TeamToggle
              value={
                statsTeam
              }
              options={[
                {
                  value: "a",
                  label: "A-TÝM",
                },
                {
                  value: "b",
                  label: "B-TÝM",
                },
                {
                  value: "all",
                  label: "CELKOVĚ",
                },
              ]}
              onChange={(
                value,
              ) =>
                setStatsTeam(
                  value as TeamKey,
                )
              }
            />
          </div>

          <div
            className={
              styles.statsCard
            }
          >
            <div
              className={
                styles.statsHeader
              }
            >
              <span
                className={
                  styles.positionColumn
                }
              >
                #
              </span>

              <span
                className={
                  styles.playerColumn
                }
              >
                HRÁČ
              </span>

              <SortButton
                label="Z"
                sortKey="matches"
                currentKey={
                  sortKey
                }
                direction={
                  sortDirection
                }
                onClick={
                  handleSort
                }
              />

              <SortButton
                label="G"
                sortKey="goals"
                currentKey={
                  sortKey
                }
                direction={
                  sortDirection
                }
                onClick={
                  handleSort
                }
              />

              <SortButton
                label="A"
                sortKey="assists"
                currentKey={
                  sortKey
                }
                direction={
                  sortDirection
                }
                onClick={
                  handleSort
                }
              />

              <SortButton
                label="BODY"
                sortKey="points"
                currentKey={
                  sortKey
                }
                direction={
                  sortDirection
                }
                onClick={
                  handleSort
                }
              />

              <SortButton
                label="HZ"
                sortKey="playerOfMatch"
                currentKey={
                  sortKey
                }
                direction={
                  sortDirection
                }
                onClick={
                  handleSort
                }
              />

              <SortButton
                label="ZNÁMKA"
                sortKey="rating"
                currentKey={
                  sortKey
                }
                direction={
                  sortDirection
                }
                onClick={
                  handleSort
                }
              />
            </div>

            {statsRows.map(
              (
                row,
                index,
              ) => (
                <div
                  key={
                    row.player.id
                  }
                  className={`${styles.statsRow} ${
                    index <
                    3
                      ? styles.topRow
                      : ""
                  }`}
                >
                  <span
                    className={
                      styles.positionColumn
                    }
                  >
                    {index +
                      1}.
                  </span>

                  <Link
                    href={`/hrac/${row.player.id}`}
                    className={
                      styles.statsPlayer
                    }
                  >
                    <PlayerThumb
                      player={
                        row.player
                      }
                    />

                    <div>
                      <strong>
                        {
                          row
                            .player
                            .name
                        }
                      </strong>

                      <small>
                        {row
                          .player
                          .team ===
                        "a"
                          ? "A-TÝM"
                          : "B-TÝM"}
                      </small>
                    </div>
                  </Link>

                  <span>
                    {
                      row.matches
                    }
                  </span>

                  <span>
                    {
                      row.goals
                    }
                  </span>

                  <span>
                    {
                      row.assists
                    }
                  </span>

                  <b>
                    {
                      row.points
                    }
                  </b>

                  <span>
                    {
                      row.playerOfMatch
                    }
                  </span>

                  <strong
                    className={
                      styles.rating
                    }
                  >
                    {row.rating !==
                    null
                      ? row.rating.toFixed(
                          1,
                        )
                      : "–"}
                  </strong>
                </div>
              ),
            )}
          </div>
        </section>
      </div>
    </main>
  );
}


/* =========================================================
   PLAYER CARD
   ========================================================= */

function PlayerCard({
  player,
}: {
  player: Player;
}) {
  return (
    <Link
      href={`/hrac/${player.id}`}
      className={
        styles.playerCard
      }
    >
      <div
        className={
          styles.playerCardGlow
        }
      />

      <img
        className={
          styles.playerWatermark
        }
        src="/images/fc-ppb-logo.png"
        alt=""
        aria-hidden="true"
      />

      <PlayerImage
        player={player}
      />

      <div
        className={
          styles.playerCardCopy
        }
      >
        <span>
          {player.position}
        </span>

        <h3>
          {formatPlayerName(
            player.name,
          )}
        </h3>

        <small>
          {player.team ===
          "a"
            ? "A-TÝM"
            : "B-TÝM"}
        </small>
      </div>

      <div
        className={
          styles.playerArrow
        }
      >
        →
      </div>
    </Link>
  );
}


/* =========================================================
   PLAYER IMAGE
   ========================================================= */

function PlayerImage({
  player,
}: {
  player: Player;
}) {
  return (
    <img
      className={
        styles.playerImage
      }
      src={`/images/${player.id}.png`}
      alt={player.name}
      onError={(
        event,
      ) => {
        const image =
          event.currentTarget;

        const fallback =
          image.dataset
            .fallback ??
          "";

        if (
          fallback ===
          ""
        ) {
          image.dataset
            .fallback =
            "jpg";

          image.src =
            `/images/${player.id}.jpg`;

          return;
        }

        if (
          fallback ===
            "jpg" &&
          player.imageUrl
        ) {
          image.dataset
            .fallback =
            "remote";

          image.src =
            player.imageUrl;

          return;
        }

        image.style.display =
          "none";
      }}
    />
  );
}

function PlayerThumb({
  player,
}: {
  player: Player;
}) {
  return (
    <div
      className={
        styles.playerThumb
      }
    >
      <img
        src={`/images/${player.id}.png`}
        alt=""
        onError={(
          event,
        ) => {
          const image =
            event.currentTarget;

          if (
            image.dataset
              .fallback !==
            "jpg"
          ) {
            image.dataset
              .fallback =
              "jpg";

            image.src =
              `/images/${player.id}.jpg`;

            return;
          }

          image.style.display =
            "none";
        }}
      />

      <span>
        {initials(
          player.name,
        )}
      </span>
    </div>
  );
}


/* =========================================================
   SECTION TITLE
   ========================================================= */

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <div
      className={
        styles.sectionTitle
      }
    >
      <h2>
        {title}
      </h2>
    </div>
  );
}


/* =========================================================
   TEAM TOGGLE
   ========================================================= */

function TeamToggle({
  value,
  options,
  onChange,
}: {
  value: string;

  options: Array<{
    value: string;
    label: string;
  }>;

  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div
      className={
        styles.toggle
      }
    >
      {options.map(
        (option) => (
          <button
            key={
              option.value
            }
            type="button"
            className={
              value ===
              option.value
                ? styles.toggleActive
                : ""
            }
            onClick={() =>
              onChange(
                option.value,
              )
            }
          >
            {
              option.label
            }
          </button>
        ),
      )}
    </div>
  );
}


/* =========================================================
   SORT
   ========================================================= */

function SortButton({
  label,
  sortKey,
  currentKey,
  direction,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  direction: SortDirection;

  onClick: (
    key: SortKey,
  ) => void;
}) {
  const active =
    sortKey ===
    currentKey;

  return (
    <button
      type="button"
      className={`${styles.sortButton} ${
        active
          ? styles.sortActive
          : ""
      }`}
      onClick={() =>
        onClick(
          sortKey,
        )
      }
    >
      <span>
        {label}
      </span>

      {active ? (
        <i>
          {direction ===
          "desc"
            ? "↓"
            : "↑"}
        </i>
      ) : null}
    </button>
  );
}


/* =========================================================
   HELPERS
   ========================================================= */

function getSortValue(
  row: {
    matches: number;
    goals: number;
    assists: number;
    points: number;
    playerOfMatch: number;
    rating: number | null;
  },
  key: SortKey,
): number {
  switch (key) {
    case "matches":
      return row.matches;

    case "goals":
      return row.goals;

    case "assists":
      return row.assists;

    case "points":
      return row.points;

    case "playerOfMatch":
      return row.playerOfMatch;

    case "rating":
      return row.rating ?? -1;
  }
}

function formatPlayerName(
  name: string,
) {
  const parts =
    name
      .trim()
      .split(/\s+/);

  if (
    parts.length <
    2
  ) {
    return name;
  }

  const last =
    parts.pop();

  return (
    <>
      {parts.join(
        " ",
      )}

      <strong>
        {last}
      </strong>
    </>
  );
}

function initials(
  value: string,
): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (word) =>
        word[0]
          ?.toUpperCase() ??
        "",
    )
    .join("");
}