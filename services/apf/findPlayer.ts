import {
  clubConfig,
} from "@/config/club";

import {
  getSquad,
} from "./getSquad";

import type {
  SquadPlayer,
} from "@/types/player";

export async function findPlayer(
  playerId: number,
): Promise<SquadPlayer | null> {
  const aTeam =
    clubConfig.teams.aTeam;

  const bTeam =
    clubConfig.teams.bTeam;

  const [
    aPlayers,
    bPlayers,
  ] = await Promise.all([
    getSquad({
      teamId:
        aTeam.teamId,

      teamSlug:
        aTeam.teamSlug,

      team: "a",
    }),

    getSquad({
      teamId:
        bTeam.teamId,

      teamSlug:
        bTeam.teamSlug,

      team: "b",
    }),
  ]);

  return (
    aPlayers.find(
      (player) =>
        player.id === playerId,
    ) ??
    bPlayers.find(
      (player) =>
        player.id === playerId,
    ) ??
    null
  );
}