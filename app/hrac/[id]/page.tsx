import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PlayerRecentMatches } from "@/components/player/PlayerRecentMatches";

import { clubConfig } from "@/config/club";
import { getPlayerMeta } from "@/data/playerMeta";

import { getPlayerAppStats } from "@/lib/getPlayerAppStats";
import { getStatisticsPlayers } from "@/lib/getStatisticsPlayers";

import { findPlayer } from "@/services/apf/findPlayer";
import { getPlayerProfile } from "@/services/apf/getPlayerProfile";

import type {
  PlayerSeasonHistory,
} from "@/types/player";

import type {
  PlayerAppSeasonStats,
} from "@/types/playerAppStats";

import styles from "./page.module.css";

type PlayerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlayerPage({
  params,
}: PlayerPageProps) {
  const { id } =
    await params;

  const playerId =
    Number(id);

  if (
    !Number.isFinite(
      playerId,
    )
  ) {
    notFound();
  }

  /*
   * ========================================
   * HRÁČ Z APF
   * ========================================
   */

  let squadPlayer =
    null;

  try {
    squadPlayer =
      await findPlayer(
        playerId,
      );
  } catch (error) {
    console.error(
      `Chyba při hledání hráče ${playerId}:`,
      error,
    );
  }

  if (
    !squadPlayer
  ) {
    notFound();
  }

  /*
   * ========================================
   * PROFIL APF
   * ========================================
   */

  let profile =
    null;

  try {
    profile =
      await getPlayerProfile(
        playerId,
        squadPlayer.apfSlug,
      );
  } catch (error) {
    console.error(
      `Chyba při načítání APF profilu ${playerId}:`,
      error,
    );
  }

  if (
    !profile
  ) {
    notFound();
  }

  /*
   * ========================================
   * DATA Z APLIKACE
   * ========================================
   */

  let appStats =
    null;

  try {
    appStats =
      await getPlayerAppStats(
        playerId,
      );
  } catch (error) {
    console.error(
      `Chyba při načítání dat aplikace pro hráče ${playerId}:`,
      error,
    );
  }

  /*
   * ========================================
   * META
   * ========================================
   */

  const meta =
    getPlayerMeta(
      playerId,
    );

  const number =
    appStats?.number ??
    meta.shirtNumber;

  const position =
    appStats?.position ??
    (
      meta.position ===
      "goalkeeper"
        ? "Brankář"
        : "Hráč"
    );

  const team =
    meta.team === "a"
      ? "A-tým"
      : meta.team === "b"
        ? "B-tým"
        : "A-tým + B-tým";

  /*
   * ========================================
   * SEZÓNY
   *
   * 2026/27 = od 1. 8. 2026
   * 2025/26 = do 31. 7. 2026 včetně
   * ========================================
   */

  const CURRENT_SEASON =
    "2026/27";

  const PREVIOUS_SEASON =
    "2025/26";

  let statisticsPlayer =
    null;

  try {
    const statisticsPlayers =
      await getStatisticsPlayers();

    statisticsPlayer =
      statisticsPlayers.find(
        (
          item,
        ) =>
          item.id ===
          playerId,
      ) ??
      null;
  } catch (error) {
    console.error(
      `Chyba při načítání sezonních statistik hráče ${playerId}:`,
      error,
    );
  }

  const currentAppSeason =
    findAppSeason(
      appStats?.seasons ??
        [],
      CURRENT_SEASON,
    );

  const previousAppSeason =
    findAppSeason(
      appStats?.seasons ??
        [],
      PREVIOUS_SEASON,
    );

  /*
   * ========================================
   * 2026/27
   *
   * VŠECHNO OD 1. 8. 2026 Z APLIKACE
   * ========================================
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

  const currentSeasonStats = {
    matches:
      currentMatches.length,

    goals:
      currentMatches.reduce(
        (
          sum,
          match,
        ) =>
          sum +
          Number(
            match.goals ??
              0,
          ),
        0,
      ),

    assists:
      currentMatches.reduce(
        (
          sum,
          match,
        ) =>
          sum +
          Number(
            match.assists ??
              0,
          ),
        0,
      ),

    yellowCards:
      currentMatches.reduce(
        (
          sum,
          match,
        ) =>
          sum +
          Number(
            match.yellowCards ??
              0,
          ),
        0,
      ),

    redCards:
      currentMatches.reduce(
        (
          sum,
          match,
        ) =>
          sum +
          Number(
            match.redCards ??
              0,
          ),
        0,
      ),

    rating:
      currentAppSeason?.averageRating ??
      null,

    attendance:
      currentAppSeason?.attendancePercentage ??
      null,
  };

  /*
   * ========================================
   * 2025/26
   *
   * APF A + B + APLIKACE DO 31. 7. 2026
   * ========================================
   */

  const previousSeasonStats = {
    matches:
      statisticsPlayer?.previous.matches ??
      0,

    goals:
      statisticsPlayer?.previous.goals ??
      0,

    assists:
      statisticsPlayer?.previous.assists ??
      0,

    yellowCards:
      statisticsPlayer?.previous.yellowCards ??
      0,

    redCards:
      statisticsPlayer?.previous.redCards ??
      0,

    awards:
      statisticsPlayer?.previous.awards ??
      0,

    rating:
      statisticsPlayer?.previous.rating ??
      previousAppSeason?.averageRating ??
      null,

    attendance:
      statisticsPlayer?.previous.attendance ??
      previousAppSeason?.attendancePercentage ??
      null,
  };

  const previousATeam =
    statisticsPlayer?.previousTeams.a ??
    null;

  const previousBTeam =
    statisticsPlayer?.previousTeams.b ??
    null;

  /*
   * ========================================
   * KARIÉRA
   * ========================================
   */

  const careerAssists =
    Number(
      profile.career.assists ??
        0,
    ) +
    Number(
      appStats?.totals.assists ??
        0,
    );

  const attendance =
    appStats?.attendancePercentage ??
    null;

  const careerRating =
    appStats?.averageRating ??
    null;

  /*
   * ========================================
   * WEB
   * ========================================
   */

  return (
    <main
      className={
        styles.page
      }
    >
      <div
        className={
          styles.container
        }
      >
        <Link
          href="/#soupiska"
          className={
            styles.back
          }
        >
          ← Zpět na soupisku
        </Link>

        {/* ==================================
            HERO
        ================================== */}

        <section
          className={
            styles.hero
          }
        >
          <div
            className={
              styles.heroContent
            }
          >
            <div
              className={
                styles.badges
              }
            >
              <span>
                {position}
              </span>

              <span>
                {team}
              </span>

              {meta.status ===
                "loan" && (
                <span>
                  Host
                </span>
              )}
            </div>

            <div
              className={
                styles.number
              }
            >
              {number !== null &&
              number !== undefined
                ? `#${number}`
                : "#—"}
            </div>

            <h1>
              {profile.name}
            </h1>

            <div
              className={
                styles.playerMeta
              }
            >
              {profile.age !==
                null && (
                <span>
                  {profile.age} let
                </span>
              )}

              <span>
                {position}
              </span>

              <span>
                {team}
              </span>
            </div>
          </div>

          <div
            className={
              styles.photo
            }
          >
            <Image
              src={
                `/images/${playerId}.jpg`
              }
              alt={
                profile.name
              }
              fill
              priority
              sizes="(max-width: 760px) 100vw, 50vw"
              className={
                styles.photoImage
              }
            />

            <div
              className={
                styles.photoShade
              }
            />
          </div>
        </section>

        {/* ==================================
            KARIÉRA
        ================================== */}

        <section
          className={
            styles.statsSection
          }
        >
          <div
            className={
              styles.sectionTitle
            }
          >
            <span>
              Kariéra
            </span>

            <h2>
              Celkové statistiky.
            </h2>
          </div>

          <div
            className={
              styles.statsGrid
            }
          >
            <StatBox
              label="Sezóny"
              value={
                profile.career.seasons
              }
            />

            <StatBox
              label="Zápasy"
              value={
                profile.career.matches
              }
            />

            <StatBox
              label="Góly"
              value={
                profile.career.goals
              }
            />

            <StatBox
              label="Asistence"
              value={
                careerAssists
              }
            />

            <StatBox
              label="Průměrná známka"
              value={
                careerRating !==
                null
                  ? careerRating.toFixed(
                      1,
                    )
                  : "—"
              }
            />

            <StatBox
              label="Docházka"
              value={
                attendance ??
                "—"
              }
              suffix={
                attendance !==
                null
                  ? "%"
                  : ""
              }
            />
          </div>
        </section>

        {/* ==================================
            AKTUÁLNÍ SEZÓNA 2026/27
        ================================== */}

        <section
          className={
            styles.currentSeason
          }
        >
          <div
            className={
              styles.sectionTitle
            }
          >
            <span>
              Aktuálně
            </span>

            <h2>
              Sezóna{" "}
              {CURRENT_SEASON}
            </h2>
          </div>

          <div
            className={
              styles.statsGrid
            }
          >
            <StatBox
              label="Zápasy"
              value={
                currentSeasonStats.matches
              }
            />

            <StatBox
              label="Góly"
              value={
                currentSeasonStats.goals
              }
            />

            <StatBox
              label="Asistence"
              value={
                currentSeasonStats.assists
              }
            />

            <StatBox
              label="ŽK"
              value={
                currentSeasonStats.yellowCards
              }
            />

            <StatBox
              label="ČK"
              value={
                currentSeasonStats.redCards
              }
            />

            <StatBox
              label="Průměrná známka"
              value={
                currentSeasonStats.rating !==
                null
                  ? currentSeasonStats.rating.toFixed(
                      1,
                    )
                  : "—"
              }
            />

            <StatBox
              label="Docházka"
              value={
                currentSeasonStats.attendance ??
                "—"
              }
              suffix={
                currentSeasonStats.attendance !==
                null
                  ? "%"
                  : ""
              }
            />
          </div>
        </section>

        {/* ==================================
            POSLEDNÍ ZÁPASY
        ================================== */}

        <section
          className={
            styles.performance
          }
        >
          <div
            className={
              styles.sectionTitle
            }
          >
            <span>
              Výkon
            </span>

            <h2>
              Poslední zápasy.
            </h2>
          </div>

          <PlayerRecentMatches
            matches={
              appStats?.matches ??
              []
            }
            limit={8}
          />
        </section>


        {/* ==================================
            PŘEHLED SEZÓN
        ================================== */}

        <section className={styles.history}>
          <div className={styles.sectionTitle}>
            <span>Historie</span>
            <h2>Přehled sezón.</h2>
          </div>

          <div className={styles.seasonOverview}>
            <details className={styles.seasonRow}>
              <summary>
                <div className={styles.seasonIdentity}>
                  <span>Poslední sezóna</span>
                  <strong>2025/26</strong>
                </div>

                <div className={styles.seasonQuickStats}>
                  <SeasonQuickStat label="Z" value={previousSeasonStats.matches} />
                  <SeasonQuickStat label="G" value={previousSeasonStats.goals} />
                  <SeasonQuickStat label="A" value={previousSeasonStats.assists} />
                  <SeasonQuickStat
                    label="Ø"
                    value={
                      previousSeasonStats.rating !== null
                        ? previousSeasonStats.rating.toFixed(1)
                        : "—"
                    }
                  />
                </div>

                <i className={styles.seasonToggle} aria-hidden="true">+</i>
              </summary>

              <div className={styles.seasonExpanded}>
                <div className={styles.seasonTotalStats}>
                  <SeasonDetailStat label="Zápasy" value={previousSeasonStats.matches} />
                  <SeasonDetailStat label="Góly" value={previousSeasonStats.goals} />
                  <SeasonDetailStat label="Asistence" value={previousSeasonStats.assists} />
                  <SeasonDetailStat label="ŽK" value={previousSeasonStats.yellowCards} />
                  <SeasonDetailStat label="ČK" value={previousSeasonStats.redCards} />
                  <SeasonDetailStat
                    label="Známka"
                    value={
                      previousSeasonStats.rating !== null
                        ? previousSeasonStats.rating.toFixed(1)
                        : "—"
                    }
                  />
                  <SeasonDetailStat
                    label="Docházka"
                    value={
                      previousSeasonStats.attendance !== null
                        ? `${previousSeasonStats.attendance}%`
                        : "—"
                    }
                  />
                </div>

                {(previousATeam || previousBTeam) && (
                  <div className={styles.seasonTeams}>
                    {previousATeam && (
                      <TeamSeasonBlock title="A-tým" stats={previousATeam} />
                    )}

                    {previousBTeam && (
                      <TeamSeasonBlock title="B-tým" stats={previousBTeam} />
                    )}
                  </div>
                )}
              </div>
            </details>

            {profile.seasons
              .filter(
                (season) =>
                  normalizeSeasonLabel(season.season) !== "2025/26",
              )
              .map((season) => (
                <details
                  key={`${season.season}-${season.team}`}
                  className={styles.seasonRow}
                >
                  <summary>
                    <div className={styles.seasonIdentity}>
                      <span>Sezóna</span>
                      <strong>{normalizeSeasonLabel(season.season)}</strong>
                    </div>

                    <div className={styles.seasonQuickStats}>
                      <SeasonQuickStat label="Z" value={season.matches} />
                      <SeasonQuickStat label="G" value={season.goals} />
                      <SeasonQuickStat label="A" value={season.assists} />
                    </div>

                    <i className={styles.seasonToggle} aria-hidden="true">+</i>
                  </summary>

                  <div className={styles.seasonExpanded}>
                    <div className={styles.seasonTotalStats}>
                      <SeasonDetailStat label="Tým" value={season.team} />
                      <SeasonDetailStat label="Zápasy" value={season.matches} />
                      <SeasonDetailStat label="Góly" value={season.goals} />
                      <SeasonDetailStat label="Asistence" value={season.assists} />
                      <SeasonDetailStat label="ŽK" value={season.yellowCards} />
                      <SeasonDetailStat label="ČK" value={season.redCards} />
                    </div>
                  </div>
                </details>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}

/*
 * ========================================
 * SEZÓNA APLIKACE
 * ========================================
 */

function findAppSeason(
  seasons:
    PlayerAppSeasonStats[],
  seasonName: string,
): PlayerAppSeasonStats | null {
  const wanted =
    normalizeSeasonLabel(
      seasonName,
    );

  return (
    seasons.find(
      (
        season,
      ) =>
        normalizeSeasonLabel(
          season.season,
        ) ===
        wanted,
    ) ??
    null
  );
}

/*
 * ========================================
 * NORMALIZACE SEZÓNY
 *
 * Podporuje například:
 *
 * 25/26
 * 2025/26
 * 2025/2026
 * SEZÓNA 2025/26
 * 2025 / 2026
 *
 * Vše převede na:
 *
 * 2025/26
 * ========================================
 */

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

function normalizeSeasonLabel(
  value: string,
): string {
  const raw =
    String(
      value ??
        "",
    ).trim();

  /*
   * Nejdřív hledáme:
   *
   * 2025/2026
   * 2025/26
   */

  const longMatch =
    raw.match(
      /(\d{4})\s*\/\s*(\d{2,4})/,
    );

  if (
    longMatch
  ) {
    const startYear =
      longMatch[1];

    const endYear =
      longMatch[2].slice(
        -2,
      );

    return `${startYear}/${endYear}`;
  }

  /*
   * Potom:
   *
   * 25/26
   */

  const shortMatch =
    raw.match(
      /(?:^|\D)(\d{2})\s*\/\s*(\d{2})(?:\D|$)/,
    );

  if (
    shortMatch
  ) {
    return `20${shortMatch[1]}/${shortMatch[2]}`;
  }

  return raw
    .replace(
      /\s+/g,
      "",
    )
    .toLowerCase();
}

/*
 * ========================================
 * HISTORIE
 * ========================================
 */

function SeasonHistory({
  seasons,
  appSeasons,
}: {
  seasons:
    PlayerSeasonHistory[];

  appSeasons:
    PlayerAppSeasonStats[];
}) {
  return (
    <div
      className={
        styles.historyTable
      }
    >
      <div
        className={
          styles.historyHeader
        }
      >
        <span>
          Sezóna
        </span>

        <span>
          Tým
        </span>

        <span>
          Zápasy
        </span>

        <span>
          Góly
        </span>

        <span>
          Asistence
        </span>

        <span>
          Známka
        </span>

        <span>
          Docházka
        </span>
      </div>

      {seasons.map(
        (
          season,
          index,
        ) => {
          /*
           * ====================================
           * SPOJENÍ APF SEZÓNY
           * S DATY APLIKACE
           * ====================================
           */

          const normalizedSeason =
            normalizeSeasonLabel(
              season.season,
            );

          const appSeason =
            appSeasons.find(
              (
                item,
              ) => {
                const normalizedAppSeason =
                  normalizeSeasonLabel(
                    item.season,
                  );

                return (
                  normalizedAppSeason ===
                  normalizedSeason
                );
              },
            ) ??
            null;

          /*
           * ====================================
           * DEBUG
           *
           * Zatím necháme.
           * ====================================
           */

          console.log(
            "SEZÓNA WEB:",
            {
              apfSeason:
                season.season,

              normalizedSeason,

              appSeason:
                appSeason?.season ??
                null,

              attendance:
                appSeason?.attendancePercentage ??
                null,

              attendedTrainings:
                appSeason?.attendedTrainings ??
                null,

              totalTrainings:
                appSeason?.totalTrainings ??
                null,
            },
          );

          /*
           * ====================================
           * ASISTENCE
           *
           * APF + APLIKACE
           * ====================================
           */

          const assists =
            Number(
              season.assists ??
                0,
            ) +
            Number(
              appSeason?.assists ??
                0,
            );

          /*
           * ====================================
           * ZNÁMKA
           * ====================================
           */

          const rating =
            appSeason?.averageRating ??
            season.rating ??
            null;

          /*
           * ====================================
           * DOCHÁZKA
           *
           * Tady už bereme přímo
           * attendancePercentage z aplikace.
           * ====================================
           */

          const attendance =
            appSeason?.attendancePercentage ??
            null;

          return (
            <div
              key={
                `${season.season}-${season.team}-${index}`
              }
              className={
                styles.historyRow
              }
            >
              <div
                className={
                  styles.seasonCell
                }
              >
                <small>
                  Sezóna
                </small>

                <strong>
                  {season.season}
                </strong>
              </div>

              <div>
                <small>
                  Tým
                </small>

                <span
                  className={
                    styles.historyTeam
                  }
                >
                  {season.team}
                </span>
              </div>

              <div>
                <small>
                  Zápasy
                </small>

                <strong>
                  {season.matches}
                </strong>
              </div>

              <div>
                <small>
                  Góly
                </small>

                <strong>
                  {season.goals}
                </strong>
              </div>

              <div>
                <small>
                  Asistence
                </small>

                <strong>
                  {assists}
                </strong>
              </div>

              <div>
                <small>
                  Známka
                </small>

                <strong>
                  {rating !==
                  null
                    ? Number(
                        rating,
                      ).toFixed(
                        1,
                      )
                    : "—"}
                </strong>
              </div>

              <div>
                <small>
                  Docházka
                </small>

                <strong>
                  {attendance !==
                  null
                    ? `${attendance} %`
                    : "—"}
                </strong>
              </div>
            </div>
          );
        },
      )}
    </div>
  );
}

function SeasonQuickStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SeasonDetailStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/*
 * ========================================
 * ROZDĚLENÍ SEZÓNY A / B
 * ========================================
 */

function TeamSeasonBlock({
  title,
  stats,
}: {
  title: string;

  stats: {
    matches: number;

    goals: number;

    assists: number;

    rating: number | null;

    awards: number;
  };
}) {
  return (
    <div
      className={
        styles.teamSeasonBlock
      }
    >
      <div
        className={
          styles.teamSeasonTitle
        }
      >
        <span>
          Tým
        </span>

        <strong>
          {title}
        </strong>
      </div>

      <div
        className={
          styles.teamSeasonStats
        }
      >
        <div>
          <span>
            Zápasy
          </span>

          <strong>
            {stats.matches}
          </strong>
        </div>

        <div>
          <span>
            Góly
          </span>

          <strong>
            {stats.goals}
          </strong>
        </div>

        <div>
          <span>
            Asistence
          </span>

          <strong>
            {stats.assists}
          </strong>
        </div>

        <div>
          <span>
            Známka
          </span>

          <strong>
            {stats.rating !==
            null
              ? stats.rating.toFixed(
                  1,
                )
              : "—"}
          </strong>
        </div>

        <div>
          <span>
            Hráč zápasu
          </span>

          <strong>
            {stats.awards}
          </strong>
        </div>
      </div>
    </div>
  );
}

/*
 * ========================================
 * STAT BOX
 * ========================================
 */

type StatBoxProps = {
  label: string;

  value:
    | string
    | number;

  suffix?: string;

  note?: string;
};

function StatBox({
  label,
  value,
  suffix = "",
  note,
}: StatBoxProps) {
  return (
    <div
      className={
        styles.statBox
      }
    >
      <span>
        {label}
      </span>

      <strong>
        {value}
        {suffix}
      </strong>

      {note && (
        <small>
          {note}
        </small>
      )}
    </div>
  );
}