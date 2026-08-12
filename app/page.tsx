import { ClubStory } from "@/components/home/ClubStory";
import { HomeHighlights } from "@/components/home/HomeHighlights";
import { MatchCenter } from "@/components/home/MatchCenter";
import { LeagueTable } from "@/components/home/LeagueTable";
import { Squad } from "@/components/home/Squad";
import { Results } from "@/components/home/Results";
import { Partners } from "@/components/home/Partners";
import { Transfers } from "@/components/home/Transfers";

import { AnimatedLogo } from "@/components/ui/AnimatedLogo/AnimatedLogo";

import { clubConfig } from "@/config/club";

import { getLeagueTable } from "@/services/apf/getLeagueTable";
import { getMatchResults } from "@/services/apf/getMatchResults";
import { getNextMatch } from "@/services/apf/getNextMatch";
import { getTopScorer } from "@/services/apf/getTopScorer";
import { getSquad } from "@/services/apf/getSquad";

import { testSupabaseConnection } from "@/lib/testSupabase";
import { getPublishedTransfers } from "@/lib/getTransfers";

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
   */

  try {
    const [
      aApfPlayers,
      bApfPlayers,
    ] = await Promise.all([
      getSquad({
        teamId:
          aTeam.teamId,

        teamSlug:
          aTeam.teamSlug,

        team: "a",
      }),

      getSquad({
        teamId:
          bTeam.teamId,

        teamSlug:
          bTeam.teamSlug,

        team: "b",
      }),
    ]);

    /*
     * ========================================
     * KMENOVÉ SOUPISKY
     * ========================================
     *
     * APF určuje, na které týmové stránce
     * se hráč objevil / nastoupil.
     *
     * Kmenovou příslušnost ale určujeme
     * výhradně podle playerMeta.ts:
     *
     * player.team === "a" -> A-tým
     * player.team === "b" -> B-tým
     *
     * Pokud hráč nastoupí za oba týmy,
     * v soupisce zůstane jen u svého kmene.
     */

    const allPlayersById =
      new Map<
        number,
        SquadPlayer
      >();

    [
      ...aApfPlayers,
      ...bApfPlayers,
    ].forEach(
      (
        player,
      ) => {
        const existing =
          allPlayersById.get(
            player.id,
          );

        if (
          !existing
        ) {
          allPlayersById.set(
            player.id,
            player,
          );

          return;
        }

        /*
         * Když je hráč na obou APF stránkách,
         * ponecháme jeden záznam.
         *
         * Pro soupisku jsou důležité hlavně:
         * ID, jméno, foto, kmen, status, číslo.
         * Statistiky se na kartách stejně
         * načítají zvlášť z aplikace 2026/27.
         */
        allPlayersById.set(
          player.id,
          {
            ...existing,

            team:
              player.team,

            status:
              player.status,

            shirtNumber:
              player.shirtNumber ??
              existing.shirtNumber,

            apfSlug:
              player.apfSlug ||
              existing.apfSlug,
          },
        );
      },
    );

    const allPlayers =
      Array.from(
        allPlayersById.values(),
      );

    aPlayers =
      allPlayers.filter(
        (
          player,
        ) =>
          player.team ===
          "a",
      );

    bPlayers =
      allPlayers.filter(
        (
          player,
        ) =>
          player.team ===
          "b",
      );
  } catch (error) {
    console.error(
      "Chyba při načítání soupisek APF:",
      error,
    );
  }

  /*
   * ========================================
   * PŘESTUPY
   * ========================================
   */

  try {
    transfers =
      await getPublishedTransfers();
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

      <section
        id="home"
        style={{
          minHeight: "590px",

          display: "grid",

          placeItems: "center",

          padding:
            "70px 22px",

          textAlign: "center",
        }}
      >
        <div>
          <AnimatedLogo
            size={230}
            priority
          />

          <h1
            style={{
              marginTop:
                "28px",

              marginBottom:
                "0",

              fontSize:
                "clamp(52px, 8vw, 92px)",

              fontWeight:
                950,

              lineHeight:
                0.9,

              letterSpacing:
                "-0.065em",
            }}
          >
            {clubConfig.name}
          </h1>

          <p
            style={{
              maxWidth:
                "800px",

              margin:
                "24px auto 0",

              color:
                "#747d76",

              fontSize:
                "clamp(25px, 3.5vw, 42px)",

              fontWeight:
                900,

              lineHeight:
                1,

              letterSpacing:
                "-0.045em",
            }}
          >
            Jeden klub.
            Dva týmy.
            Jedna vášeň.
          </p>
        </div>
      </section>

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