export type PlayerAppMatch = {
  matchId: string;

  matchTitle: string;

  team: "A" | "B" | string;

  date: string;

  time: string | null;

  location: string | null;

  score: string | null;

  finishedAt: string | null;

  goals: number;

  assists: number;

  yellowCards: number;

  redCards: number;

  averageRating: number | null;

  ratingVotes: number;

  isPlayerOfTheMatch: boolean;
};

export type PlayerAppSeasonStats = {
  season: string;

  matches: number;

  assists: number;

  averageRating: number | null;

  ratingVotes: number;

  attendancePercentage: number | null;

  attendedTrainings: number;

  totalTrainings: number;
};

export type PlayerAppStats = {
  playerId: string;

  apfPlayerId: number;

  name: string;

  number: number;

  position: string;

  matches: PlayerAppMatch[];

  attendancePercentage:
    number | null;

  averageRating:
    number | null;

  ratingVotes: number;

  activePeriod: {
    id: string;

    startDate: string;

    endDate: string;

    averageRating: number | null;

    ratingVotes: number;

    assists: number;

    matches: number;
  } | null;

  seasons: PlayerAppSeasonStats[];

  totals: {
    matches: number;

    goals: number;

    assists: number;

    yellowCards: number;

    redCards: number;
  };
};