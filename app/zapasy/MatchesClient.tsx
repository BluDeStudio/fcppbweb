"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SeasonMatch } from "@/services/apf/getSeasonMatches";
import styles from "./Matches.module.css";

type Row = SeasonMatch & { detailId: string | null };
type Filter = "all" | "played" | "upcoming";
export default function MatchesClient({ matches, season }: { matches: Row[]; season: string }) {
  const [team, setTeam] = useState<"A" | "B">("A");
  const [filter, setFilter] = useState<Filter>("all");
  const visible = useMemo(() => matches.filter(m => m.team === team && (filter === "all" || (filter === "played" ? m.homeScore !== null : m.homeScore === null))).sort((a,b) => a.sortDate.localeCompare(b.sortDate)), [matches, team, filter]);
  return <main className={styles.page}><div className={styles.shell}>
    <div className={styles.eyebrow}>FC PPB / SEZÓNA {season}</div>
    <h1 className={styles.title}>ZÁPASY<span>.</span></h1>
    <p className={styles.intro}>Kompletní rozpis a výsledky našich týmů.</p>
    <div className={styles.toolbar}>
      <div className={styles.tabs} aria-label="Výběr týmu">
        {(["A", "B"] as const).map(t => <button key={t} type="button" className={team === t ? styles.active : ""} onClick={() => setTeam(t)}>{t}-TÝM</button>)}
      </div>
      <div className={styles.filters} aria-label="Filtr zápasů">
        {([ ["all", "Všechny"], ["played", "Odehrané"], ["upcoming", "Nadcházející"] ] as const).map(([key, label]) => <button type="button" key={key} className={filter === key ? styles.selected : ""} onClick={() => setFilter(key)}>{label}</button>)}
      </div>
    </div>
    <div className={styles.league}>{team === "A" ? "1. B TŘÍDA" : "2. B TŘÍDA"}<span>{visible.length} UTKÁNÍ</span></div>
    <div className={styles.list}>{visible.length ? visible.map(match => {
      const played = match.homeScore !== null && match.awayScore !== null;
      const isHome = match.team === "A" ? match.homeId === 269 || match.home === "FC PPB" : match.homeId === 271 || match.home === "FC PPB B";
      const ours = played ? (isHome ? match.homeScore! : match.awayScore!) : null;
      const opponent = played ? (isHome ? match.awayScore! : match.homeScore!) : null;
      const result = played ? (ours! > opponent! ? "VÝHRA" : ours! < opponent! ? "PROHRA" : "REMÍZA") : "PLÁNOVÁNO";
      const body = <><div className={styles.date}><strong>{match.date || "Datum neurčeno"}</strong><small>{match.round || "SEZÓNA"}</small></div><div className={styles.teams}><strong className={isHome ? styles.ourTeam : ""}>{match.home}</strong><span>vs</span><strong className={!isHome ? styles.ourTeam : ""}>{match.away}</strong></div><div className={styles.score}><strong>{played ? `${match.homeScore}:${match.awayScore}` : (match.time || "—")}</strong><small className={played && result === "VÝHRA" ? styles.win : ""}>{result}</small></div><span className={styles.arrow}>{match.detailId ? "↗" : ""}</span></>;
      return match.detailId ? <Link className={`${styles.match} ${styles.clickable}`} href={`/zapas/${match.detailId}`} key={match.key} aria-label={`Detail zápasu ${match.home} proti ${match.away}`}>{body}</Link> : <div className={styles.match} key={match.key}>{body}</div>;
    }) : <div className={styles.empty}>Pro tento výběr zatím nejsou dostupné zápasy. Zkontroluj dostupnost rozpisu APF.</div>}</div>
    <p className={styles.note}>Výsledky a termíny se načítají z APF. Detail lze otevřít u zápasů, které jsou také uložené v databázi FC PPB.</p>
  </div></main>;
}
