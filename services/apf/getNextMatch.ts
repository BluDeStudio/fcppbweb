import * as cheerio from "cheerio";

import type { NextMatch } from "@/types/nextMatch";

import { fetchApfPage } from "./fetchApfPage";

type NextMatchConfig = {
  competitionId: number;
  competitionSlug: string;
  teamName: string;
};

function clean(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

export async function getNextMatch({
  competitionId,
  competitionSlug,
  teamName,
}: NextMatchConfig): Promise<NextMatch | null> {
  const path =
    `/soutez/${competitionId}` +
    `/${competitionSlug}`;

  const html = await fetchApfPage(path);

  const $ = cheerio.load(html);

  let nextMatch: NextMatch | null = null;

  $("tr").each((_, rowElement) => {
    if (nextMatch) {
      return;
    }

    const row = $(rowElement);

    const text = clean(
      row.text(),
    );

    if (
      !text
        .toLowerCase()
        .includes(teamName.toLowerCase())
    ) {
      return;
    }

    const cells = row.find("td");

    if (cells.length < 4) {
      return;
    }

    const homeTeam = clean(
      $(cells[1]).text(),
    );

    const awayTeam = clean(
      $(cells[3]).text(),
    );

    const scoreText = clean(
      $(cells[2]).text(),
    );

    // Pokud už má zápas výsledek,
    // není to budoucí zápas.
    if (
      /\d+\s*:\s*\d+/.test(scoreText)
    ) {
      return;
    }

    const dateText = clean(
      $(cells[0]).text(),
    );

    nextMatch = {
      day: "",
      date: dateText,
      time: scoreText,
      venue: "",
      homeTeam,
      awayTeam,
      competition: competitionSlug,
    };
  });

  return nextMatch;
}