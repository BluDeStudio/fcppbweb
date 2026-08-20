"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { clubConfig } from "@/config/club";

import type { LeagueRow } from "@/types/league";
import type { MatchResult } from "@/types/match";
import type { NextMatch } from "@/types/nextMatch";

import styles from "./MatchCenter.module.css";

type TeamView = "a" | "b";

type MatchCenterProps = {
  aNextMatch: NextMatch | null;
  bNextMatch: NextMatch | null;

  aMatches: MatchResult[];
  bMatches: MatchResult[];

  aLeagueTable: LeagueRow[];
  bLeagueTable: LeagueRow[];
};

export function MatchCenter({
  aNextMatch,
  bNextMatch,
  aMatches,
  bMatches,
  aLeagueTable,
  bLeagueTable,
}: MatchCenterProps) {
  const [team, setTeam] =
    useState<TeamView>("a");

  const nextMatch =
    team === "a"
      ? aNextMatch
      : bNextMatch;

  const matches =
    team === "a"
      ? aMatches
      : bMatches;

  const leagueRows =
    team === "a"
      ? aLeagueTable
      : bLeagueTable;

  const currentTeam =
    team === "a"
      ? clubConfig.teams.aTeam
      : clubConfig.teams.bTeam;

  return (
    <section
      id="zapasy"
      className={styles.section}
    >
      <div className={styles.wrapper}>
        <SectionHeader
          number="03"
          label="Zápasy"
          title="Zápasy."
          secondLine={`${currentTeam.label} ${clubConfig.name}.`}
          meta={`Sezóna ${clubConfig.season}`}
        />

        <div className={styles.toolbar}>
          <div className={styles.teamSwitch}>
            <button
              type="button"
              className={
                team === "a"
                  ? styles.active
                  : undefined
              }
              onClick={() => setTeam("a")}
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
              onClick={() => setTeam("b")}
            >
              B-tým
            </button>
          </div>
        </div>

        <div
          key={team}
          className={styles.content}
        >
          <div className={styles.grid}>
            <NextMatchCard
              match={nextMatch}
              leagueRows={leagueRows}
              competitionName={
                currentTeam.competition.name
              }
            />

            <LastMatchesCard
              matches={matches}
            />
          </div>

          <FormRow
            matches={matches}
          />
        </div>
      </div>
    </section>
  );
}

function NextMatchCard({
  match,
  leagueRows,
  competitionName,
}: {
  match: NextMatch | null;
  leagueRows: LeagueRow[];
  competitionName: string;
}) {
  const comparison =
    useMemo(() => {
      if (!match) {
        return null;
      }

      const home =
        findTeamRow(
          leagueRows,
          match.homeTeam,
        );

      const away =
        findTeamRow(
          leagueRows,
          match.awayTeam,
        );

      return {
        home,
        away,
      };
    }, [
      leagueRows,
      match,
    ]);

  return (
    <article
      className={`${styles.card} ${styles.nextMatchCard}`}
    >
      <div className={styles.nextHeader}>
        <span className={styles.blockLabel}>
          Následující zápas
        </span>

        <span className={styles.competitionName}>
          {competitionName}
        </span>
      </div>

      {match ? (
        <>
          <div className={styles.matchTeams}>
            <MatchTeam
              teamName={match.homeTeam}
              leagueRow={comparison?.home ?? null}
            />

            <div className={styles.vs}>
              VS
            </div>

            <MatchTeam
              teamName={match.awayTeam}
              leagueRow={comparison?.away ?? null}
            />
          </div>

          <div className={styles.matchMeta}>
            <MatchMeta
              label="Datum"
              value={
                match.date || "—"
              }
            />

            <MatchMeta
              label="Čas"
              value={
                match.time || "—"
              }
            />

            <MatchMeta
              label="Místo"
              value={
                match.venue ||
                "Bude doplněno"
              }
            />
          </div>
        </>
      ) : (
        <div className={styles.noMatch}>
          <strong>
            Rozpis zatím není dostupný.
          </strong>

          <p>
            Jakmile APF zveřejní další zápas,
            zobrazí se zde automaticky.
          </p>
        </div>
      )}
    </article>
  );
}

function MatchTeam({
  teamName,
  leagueRow,
}: {
  teamName: string;
  leagueRow: LeagueRow | null;
}) {
  return (
    <div className={styles.matchTeam}>
      <TeamLogo
        teamName={teamName}
      />

      <strong className={styles.matchTeamName}>
        {teamName}
      </strong>

      <div className={styles.teamComparison}>
        <div>
          <strong>
            {leagueRow
              ? `${leagueRow.position}.`
              : "—"}
          </strong>

          <span>
            MÍSTO
          </span>
        </div>

        <div>
          <strong>
            {leagueRow?.score || "—"}
          </strong>

          <span>
            SKÓRE
          </span>
        </div>
      </div>
    </div>
  );
}

function findTeamRow(
  rows: LeagueRow[],
  teamName: string,
): LeagueRow | null {
  const normalized =
    normalizeTeamName(
      teamName,
    );

  return (
    rows.find(
      (row) =>
        normalizeTeamName(
          row.teamName,
        ) ===
        normalized,
    ) ??
    rows.find(
      (row) =>
        normalizeTeamName(
          row.teamName,
        ).includes(
          normalized,
        ) ||
        normalized.includes(
          normalizeTeamName(
            row.teamName,
          ),
        ),
    ) ??
    null
  );
}

function normalizeTeamName(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      " ",
    )
    .trim();
}

function TeamLogo({
  teamName,
}: {
  teamName: string;
}) {
  const isPpb =
    teamName
      .toLowerCase()
      .includes("fc ppb");

  if (isPpb) {
    return (
      <div className={styles.logoWrap}>
        <Image
          src="/images/fc-ppb-logo.png"
          alt={teamName}
          fill
          sizes="88px"
          className={styles.teamLogo}
        />
      </div>
    );
  }

  return (
    <div className={styles.logoFallback}>
      <span>
        {getInitials(
          teamName,
        )}
      </span>
    </div>
  );
}

function getInitials(
  teamName: string,
): string {
  return teamName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (word) =>
        word[0]?.toUpperCase() ??
        "",
    )
    .join("");
}

function MatchMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className={styles.matchMetaItem}>
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function LastMatchesCard({
  matches,
}: {
  matches: MatchResult[];
}) {
  const visibleMatches =
    matches.slice(0, 3);

  return (
    <article className={styles.card}>
      <span className={styles.blockLabel}>
        Poslední zápasy
      </span>

      <div className={styles.results}>
        {visibleMatches.length > 0 ? (
          visibleMatches.map(
            (match) => (
              <LastMatchRow
                key={match.id}
                match={match}
              />
            ),
          )
        ) : (
          <div className={styles.noMatch}>
            <strong>
              Sezóna ještě nemá výsledky.
            </strong>

            <p>
              Po odehrání prvních zápasů
              se výsledky zobrazí automaticky.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function LastMatchRow({
  match,
}: {
  match: MatchResult;
}) {
  return (
    <a
      className={styles.resultRow}
      href={match.detailUrl}
      target="_blank"
      rel="noreferrer"
    >
      <div className={styles.resultDate}>
        {match.date}
      </div>

      <div className={styles.resultTeams}>
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

      <div className={styles.resultSide}>
        <ResultBadge
          result={match.result}
        />

        <span className={styles.arrow}>
          →
        </span>
      </div>
    </a>
  );
}

function FormRow({
  matches,
}: {
  matches: MatchResult[];
}) {
  const form =
    matches.slice(0, 5);

  return (
    <div className={styles.formCard}>
      <div>
        <span className={styles.blockLabel}>
          Forma
        </span>

        <strong>
          Posledních 5 zápasů
        </strong>
      </div>

      <div className={styles.formResults}>
        {form.length > 0 ? (
          form.map((match) => (
            <ResultBadge
              key={match.id}
              result={match.result}
            />
          ))
        ) : (
          <span className={styles.formEmpty}>
            Bez odehraných zápasů
          </span>
        )}
      </div>
    </div>
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
      className={`${styles.badge} ${
        styles[result]
      }`}
    >
      {label}
    </span>
  );
}
