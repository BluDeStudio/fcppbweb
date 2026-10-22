export type Match = {
  id: string;
  team: "A" | "B";
  round: number | string;
  date: string; // ISO, e.g. 2026-10-25T18:00:00+01:00
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  competition?: string;
  venue?: string;
  scorers?: string[];
  lineup?: string[];
  summary?: string;
};

// Připojte existující zdroj zápasů zde. Bez něj nezobrazujeme vymyšlené výsledky.
export const matches: Match[] = [];
