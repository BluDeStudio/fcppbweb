"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getApfTeamInfo } from "@/services/apf/getApfTeamInfo";

import type {
  TransferDirection,
  TransferMovementDetail,
  TransferMovementType,
} from "@/types/transfer";

const text = (fd: FormData, key: string) =>
  String(fd.get(key) ?? "").trim();

function refresh() {
  // Přestupy jsou na homepage i na samostatné stránce /prestupy.
  revalidatePath("/", "page");
  revalidatePath("/prestupy", "page");
  revalidatePath("/admin/prestupy", "page");
  revalidatePath("/admin/hraci", "page");
}

function isDirection(value: string): value is TransferDirection {
  return value === "arrival" || value === "departure";
}

function isDetail(value: string): value is TransferMovementDetail {
  return [
    "transfer_from",
    "transfer_to",
    "loan_in",
    "loan_out",
    "loan_end",
    "released",
  ].includes(value);
}

function detailAllowedForDirection(
  direction: TransferDirection,
  detail: TransferMovementDetail,
) {
  if (direction === "arrival") {
    return ["transfer_from", "loan_in", "loan_end"].includes(detail);
  }

  return [
    "transfer_to",
    "loan_out",
    "loan_end",
    "released",
  ].includes(detail);
}

function legacyMovementType(
  detail: TransferMovementDetail,
): TransferMovementType {
  return ["loan_in", "loan_out", "loan_end"].includes(detail)
    ? "loan"
    : "transfer";
}

async function resolveClub(fd: FormData) {
  const manual = text(fd, "otherClub");
  const apfRaw = text(fd, "otherClubApfId");
  const apfId = apfRaw ? Number(apfRaw) : null;

  let name: string | null = manual || null;
  let logoUrl: string | null = null;

  if (apfId && Number.isInteger(apfId)) {
    try {
      const team = await getApfTeamInfo(apfId);
      if (team) {
        name = team.name;
        logoUrl = team.logoUrl;
      }
    } catch (error) {
      console.error("APF team lookup:", error);
    }
  }

  return { apfId, name, logoUrl };
}

async function uploadPhoto(photo: File, playerName: string) {
  const supabase = getSupabaseAdmin();

  const extension =
    photo.name.split(".").pop()?.toLowerCase() ?? "jpg";

  const safeName = playerName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const storagePath = `${Date.now()}-${safeName}.${extension}`;

  const { error } = await supabase.storage
    .from("transfers")
    .upload(storagePath, await photo.arrayBuffer(), {
      contentType: photo.type || "image/jpeg",
      upsert: false,
    });

  if (error) throw error;

  return supabase.storage
    .from("transfers")
    .getPublicUrl(storagePath).data.publicUrl;
}

export async function createTransfer(fd: FormData) {
  await requireAdmin();

  const directionRaw = text(fd, "direction");
  const detailRaw = text(fd, "movementDetail");

  if (!isDirection(directionRaw) || !isDetail(detailRaw)) {
    redirect("/admin/prestupy?error=required");
  }

  const direction = directionRaw;
  const movementDetail = detailRaw;

  if (!detailAllowedForDirection(direction, movementDetail)) {
    redirect("/admin/prestupy?error=movement");
  }

  const selectedPlayerId = text(fd, "playerId");
  const selectedPlayerName = text(fd, "selectedPlayerName");
  const arrivalName = text(fd, "arrivalName");
  const occurredOn = text(fd, "occurredOn");
  const description = text(fd, "description");
  const published = fd.get("published") === "on";

  const playerName =
    direction === "departure" ? selectedPlayerName : arrivalName;

  if (!playerName || !occurredOn) {
    redirect("/admin/prestupy?error=required");
  }

  const playerId =
    direction === "departure" && selectedPlayerId
      ? Number(selectedPlayerId)
      : null;

  const club = await resolveClub(fd);

  let imageUrl: string | null =
    playerId ? `/images/${playerId}.jpg` : null;

  const photo = fd.get("photo");

  if (photo instanceof File && photo.size > 0) {
    try {
      imageUrl = await uploadPhoto(photo, playerName);
    } catch (error) {
      console.error("Transfer photo upload:", error);
      redirect("/admin/prestupy?error=upload");
    }
  }

  const { error } = await getSupabaseAdmin()
    .from("club_transfers")
    .insert({
      direction,
      movement_type: legacyMovementType(movementDetail),
      movement_detail: movementDetail,
      player_id: playerId,
      player_name: playerName,
      description: description || null,
      image_url: imageUrl,
      other_club: club.name,
      other_club_apf_id: club.apfId,
      other_club_logo_url: club.logoUrl,
      occurred_on: occurredOn,
      published,
    });

  if (error) {
    console.error("Create transfer:", error);
    redirect("/admin/prestupy?error=database");
  }

  refresh();
  redirect("/admin/prestupy?success=created");
}

export async function updateTransfer(fd: FormData) {
  await requireAdmin();

  const id = text(fd, "id");
  const directionRaw = text(fd, "direction");
  const detailRaw = text(fd, "movementDetail");
  const playerIdRaw = text(fd, "playerId");
  const playerName = text(fd, "playerName");
  const occurredOn = text(fd, "occurredOn");
  const description = text(fd, "description");
  const published = fd.get("published") === "on";
  const currentImageUrl = text(fd, "currentImageUrl");

  if (
    !id ||
    !playerName ||
    !occurredOn ||
    !isDirection(directionRaw) ||
    !isDetail(detailRaw)
  ) {
    redirect("/admin/prestupy?error=required");
  }

  const direction = directionRaw;
  const movementDetail = detailRaw;

  if (!detailAllowedForDirection(direction, movementDetail)) {
    redirect(`/admin/prestupy?error=movement&edit=${id}`);
  }

  const playerId = playerIdRaw ? Number(playerIdRaw) : null;
  const club = await resolveClub(fd);

  let imageUrl: string | null = currentImageUrl || null;

  if (direction === "departure" && playerId && !imageUrl) {
    imageUrl = `/images/${playerId}.jpg`;
  }

  const photo = fd.get("photo");

  if (photo instanceof File && photo.size > 0) {
    try {
      imageUrl = await uploadPhoto(photo, playerName);
    } catch (error) {
      console.error("Update photo:", error);
      redirect(`/admin/prestupy?error=upload&edit=${id}`);
    }
  }

  const { error } = await getSupabaseAdmin()
    .from("club_transfers")
    .update({
      direction,
      movement_type: legacyMovementType(movementDetail),
      movement_detail: movementDetail,
      player_id: playerId,
      player_name: playerName,
      description: description || null,
      image_url: imageUrl,
      other_club: club.name,
      other_club_apf_id: club.apfId,
      other_club_logo_url: club.logoUrl,
      occurred_on: occurredOn,
      published,
    })
    .eq("id", id);

  if (error) {
    console.error("Update transfer:", error);
    redirect(`/admin/prestupy?error=database&edit=${id}`);
  }

  refresh();
  redirect("/admin/prestupy?success=updated");
}

export async function toggleTransferPublished(fd: FormData) {
  await requireAdmin();

  const id = text(fd, "id");
  const published = text(fd, "published") === "true";

  if (!id) redirect("/admin/prestupy?error=required");

  const { error } = await getSupabaseAdmin()
    .from("club_transfers")
    .update({ published: !published })
    .eq("id", id);

  if (error) {
    console.error("Toggle transfer:", error);
    redirect("/admin/prestupy?error=database");
  }

  refresh();
  redirect("/admin/prestupy?success=visibility");
}

export async function deleteTransfer(fd: FormData) {
  await requireAdmin();

  const id = text(fd, "id");

  if (!id) redirect("/admin/prestupy?error=required");

  const { error } = await getSupabaseAdmin()
    .from("club_transfers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete transfer:", error);
    redirect("/admin/prestupy?error=database");
  }

  refresh();
  redirect("/admin/prestupy?success=deleted");
}
