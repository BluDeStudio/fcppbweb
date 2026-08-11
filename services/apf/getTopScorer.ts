import * as cheerio from "cheerio";

import { clubConfig } from "@/config/club";
import type { TopScorer } from "@/types/player";

import { fetchApfPage } from "./fetchApfPage";

type TeamScorerConfig = {
  teamId: number;
  teamSlug: string;
};

function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export async function getTopScorer({
  teamId,
  teamSlug,
}: TeamScorerConfig): Promise<TopScorer | null> {
  const html = await fetchApfPage(
    `/tym/${teamId}/${teamSlug}`,
  );

  const $ = cheerio.load(html);

  const players: TopScorer[] = [];

  $("table").each((_, tableElement) => {
    $(tableElement)
      .find("tbody tr")
      .each((_, rowElement) => {
        const cells = $(rowElement).find("td");

        if (cells.length < 4) {
          return;
        }

        const playerLink = $(cells[1]).find("a");

        const href = playerLink.attr("href");

        if (!href) {
          return;
        }

        const playerIdMatch = href.match(
          /\/hrac\/(\d+)/,
        );

        if (!playerIdMatch) {
          return;
        }

        const name = clean(
          playerLink.text(),
        );

        if (!name) {
          return;
        }

        const matchesText = clean(
          $(cells[2]).text(),
        );

        const goalsText = clean(
          $(cells[3]).text(),
        );

        const matches =
          Number(
            matchesText.replace(
              /[^\d]/g,
              "",
            ),
          ) || 0;

        const goals =
          Number(
            goalsText.replace(
              /[^\d]/g,
              "",
            ),
          ) || 0;

        players.push({
          id: Number(
            playerIdMatch[1],
          ),

          name,

          matches,
          goals,

          profileUrl:
            `${clubConfig.apf.baseUrl}${href}`,
        });
      });
  });

  if (players.length === 0) {
    return null;
  }

  players.sort((a, b) => {
    if (b.goals !== a.goals) {
      return b.goals - a.goals;
    }

    return a.matches - b.matches;
  });

  return players[0];
}