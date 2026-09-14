export type MatchResult = {
  id: number;

  date: string;

  homeTeam: string;
  awayTeam: string;

  homeTeamId: number | null;
  awayTeamId: number | null;

  homeScore: number;
  awayScore: number;

  halfTimeScore: string | null;

  detailUrl: string;

  isHome: boolean;

  result: "win" | "draw" | "loss";
};