"use client";

import Link from "next/link";

import { useState } from "react";

import {
  SectionHeader,
} from "@/components/ui/SectionHeader";

import {
  TeamSwitch,
  type TeamView,
} from "@/components/ui/TeamSwitch";

import {
  clubConfig,
} from "@/config/club";

import type {
  LeagueRow,
} from "@/types/league";

import styles from "./LeagueTable.module.css";

type LeagueTableProps = {
  aTeamRows: LeagueRow[];
  bTeamRows: LeagueRow[];
};

export function LeagueTable({
  aTeamRows,
  bTeamRows,
}: LeagueTableProps) {
  const [view, setView] =
    useState<TeamView>("a");

  const secondLine =
    view === "a"
      ? `${clubConfig.teams.aTeam.competition.name}.`
      : view === "b"
        ? `${clubConfig.teams.bTeam.competition.name}.`
        : "A-tým i B-tým.";

  return (
    <section
      id="tabulka"
      className={
        styles.section
      }
    >
      <SectionHeader
        number="04"
        label="Tabulka"
        title="Tabulka soutěže."
        secondLine={
          secondLine
        }
        meta={`Sezóna ${clubConfig.season}`}
      />

      <div
        className={
          styles.controlsRow
        }
      >
        <div
          className={
            styles.seasonInfo
          }
        >
          <span>
            Aktuální sezóna
          </span>

          <strong>
            {
              clubConfig.season
            }
          </strong>
        </div>

        <div
          className={
            styles.actions
          }
        >
          <TeamSwitch
            value={
              view
            }
            onChange={
              setView
            }
          />

          <Link
            href="/historie"
            className={
              styles.historyButton
            }
          >
            <span>
              Historie
            </span>

            <strong>
              →
            </strong>
          </Link>
        </div>
      </div>

      {view === "a" && (
        <LeagueTableBlock
          title="A-tým"
          subtitle={
            clubConfig
              .teams
              .aTeam
              .competition
              .name
          }
          rows={
            aTeamRows
          }
        />
      )}

      {view === "b" && (
        <LeagueTableBlock
          title="B-tým"
          subtitle={
            clubConfig
              .teams
              .bTeam
              .competition
              .name
          }
          rows={
            bTeamRows
          }
        />
      )}

      {view === "all" && (
        <div
          className={
            styles.allTables
          }
        >
          <LeagueTableBlock
            title="A-tým"
            subtitle={
              clubConfig
                .teams
                .aTeam
                .competition
                .name
            }
            rows={
              aTeamRows
            }
          />

          <LeagueTableBlock
            title="B-tým"
            subtitle={
              clubConfig
                .teams
                .bTeam
                .competition
                .name
            }
            rows={
              bTeamRows
            }
          />
        </div>
      )}
    </section>
  );
}

type LeagueTableBlockProps = {
  title: string;
  subtitle: string;
  rows: LeagueRow[];
};

export function LeagueTableBlock({
  title,
  subtitle,
  rows,
}: LeagueTableBlockProps) {
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
        Tabulka zatím není
        na APF dostupná.
      </div>
    );
  }

  return (
    <div
      className={
        styles.block
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
    </div>
  );
}
