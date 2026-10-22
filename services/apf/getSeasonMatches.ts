import * as cheerio from "cheerio";
import { clubConfig } from "@/config/club";
import { fetchApfPage } from "./fetchApfPage";

export type SeasonMatch = {
  key: string;
  team: "A" | "B";
  date: string;
  sortDate: string;
  time: string;
  round: string;
  home: string;
  away: string;
  homeId: number | null;
  awayId: number | null;
  homeScore: number | null;
  awayScore: number | null;
  apfId: number | null;
};

const clean = (v: string) => v.replace(/\s+/g, " ").trim();
const normalize = (v: string) => clean(v).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const teamId = (href?: string) => {
  const match = href?.match(/\/tym\/(\d+)/);
  return match ? Number(match[1]) : null;
};

function parseDate(raw: string) {
  const match = raw.match(/(\d{1,2})\.\s*(\d{1,2})\.(?:\s*(\d{4}))?(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!match) return { date: clean(raw), sortDate: "", time: "" };
  const day = Number(match[1]);
  const month = Number(match[2]);
  // Sezóna 2026/27: podzim 2026, leden–červen 2027.
  const seasonStart = Number(clubConfig.season.split("/")[0]) || new Date().getFullYear();
  const year = match[3] ? Number(match[3]) : month >= 7 ? seasonStart : seasonStart + 1;
  const sortDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { date: `${day}. ${month}. ${year}`, sortDate, time: match[4] ? `${match[4].padStart(2, "0")}:${match[5]}` : "" };
}

export async function getSeasonMatches(team: "A" | "B"): Promise<SeasonMatch[]> {
  const config = team === "A" ? clubConfig.teams.aTeam : clubConfig.teams.bTeam;
  const html = await fetchApfPage(`/soutez/${config.competition.id}/${config.competition.slug}/rozpis`);
  const $ = cheerio.load(html);
  const matches: SeasonMatch[] = [];
  let currentRound = "";
  $("tr").each((index, element) => {
    const row = $(element);
    const cells = row.find("td");
    if (cells.length < 4) {
      const header = clean(row.text());
      const roundMatch = header.match(/(?:^|\s)(\d+)\.\s*kolo/i);
      if (roundMatch) currentRound = `${roundMatch[1]}. kolo`;
      return;
    }
    const homeCell = $(cells[1]);
    const middleCell = $(cells[2]);
    const awayCell = $(cells[3]);
    const home = clean(homeCell.text());
    const away = clean(awayCell.text());
    if (normalize(home) !== normalize(config.teamName) && normalize(away) !== normalize(config.teamName)) return;
    const date = parseDate(clean($(cells[0]).text()));
    const middle = clean(middleCell.text());
    const score = middle.match(/(\d+)\s*:\s*(\d+)/);
    const apfHref = middleCell.find('a[href*="/zapas/"]').first().attr("href") ?? row.find('a[href*="/zapas/"]').first().attr("href");
    const apfMatch = apfHref?.match(/\/zapas\/(\d+)/);
    const time = date.time || middle.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/)?.[0] || "";
    const round = clean(row.attr("data-round") || "") || currentRound;
    matches.push({
      key: `${team}-${apfMatch?.[1] ?? `${date.sortDate}-${index}`}`,
      team, date: date.date, sortDate: date.sortDate, time, round,
      home, away,
      homeId: teamId(homeCell.find('a[href*="/tym/"]').first().attr("href")),
      awayId: teamId(awayCell.find('a[href*="/tym/"]').first().attr("href")),
      homeScore: score ? Number(score[1]) : null,
      awayScore: score ? Number(score[2]) : null,
      apfId: apfMatch ? Number(apfMatch[1]) : null,
    });
  });
  return matches;
}
