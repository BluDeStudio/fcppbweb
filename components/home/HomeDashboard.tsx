"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AnimatedLogo } from "@/components/ui/AnimatedLogo/AnimatedLogo";
import type { LeagueRow } from "@/types/league";
import type { MatchResult } from "@/types/match";
import type { NextMatch } from "@/types/nextMatch";
import type { SquadPlayer } from "@/types/player";
import type { ClubTransfer } from "@/types/transfer";

import styles from "./HomeDashboard.module.css";

export type PlayerOfMatch = {
  id: number;
  name: string;
  goals: number;
  assists: number;
  rating: number | null;
  ratingVotes: number;
  matchId: string;
  matchTitle: string;
  matchDate: string;
};

type Props = {
  aNextMatch: NextMatch | null;
  bNextMatch: NextMatch | null;
  aMatches: MatchResult[];
  bMatches: MatchResult[];
  aLeagueTable: LeagueRow[];
  bLeagueTable: LeagueRow[];
  aPlayers: SquadPlayer[];
  bPlayers: SquadPlayer[];
  aPlayerOfMatch: PlayerOfMatch | null;
  bPlayerOfMatch: PlayerOfMatch | null;
  transfers: ClubTransfer[];
};

type Team = "a" | "b";

const PNG_PLAYER_IDS = new Set([532, 997, 1562, 3937]);
const TIKTOK_URL = "https://www.tiktok.com/@fcppbfutsal";
const INSTAGRAM_URL = "https://www.instagram.com/fcppb_futsl/";

export function HomeDashboard(props: Props) {
  const [matchTeam, setMatchTeam] = useState<Team>("a");
  const [tableTeam, setTableTeam] = useState<Team>("a");

  const lastMatch = matchTeam === "a" ? props.aMatches[0] ?? null : props.bMatches[0] ?? null;
  const nextMatch = matchTeam === "a" ? props.aNextMatch : props.bNextMatch;
  const tableRows = tableTeam === "a" ? props.aLeagueTable : props.bLeagueTable;

  return (
    <main className={styles.page}>
      <Hero />

      <div className={styles.shell}>
        <section className={styles.scoreboardSection}>
          <div className={styles.scoreboardHeader}>
            <div>
              <span className={styles.kicker}>MATCH CENTER</span>
              <h2>AKTUÁLNĚ.</h2>
            </div>
            <TeamToggle team={matchTeam} setTeam={setMatchTeam} />
          </div>

          <div className={styles.scoreGrid}>
            <LastMatchPanel match={lastMatch} team={matchTeam} />
            <NextMatchPanel match={nextMatch} team={matchTeam} rows={tableRowsFor(matchTeam, props)} />
          </div>
        </section>

        <section className={styles.section}>
          <SectionTitle eyebrow="VÝKON KOLA" title="HRÁČI UTKÁNÍ." />
          <div className={styles.playersOfMatchGrid}>
            <PlayerOfMatchCard teamLabel="A-TÝM" player={props.aPlayerOfMatch} />
            <PlayerOfMatchCard teamLabel="B-TÝM" player={props.bPlayerOfMatch} />
          </div>
        </section>

        <NewsSection props={props} />

        <section className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <SectionTitle eyebrow="SOUTĚŽ" title="TABULKA." compact />
            <TeamToggle team={tableTeam} setTeam={setTableTeam} />
          </div>
          <LeaguePreview rows={tableRows} />
        </section>

        <TeamsPreview aPlayers={props.aPlayers} bPlayers={props.bPlayers} />
        <Partners />
        <Social />
      </div>
    </main>
  );
}

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroNoise} />
      <div className={styles.heroLogoGhost} aria-hidden="true">
        <AnimatedLogo size={470} priority />
      </div>
      <div className={styles.heroInner}>
        <div className={styles.heroBrand}>
          <div className={styles.heroLogo}>
            <AnimatedLogo size={118} priority />
          </div>
          <div>
            <span>FC PPB · FUTSAL PLZEŇ</span>
            <h1>FC PPB</h1>
          </div>
        </div>

        <div className={styles.heroClaim}>
          <strong>PŘÁTELSTVÍ.</strong>
          <strong>POKORA.</strong>
          <strong>BOJOVNOST.</strong>
        </div>

        <p>SPOJUJE NÁS VÍC NEŽ HRA.</p>
      </div>
    </section>
  );
}

function LastMatchPanel({ match, team }: { match: MatchResult | null; team: Team }) {
  return (
    <article className={styles.matchPanel}>
      <div className={styles.panelTopline}>
        <span>POSLEDNÍ ZÁPAS · {team === "a" ? "A-TÝM" : "B-TÝM"}</span>
        <b>KONEC</b>
      </div>
      {match ? (
        <>
          <div className={styles.matchMain}>
            <MatchClub name={match.homeTeam} />
            <div className={styles.score}>{match.homeScore}<i>:</i>{match.awayScore}</div>
            <MatchClub name={match.awayTeam} />
          </div>
          <div className={styles.matchFoot}>
            <span>{match.date}</span>
            {match.detailUrl ? <a href={match.detailUrl} target="_blank" rel="noreferrer">DETAIL ↗</a> : null}
          </div>
        </>
      ) : <Empty text="Bez odehraného zápasu." />}
    </article>
  );
}

function NextMatchPanel({ match, team, rows }: { match: NextMatch | null; team: Team; rows: LeagueRow[] }) {
  const home = match ? findTeamRow(rows, match.homeTeam) : null;
  const away = match ? findTeamRow(rows, match.awayTeam) : null;

  return (
    <article className={`${styles.matchPanel} ${styles.nextPanel}`}>
      <div className={styles.panelTopline}>
        <span>NADCHÁZEJÍCÍ ZÁPAS · {team === "a" ? "A-TÝM" : "B-TÝM"}</span>
        <b>DALŠÍ</b>
      </div>
      {match ? (
        <>
          <div className={styles.matchMain}>
            <MatchClub name={match.homeTeam} position={home?.position} />
            <div className={styles.versus}>VS</div>
            <MatchClub name={match.awayTeam} position={away?.position} />
          </div>
          <div className={styles.matchFoot}>
            <span>{[match.date, match.time].filter(Boolean).join(" · ")}</span>
            <Link href="/zapasy">PROGRAM →</Link>
          </div>
          {match.venue ? <div className={styles.venue}>{match.venue}</div> : null}
        </>
      ) : <Empty text="Další zápas zatím není v rozpisu." />}
    </article>
  );
}

function PlayerOfMatchCard({ player, teamLabel }: { player: PlayerOfMatch | null; teamLabel: string }) {
  if (!player) {
    return (
      <article className={styles.pomCard}>
        <div className={styles.pomLabel}>{teamLabel}</div>
        <Empty text="Hráč utkání zatím není dostupný." />
      </article>
    );
  }

  const image = PNG_PLAYER_IDS.has(player.id)
    ? `/images/${player.id}.png`
    : `/images/${player.id}.jpg`;

  return (
    <Link href={`/hrac/${player.id}`} className={styles.pomCard}>
      <div className={styles.pomLabel}>{teamLabel}</div>

      <div className={styles.pomStage}>
        <div className={styles.bigNumber}>{player.id}</div>
        <img className={styles.pomWatermark} src="/images/fc-ppb-logo.png" alt="" aria-hidden="true" />
        <img className={styles.pomPlayer} src={image} alt={player.name} />
      </div>

      <div className={styles.pomCopy}>
        <h3>{formatPlayerName(player.name)}</h3>
        <span>★ HRÁČ UTKÁNÍ</span>

        <div className={styles.pomStats}>
          <div><b>{player.goals}</b><small>GÓLY</small></div>
          <div><b>{player.assists}</b><small>ASISTENCE</small></div>
        </div>
      </div>
    </Link>
  );
}

function formatPlayerName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  const last = parts.pop();

  return (
    <>
      {parts.join(" ")}
      <strong>{last}</strong>
    </>
  );
}

function NewsSection({ props }: { props: Props }) {
  const cards = useMemo(() => {
    const transferCards = props.transfers.slice(0, 3).map((transfer) => ({
      key: `transfer-${transfer.id}`,
      tag: transfer.direction === "arrival" ? "PŘÍCHOD" : "ODCHOD",
      title: `${transfer.playerName} · ${movementLabel(transfer)}`,
      date: "AKTUALITA KLUBU",
      image: getTransferImage(transfer),
      href: "/prestupy",
    }));

    if (transferCards.length >= 3) return transferCards;

    const matchCards = [
      props.aMatches[0] ? {
        key: "a-result",
        tag: "A-TÝM",
        title: `${props.aMatches[0].homeTeam} ${props.aMatches[0].homeScore}:${props.aMatches[0].awayScore} ${props.aMatches[0].awayTeam}`,
        date: props.aMatches[0].date,
        image: "/images/fc-ppb-logo.png",
        href: "/zapasy",
      } : null,
      props.bMatches[0] ? {
        key: "b-result",
        tag: "B-TÝM",
        title: `${props.bMatches[0].homeTeam} ${props.bMatches[0].homeScore}:${props.bMatches[0].awayScore} ${props.bMatches[0].awayTeam}`,
        date: props.bMatches[0].date,
        image: "/images/fc-ppb-logo.png",
        href: "/zapasy",
      } : null,
    ].filter(Boolean) as Array<{key:string;tag:string;title:string;date:string;image:string;href:string}>;

    return [...transferCards, ...matchCards].slice(0, 3);
  }, [props.transfers, props.aMatches, props.bMatches]);

  if (cards.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeaderRow}>
        <SectionTitle eyebrow="KRÁTCE Z KLUBU" title="Z KABINY." compact />
        <Link className={styles.textLink} href="/novinky">VŠECHNY NOVINKY →</Link>
      </div>
      <div className={styles.newsGrid}>
        {cards.map((card) => (
          <Link href={card.href} className={styles.newsCard} key={card.key}>
            <div className={styles.newsVisual}><img src={card.image} alt="" /></div>
            <div className={styles.newsShade} />
            <div className={styles.newsCopy}><span>{card.tag}</span><h3>{card.title}</h3><small>{card.date}</small></div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LeaguePreview({ rows }: { rows: LeagueRow[] }) {
  const visible = aroundOurTeam(rows, 5);
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHead}><span>#</span><span>TÝM</span><span>Z</span><span>SKÓRE</span><span>B</span></div>
      {visible.map((row) => (
        <div key={`${row.position}-${row.teamName}`} className={`${styles.tableRow} ${row.isOurTeam ? styles.ourRow : ""}`}>
          <span>{row.position}.</span><strong>{row.teamName}</strong><span>{row.matches}</span><span>{row.score}</span><b>{row.points}</b>
        </div>
      ))}
      <Link href="/zapasy#tabulka" className={styles.tableLink}>CELÁ TABULKA <span>→</span></Link>
    </div>
  );
}

function TeamsPreview({ aPlayers, bPlayers }: { aPlayers: SquadPlayer[]; bPlayers: SquadPlayer[] }) {
  return (
    <section className={styles.section}>
      <SectionTitle eyebrow="SOUPISKY" title="NAŠE TÝMY." />
      <div className={styles.teamsGrid}>
        <TeamPreviewCard label="A-TÝM" players={aPlayers} href="/tymy?team=a" />
        <TeamPreviewCard label="B-TÝM" players={bPlayers} href="/tymy?team=b" />
      </div>
    </section>
  );
}

function TeamPreviewCard({ label, players, href }: { label: string; players: SquadPlayer[]; href: string }) {
  const featured = players.filter((p) => PNG_PLAYER_IDS.has(p.id) || Boolean(p.imageUrl)).slice(0, 3);

  return (
    <Link href={href} className={styles.teamCard}>
      <div className={styles.teamVertical}>{label}</div>
      <img className={styles.teamGhost} src="/images/fc-ppb-logo.png" alt="" aria-hidden="true" />

      <div className={styles.teamPlayers}>
        {featured.map((player, index) => <RosterImage key={player.id} player={player} index={index} />)}
      </div>

      <div className={styles.teamCardShade} />

      <div className={styles.teamCardCopy}>
        <div className={styles.teamMenu}>
          <span>SOUPISKA</span>
          <span>STATISTIKY</span>
          <span>REALIZAČNÍ TÝM</span>
        </div>
        <b>ZOBRAZIT TÝM →</b>
      </div>
    </Link>
  );
}

function RosterImage({ player, index }: { player: SquadPlayer; index: number }) {
  const src = PNG_PLAYER_IDS.has(player.id) ? `/images/${player.id}.png` : player.imageUrl;
  if (!src) return null;
  return <img src={src} alt={player.name} style={{ zIndex: index + 1 }} />;
}

function Partners() {
  return (
    <section className={styles.partners}>
      <span>HRAJÍ S NÁMI</span>
      <a href="https://www.pilsco.cz/" target="_blank" rel="noreferrer"><img src="/partners/pilsco.png" alt="PILSCO" /></a>
      <a href="https://femotec.cz/" target="_blank" rel="noreferrer"><img src="/partners/femotec.png" alt="FEMOTEC" /></a>
    </section>
  );
}

function Social() {
  return (
    <section className={styles.social}>
      <div><span>SLEDUJ FC PPB</span><strong>ZÁPASY. KABINA. TRÉNINKY.</strong></div>
      <div><a href={TIKTOK_URL} target="_blank" rel="noreferrer">TIKTOK ↗</a><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">INSTAGRAM ↗</a></div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, compact = false }: { eyebrow: string; title: string; compact?: boolean }) {
  return <div className={`${styles.sectionTitle} ${compact ? styles.sectionTitleCompact : ""}`}><span>{eyebrow}</span><h2>{title}</h2></div>;
}

function TeamToggle({ team, setTeam }: { team: Team; setTeam: (team: Team) => void }) {
  return (
    <div className={styles.toggle}>
      <button type="button" className={team === "a" ? styles.active : ""} onClick={() => setTeam("a")}>A-TÝM</button>
      <button type="button" className={team === "b" ? styles.active : ""} onClick={() => setTeam("b")}>B-TÝM</button>
    </div>
  );
}

function MatchClub({ name, position }: { name: string; position?: number }) {
  return <div className={styles.club}><TeamLogo name={name} /><strong>{name}</strong>{position ? <small>{position}. MÍSTO</small> : null}</div>;
}

function TeamLogo({ name }: { name: string }) {
  const ours = normalize(name).includes("fc ppb");
  const sources = ours ? ["/images/fc-ppb-logo.png"] : teamLogoSources(name);
  const [index, setIndex] = useState(0);
  const src = sources[index];
  return src ? <img className={styles.clubLogo} src={src} alt={name} onError={() => setIndex((i) => i + 1 < sources.length ? i + 1 : sources.length)} /> : <div className={styles.logoFallback}>{initials(name)}</div>;
}

function Empty({ text }: { text: string }) { return <div className={styles.empty}>{text}</div>; }

function tableRowsFor(team: Team, props: Props) { return team === "a" ? props.aLeagueTable : props.bLeagueTable; }

function teamLogoSources(teamName: string): string[] {
  const slug = slugify(teamName);
  return [`/images/teams/${slug}.png`, `/images/teams/${slug}.webp`, `/images/teams/${slug}.jpg`, `/images/${slug}.png`];
}

function findTeamRow(rows: LeagueRow[], teamName: string): LeagueRow | null {
  const wanted = normalize(teamName);
  return rows.find((row) => normalize(row.teamName) === wanted) ?? rows.find((row) => {
    const current = normalize(row.teamName);
    return current.includes(wanted) || wanted.includes(current);
  }) ?? null;
}

function aroundOurTeam(rows: LeagueRow[], count: number): LeagueRow[] {
  if (rows.length === 0) return [];
  const index = rows.findIndex((row) => row.isOurTeam);
  if (index < 0) return rows.slice(0, count);
  let start = Math.max(0, index - Math.floor(count / 2));
  let end = Math.min(rows.length, start + count);
  start = Math.max(0, end - count);
  return rows.slice(start, end);
}

function movementLabel(transfer: ClubTransfer): string {
  switch (transfer.movementDetail) {
    case "transfer_from": case "transfer_to": return "PŘESTUP";
    case "loan_in": return "NA HOSTOVÁNÍ";
    case "loan_out": return "HOSTOVÁNÍ";
    case "loan_end": return "KONEC HOSTOVÁNÍ";
    case "released": return "UKONČENÍ PŮSOBENÍ";
    default: return "ZMĚNA V KÁDRU";
  }
}

function getTransferImage(transfer: ClubTransfer): string {
  if (transfer.playerId && PNG_PLAYER_IDS.has(transfer.playerId)) return `/images/${transfer.playerId}.png`;
  return transfer.imageUrl || "/images/fc-ppb-logo.png";
}

function slugify(value: string): string { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
function normalize(value: string): string { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function initials(value: string): string { return value.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join(""); }
