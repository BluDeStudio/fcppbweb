import Link from "next/link";
import { notFound } from "next/navigation";

import {
  clubHistory,
  clubHistorySeasons,
} from "@/config/clubHistory";

import {
  getLeagueTable,
} from "@/services/apf/getLeagueTable";

import type {
  LeagueRow,
} from "@/types/league";

import styles from "./page.module.css";

type HistoryPageProps = {
  searchParams:
    Promise<{
      season?: string;
      team?: string;
    }>;
};

export const revalidate =
  300;

export default async function HistoryPage({
  searchParams,
}: HistoryPageProps) {
  const params =
    await searchParams;

  const selectedSeason =
    params.season &&
    clubHistory[
      params.season
    ]
      ? params.season
      : clubHistorySeasons[
          0
        ];

  const selectedTeam =
    params.team === "b" ||
    params.team === "all"
      ? params.team
      : "a";

  const seasonConfig =
    clubHistory[
      selectedSeason
    ];

  if (!seasonConfig) {
    notFound();
  }

  let aRows:
    LeagueRow[] = [];

  let bRows:
    LeagueRow[] = [];

  try {
    [
      aRows,
      bRows,
    ] =
      await Promise.all([
        getLeagueTable({
          competitionId:
            seasonConfig
              .aTeam
              .competition
              .id,

          competitionSlug:
            seasonConfig
              .aTeam
              .competition
              .slug,

          teamName:
            seasonConfig
              .aTeam
              .teamName,
        }),

        getLeagueTable({
          competitionId:
            seasonConfig
              .bTeam
              .competition
              .id,

          competitionSlug:
            seasonConfig
              .bTeam
              .competition
              .slug,

          teamName:
            seasonConfig
              .bTeam
              .teamName,
        }),
      ]);
  } catch (error) {
    console.error(
      "Historické tabulky APF:",
      error,
    );
  }

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
        <div
          className={
            styles.top
          }
        >
          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              Historie FC PPB
            </span>

            <h1>
              Historie soutěží.
            </h1>

            <p>
              Přehled tabulek A-týmu a B-týmu
              napříč jednotlivými sezonami.
              Data se načítají přímo z APF.
            </p>
          </div>

          <Link
            href="/#tabulka"
            className={
              styles.back
            }
          >
            ← Zpět na aktuální tabulku
          </Link>
        </div>

        <div
          className={
            styles.seasonBar
          }
        >
          <span>
            Sezóna
          </span>

          <div
            className={
              styles.seasonLinks
            }
          >
            {clubHistorySeasons.map(
              (
                season,
              ) => (
                <Link
                  key={
                    season
                  }
                  href={`/historie?season=${encodeURIComponent(
                    season,
                  )}&team=${selectedTeam}`}
                  className={
                    season ===
                    selectedSeason
                      ? styles.activeSeason
                      : styles.seasonLink
                  }
                >
                  {season}
                </Link>
              ),
            )}
          </div>
        </div>

        <div
          className={
            styles.teamSwitch
          }
        >
          <HistoryTab
            label="A-tým"
            season={
              selectedSeason
            }
            team="a"
            active={
              selectedTeam ===
              "a"
            }
          />

          <HistoryTab
            label="B-tým"
            season={
              selectedSeason
            }
            team="b"
            active={
              selectedTeam ===
              "b"
            }
          />

          <HistoryTab
            label="Vše"
            season={
              selectedSeason
            }
            team="all"
            active={
              selectedTeam ===
              "all"
            }
          />
        </div>

        {selectedTeam ===
          "a" && (
          <HistoryTable
            title="A-tým"
            subtitle={
              seasonConfig
                .aTeam
                .competition
                .name
            }
            rows={
              aRows
            }
          />
        )}

        {selectedTeam ===
          "b" && (
          <HistoryTable
            title="B-tým"
            subtitle={
              seasonConfig
                .bTeam
                .competition
                .name
            }
            rows={
              bRows
            }
          />
        )}

        {selectedTeam ===
          "all" && (
          <div
            className={
              styles.allTables
            }
          >
            <HistoryTable
              title="A-tým"
              subtitle={
                seasonConfig
                  .aTeam
                  .competition
                  .name
              }
              rows={
                aRows
              }
            />

            <HistoryTable
              title="B-tým"
              subtitle={
                seasonConfig
                  .bTeam
                  .competition
                  .name
              }
              rows={
                bRows
              }
            />
          </div>
        )}
      </div>
    </main>
  );
}

function HistoryTab({
  label,
  season,
  team,
  active,
}: {
  label: string;
  season: string;
  team:
    | "a"
    | "b"
    | "all";
  active: boolean;
}) {
  return (
    <Link
      href={`/historie?season=${encodeURIComponent(
        season,
      )}&team=${team}`}
      className={
        active
          ? styles.activeTab
          : styles.tab
      }
    >
      {label}
    </Link>
  );
}

function HistoryTable({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows:
    LeagueRow[];
}) {
  if (
    rows.length ===
    0
  ) {
    return (
      <div
        className={
          styles.empty
        }
      >
        Tabulka pro tuto sezonu zatím
        není na APF dostupná.
      </div>
    );
  }

  return (
    <section
      className={
        styles.tableBlock
      }
    >
      <div
        className={
          styles.blockHeading
        }
      >
        <strong>
          {title}
        </strong>

        <span>
          {subtitle}
        </span>
      </div>

      <div
        className={
          styles.tableWrapper
        }
      >
        <table
          className={
            styles.table
          }
        >
          <thead>
            <tr>
              <th>#</th>
              <th>Tým</th>
              <th>Z</th>
              <th>V</th>
              <th>R</th>
              <th>P</th>
              <th>Skóre</th>
              <th>B</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(
              (
                row,
              ) => (
                <tr
                  key={`${row.position}-${row.teamName}`}
                  className={
                    row.isOurTeam
                      ? styles.ourTeam
                      : undefined
                  }
                >
                  <td>
                    {
                      row.position
                    }
                  </td>

                  <td
                    className={
                      styles.teamName
                    }
                  >
                    {
                      row.teamName
                    }
                  </td>

                  <td>
                    {
                      row.matches
                    }
                  </td>

                  <td>
                    {
                      row.wins
                    }
                  </td>

                  <td>
                    {
                      row.draws
                    }
                  </td>

                  <td>
                    {
                      row.losses
                    }
                  </td>

                  <td>
                    {
                      row.score
                    }
                  </td>

                  <td
                    className={
                      styles.points
                    }
                  >
                    {
                      row.points
                    }
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
