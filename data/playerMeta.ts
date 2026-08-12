import type {
  PlayerPosition,
  PlayerStatus,
  PlayerTeam,
} from "@/types/player";

type PlayerMeta = {
  position: PlayerPosition;

  team: PlayerTeam;

  status: PlayerStatus;

  shirtNumber: number | null;

  slug?: string;
};

const playerMeta: Record<
  number,
  PlayerMeta
> = {
  /*
   * ========================================
   * A-TÝM
   * ========================================
   */

  2024: {
    position: "player",
    team: "a",
    status: "club",
    shirtNumber: null,
  },

  3935: {
    position: "player",
    team: "a",
    status: "club",
    shirtNumber: null,
  },

  2945: {
    position: "player",
    team: "a",
    status: "club",
    shirtNumber: null,
  },

  6703: {
    position: "player",
    team: "a",
    status: "club",
    shirtNumber: null,
  },

  6209: {
    position: "player",
    team: "a",
    status: "club",
    shirtNumber: null,
  },

  4397: {
    position: "player",
    team: "a",
    status: "loan",
    shirtNumber: null,
  },

  6551: {
    position: "goalkeeper",
    team: "a",
    status: "club",
    shirtNumber: null,
  },

  5161: {
    position: "player",
    team: "a",
    status: "club",
    shirtNumber: null,
  },

  1562: {
    position: "player",
    team: "a",
    status: "loan",
    shirtNumber: null,
  },

  5143: {
    position: "player",
    team: "a",
    status: "club",
    shirtNumber: null,
  },

  1743: {
    position: "player",
    team: "a",
    status: "club",
    shirtNumber: null,
  },

  5423: {
    position: "goalkeeper",
    team: "a",
    status: "club",
    shirtNumber: null,
  },

  963: {
    position: "player",
    team: "a",
    status: "loan",
    shirtNumber: null,
  },

  6700: {
    position: "player",
    team: "a",
    status: "club",
    shirtNumber: null,
  },

  3762: {
    position: "player",
    team: "a",
    status: "club",
    shirtNumber: null,
  },

  /*
   * ========================================
   * B-TÝM
   * ========================================
   */

  532: {
    position: "player",
    team: "b",
    status: "loan",
    shirtNumber: null,
  },

  2947: {
    position: "player",
    team: "b",
    status: "club",
    shirtNumber: null,
  },

  4455: {
    position: "player",
    team: "b",
    status: "club",
    shirtNumber: null,
  },

  5383: {
    position: "player",
    team: "b",
    status: "club",
    shirtNumber: null,
  },

  6615: {
    position: "player",
    team: "b",
    status: "club",
    shirtNumber: null,
  },

  6616: {
    position: "player",
    team: "b",
    status: "club",
    shirtNumber: null,
  },

  4637: {
    position: "player",
    team: "b",
    status: "club",
    shirtNumber: null,
  },

  3389: {
    position: "goalkeeper",
    team: "b",
    status: "club",
    shirtNumber: null,
  },

  6892: {
    position: "player",
    team: "b",
    status: "club",
    shirtNumber: null,
  },

  6318: {
    position: "player",
    team: "b",
    status: "club",
    shirtNumber: null,
  },

  1744: {
    position: "player",
    team: "b",
    status: "club",
    shirtNumber: null,
  },

  3937: {
    position: "player",
    team: "b",
    status: "club",

    shirtNumber: 6,

    slug: "schmirler-david",
  },

  3265: {
    position: "player",
    team: "b",
    status: "loan",
    shirtNumber: null,
  },

  997: {
    position: "player",
    team: "b",
    status: "club",
    shirtNumber: null,
  },

  3931: {
    position: "player",
    team: "b",
    status: "club",
    shirtNumber: null,
  },
};

export function getPlayerMeta(
  playerId: number,
): PlayerMeta {
  return (
    playerMeta[playerId] ?? {
      position: "player",
      team: "b",
      status: "club",
      shirtNumber: null,
    }
  );
}