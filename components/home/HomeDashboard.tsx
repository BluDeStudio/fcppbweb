"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LeagueRow } from "@/types/league";
import type { MatchResult } from "@/types/match";
import type { NextMatch } from "@/types/nextMatch";
import type { SquadPlayer, TopScorer } from "@/types/player";
import type { ClubTransfer } from "@/types/transfer";
import styles from "./HomeDashboard.module.css";

type Props={aNextMatch:NextMatch|null;bNextMatch:NextMatch|null;aMatches:MatchResult[];bMatches:MatchResult[];aLeagueTable:LeagueRow[];bLeagueTable:LeagueRow[];aPlayers:SquadPlayer[];bPlayers:SquadPlayer[];aTopScorer:TopScorer|null;bTopScorer:TopScorer|null;transfers:ClubTransfer[]};
type Team="a"|"b";

export function HomeDashboard(p:Props){
 const [team,setTeam]=useState<Team>("a");
 const next=team==="a"?p.aNextMatch:p.bNextMatch;
 const matches=team==="a"?p.aMatches:p.bMatches;
 const table=team==="a"?p.aLeagueTable:p.bLeagueTable;
 const players=team==="a"?p.aPlayers:p.bPlayers;
 const pngPlayers=players.filter(player=>PNG_PLAYER_IDS.has(player.id));
 const scorer=team==="a"?p.aTopScorer:p.bTopScorer;
 const competition=team==="a"?"1.B TŘÍDA":"2.B TŘÍDA";
 const news=p.transfers.slice(0,4);
 const mini=useMemo(()=>aroundOurTeam(table),[table]);
 return <div className={styles.page}>
  <section className={styles.mobileHero}><div className={styles.mobileHeroLogo}/><div className={styles.mobileHeroShade}/><div className={styles.mobileHeroText}><h1>FC PPB</h1><p>PŘÁTELSTVÍ. POKORA.<br/>BOJOVNOST.</p><Link href="/klub">POZNAT KLUB <b>→</b></Link></div></section>
  <div className={styles.shell}>
   <main className={styles.main}>
    <section id="aktuality" className={styles.heroNews}>
      <HeroNews transfer={news[0]}/>
    </section>
    <section className={styles.mobileOnly}><MatchCard match={next} competition={competition}/><QuickTabs/></section>
    <section className={styles.newsSection}><h2>DALŠÍ NOVINKY</h2><div className={styles.newsGrid}>{news.slice(1,4).map(t=><NewsCard key={t.id} transfer={t}/>)}</div>{news.length>0&&<Link className={styles.centerButton} href="/prestupy">VŠECHNY NOVINKY <b>→</b></Link>}</section>
    <section className={styles.teamSection}><div className={styles.sectionTitle}><h2>TÝM</h2><TeamToggle team={team} setTeam={setTeam}/></div><div className={styles.playerRail}>{pngPlayers.map(player=><PlayerSpotlight key={player.id} player={player}/>)}</div><Link className={styles.centerButton} href="/tymy">CELÝ TÝM <b>→</b></Link></section>
    <section className={`${styles.mobileOnly} ${styles.mobileTable}`}><MiniTable rows={mini}/></section>
    <section className={styles.socialBanner}><div><span>SLEDUJ FC PPB</span><h2>ZÁPASY. KABINA. TRÉNINKY. ZÁKULISÍ.</h2></div><div className={styles.socialLinks}><a href="https://www.tiktok.com/" target="_blank" rel="noreferrer">TIKTOK</a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">INSTAGRAM</a><a href="https://www.facebook.com/" target="_blank" rel="noreferrer">FACEBOOK</a></div></section>
   </main>
   <aside className={styles.sidebar}>
    <div className={styles.teamToggleSide}><TeamToggle team={team} setTeam={setTeam}/></div>
    <MatchCard match={next} competition={competition}/>
    <MiniTable rows={mini}/>
    <ScorerCard scorer={scorer}/>
    <LastMatchCard match={matches[0]??null}/>
   </aside>
  </div>
 </div>
}

function HeroNews({transfer}:{transfer:ClubTransfer|undefined}){if(!transfer)return <div className={styles.heroFallback}><div><span>FC PPB</span><h1>PŘÁTELSTVÍ.<br/>POKORA. BOJOVNOST.</h1><p>Spojuje nás víc než hra.</p></div></div>;return <Link href="/prestupy" className={styles.heroArticle}><img src={transfer.imageUrl||"/images/fc-ppb-logo.png"} alt={transfer.playerName}/><div className={styles.heroOverlay}/><div className={styles.heroCopy}><span>AKTUALITY</span><h1>{transfer.direction==="arrival"?"NOVÁ TVÁŘ V FC PPB":"ZMĚNA V KÁDRU"}</h1><p>{transfer.playerName} · {movementLabel(transfer)}</p><b>ČÍST VÍCE →</b></div></Link>}
function NewsCard({transfer}:{transfer:ClubTransfer}){return <Link href="/prestupy" className={styles.newsCard}><div className={styles.newsImage}><img src={transfer.imageUrl||"/images/fc-ppb-logo.png"} alt={transfer.playerName}/></div><div className={styles.newsBody}><span>{transfer.direction==="arrival"?"PŘÍCHOD":"ODCHOD"}</span><h3>{transfer.playerName}</h3><p>{movementLabel(transfer)} · {transfer.otherClub||"FC PPB"}</p><small>{formatDate(transfer.occurredOn)}</small></div></Link>}
function MatchCard({match,competition}:{match:NextMatch|null;competition:string}){
 const round=getRoundLabel(match);
 const meta=round?`${competition} / ${round}`:competition;
 return <section className={styles.widget}><div className={styles.widgetHead}><h2>DALŠÍ ZÁPAS</h2><span>{meta}</span></div>{match?<><div className={styles.matchTeams}><TeamMark name={match.homeTeam}/><strong>VS</strong><TeamMark name={match.awayTeam}/></div><div className={styles.matchNames}><b>{match.homeTeam}</b><b>{match.awayTeam}</b></div><div className={styles.matchWhen}>{[match.day,match.date,match.time].filter(Boolean).join(" / ")}</div>{match.venue&&<p className={styles.venue}>{match.venue}</p>}<Link className={styles.widgetButton} href="/zapasy">DETAIL ZÁPASU →</Link></>:<div className={styles.noData}>Další zápas zatím není v rozpisu APF.</div>}</section>
}
function TeamMark({name}:{name:string}){const ours=name.toLowerCase().includes("ppb");return <div className={styles.teamMark}>{ours?<img src="/images/fc-ppb-logo.png" alt={name}/>:<span>{initials(name)}</span>}</div>}
function MiniTable({rows}:{rows:LeagueRow[]}){return <section className={styles.widget}><div className={styles.widgetHead}><h2>TABULKA</h2></div><div className={styles.miniRows}>{rows.map(r=><div key={`${r.position}-${r.teamName}`} className={r.isOurTeam?styles.ourRow:""}><span>{r.position}.</span><b>{r.teamName}</b><strong>{r.points} b.</strong></div>)}</div><Link className={styles.textLink} href="/zapasy#tabulka">CELÁ TABULKA →</Link></section>}
function ScorerCard({scorer}:{scorer:TopScorer|null}){const image=scorer?(PNG_PLAYER_IDS.has(scorer.id)?`/images/${scorer.id}.png`:`/images/${scorer.id}.jpg`):"";return <section className={`${styles.widget} ${styles.scorer}`}><div className={styles.widgetHead}><h2>NEJLEPŠÍ STŘELEC</h2></div>{scorer?<><img src={image} alt={scorer.name}/><div><h3>{scorer.name}</h3><p><b>{scorer.goals} GÓLŮ</b> / {scorer.matches} ZÁPASŮ</p><Link className={styles.widgetButton} href={`/hrac/${scorer.id}`}>PROFIL HRÁČE →</Link></div></>:<div className={styles.noData}>Statistiky střelců zatím nejsou dostupné.</div>}</section>}
function LastMatchCard({match}:{match:MatchResult|null}){return <section className={styles.widget}><div className={styles.widgetHead}><h2>POSLEDNÍ ZÁPAS</h2></div>{match?<><div className={styles.lastScore}><span>{match.homeTeam}</span><strong>{match.homeScore} : {match.awayScore}</strong><span>{match.awayTeam}</span></div><small className={styles.lastDate}>{match.date}</small></>:<div className={styles.noData}>Bez odehraného zápasu.</div>}</section>}
function PlayerSpotlight({player}:{player:SquadPlayer}){return <Link href={`/hrac/${player.id}`} className={styles.playerCard}><div className={styles.playerWatermark}>PPB</div><img src={`/images/${player.id}.png`} alt={player.name}/><div className={styles.playerInfo}><span>#{player.shirtNumber??"—"}</span><h3>{player.name}</h3><p>{player.position==="goalkeeper"?"BRANKÁŘ":"HRÁČ"}</p></div></Link>}
function TeamToggle({team,setTeam}:{team:Team;setTeam:(t:Team)=>void}){return <div className={styles.toggle}><button className={team==="a"?styles.active:""} onClick={()=>setTeam("a")}>A-TÝM</button><button className={team==="b"?styles.active:""} onClick={()=>setTeam("b")}>B-TÝM</button></div>}
function QuickTabs(){return <nav className={styles.quick}><Link href="/zapasy#vysledky">POSLEDNÍ ZÁPAS</Link><Link href="/zapasy#tabulka">TABULKA</Link><Link href="/zapasy">PROGRAM</Link></nav>}
const PNG_PLAYER_IDS=new Set([532,997,1562,3937]);

function getRoundLabel(match:NextMatch|null):string|null{
 if(!match)return null;
 const extended=match as NextMatch&{round?:string|number|null;roundName?:string|null;matchday?:string|number|null};
 const raw=extended.roundName??extended.round??extended.matchday;
 if(raw===null||raw===undefined||String(raw).trim()==="")return null;
 const value=String(raw).trim();
 return /kolo/i.test(value)?value.toUpperCase():`${value}. KOLO`;
}

function aroundOurTeam(rows:LeagueRow[]){if(!rows.length)return[];const i=rows.findIndex(r=>r.isOurTeam);if(i<0)return rows.slice(0,3);return rows.slice(Math.max(0,i-1),Math.min(rows.length,i+2))}
function initials(n:string){return n.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join("")}
function formatDate(v:string){try{return new Date(v).toLocaleDateString("cs-CZ")}catch{return v}}
function movementLabel(t:ClubTransfer){switch(t.movementDetail){case"transfer_from":case"transfer_to":return"Přestup";case"loan_in":case"loan_out":return"Hostování";case"loan_end":return"Konec hostování";case"released":return"Ukončení působení"}}
