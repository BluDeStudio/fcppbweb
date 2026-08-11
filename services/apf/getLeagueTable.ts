import * as cheerio from "cheerio";

import type { LeagueRow } from "@/types/league";

import { fetchApfPage } from "./fetchApfPage";

type LeagueTableConfig = {
  competitionId: number;
  competitionSlug: string;
  teamName: string;
};

function parseNumber(value: string): number {
  const cleanedValue = value
    .replace(".", "")
    .replace(/\s+/g, "")
    .trim();

  return Number(cleanedValue) || 0;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export async function getLeagueTable({
  competitionId,
  competitionSlug,
  teamName,
}: LeagueTableConfig): Promise<LeagueRow[]> {
  const path =
    `/soutez/${competitionId}` +
    `/${competitionSlug}`;

  const html = await fetchApfPage(path);

  const $ = cheerio.load(html);

  const rows: LeagueRow[] = [];

  $("table").each((_, tableElement) => {
    const headerText = normalizeText(
      $(tableElement).find("thead").text(),
    );

    const isLeagueTable =
      headerText.includes("Název") &&
      headerText.includes("Z") &&
      headerText.includes("V") &&
      headerText.includes("B");

    if (!isLeagueTable) {
      return;
    }

    $(tableElement)
      .find("tbody tr")
      .each((_, rowElement) => {
        const cells = $(rowElement).find("td");

        if (cells.length < 8) {
          return;
        }

        const currentTeamName =
          normalizeText($(cells[1]).text());

        rows.push({
          position: parseNumber(
            $(cells[0]).text(),
          ),

          teamName: currentTeamName,

          matches: parseNumber(
            $(cells[2]).text(),
          ),

          wins: parseNumber(
            $(cells[3]).text(),
          ),

          draws: parseNumber(
            $(cells[4]).text(),
          ),

          losses: parseNumber(
            $(cells[5]).text(),
          ),

          score: normalizeText(
            $(cells[6]).text(),
          ),

          points: parseNumber(
            $(cells[7]).text(),
          ),

          isOurTeam:
            currentTeamName.toLowerCase() ===
            teamName.toLowerCase(),
        });
      });
  });

  return rows;
}