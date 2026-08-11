"use client";

import Image from "next/image";
import { useState } from "react";

import { SectionHeader } from "@/components/ui/SectionHeader";

import type { MatchResult } from "@/types/match";
import type { NextMatch } from "@/types/nextMatch";

import styles from "./MatchCenter.module.css";

type TeamView = "a" | "b";

type MatchCenterProps = {
  aNextMatch: NextMatch | null;
  bNextMatch: NextMatch | null;

  aMatches: MatchResult[];
  bMatches: MatchResult[];
};

export function MatchCenter({
  aNextMatch,
  bNextMatch,
  aMatches,
  bMatches,
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
          secondLine={
            team === "a"
              ? "A-tým FC PPB."
              : "B-tým FC PPB."
          }
          meta="Sezóna 2025/26"
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
              onClick={() =>
                setTeam("a")
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
                setTeam("b")
              }
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
}: {
  match: NextMatch | null;
}) {
  return (
    <article
      className={`${styles.card} ${styles.nextMatchCard}`}
    >
      <span className={styles.blockLabel}>
        Následující zápas
      </span>

      {match ? (
        <>
          <div className={styles.matchVisual}>
            <TeamLogo
              teamName={match.homeTeam}
            />

            <div className={styles.vs}>
              VS
            </div>

            <TeamLogo
              teamName={match.awayTeam}
            />
          </div>

          <div className={styles.teamNames}>
            <strong>
              {match.homeTeam}
            </strong>

            <span />

            <strong>
              {match.awayTeam}
            </strong>
          </div>

          <div className={styles.matchDetails}>
            <MatchDetail
              label="Kdy"
              value={
                match.date || "—"
              }
            />

            <MatchDetail
              label="V kolik"
              value={
                match.time || "—"
              }
            />

            <MatchDetail
              label="Kde"
              value={
                match.venue || "—"
              }
            />
          </div>
        </>
      ) : (
        <div className={styles.noMatch}>
          <strong>
            Nová sezóna se připravuje.
          </strong>

          <p>
            Čekáme na zveřejnění
            dalšího rozpisu APF.
          </p>
        </div>
      )}
    </article>
  );
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
          sizes="90px"
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

type MatchDetailProps = {
  label: string;
  value: string;
};

function MatchDetail({
  label,
  value,
}: MatchDetailProps) {
  return (
    <div className={styles.matchDetail}>
      <small>
        {label}
      </small>

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
          <p className={styles.empty}>
            Zápasy nejsou dostupné.
          </p>
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