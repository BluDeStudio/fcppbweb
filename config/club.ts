export const clubConfig = {
  name: "FC PPB",
  shortName: "PPB",
  city: "Plzeň",

  logo: "/images/fc-ppb-logo.png",

  season: "2026/27",

  apf: {
    baseUrl: "https://futsalvplzni.cz",
  },

  teams: {
    aTeam: {
      key: "a",
      label: "A-tým",

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
      key: "b",
      label: "B-tým",

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

  colors: {
    primary: "#29e83f",
    background: "#050705",
    surface: "#0d120e",
    text: "#f4f6f4",
    muted: "#9ca59e",
  },
} as const;
