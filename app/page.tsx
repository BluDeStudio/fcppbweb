import { HomeDashboard } from "@/components/home/HomeDashboard";
import { Partners } from "@/components/home/Partners";
import { clubConfig } from "@/config/club";
import { testSupabaseConnection } from "@/lib/testSupabase";
import { getDepartedPlayerIds, getPublishedTransfers } from "@/lib/getTransfers";
import { getLeagueTable } from "@/services/apf/getLeagueTable";
import { getMatchResults } from "@/services/apf/getMatchResults";
import { getNextMatch } from "@/services/apf/getNextMatch";
import { getSquad } from "@/services/apf/getSquad";
import { getTopScorer } from "@/services/apf/getTopScorer";
import type { LeagueRow } from "@/types/league";
import type { MatchResult } from "@/types/match";
import type { NextMatch } from "@/types/nextMatch";
import type { SquadPlayer, TopScorer } from "@/types/player";
import type { ClubTransfer } from "@/types/transfer";

export default async function HomePage(){
 await testSupabaseConnection();
 const a=clubConfig.teams.aTeam,b=clubConfig.teams.bTeam;
 let aLeagueTable:LeagueRow[]=[],bLeagueTable:LeagueRow[]=[];
 let aMatches:MatchResult[]=[],bMatches:MatchResult[]=[];
 let aNextMatch:NextMatch|null=null,bNextMatch:NextMatch|null=null;
 let aTopScorer:TopScorer|null=null,bTopScorer:TopScorer|null=null;
 let aPlayers:SquadPlayer[]=[],bPlayers:SquadPlayer[]=[];
 let transfers:ClubTransfer[]=[];

 try{[aLeagueTable,bLeagueTable]=await Promise.all([getLeagueTable({competitionId:a.competition.id,competitionSlug:a.competition.slug,teamName:a.teamName}),getLeagueTable({competitionId:b.competition.id,competitionSlug:b.competition.slug,teamName:b.teamName})])}catch(e){console.error("Tabulky APF:",e)}
 try{[aMatches,bMatches]=await Promise.all([getMatchResults({competitionId:a.competition.id,competitionSlug:a.competition.slug,teamName:a.teamName}),getMatchResults({competitionId:b.competition.id,competitionSlug:b.competition.slug,teamName:b.teamName})])}catch(e){console.error("Výsledky APF:",e)}
 try{[aNextMatch,bNextMatch]=await Promise.all([getNextMatch({competitionId:a.competition.id,competitionSlug:a.competition.slug,teamName:a.teamName}),getNextMatch({competitionId:b.competition.id,competitionSlug:b.competition.slug,teamName:b.teamName})])}catch(e){console.error("Rozpis APF:",e)}
 try{[aTopScorer,bTopScorer]=await Promise.all([getTopScorer({teamId:a.teamId,teamSlug:a.teamSlug}),getTopScorer({teamId:b.teamId,teamSlug:b.teamSlug})])}catch(e){console.error("Střelci APF:",e)}
 try{
  const [ap, bp]=await Promise.all([getSquad({teamId:a.teamId,teamSlug:a.teamSlug,team:"a"}),getSquad({teamId:b.teamId,teamSlug:b.teamSlug,team:"b"})]);
  const map=new Map<number,SquadPlayer>();
  [...ap,...bp].forEach(player=>{const old=map.get(player.id);map.set(player.id,old?{...old,...player,shirtNumber:player.shirtNumber??old.shirtNumber}:player)});
  const all=[...map.values()];aPlayers=all.filter(x=>x.team==="a");bPlayers=all.filter(x=>x.team==="b");
 }catch(e){console.error("Soupisky APF:",e)}
 try{const [published,departed]=await Promise.all([getPublishedTransfers(),getDepartedPlayerIds()]);transfers=published;aPlayers=aPlayers.filter(x=>!departed.has(x.id));bPlayers=bPlayers.filter(x=>!departed.has(x.id))}catch(e){console.error("Přestupy:",e)}

 return <><HomeDashboard aNextMatch={aNextMatch} bNextMatch={bNextMatch} aMatches={aMatches} bMatches={bMatches} aLeagueTable={aLeagueTable} bLeagueTable={bLeagueTable} aPlayers={aPlayers} bPlayers={bPlayers} aTopScorer={aTopScorer} bTopScorer={bTopScorer} transfers={transfers}/><Partners/></>;
}
