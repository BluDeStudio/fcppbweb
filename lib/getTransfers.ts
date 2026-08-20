import { supabase } from "@/lib/supabase";
import { clubConfig } from "@/config/club";

import type {
  ClubTransfer,
  TransferDirection,
  TransferMovementDetail,
  TransferMovementType,
} from "@/types/transfer";

type TransferRow = {
  id: string;
  direction: TransferDirection;
  movement_type: TransferMovementType;
  movement_detail: TransferMovementDetail | null;
  player_id: number | null;
  player_name: string;
  description: string | null;
  image_url: string | null;
  other_club: string | null;
  other_club_apf_id: number | null;
  other_club_logo_url: string | null;
  occurred_on: string;
  published: boolean;
};

function fallbackMovementDetail(
  direction: TransferDirection,
  movementType: TransferMovementType,
): TransferMovementDetail {
  if (movementType === "loan") {
    return direction === "arrival"
      ? "loan_in"
      : "loan_out";
  }

  return direction === "arrival"
    ? "transfer_from"
    : "transfer_to";
}

export async function getPublishedTransfers(): Promise<ClubTransfer[]> {
  const { data, error } = await supabase
    .from("club_transfers")
    .select(
      [
        "id",
        "direction",
        "movement_type",
        "movement_detail",
        "player_id",
        "player_name",
        "description",
        "image_url",
        "other_club",
        "other_club_apf_id",
        "other_club_logo_url",
        "occurred_on",
        "published",
      ].join(", "),
    )
    .eq("published", true)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "Nepodařilo se načíst přestupy:",
      error,
    );

    return [];
  }

  return (data ?? []).map((row) => {
    const item =
      row as unknown as TransferRow;

    return {
      id: item.id,
      direction: item.direction,
      movementType: item.movement_type,

      movementDetail:
        item.movement_detail ??
        fallbackMovementDetail(
          item.direction,
          item.movement_type,
        ),

      playerId: item.player_id,
      playerName: item.player_name,
      description: item.description,
      imageUrl: item.image_url,
      otherClub: item.other_club,
      otherClubApfId: item.other_club_apf_id,
      otherClubLogoUrl: item.other_club_logo_url,
      occurredOn: item.occurred_on,
      published: item.published,
    };
  });
}

/*
 * ========================================
 * ODCHODY POUZE AKTUÁLNÍ SEZÓNY
 * ========================================
 *
 * Historický odchod z 2025/26 už nesmí
 * vyhodit hráče ze soupisky 2026/27.
 *
 * Sezóna FC PPB začíná 1. srpna.
 */
export async function getDepartedPlayerIds(): Promise<Set<number>> {
  const {
    startDate,
    endDate,
  } =
    getCurrentSeasonDateRange();

  const { data, error } = await supabase
    .from("club_transfers")
    .select("player_id")
    .eq("published", true)
    .eq("direction", "departure")
    .gte("occurred_on", startDate)
    .lte("occurred_on", endDate)
    .not("player_id", "is", null);

  if (error) {
    console.error(
      "Nepodařilo se načíst odchozí hráče:",
      error,
    );

    return new Set();
  }

  return new Set(
    (data ?? [])
      .map(
        (row) =>
          Number(
            row.player_id,
          ),
      )
      .filter(
        (id) =>
          Number.isFinite(
            id,
          ),
      ),
  );
}

function getCurrentSeasonDateRange(): {
  startDate: string;
  endDate: string;
} {
  const match =
    clubConfig.season.match(
      /(\d{4})\/(\d{2})/,
    );

  if (!match) {
    const year =
      new Date().getFullYear();

    return {
      startDate:
        `${year}-08-01`,
      endDate:
        `${year + 1}-07-31`,
    };
  }

  const startYear =
    Number(
      match[1],
    );

  const endYear =
    startYear + 1;

  return {
    startDate:
      `${startYear}-08-01`,

    endDate:
      `${endYear}-07-31`,
  };
}
