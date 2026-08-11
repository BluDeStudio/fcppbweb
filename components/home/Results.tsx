"use client";

import { useMemo, useState } from "react";

import { SectionHeader } from "@/components/ui/SectionHeader";

import {
  TeamSwitch,
  type TeamView,
} from "@/components/ui/TeamSwitch";

import { clubConfig } from "@/config/club";

import type { MatchResult } from "@/types/match";

import styles from "./Results.module.css";

type ResultsProps = {
  aMatches: MatchResult[];
  bMatches: MatchResult[];
};

type MatchWithTeam = MatchResult & {
  teamLabel: "A-tým" | "B-tým";
};

export function Results({
  aMatches,
  bMatches,
}: ResultsProps) {
  const [view, setView] =
    useState<TeamView>("all");

  const matches = useMemo(() => {
    const a: MatchWithTeam[] =
      aMatches.map((match) => ({
        ...match,
        teamLabel: "A-tým",
      }));

    const b: MatchWithTeam[] =
      bMatches.map((match) => ({
        ...match,
        teamLabel: "B-tým",
      }));

    if (view === "a") {
      return sortMatchesByDate(a);
    }

    if (view === "b") {
      return sortMatchesByDate(b);
    }

    return sortMatchesByDate([
      ...a,
      ...b,
    ]);
  }, [
    view,
    aMatches,
    bMatches,
  ]);

  const visibleMatches =
    matches.slice(0, 10);

  return (
    <section
      id="vysledky"
      className={styles.section}
    >
      <div className={styles.wrapper}>
        <SectionHeader
          number="06"
          label="Výsledky"
          title="Výsledky."
          secondLine="Poslední odehrané zápasy."
          meta={`Sezóna ${clubConfig.season}`}
        />

        <div className={styles.toolbar}>
          <TeamSwitch
            value={view}
            onChange={setView}
          />
        </div>

        {visibleMatches.length > 0 ? (
          <div className={styles.list}>
            {visibleMatches.map(
              (match) => (
                <ResultRow
                  key={`${match.teamLabel}-${match.id}`}
                  match={match}
                />
              ),
            )}
          </div>
        ) : (
          <div className={styles.empty}>
            Výsledky zatím nejsou
            dostupné.
          </div>
        )}
      </div>
    </section>
  );
}

function sortMatchesByDate(
  matches: MatchWithTeam[],
): MatchWithTeam[] {
  return [...matches].sort(
    (a, b) => {
      const dateA =
        getMatchTimestamp(a.date);

      const dateB =
        getMatchTimestamp(b.date);

      if (dateB !== dateA) {
        return dateB - dateA;
      }

      return b.id - a.id;
    },
  );
}

function getMatchTimestamp(
  value: string,
): number {
  /*
   * APF například:
   *
   * 14.6. 12:00
   * 7.6. 10:00
   * 31.5. 09:00
   *
   * Rok proto doplníme ze sezóny.
   */

  const match = value.match(
    /(\d{1,2})\.\s*(\d{1,2})\.(?:\s*(\d{4}))?(?:\s+(\d{1,2}):(\d{2}))?/,
  );

  if (!match) {
    return 0;
  }

  const day =
    Number(match[1]);

  const month =
    Number(match[2]);

  const explicitYear =
    match[3]
      ? Number(match[3])
      : null;

  const hour =
    match[4]
      ? Number(match[4])
      : 0;

  const minute =
    match[5]
      ? Number(match[5])
      : 0;

  const year =
    explicitYear ??
    getSeasonYear(month);

  return new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
  ).getTime();
}

function getSeasonYear(
  month: number,
): number {
  /*
   * Například:
   *
   * 2025/26
   *
   * U venkovní soutěže jsou jarní
   * a letní měsíce v roce 2026.
   *
   * Funkce ale funguje i pro další
   * sezóny, takže rok není natvrdo.
   */

  const season =
    clubConfig.season;

  const match =
    season.match(
      /(\d{4})\/(\d{2})/,
    );

  if (!match) {
    return new Date().getFullYear();
  }

  const firstYear =
    Number(match[1]);

  const secondYear =
    Number(
      `${String(firstYear).slice(0, 2)}${match[2]}`,
    );

  /*
   * Podzimní měsíce bereme jako
   * první rok sezóny.
   *
   * Leden až srpen jako druhý.
   */
  if (month >= 9) {
    return firstYear;
  }

  return secondYear;
}

function ResultRow({
  match,
}: {
  match: MatchWithTeam;
}) {
  return (
    <a
      href={match.detailUrl}
      target="_blank"
      rel="noreferrer"
      className={styles.row}
      title="Otevřít detail zápasu na APF"
    >
      <div className={styles.teamBadge}>
        {match.teamLabel}
      </div>

      <div className={styles.date}>
        {match.date}
      </div>

      <div className={styles.match}>
        <span>
          {match.homeTeam}
        </span>

        <strong>
          {match.homeScore}
          {" : "}
          {match.awayScore}
        </strong>

        <span>
          {match.awayTeam}
        </span>
      </div>

      <div className={styles.side}>
        <ResultBadge
          result={match.result}
        />

        <span className={styles.detail}>
          Detail
        </span>

        <span className={styles.arrow}>
          →
        </span>
      </div>
    </a>
  );
}

function ResultBadge({
  result,
}: {
  result: MatchResult["result"];
}) {
  const label =
    result === "win"
      ? "V"
      : result === "draw"
        ? "R"
        : "P";

  return (
    <span
      className={`${styles.resultBadge} ${
        styles[result]
      }`}
    >
      {label}
    </span>
  );
}