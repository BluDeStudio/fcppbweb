export type TransferDirection =
  | "arrival"
  | "departure";

export type TransferMovementType =
  | "transfer"
  | "loan";

export type TransferMovementDetail =
  | "transfer_from"
  | "transfer_to"
  | "loan_in"
  | "loan_out"
  | "loan_end"
  | "released";

export type ClubTransfer = {
  id: string;
  direction: TransferDirection;
  movementType: TransferMovementType;
  movementDetail: TransferMovementDetail;
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
