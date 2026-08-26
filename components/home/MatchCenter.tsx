"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { clubConfig } from "@/config/club";
import type { LeagueRow } from "@/types/league";
import type { MatchResult } from "@/types/match";
import type { NextMatch } from "@/types/nextMatch";

import styles from "./MatchCenter.module.css";

type TeamView = "a" | "b";

type Props = {
  aNextMatch: NextMatch | null;
  bNextMatch: NextMatch | null;
  aMatches: MatchResult[];
  bMatches: MatchResult[];
  aLeagueTable: LeagueRow[];
  bLeagueTable: LeagueRow[];
};

export function MatchCenter(props: Props) {
  const [team, setTeam] = useState<TeamView>("a");

  const nextMatch = team === "a" ? props.aNextMatch : props.bNextMatch;
  const matches = team === "a" ? props.aMatches : props.bMatches;
  const leagueRows = team === "a" ? props.aLeagueTable : props.bLeagueTable;
  const currentTeam = team === "a" ? clubConfig.teams.aTeam : clubConfig.teams.bTeam;
  const lastMatch = matches[0] ?? null;

  return (
    <section id="zapasy" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.head}>
          <div className={styles.index}><span>02</span><b>ZÁPASY</b></div>

          <div>
            <h2>Zápasy.</h2>
            <p>Poslední a následující.</p>
          </div>

          <div className={styles.switch}>
            <button className={team === "a" ? styles.active : ""} onClick={() => setTeam("a")}>A-tým</button>
            <button className={team === "b" ? styles.active : ""} onClick={() => setTeam("b")}>B-tým</button>
          </div>
        </div>

        <div className={styles.grid}>
          <LastMatchCard match={lastMatch} competitionName={currentTeam.competition.name} />
          <NextMatchCard match={nextMatch} leagueRows={leagueRows} competitionName={currentTeam.competition.name} />
        </div>
      </div>
    </section>
  );
}

function LastMatchCard({ match, competitionName }: { match: MatchResult | null; competitionName: string }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}><span>POSLEDNÍ ZÁPAS</span><b>{competitionName}</b></div>

      {match ? (
        <>
          <div className={styles.score}>
            <span>{match.homeTeam}</span>
            <strong>{match.homeScore}<i>:</i>{match.awayScore}</strong>
            <span>{match.awayTeam}</span>
          </div>
          <div className={styles.cardBottom}>
            <span>{match.date}</span>
            <a href={match.detailUrl} target="_blank" rel="noreferrer">Detail zápasu <b>↗</b></a>
          </div>
        </>
      ) : (
        <div className={styles.empty}>Zatím bez odehraného zápasu.</div>
      )}
    </article>
  );
}

function NextMatchCard({ match, leagueRows, competitionName }: { match: NextMatch | null; leagueRows: LeagueRow[]; competitionName: string }) {
  const comparison = useMemo(() => {
    if (!match) return null;
    return { home: findTeamRow(leagueRows, match.homeTeam), away: findTeamRow(leagueRows, match.awayTeam) };
  }, [leagueRows, match]);

  return (
    <article className={`${styles.card} ${styles.next}`}>
      <div className={styles.cardTop}><span>NÁSLEDUJÍCÍ ZÁPAS</span><b>{competitionName}</b></div>

      {match ? (
        <>
          <div className={styles.teams}>
            <MatchTeam name={match.homeTeam} row={comparison?.home ?? null} />
            <div className={styles.vs}>VS</div>
            <MatchTeam name={match.awayTeam} row={comparison?.away ?? null} />
          </div>
          <div className={styles.meta}>
            <Meta label="Datum" value={match.date || "—"} />
            <Meta label="Čas" value={match.time || "—"} />
            <Meta label="Místo" value={match.venue || "—"} />
          </div>
        </>
      ) : (
        <div className={styles.empty}>Další zápas zatím není v rozpisu.</div>
      )}
    </article>
  );
}

function MatchTeam({ name, row }: { name: string; row: LeagueRow | null }) {
  const isPpb = name.toLowerCase().includes("fc ppb");

  return (
    <div className={styles.team}>
      <div className={styles.teamLogo}>
        {isPpb ? (
          <Image src="/images/fc-ppb-logo.png" alt={name} fill sizes="82px" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      <strong>{name}</strong>
      <small>{row ? `${row.position}. místo` : "—"}</small>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function findTeamRow(rows: LeagueRow[], teamName: string): LeagueRow | null {
  const normalized = normalize(teamName);
  return rows.find((row) => normalize(row.teamName) === normalized) ??
    rows.find((row) => normalize(row.teamName).includes(normalized) || normalized.includes(normalize(row.teamName))) ??
    null;
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getInitials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("");
}
