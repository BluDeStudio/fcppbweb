export type PlayerPosition =
  | "player"
  | "goalkeeper";

export type PlayerTeam =
  | "a"
  | "b"
  | "both";

export type PlayerStatus =
  | "club"
  | "loan";

export type TopScorer = {
  id: number;

  name: string;

  matches: number;
  goals: number;

  profileUrl: string;
};

export type SquadPlayer = {
  id: number;

  name: string;

  matches: number;
  goals: number;
  assists: number;

  yellowCards: number;
  redCards: number;

  profileUrl: string;

  imageUrl: string;

  position: PlayerPosition;

  team: PlayerTeam;

  status: PlayerStatus;

  shirtNumber: number | null;

  apfSlug: string;
};

export type PlayerCareerStats = {
  seasons: number;

  matches: number;

  goals: number;

  assists: number;
};

export type PlayerSeasonHistory = {
  season: string;

  team: string;

  matches: number;

  goals: number;

  assists: number;

  yellowCards: number;

  redCards: number;

  rating: number | null;

  attendance: number | null;
};

export type PlayerProfile = {
  id: number;

  name: string;

  age: number | null;

  apfSlug: string;

  career: PlayerCareerStats;

  seasons: PlayerSeasonHistory[];
};
