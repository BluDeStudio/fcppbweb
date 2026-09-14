export type NextMatch = {
  date: string;
  day: string;
  time: string;

  /*
   * Datum + čas ve formátu:
   *
   * 2026-09-20T13:00:00
   *
   * Používá homepage pro živý odpočet.
   */
  dateTimeIso: string | null;

  competition: string;
  venue: string;

  homeTeam: string;
  awayTeam: string;

  /*
   * APF ID týmů.
   *
   * Např.:
   * FC Blizzard = 14
   *
   * Logo:
   * /public/teams/14.png
   */
  homeTeamId: number | null;
  awayTeamId: number | null;
};