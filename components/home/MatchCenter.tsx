"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

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
  const [team, setTeam] = useState<TeamView>("a");

  const nextMatch = team === "a" ? aNextMatch : bNextMatch;
  const matches = team === "a" ? aMatches : bMatches;
  const leagueRows = team === "a" ? aLeagueTable : bLeagueTable;
  const currentTeam =
    team === "a" ? clubConfig.teams.aTeam : clubConfig.teams.bTeam;

  const lastMatch = matches[0] ?? null;

  return (
    <section id="zapasy" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.head}>
          <div className={styles.index}>
            <span>02</span>
            <b>ZÁPASOVÉ CENTRUM</b>
          </div>

          <div>
            <h2>
              Zápasy.
              <span>To nejdůležitější na jednom místě.</span>
            </h2>
          </div>

          <div className={styles.switch}>
            <button type="button" className={team === "a" ? styles.active : ""} onClick={() => setTeam("a")}>
              A-tým
            </button>
            <button type="button" className={team === "b" ? styles.active : ""} onClick={() => setTeam("b")}>
              B-tým
            </button>
          </div>
        </div>

        <div className={styles.matchGrid}>
          <LastMatchCard match={lastMatch} competitionName={currentTeam.competition.name} />

          <NextMatchCard
            match={nextMatch}
            leagueRows={leagueRows}
            competitionName={currentTeam.competition.name}
          />
        </div>
      </div>
    </section>
  );
}

function LastMatchCard({
  match,
  competitionName,
}: {
  match: MatchResult | null;
  competitionName: string;
}) {
  return (
    <article className={`${styles.matchCard} ${styles.lastCard}`}>
      <div className={styles.cardTop}>
        <span>POSLEDNÍ ZÁPAS</span>
        <b>{competitionName}</b>
      </div>

      {match ? (
        <>
          <div className={styles.lastScore}>
            <span>{match.homeTeam}</span>

            <strong>
              {match.homeScore}
              <i>:</i>
              {match.awayScore}
            </strong>

            <span>{match.awayTeam}</span>
          </div>

          <div className={styles.cardBottom}>
            <span>{match.date}</span>

            <a href={match.detailUrl} target="_blank" rel="noreferrer">
              Detail zápasu
              <b>↗</b>
            </a>
          </div>
        </>
      ) : (
        <EmptyState text="Sezóna zatím nemá odehraný zápas." />
      )}
    </article>
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
  const comparison = useMemo(() => {
    if (!match) return null;

    return {
      home: findTeamRow(leagueRows, match.homeTeam),
      away: findTeamRow(leagueRows, match.awayTeam),
    };
  }, [leagueRows, match]);

  return (
    <article className={`${styles.matchCard} ${styles.nextCard}`}>
      <div className={styles.cardTop}>
        <span>NÁSLEDUJÍCÍ ZÁPAS</span>
        <b>{competitionName}</b>
      </div>

      {match ? (
        <>
          <div className={styles.teams}>
            <MatchTeam teamName={match.homeTeam} leagueRow={comparison?.home ?? null} />
            <div className={styles.vs}>VS</div>
            <MatchTeam teamName={match.awayTeam} leagueRow={comparison?.away ?? null} />
          </div>

          <div className={styles.nextMeta}>
            <Meta label="Datum" value={match.date || "—"} />
            <Meta label="Čas" value={match.time || "—"} />
            <Meta label="Místo" value={match.venue || "Bude doplněno"} />
          </div>
        </>
      ) : (
        <EmptyState text="Další zápas zatím není v rozpisu." />
      )}
    </article>
  );
}

function MatchTeam({ teamName, leagueRow }: { teamName: string; leagueRow: LeagueRow | null }) {
  return (
    <div className={styles.team}>
      <TeamLogo teamName={teamName} />
      <strong>{teamName}</strong>

      <div className={styles.teamData}>
        <span><b>{leagueRow ? `${leagueRow.position}.` : "—"}</b>MÍSTO</span>
        <span><b>{leagueRow?.score || "—"}</b>SKÓRE</span>
      </div>
    </div>
  );
}

function TeamLogo({ teamName }: { teamName: string }) {
  const isPpb = teamName.toLowerCase().includes("fc ppb");

  if (isPpb) {
    return (
      <div className={styles.logo}>
        <Image src="/images/fc-ppb-logo.png" alt={teamName} fill sizes="96px" className={styles.logoImage} />
      </div>
    );
  }

  return <div className={styles.logoFallback}>{getInitials(teamName)}</div>;
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className={styles.empty}><strong>Čekáme na data.</strong><p>{text}</p></div>;
}

function findTeamRow(rows: LeagueRow[], teamName: string): LeagueRow | null {
  const normalized = normalizeTeamName(teamName);

  return (
    rows.find((row) => normalizeTeamName(row.teamName) === normalized) ??
    rows.find((row) => {
      const current = normalizeTeamName(row.teamName);
      return current.includes(normalized) || normalized.includes(current);
    }) ??
    null
  );
}

function normalizeTeamName(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getInitials(teamName: string): string {
  return teamName.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("");
}
