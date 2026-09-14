"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

import styles from "./Teams.module.css";

export type SquadTeam =
  | "a"
  | "b"
  | "both";

export type StatsTeam =
  | "a"
  | "b"
  | "all";

export type TeamsPlayer = {
  id: string;

  appPlayerId:
    string | null;

  apfPlayerId:
    number | null;

  name: string;

  team:
    SquadTeam;

  number:
    number | null;

  position:
    string;

  status:
    "club" | "loan";

  imageUrl:
    string | null;
};

export type TeamsStatRow = {
  playerId: string;

  apfPlayerId:
    number | null;

  name: string;

  position:
    string;

  squadTeam:
    SquadTeam | null;

  team:
    "a" | "b";

  matches:
    number;

  goals:
    number;

  assists:
    number;

  points:
    number;

  motm:
    number;

  rating:
    number | null;

  /*
   * Pomocné hodnoty pro serverovou agregaci.
   * V UI se nezobrazují.
   */

  ratingSum:
    number;

  ratingCount:
    number;

  matchIds:
    string[];
};

type View =
  | "squad"
  | "stats";

type SortKey =
  | "matches"
  | "goals"
  | "assists"
  | "points"
  | "motm"
  | "rating";

type SortDirection =
  | "desc"
  | "asc";

type Props = {
  squad:
    TeamsPlayer[];

  stats:
    TeamsStatRow[];

  initialSquadTeam:
    "a" | "b";
};

type DisplayStatRow = {
  playerId:
    string;

  apfPlayerId:
    number | null;

  name:
    string;

  position:
    string;

  squadTeam:
    SquadTeam | null;

  matches:
    number;

  goals:
    number;

  assists:
    number;

  points:
    number;

  motm:
    number;

  rating:
    number | null;

  ratingSum:
    number;

  ratingCount:
    number;
};

const POSITION_ORDER =
  [
    "Brankář",
    "Obránce",
    "Záložník",
    "Útočník",
    "Hráč",
  ];

export default function TeamsClient({
  squad,
  stats,
  initialSquadTeam,
}: Props) {
  const [
    view,
    setView,
  ] =
    useState<View>(
      "squad",
    );

  const [
    squadTeam,
    setSquadTeam,
  ] =
    useState<
      "a" | "b"
    >(
      initialSquadTeam,
    );

  const [
    statsTeam,
    setStatsTeam,
  ] =
    useState<StatsTeam>(
      "a",
    );

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

  /*
   * ============================================================
   * SOUPISKA
   * ============================================================
   */

  const squadPlayers =
    useMemo(
      () =>
        squad.filter(
          (player) =>
            player.team ===
              squadTeam ||
            player.team ===
              "both",
        ),
      [
        squad,
        squadTeam,
      ],
    );

  const groups =
    useMemo(() => {
      const map =
        new Map<
          string,
          TeamsPlayer[]
        >();

      squadPlayers.forEach(
        (
          player,
        ) => {
          const position =
            player.position ||
            "Hráč";

          const current =
            map.get(
              position,
            ) ?? [];

          current.push(
            player,
          );

          map.set(
            position,
            current,
          );
        },
      );

      return Array.from(
        map.entries(),
      ).sort(
        (
          [a],
          [b],
        ) => {
          const ai =
            POSITION_ORDER.indexOf(
              a,
            );

          const bi =
            POSITION_ORDER.indexOf(
              b,
            );

          const safeA =
            ai === -1
              ? 999
              : ai;

          const safeB =
            bi === -1
              ? 999
              : bi;

          if (
            safeA !==
            safeB
          ) {
            return (
              safeA -
              safeB
            );
          }

          return a.localeCompare(
            b,
            "cs",
          );
        },
      );
    }, [
      squadPlayers,
    ]);

  /*
   * ============================================================
   * STATISTIKY
   * ============================================================
   */

  const statsRows =
    useMemo(() => {
      let rows:
        DisplayStatRow[] =
          [];

      /*
       * A / B
       *
       * NEFILTRUJEME podle kmenové soupisky.
       *
       * Pouze podle toho,
       * v jakém zápase hráč skutečně nastoupil.
       */

      if (
        statsTeam ===
        "a" ||
        statsTeam ===
        "b"
      ) {
        rows =
          stats
            .filter(
              (row) =>
                row.team ===
                statsTeam,
            )
            .map(
              (row) => ({
                playerId:
                  row.playerId,

                apfPlayerId:
                  row.apfPlayerId,

                name:
                  row.name,

                position:
                  row.position,

                squadTeam:
                  row.squadTeam,

                matches:
                  row.matches,

                goals:
                  row.goals,

                assists:
                  row.assists,

                points:
                  row.points,

                motm:
                  row.motm,

                rating:
                  row.rating,

                ratingSum:
                  row.ratingSum,

                ratingCount:
                  row.ratingCount,
              }),
            );
      } else {
        /*
         * CELKOVĚ
         *
         * Spojíme A + B podle player_id.
         */

        const combined =
          new Map<
            string,
            DisplayStatRow
          >();

        stats.forEach(
          (row) => {
            let current =
              combined.get(
                row.playerId,
              );

            if (!current) {
              current = {
                playerId:
                  row.playerId,

                apfPlayerId:
                  row.apfPlayerId,

                name:
                  row.name,

                position:
                  row.position,

                squadTeam:
                  row.squadTeam,

                matches:
                  0,

                goals:
                  0,

                assists:
                  0,

                points:
                  0,

                motm:
                  0,

                rating:
                  null,

                ratingSum:
                  0,

                ratingCount:
                  0,
              };

              combined.set(
                row.playerId,
                current,
              );
            }

            current.matches +=
              row.matches;

            current.goals +=
              row.goals;

            current.assists +=
              row.assists;

            current.points =
              current.goals +
              current.assists;

            current.motm +=
              row.motm;

            current.ratingSum +=
              row.ratingSum;

            current.ratingCount +=
              row.ratingCount;

            current.rating =
              current.ratingCount >
              0
                ? roundToOne(
                    current.ratingSum /
                      current.ratingCount,
                  )
                : null;
          },
        );

        rows =
          Array.from(
            combined.values(),
          );
      }

      /*
       * Bez startu se do statistik
       * nikdy nedostane.
       */

      rows =
        rows.filter(
          (row) =>
            row.matches >
            0,
        );

      /*
       * ŘAZENÍ
       */

      rows.sort(
        (
          a,
          b,
        ) => {
          const aValue =
            getSortValue(
              a,
              sortKey,
            );

          const bValue =
            getSortValue(
              b,
              sortKey,
            );

          if (
            aValue ===
            bValue
          ) {
            /*
             * Sekundárně BODY,
             * potom góly,
             * potom jméno.
             */

            if (
              a.points !==
              b.points
            ) {
              return (
                b.points -
                a.points
              );
            }

            if (
              a.goals !==
              b.goals
            ) {
              return (
                b.goals -
                a.goals
              );
            }

            return a.name.localeCompare(
              b.name,
              "cs",
            );
          }

          return sortDirection ===
            "desc"
            ? bValue -
                aValue
            : aValue -
                bValue;
        },
      );

      return rows;
    }, [
      stats,
      statsTeam,
      sortKey,
      sortDirection,
    ]);

  function handleSort(
    key:
      SortKey,
  ) {
    if (
      key ===
      sortKey
    ) {
      setSortDirection(
        (
          previous,
        ) =>
          previous ===
          "desc"
            ? "asc"
            : "desc",
      );

      return;
    }

    setSortKey(
      key,
    );

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
      {/* =====================================================
          HERO
      ===================================================== */}

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

        <img
          className={
            styles.heroLogo
          }
          src="/images/fc-ppb-logo.png"
          alt=""
          aria-hidden="true"
        />

        <div
          className={
            styles.heroInner
          }
        >
          <span>
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
            HLAVNÍ NAVIGACE
        ================================================= */}

        <nav
          className={
            styles.viewTabs
          }
          aria-label="Týmy"
        >
          <button
            type="button"
            className={
              view ===
              "squad"
                ? styles.viewTabActive
                : ""
            }
            onClick={() =>
              setView(
                "squad",
              )
            }
          >
            SOUPISKA
          </button>

          <button
            type="button"
            className={
              view ===
              "stats"
                ? styles.viewTabActive
                : ""
            }
            onClick={() =>
              setView(
                "stats",
              )
            }
          >
            STATISTIKY
          </button>
        </nav>

        {/* =================================================
            SOUPISKA
        ================================================= */}

        {view ===
        "squad" ? (
          <section
            className={
              styles.contentSection
            }
          >
            <div
              className={
                styles.sectionHeader
              }
            >
              <SectionTitle
                eyebrow="FC PPB"
                title="SOUPISKA."
              />

              <div
                className={
                  styles.teamTabs
                }
              >
                <button
                  type="button"
                  className={
                    squadTeam ===
                    "a"
                      ? styles.teamTabActive
                      : ""
                  }
                  onClick={() =>
                    setSquadTeam(
                      "a",
                    )
                  }
                >
                  A-TÝM
                </button>

                <button
                  type="button"
                  className={
                    squadTeam ===
                    "b"
                      ? styles.teamTabActive
                      : ""
                  }
                  onClick={() =>
                    setSquadTeam(
                      "b",
                    )
                  }
                >
                  B-TÝM
                </button>
              </div>
            </div>

            {groups.length >
            0 ? (
              <div
                className={
                  styles.groups
                }
              >
                {groups.map(
                  ([
                    position,
                    players,
                  ]) => (
                    <PlayerGroup
                      key={
                        position
                      }
                      position={
                        position
                      }
                      players={
                        players
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <Empty
                text="SOUPISKA ZATÍM NENÍ K DISPOZICI."
              />
            )}
          </section>
        ) : (
          /* ===============================================
             STATISTIKY
          =============================================== */

          <section
            className={
              styles.contentSection
            }
          >
            <div
              className={
                styles.sectionHeader
              }
            >
              <SectionTitle
                eyebrow="SEZÓNNÍ PŘEHLED"
                title="STATISTIKY."
              />

              <div
                className={
                  styles.teamTabs
                }
              >
                <button
                  type="button"
                  className={
                    statsTeam ===
                    "a"
                      ? styles.teamTabActive
                      : ""
                  }
                  onClick={() =>
                    setStatsTeam(
                      "a",
                    )
                  }
                >
                  A-TÝM
                </button>

                <button
                  type="button"
                  className={
                    statsTeam ===
                    "b"
                      ? styles.teamTabActive
                      : ""
                  }
                  onClick={() =>
                    setStatsTeam(
                      "b",
                    )
                  }
                >
                  B-TÝM
                </button>

                <button
                  type="button"
                  className={
                    statsTeam ===
                    "all"
                      ? styles.teamTabActive
                      : ""
                  }
                  onClick={() =>
                    setStatsTeam(
                      "all",
                    )
                  }
                >
                  CELKOVĚ
                </button>
              </div>
            </div>

            <StatsTable
              rows={
                statsRows
              }
              sortKey={
                sortKey
              }
              direction={
                sortDirection
              }
              onSort={
                handleSort
              }
            />
          </section>
        )}
      </div>
    </main>
  );
}


/* ============================================================
   PLAYER GROUP
   ============================================================ */

function PlayerGroup({
  position,
  players,
}: {
  position:
    string;

  players:
    TeamsPlayer[];
}) {
  return (
    <section
      className={
        styles.playerGroup
      }
    >
      <h2>
        {position.toUpperCase()}
      </h2>

      <div
        className={
          styles.playerGrid
        }
      >
        {players.map(
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
  );
}


/* ============================================================
   PLAYER CARD
   ============================================================ */

function PlayerCard({
  player,
}: {
  player:
    TeamsPlayer;
}) {
  const href =
    player.apfPlayerId !==
    null
      ? `/hrac/${player.apfPlayerId}`
      : "#";

  return (
    <Link
      href={href}
      className={
        styles.playerCard
      }
      aria-disabled={
        player.apfPlayerId ===
        null
      }
    >
      <div
        className={
          styles.cardLight
        }
      />

      <img
        className={
          styles.cardGhost
        }
        src="/images/fc-ppb-logo.png"
        alt=""
        aria-hidden="true"
      />

      {player.number !==
      null ? (
        <span
          className={
            styles.playerNumber
          }
        >
          #
          {
            player.number
          }
        </span>
      ) : (
        <span
          className={
            styles.playerNumber
          }
        >
          FC PPB
        </span>
      )}

      <PlayerImage
        player={
          player
        }
      />

      <div
        className={
          styles.playerShade
        }
      />

      <div
        className={
          styles.playerCopy
        }
      >
        <h3>
          {formatName(
            player.name,
          )}
        </h3>

        <span>
          {
            player.position
          }
        </span>

        {player.status ===
        "loan" ? (
          <small>
            HOSTOVÁNÍ
          </small>
        ) : null}
      </div>
    </Link>
  );
}


/* ============================================================
   PLAYER IMAGE
   ============================================================ */

function PlayerImage({
  player,
}: {
  player:
    TeamsPlayer;
}) {
  const candidates =
    Array.from(
      new Set(
        [
          player.apfPlayerId !==
            null
            ? `/images/${player.apfPlayerId}.png`
            : null,

          player.apfPlayerId !==
            null
            ? `/images/${player.apfPlayerId}.jpg`
            : null,

          player.imageUrl,
        ].filter(
          (
            value,
          ): value is string =>
            Boolean(
              value,
            ),
        ),
      ),
    );


  if (
    candidates.length ===
    0
  ) {
    return null;
  }


  return (
    <img
      className={
        styles.playerImage
      }
      src={
        candidates[0]
      }
      alt={
        player.name
      }
      data-fallback-index="0"
      onError={(
        event,
      ) => {
        const image =
          event.currentTarget;


        const currentIndex =
          Number(
            image.dataset
              .fallbackIndex ??
              "0",
          );


        const nextIndex =
          currentIndex +
          1;


        if (
          nextIndex <
          candidates.length
        ) {
          image.dataset
            .fallbackIndex =
            String(
              nextIndex,
            );


          image.src =
            candidates[
              nextIndex
            ];

          return;
        }


        image.style.display =
          "none";
      }}
    />
  );
}

/* ============================================================
   STATISTIKY
   ============================================================ */

function StatsTable({
  rows,
  sortKey,
  direction,
  onSort,
}: {
  rows:
    DisplayStatRow[];

  sortKey:
    SortKey;

  direction:
    SortDirection;

  onSort:
    (
      key:
        SortKey,
    ) => void;
}) {
  if (
    rows.length ===
    0
  ) {
    return (
      <Empty
        text="ZA TENTO TÝM ZATÍM NIKDO NENASTOUPIL."
      />
    );
  }

  return (
    <div
      className={
        styles.statsWrap
      }
    >
      <div
        className={
          styles.statsTable
        }
      >
        <div
          className={
            styles.statsHead
          }
        >
          <span>
            #
          </span>

          <span>
            HRÁČ
          </span>

          <SortHead
            label="Z"
            value="matches"
            active={
              sortKey
            }
            direction={
              direction
            }
            onSort={
              onSort
            }
          />

          <SortHead
            label="G"
            value="goals"
            active={
              sortKey
            }
            direction={
              direction
            }
            onSort={
              onSort
            }
          />

          <SortHead
            label="A"
            value="assists"
            active={
              sortKey
            }
            direction={
              direction
            }
            onSort={
              onSort
            }
          />

          <SortHead
            label="BODY"
            value="points"
            active={
              sortKey
            }
            direction={
              direction
            }
            onSort={
              onSort
            }
          />

          <SortHead
            label="HZ"
            value="motm"
            active={
              sortKey
            }
            direction={
              direction
            }
            onSort={
              onSort
            }
          />

          <SortHead
            label="ZNÁMKA"
            value="rating"
            active={
              sortKey
            }
            direction={
              direction
            }
            onSort={
              onSort
            }
          />
        </div>

        {rows.map(
          (
            row,
            index,
          ) => (
            <StatsRow
              key={
                row.playerId
              }
              row={
                row
              }
              position={
                index + 1
              }
              activeSort={
                sortKey
              }
            />
          ),
        )}
      </div>
    </div>
  );
}


/* ============================================================
   STATS ROW
   ============================================================ */

function StatsRow({
  row,
  position,
  activeSort,
}: {
  row:
    DisplayStatRow;

  position:
    number;

  activeSort:
    SortKey;
}) {
  const href =
    row.apfPlayerId !==
    null
      ? `/hrac/${row.apfPlayerId}`
      : "#";

  return (
    <div
      className={
        styles.statsRow
      }
    >
      <span
        className={
          styles.rank
        }
      >
        {position}.
      </span>

      <Link
        href={href}
        className={
          styles.statsPlayer
        }
      >
        <PlayerThumb
          row={row}
        />

        <div>
          <strong>
            {row.name}
          </strong>

          <small>
            {
              row.position
            }

            {row.squadTeam ? (
              <>
                {" · "}

                {formatSquadTeam(
                  row.squadTeam,
                )}
              </>
            ) : null}
          </small>
        </div>
      </Link>

      <StatValue
        value={
          row.matches
        }
        active={
          activeSort ===
          "matches"
        }
      />

      <StatValue
        value={
          row.goals
        }
        active={
          activeSort ===
          "goals"
        }
      />

      <StatValue
        value={
          row.assists
        }
        active={
          activeSort ===
          "assists"
        }
      />

      <StatValue
        value={
          row.points
        }
        active={
          activeSort ===
          "points"
        }
      />

      <StatValue
        value={
          row.motm
        }
        active={
          activeSort ===
          "motm"
        }
      />

      <StatValue
        value={
          row.rating !==
          null
            ? row.rating.toFixed(
                1,
              )
            : "–"
        }
        active={
          activeSort ===
          "rating"
        }
      />
    </div>
  );
}


/* ============================================================
   STAT VALUE
   ============================================================ */

function StatValue({
  value,
  active,
}: {
  value:
    string | number;

  active:
    boolean;
}) {
  return (
    <span
      className={`${styles.statValue} ${
        active
          ? styles.statValueActive
          : ""
      }`}
    >
      {value}
    </span>
  );
}


/* ============================================================
   SORT HEAD
   ============================================================ */

function SortHead({
  label,
  value,
  active,
  direction,
  onSort,
}: {
  label:
    string;

  value:
    SortKey;

  active:
    SortKey;

  direction:
    SortDirection;

  onSort:
    (
      key:
        SortKey,
    ) => void;
}) {
  const isActive =
    value ===
    active;

  return (
    <button
      type="button"
      className={`${styles.sortHead} ${
        isActive
          ? styles.sortHeadActive
          : ""
      }`}
      onClick={() =>
        onSort(
          value,
        )
      }
    >
      {label}

      {isActive ? (
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


/* ============================================================
   THUMB
   ============================================================ */

function PlayerThumb({
  row,
}: {
  row:
    DisplayStatRow;
}) {
  return (
    <div
      className={
        styles.playerThumb
      }
    >
      {row.apfPlayerId !==
      null ? (
        <img
          src={`/images/${row.apfPlayerId}.png`}
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
                `/images/${row.apfPlayerId}.jpg`;

              return;
            }

            image.style.display =
              "none";
          }}
        />
      ) : null}

      <span>
        {initials(
          row.name,
        )}
      </span>
    </div>
  );
}


/* ============================================================
   TITLE
   ============================================================ */

function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow:
    string;

  title:
    string;
}) {
  return (
    <div
      className={
        styles.sectionTitle
      }
    >
      <span>
        {eyebrow}
      </span>

      <h2>
        {title}
      </h2>
    </div>
  );
}


/* ============================================================
   EMPTY
   ============================================================ */

function Empty({
  text,
}: {
  text:
    string;
}) {
  return (
    <div
      className={
        styles.empty
      }
    >
      {text}
    </div>
  );
}


/* ============================================================
   HELPERS
   ============================================================ */

function formatName(
  name:
    string,
) {
  const parts =
    name
      .trim()
      .split(
        /\s+/,
      );

  if (
    parts.length <
    2
  ) {
    return name;
  }

  const surname =
    parts.pop();

  return (
    <>
      <span>
        {parts.join(
          " ",
        )}
      </span>

      <strong>
        {surname}
      </strong>
    </>
  );
}

function formatSquadTeam(
  team:
    SquadTeam,
) {
  if (
    team ===
    "a"
  ) {
    return "A-TÝM";
  }

  if (
    team ===
    "b"
  ) {
    return "B-TÝM";
  }

  return "A + B";
}

function initials(
  name:
    string,
) {
  return name
    .split(
      /\s+/,
    )
    .filter(
      Boolean,
    )
    .slice(
      0,
      2,
    )
    .map(
      (part) =>
        part[0]?.toUpperCase() ??
        "",
    )
    .join("");
}

function getSortValue(
  row:
    DisplayStatRow,

  key:
    SortKey,
) {
  if (
    key ===
    "rating"
  ) {
    return (
      row.rating ??
      -1
    );
  }

  return row[key];
}

function roundToOne(
  value:
    number,
) {
  return (
    Math.round(
      value * 10,
    ) / 10
  );
}