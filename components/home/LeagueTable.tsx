"use client";

import { useState } from "react";

import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  TeamSwitch,
  type TeamView,
} from "@/components/ui/TeamSwitch";

import type { LeagueRow } from "@/types/league";

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

  return (
    <section
      id="tabulka"
      className={styles.section}
    >
      <SectionHeader
        number="04"
        label="Tabulka"
        title="Tabulka soutěže."
        secondLine={
          view === "a"
            ? "1. B třída."
            : view === "b"
              ? "3. B třída."
              : "A-tým i B-tým."
        }
        meta="Sezóna 2025/26"
      />

      <div className={styles.switchRow}>
        <TeamSwitch
          value={view}
          onChange={setView}
        />
      </div>

      {view === "a" && (
        <LeagueTableBlock
          title="A-tým"
          subtitle="1. B třída"
          rows={aTeamRows}
        />
      )}

      {view === "b" && (
        <LeagueTableBlock
          title="B-tým"
          subtitle="3. B třída"
          rows={bTeamRows}
        />
      )}

      {view === "all" && (
        <div className={styles.allTables}>
          <LeagueTableBlock
            title="A-tým"
            subtitle="1. B třída"
            rows={aTeamRows}
          />

          <LeagueTableBlock
            title="B-tým"
            subtitle="3. B třída"
            rows={bTeamRows}
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

function LeagueTableBlock({
  title,
  subtitle,
  rows,
}: LeagueTableBlockProps) {
  if (rows.length === 0) {
    return (
      <div className={styles.empty}>
        Tabulku se nepodařilo načíst.
      </div>
    );
  }

  return (
    <div className={styles.block}>
      <div className={styles.blockHeading}>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
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
            {rows.map((row) => (
              <tr
                key={`${row.position}-${row.teamName}`}
                className={
                  row.isOurTeam
                    ? styles.ourTeam
                    : undefined
                }
              >
                <td>
                  {row.position}
                </td>

                <td
                  className={
                    styles.teamName
                  }
                >
                  {row.teamName}
                </td>

                <td>{row.matches}</td>
                <td>{row.wins}</td>
                <td>{row.draws}</td>
                <td>{row.losses}</td>

                <td>
                  {row.score}
                </td>

                <td
                  className={
                    styles.points
                  }
                >
                  {row.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}