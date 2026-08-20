export type ClubHistoryTeam = {
  teamId: number;
  teamName: string;
  teamSlug: string;

  competition: {
    id: number;
    slug: string;
    name: string;
  };
};

export type ClubHistorySeason = {
  season: string;
  aTeam: ClubHistoryTeam;
  bTeam: ClubHistoryTeam;
};

export const clubHistory: Record<
  string,
  ClubHistorySeason
> = {
  "2026/27": {
    season: "2026/27",

    aTeam: {
      teamId: 269,
      teamName: "FC PPB",
      teamSlug: "fc-ppb",

      competition: {
        id: 430,
        slug: "1-b-trida",
        name: "1. B třída",
      },
    },

    bTeam: {
      teamId: 271,
      teamName: "FC PPB B",
      teamSlug: "fc-ppb-b",

      competition: {
        id: 432,
        slug: "2-b-trida",
        name: "2. B třída",
      },
    },
  },

  "2025/26": {
    season: "2025/26",

    aTeam: {
      teamId: 269,
      teamName: "FC PPB",
      teamSlug: "fc-ppb",

      competition: {
        id: 418,
        slug: "1-b-trida",
        name: "1. B třída",
      },
    },

    bTeam: {
      teamId: 271,
      teamName: "FC PPB B",
      teamSlug: "fc-ppb-b",

      competition: {
        id: 422,
        slug: "3-b-trida",
        name: "3. B třída",
      },
    },
  },
};

export const clubHistorySeasons =
  Object.keys(clubHistory).sort(
    (a, b) => {
      const aYear =
        Number(a.slice(0, 4));

      const bYear =
        Number(b.slice(0, 4));

      return bYear - aYear;
    },
  );
