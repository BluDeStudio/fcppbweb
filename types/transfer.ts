export type TransferDirection =
  | "arrival"
  | "departure";

export type TransferMovementType =
  | "transfer"
  | "loan";

export type ClubTransfer = {
  id: string;
  direction: TransferDirection;
  movementType: TransferMovementType;
  playerId: number | null;
  playerName: string;
  description: string | null;
  imageUrl: string | null;
  otherClub: string | null;
  otherClubApfId: number | null;
  otherClubLogoUrl: string | null;
  occurredOn: string;
  published: boolean;
};
