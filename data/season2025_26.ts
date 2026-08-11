/*
 * =========================================
 * FC PPB — UZAVŘENÁ SEZÓNA 2025/26
 * =========================================
 *
 * MANUÁLNÍ ZDROJ PRAVDY:
 * "Statistiky 25-26.xlsx"
 *
 * Tento soubor už pro sezonu 2025/26
 * nepřepočítává zápasy / góly / asistence
 * z APF. Hodnoty jsou uzamčené.
 *
 * Známka a docházka zůstávají z aplikace,
 * protože v dodaném Excelu nejsou.
 * =========================================
 */

export type ManualTeamSeasonStats = {
  matches: number;

  goals: number;

  assists: number;

  awards: number;
};

export type ManualSeason2025_26Player = {
  name: string;

  a: ManualTeamSeasonStats;

  b: ManualTeamSeasonStats;

  total: {
    matches: number;

    goals: number;

    assists: number;

    points: number;

    yellowCards: number;

    redCards: number;

    awards: number;
  };
};

export const season2025_26: ManualSeason2025_26Player[] = [
  {
    name: "David Bass",

    a: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 12,
      goals: 22,
      assists: 13,
      awards: 1,
    },

    total: {
      matches: 12,
      goals: 22,
      assists: 13,
      points: 35,
      yellowCards: 0,
      redCards: 0,
      awards: 1,
    },
  },
  {
    name: "Jiří Bešta",

    a: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    total: {
      matches: 0,
      goals: 0,
      assists: 0,
      points: 0,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Jaroslav Cink",

    a: {
      matches: 11,
      goals: 3,
      assists: 5,
      awards: 0,
    },

    b: {
      matches: 5,
      goals: 1,
      assists: 3,
      awards: 0,
    },

    total: {
      matches: 16,
      goals: 4,
      assists: 8,
      points: 12,
      yellowCards: 1,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Michal Himmer",

    a: {
      matches: 14,
      goals: 13,
      assists: 7,
      awards: 2,
    },

    b: {
      matches: 5,
      goals: 1,
      assists: 0,
      awards: 2,
    },

    total: {
      matches: 19,
      goals: 14,
      assists: 7,
      points: 21,
      yellowCards: 0,
      redCards: 0,
      awards: 4,
    },
  },
  {
    name: "Petr Jelínek",

    a: {
      matches: 13,
      goals: 6,
      assists: 7,
      awards: 0,
    },

    b: {
      matches: 12,
      goals: 10,
      assists: 13,
      awards: 1,
    },

    total: {
      matches: 25,
      goals: 16,
      assists: 20,
      points: 36,
      yellowCards: 1,
      redCards: 0,
      awards: 1,
    },
  },
  {
    name: "David Kolářský",

    a: {
      matches: 11,
      goals: 13,
      assists: 7,
      awards: 1,
    },

    b: {
      matches: 10,
      goals: 19,
      assists: 6,
      awards: 0,
    },

    total: {
      matches: 21,
      goals: 32,
      assists: 13,
      points: 45,
      yellowCards: 2,
      redCards: 0,
      awards: 1,
    },
  },
  {
    name: "Oscar Konaré",

    a: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 11,
      goals: 3,
      assists: 8,
      awards: 0,
    },

    total: {
      matches: 11,
      goals: 3,
      assists: 8,
      points: 11,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Martin Kopřiva",

    a: {
      matches: 9,
      goals: 14,
      assists: 7,
      awards: 5,
    },

    b: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    total: {
      matches: 9,
      goals: 14,
      assists: 7,
      points: 21,
      yellowCards: 0,
      redCards: 0,
      awards: 5,
    },
  },
  {
    name: "Peter Kotlár",

    a: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 9,
      goals: 3,
      assists: 5,
      awards: 0,
    },

    total: {
      matches: 9,
      goals: 3,
      assists: 5,
      points: 8,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Vojtěch Kselík",

    a: {
      matches: 7,
      goals: 1,
      assists: 2,
      awards: 0,
    },

    b: {
      matches: 9,
      goals: 9,
      assists: 9,
      awards: 2,
    },

    total: {
      matches: 16,
      goals: 10,
      assists: 11,
      points: 21,
      yellowCards: 0,
      redCards: 0,
      awards: 2,
    },
  },
  {
    name: "Negru Maxim",

    a: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 5,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    total: {
      matches: 5,
      goals: 0,
      assists: 0,
      points: 0,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Jiří Míkovec",

    a: {
      matches: 3,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    total: {
      matches: 3,
      goals: 0,
      assists: 0,
      points: 0,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Adam Nekola",

    a: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    total: {
      matches: 0,
      goals: 0,
      assists: 0,
      points: 0,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Jakub Onody",

    a: {
      matches: 11,
      goals: 0,
      assists: 2,
      awards: 1,
    },

    b: {
      matches: 17,
      goals: 0,
      assists: 2,
      awards: 0,
    },

    total: {
      matches: 28,
      goals: 0,
      assists: 4,
      points: 4,
      yellowCards: 0,
      redCards: 0,
      awards: 1,
    },
  },
  {
    name: "David Pelikán",

    a: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    total: {
      matches: 0,
      goals: 0,
      assists: 0,
      points: 0,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Vojtěch Plaček",

    a: {
      matches: 11,
      goals: 2,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 7,
      goals: 3,
      assists: 2,
      awards: 0,
    },

    total: {
      matches: 18,
      goals: 5,
      assists: 2,
      points: 7,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Petr Porada",

    a: {
      matches: 12,
      goals: 14,
      assists: 7,
      awards: 2,
    },

    b: {
      matches: 8,
      goals: 18,
      assists: 9,
      awards: 2,
    },

    total: {
      matches: 20,
      goals: 32,
      assists: 16,
      points: 48,
      yellowCards: 0,
      redCards: 0,
      awards: 4,
    },
  },
  {
    name: "Martin Procházka",

    a: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    total: {
      matches: 0,
      goals: 0,
      assists: 0,
      points: 0,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Saša Procházka",

    a: {
      matches: 1,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 3,
      goals: 2,
      assists: 1,
      awards: 0,
    },

    total: {
      matches: 4,
      goals: 2,
      assists: 1,
      points: 3,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Aleš Psohlavec",

    a: {
      matches: 12,
      goals: 3,
      assists: 10,
      awards: 1,
    },

    b: {
      matches: 4,
      goals: 3,
      assists: 2,
      awards: 0,
    },

    total: {
      matches: 16,
      goals: 6,
      assists: 12,
      points: 18,
      yellowCards: 1,
      redCards: 0,
      awards: 1,
    },
  },
  {
    name: "Jiří Rajtolar",

    a: {
      matches: 5,
      goals: 2,
      assists: 2,
      awards: 0,
    },

    b: {
      matches: 2,
      goals: 1,
      assists: 0,
      awards: 0,
    },

    total: {
      matches: 7,
      goals: 3,
      assists: 2,
      points: 5,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Stanislav Rajtolar",

    a: {
      matches: 1,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 1,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    total: {
      matches: 2,
      goals: 0,
      assists: 0,
      points: 0,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Filip Roučka",

    a: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    total: {
      matches: 0,
      goals: 0,
      assists: 0,
      points: 0,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "David Schmirler",

    a: {
      matches: 4,
      goals: 0,
      assists: 1,
      awards: 0,
    },

    b: {
      matches: 8,
      goals: 4,
      assists: 5,
      awards: 0,
    },

    total: {
      matches: 12,
      goals: 4,
      assists: 6,
      points: 10,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Michal Siakala",

    a: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 8,
      goals: 14,
      assists: 15,
      awards: 4,
    },

    total: {
      matches: 8,
      goals: 14,
      assists: 15,
      points: 29,
      yellowCards: 0,
      redCards: 0,
      awards: 4,
    },
  },
  {
    name: "Jiří Stehlík",

    a: {
      matches: 1,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 15,
      goals: 1,
      assists: 6,
      awards: 0,
    },

    total: {
      matches: 16,
      goals: 1,
      assists: 6,
      points: 7,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Lukáš Svoboda",

    a: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    total: {
      matches: 0,
      goals: 0,
      assists: 0,
      points: 0,
      yellowCards: 0,
      redCards: 0,
      awards: 0,
    },
  },
  {
    name: "Lukáš Tintěra",

    a: {
      matches: 6,
      goals: 1,
      assists: 3,
      awards: 0,
    },

    b: {
      matches: 16,
      goals: 12,
      assists: 6,
      awards: 1,
    },

    total: {
      matches: 22,
      goals: 13,
      assists: 9,
      points: 22,
      yellowCards: 3,
      redCards: 0,
      awards: 1,
    },
  },
  {
    name: "Jan Vlček",

    a: {
      matches: 8,
      goals: 7,
      assists: 1,
      awards: 1,
    },

    b: {
      matches: 1,
      goals: 1,
      assists: 0,
      awards: 0,
    },

    total: {
      matches: 9,
      goals: 8,
      assists: 1,
      points: 9,
      yellowCards: 1,
      redCards: 0,
      awards: 1,
    },
  },
  {
    name: "Radek Červeňák",

    a: {
      matches: 2,
      goals: 2,
      assists: 0,
      awards: 0,
    },

    b: {
      matches: 2,
      goals: 0,
      assists: 1,
      awards: 1,
    },

    total: {
      matches: 4,
      goals: 2,
      assists: 1,
      points: 3,
      yellowCards: 0,
      redCards: 0,
      awards: 1,
    },
  },
  {
    name: "Radim Červeňák",

    a: {
      matches: 7,
      goals: 1,
      assists: 2,
      awards: 1,
    },

    b: {
      matches: 3,
      goals: 2,
      assists: 2,
      awards: 1,
    },

    total: {
      matches: 10,
      goals: 3,
      assists: 4,
      points: 7,
      yellowCards: 0,
      redCards: 0,
      awards: 2,
    },
  },
  {
    name: "Jan Šebek",

    a: {
      matches: 5,
      goals: 8,
      assists: 4,
      awards: 3,
    },

    b: {
      matches: 0,
      goals: 0,
      assists: 0,
      awards: 0,
    },

    total: {
      matches: 5,
      goals: 8,
      assists: 4,
      points: 12,
      yellowCards: 0,
      redCards: 0,
      awards: 3,
    },
  },
  {
    name: "Václav Žežulka",

    a: {
      matches: 3,
      goals: 2,
      assists: 1,
      awards: 0,
    },

    b: {
      matches: 2,
      goals: 4,
      assists: 1,
      awards: 2,
    },

    total: {
      matches: 5,
      goals: 6,
      assists: 2,
      points: 8,
      yellowCards: 0,
      redCards: 0,
      awards: 2,
    },
  }
];

export function normalizePlayerName(
  value: string,
): string {
  return String(
    value ??
      "",
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      " ",
    )
    .trim();
}

const season2025_26ByName =
  new Map(
    season2025_26.map(
      (
        player,
      ) => [
        normalizePlayerName(
          player.name,
        ),
        player,
      ],
    ),
  );

export function getSeason2025_26Player(
  name: string,
): ManualSeason2025_26Player | null {
  return (
    season2025_26ByName.get(
      normalizePlayerName(
        name,
      ),
    ) ??
    null
  );
}
