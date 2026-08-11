import * as cheerio from "cheerio";

import { clubConfig } from "@/config/club";
import type { MatchResult } from "@/types/match";

import { fetchApfPage } from "./fetchApfPage";

type MatchResultsConfig = {
  competitionId: number;
  competitionSlug: string;
  teamName: string;
};

function clean(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

function getResult(
  homeScore: number,
  awayScore: number,
  isHome: boolean,
): MatchResult["result"] {
  const ourScore = isHome
    ? homeScore
    : awayScore;

  const opponentScore = isHome
    ? awayScore
    : homeScore;

  if (ourScore > opponentScore) {
    return "win";
  }

  if (ourScore < opponentScore) {
    return "loss";
  }

  return "draw";
}

export async function getMatchResults({
  competitionId,
  competitionSlug,
  teamName,
}: MatchResultsConfig): Promise<MatchResult[]> {
  const path =
    `/soutez/${competitionId}` +
    `/${competitionSlug}/vysledky`;

  const html = await fetchApfPage(path);

  const $ = cheerio.load(html);

  const matches: MatchResult[] = [];

  $('a[href^="/zapas/"]').each(
    (_, element) => {
      const link = $(element);

      const row = link.closest("tr");

      const cells = row.find("td");

      if (cells.length < 4) {
        return;
      }

      const href = link.attr("href");

      if (!href) {
        return;
      }

      const matchId = href.match(
        /\/zapas\/(\d+)/,
      );

      if (!matchId) {
        return;
      }

      const homeTeam = clean(
        $(cells[1]).text(),
      );

      const awayTeam = clean(
        $(cells[3]).text(),
      );

      const normalizedTeamName =
        teamName.toLowerCase();

      const isOurMatch =
        homeTeam.toLowerCase() ===
          normalizedTeamName ||
        awayTeam.toLowerCase() ===
          normalizedTeamName;

      if (!isOurMatch) {
        return;
      }

      const scoreText = clean(
        link.text(),
      );

      const score = scoreText.match(
        /(\d+)\s*:\s*(\d+)/,
      );

      if (!score) {
        return;
      }

      const homeScore = Number(
        score[1],
      );

      const awayScore = Number(
        score[2],
      );

      const isHome =
        homeTeam.toLowerCase() ===
        normalizedTeamName;

      matches.push({
        id: Number(matchId[1]),

        date: clean(
          $(cells[0]).text(),
        ),

        homeTeam,
        awayTeam,

        homeScore,
        awayScore,

        halfTimeScore: null,

        detailUrl:
          `${clubConfig.apf.baseUrl}${href}`,

        isHome,

        result: getResult(
          homeScore,
          awayScore,
          isHome,
        ),
      });
    },
  );

  return matches;
}