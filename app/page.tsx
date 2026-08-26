import { ClubStory } from "@/components/home/ClubStory";
import { Hero } from "@/components/home/Hero";
import { HomeAwards } from "@/components/home/HomeAwards";
import { MatchCenter } from "@/components/home/MatchCenter";
import { Partners } from "@/components/home/Partners";

import { clubConfig } from "@/config/club";

import { getLeagueTable } from "@/services/apf/getLeagueTable";
import { getMatchResults } from "@/services/apf/getMatchResults";
import { getNextMatch } from "@/services/apf/getNextMatch";
import { getTopScorer } from "@/services/apf/getTopScorer";

import { testSupabaseConnection } from "@/lib/testSupabase";

import type { LeagueRow } from "@/types/league";
import type { MatchResult } from "@/types/match";
import type { NextMatch } from "@/types/nextMatch";
import type { TopScorer } from "@/types/player";

export default async function HomePage() {
  await testSupabaseConnection();

  const aTeam = clubConfig.teams.aTeam;
  const bTeam = clubConfig.teams.bTeam;

  let aLeagueTable: LeagueRow[] = [];
  let bLeagueTable: LeagueRow[] = [];

  let aMatches: MatchResult[] = [];
  let bMatches: MatchResult[] = [];

  let aNextMatch: NextMatch | null = null;
  let bNextMatch: NextMatch | null = null;

  let aTopScorer: TopScorer | null = null;
  let bTopScorer: TopScorer | null = null;

  /*
   * Datové zdroje zůstávají stejné jako před redesignem.
   * Mění se pouze vizuální vrstva homepage.
   */
  try {
    [aLeagueTable, bLeagueTable] = await Promise.all([
      getLeagueTable({
        competitionId: aTeam.competition.id,
        competitionSlug: aTeam.competition.slug,
        teamName: aTeam.teamName,
      }),
      getLeagueTable({
        competitionId: bTeam.competition.id,
        competitionSlug: bTeam.competition.slug,
        teamName: bTeam.teamName,
      }),
    ]);
  } catch (error) {
    console.error("Chyba při načítání tabulek APF:", error);
  }

  try {
    [aMatches, bMatches] = await Promise.all([
      getMatchResults({
        competitionId: aTeam.competition.id,
        competitionSlug: aTeam.competition.slug,
        teamName: aTeam.teamName,
      }),
      getMatchResults({
        competitionId: bTeam.competition.id,
        competitionSlug: bTeam.competition.slug,
        teamName: bTeam.teamName,
      }),
    ]);
  } catch (error) {
    console.error("Chyba při načítání výsledků APF:", error);
  }

  try {
    [aNextMatch, bNextMatch] = await Promise.all([
      getNextMatch({
        competitionId: aTeam.competition.id,
        competitionSlug: aTeam.competition.slug,
        teamName: aTeam.teamName,
      }),
      getNextMatch({
        competitionId: bTeam.competition.id,
        competitionSlug: bTeam.competition.slug,
        teamName: bTeam.teamName,
      }),
    ]);
  } catch (error) {
    console.error("Chyba při načítání rozpisu APF:", error);
  }

  try {
    [aTopScorer, bTopScorer] = await Promise.all([
      getTopScorer({
        teamId: aTeam.teamId,
        teamSlug: aTeam.teamSlug,
      }),
      getTopScorer({
        teamId: bTeam.teamId,
        teamSlug: bTeam.teamSlug,
      }),
    ]);
  } catch (error) {
    console.error("Chyba při načítání střelců APF:", error);
  }

  return (
    <main>
      <Hero />

      <ClubStory />

      <MatchCenter
        aNextMatch={aNextMatch}
        bNextMatch={bNextMatch}
        aMatches={aMatches}
        bMatches={bMatches}
        aLeagueTable={aLeagueTable}
        bLeagueTable={bLeagueTable}
      />

      <HomeAwards
        aTopScorer={aTopScorer}
        bTopScorer={bTopScorer}
      />

      <Partners />
    </main>
  );
}
