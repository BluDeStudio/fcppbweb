"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SeasonMatch } from "@/services/apf/getSeasonMatches";
import styles from "./Matches.module.css";
import PageHeading from "@/components/PageHeading";

type Row = SeasonMatch & { detailId: string | null };
type Filter = "all" | "played" | "upcoming";
export default function MatchesClient({ matches, season }: { matches: Row[]; season: string }) {
  const [team, setTeam] = useState<"A" | "B">("A");
  const [filter, setFilter] = useState<Filter>("all");
  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.search);
      const selectedTeam = params.get("team");
      const selectedFilter = params.get("filter");
      setTeam(selectedTeam === "B" ? "B" : "A");
      setFilter(selectedFilter === "played" || selectedFilter === "upcoming" ? selectedFilter : "all");
    };
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const updateSelection = (nextTeam: "A" | "B", nextFilter: Filter) => {
    setTeam(nextTeam);
    setFilter(nextFilter);
    const params = new URLSearchParams();
    params.set("team", nextTeam);
    params.set("filter", nextFilter);
    window.history.replaceState(window.history.state, "", `/zapasy?${params.toString()}`);
  };
  const visible = useMemo(() => matches.filter(m => m.team === team && (filter === "all" || (filter === "played" ? m.homeScore !== null : m.homeScore === null))).sort((a,b) => a.sortDate.localeCompare(b.sortDate)), [matches, team, filter]);
  return <main className={styles.page}><div className={styles.shell}>
    <PageHeading title="ZÁPASY" subtitle={`PŘEHLED ZÁPASŮ / SEZÓNA ${season} / ${team === "A" ? "1. B TŘÍDA" : "2. B TŘÍDA"}`} />
    <div className={styles.toolbar}>
      <div className={styles.tabs} aria-label="Výběr týmu">
        {(["A", "B"] as const).map(t => <button key={t} type="button" className={team === t ? styles.active : ""} onClick={() => updateSelection(t, filter)}>{t}-TÝM</button>)}
      </div>
      <div className={styles.filters} aria-label="Filtr zápasů">
        {([ ["all", "Všechny"], ["played", "Odehrané"], ["upcoming", "Nadcházející"] ] as const).map(([key, label]) => <button type="button" key={key} className={filter === key ? styles.selected : ""} onClick={() => updateSelection(team, key)}>{label}</button>)}
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
      return match.detailId ? <Link className={`${styles.match} ${styles.clickable}`} href={`/zapas/${match.detailId}?from=zapasy&team=${team}&filter=${filter}`} key={match.key} aria-label={`Detail zápasu ${match.home} proti ${match.away}`}>{body}</Link> : <div className={styles.match} key={match.key}>{body}</div>;
    }) : <div className={styles.empty}>Pro tento výběr zatím nejsou dostupné zápasy. Zkontroluj dostupnost rozpisu APF.</div>}</div>
    <p className={styles.note}>Výsledky a termíny se načítají z APF. Detail lze otevřít u zápasů, které jsou také uložené v databázi FC PPB.</p>
  </div></main>;
}
