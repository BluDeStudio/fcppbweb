import { ClubStory } from "@/components/home/ClubStory";
import { HomeHighlights } from "@/components/home/HomeHighlights";
import { MatchCenter } from "@/components/home/MatchCenter";
import { LeagueTable } from "@/components/home/LeagueTable";
import { Squad } from "@/components/home/Squad";
import { Results } from "@/components/home/Results";
import { Partners } from "@/components/home/Partners";
import { Transfers } from "@/components/home/Transfers";
import { Hero } from "@/components/home/Hero";


import { clubConfig } from "@/config/club";

import { getLeagueTable } from "@/services/apf/getLeagueTable";
import { getMatchResults } from "@/services/apf/getMatchResults";
import { getNextMatch } from "@/services/apf/getNextMatch";
import { getTopScorer } from "@/services/apf/getTopScorer";
import { getManagedSquads } from "@/lib/getManagedSquads";

import { testSupabaseConnection } from "@/lib/testSupabase";
import {
  getDepartedPlayerIds,
  getPublishedTransfers,
} from "@/lib/getTransfers";

import type { LeagueRow } from "@/types/league";
import type { MatchResult } from "@/types/match";
import type { NextMatch } from "@/types/nextMatch";
import type { ClubTransfer } from "@/types/transfer";

import type {
  SquadPlayer,
  TopScorer,
} from "@/types/player";

export default async function HomePage() {
  /*
   * ========================================
   * TEST SUPABASE
   * ========================================
   */

  await testSupabaseConnection();

  const aTeam =
    clubConfig.teams.aTeam;

  const bTeam =
    clubConfig.teams.bTeam;

  /*
   * ========================================
   * DATA
   * ========================================
   */

  let aLeagueTable: LeagueRow[] = [];
  let bLeagueTable: LeagueRow[] = [];

  let aMatches: MatchResult[] = [];
  let bMatches: MatchResult[] = [];

  let aNextMatch: NextMatch | null =
    null;

  let bNextMatch: NextMatch | null =
    null;

  let aTopScorer: TopScorer | null =
    null;

  let bTopScorer: TopScorer | null =
    null;

  let aPlayers: SquadPlayer[] = [];
  let bPlayers: SquadPlayer[] = [];

  let transfers: ClubTransfer[] = [];

  /*
   * ========================================
   * TABULKY
   * ========================================
   */

  try {
    [
      aLeagueTable,
      bLeagueTable,
    ] = await Promise.all([
      getLeagueTable({
        competitionId:
          aTeam.competition.id,

        competitionSlug:
          aTeam.competition.slug,

        teamName:
          aTeam.teamName,
      }),

      getLeagueTable({
        competitionId:
          bTeam.competition.id,

        competitionSlug:
          bTeam.competition.slug,

        teamName:
          bTeam.teamName,
      }),
    ]);
  } catch (error) {
    console.error(
      "Chyba při načítání tabulek APF:",
      error,
    );
  }

  /*
   * ========================================
   * VÝSLEDKY
   * ========================================
   */

  try {
    [
      aMatches,
      bMatches,
    ] = await Promise.all([
      getMatchResults({
        competitionId:
          aTeam.competition.id,

        competitionSlug:
          aTeam.competition.slug,

        teamName:
          aTeam.teamName,
      }),

      getMatchResults({
        competitionId:
          bTeam.competition.id,

        competitionSlug:
          bTeam.competition.slug,

        teamName:
          bTeam.teamName,
      }),
    ]);
  } catch (error) {
    console.error(
      "Chyba při načítání výsledků APF:",
      error,
    );
  }

  /*
   * ========================================
   * NÁSLEDUJÍCÍ ZÁPAS
   * ========================================
   */

  try {
    [
      aNextMatch,
      bNextMatch,
    ] = await Promise.all([
      getNextMatch({
        competitionId:
          aTeam.competition.id,

        competitionSlug:
          aTeam.competition.slug,

        teamName:
          aTeam.teamName,
      }),

      getNextMatch({
        competitionId:
          bTeam.competition.id,

        competitionSlug:
          bTeam.competition.slug,

        teamName:
          bTeam.teamName,
      }),
    ]);
  } catch (error) {
    console.error(
      "Chyba při načítání rozpisu APF:",
      error,
    );
  }

  /*
   * ========================================
   * NEJLEPŠÍ STŘELCI
   * ========================================
   */

  try {
    [
      aTopScorer,
      bTopScorer,
    ] = await Promise.all([
      getTopScorer({
        teamId:
          aTeam.teamId,

        teamSlug:
          aTeam.teamSlug,
      }),

      getTopScorer({
        teamId:
          bTeam.teamId,

        teamSlug:
          bTeam.teamSlug,
      }),
    ]);
  } catch (error) {
    console.error(
      "Chyba při načítání střelců APF:",
      error,
    );
  }

  /*
   * ========================================
   * SOUPISKY
   * ========================================
   *
   * ADMIN → HRÁČI je nový hlavní zdroj:
   * - A/B kmen
   * - aktivní / neaktivní
   * - pozice
   * - status
   * - číslo
   * - fotka
   *
   * APF dál dodává sportovní statistiky.
   * STATPPKA dál dodává aktuální zápasy,
   * góly, asistence, známky a docházku.
   *
   * Hráči, které ještě nemáme převedené
   * do ADMINU, během migrace zůstávají
   * načtení starým APF/playerMeta způsobem.
   * ========================================
   */

  try {
    const managedSquads =
      await getManagedSquads();

    aPlayers =
      managedSquads.aPlayers;

    bPlayers =
      managedSquads.bPlayers;
  } catch (error) {
    console.error(
      "Chyba při načítání spravovaných soupisek:",
      error,
    );
  }

  /*
   * ========================================
   * PŘESTUPY
   * ========================================
   */

  try {
    const [
      publishedTransfers,
      departedPlayerIds,
    ] =
      await Promise.all([
        getPublishedTransfers(),
        getDepartedPlayerIds(),
      ]);

    transfers =
      publishedTransfers;

    /*
     * ODCHOD hráče ho odstraní pouze
     * z AKTUÁLNÍ SOUPISKY.
     *
     * Profil, aplikace, historické zápasy
     * a statistiky zůstávají nedotčené.
     */
    aPlayers =
      aPlayers.filter(
        (
          player,
        ) =>
          !departedPlayerIds.has(
            player.id,
          ),
      );

    bPlayers =
      bPlayers.filter(
        (
          player,
        ) =>
          !departedPlayerIds.has(
            player.id,
          ),
      );
  } catch (error) {
    console.error(
      "Chyba při načítání přestupů:",
      error,
    );
  }

  /*
   * ========================================
   * WEB
   * ========================================
   */

  return (
    <main>
      {/* =====================================
          HERO
      ===================================== */}

      <Hero />

      {/* =====================================
          01 / KLUB
      ===================================== */}

      <ClubStory />

      {/* =====================================
          02 / STATISTIKY
      ===================================== */}

      <HomeHighlights
        aTopScorer={
          aTopScorer
        }
        bTopScorer={
          bTopScorer
        }
      />

      {/* =====================================
          03 / ZÁPASY
      ===================================== */}

      <MatchCenter
        aNextMatch={
          aNextMatch
        }
        bNextMatch={
          bNextMatch
        }
        aMatches={
          aMatches
        }
        bMatches={
          bMatches
        }
        aLeagueTable={
          aLeagueTable
        }
        bLeagueTable={
          bLeagueTable
        }
      />

      {/* =====================================
          04 / TABULKA
      ===================================== */}

      <LeagueTable
        aTeamRows={
          aLeagueTable
        }
        bTeamRows={
          bLeagueTable
        }
      />

      {/* =====================================
          05 / PŘESTUPY
      ===================================== */}

      <Transfers
        transfers={
          transfers
        }
      />

      {/* =====================================
          06 / SOUPISKA
      ===================================== */}

      <Squad
        aPlayers={
          aPlayers
        }
        bPlayers={
          bPlayers
        }
      />

      {/* =====================================
          07 / VÝSLEDKY
      ===================================== */}

      <Results
        aMatches={
          aMatches
        }
        bMatches={
          bMatches
        }
      />

      {/* =====================================
          08 / PARTNEŘI
      ===================================== */}

      <Partners />
    </main>
  );
}