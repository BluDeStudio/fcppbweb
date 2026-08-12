"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function createTransfer(formData: FormData) {
  const adminPassword = String(formData.get("adminPassword") ?? "");

  if (adminPassword !== process.env.FC_PPB_ADMIN_PASSWORD) {
    redirect("/admin/prestupy?error=password");
  }

  const direction = String(formData.get("direction") ?? "");
  const movementType = String(formData.get("movementType") ?? "");
  const selectedPlayerId = String(formData.get("playerId") ?? "");
  const selectedPlayerName = String(formData.get("selectedPlayerName") ?? "").trim();
  const arrivalName = String(formData.get("arrivalName") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const otherClub = String(formData.get("otherClub") ?? "").trim();
  const occurredOn = String(formData.get("occurredOn") ?? "");
  const published = formData.get("published") === "on";
  const photo = formData.get("photo");

  const playerName =
    direction === "departure"
      ? selectedPlayerName
      : arrivalName;

  if (!playerName || !occurredOn) {
    redirect("/admin/prestupy?error=required");
  }

  const supabase = getSupabaseAdmin();
  let imageUrl: string | null = null;

  if (photo instanceof File && photo.size > 0) {
    const extension = photo.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeName = playerName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const storagePath = `${Date.now()}-${safeName}.${extension}`;
    const arrayBuffer = await photo.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("transfers")
      .upload(storagePath, arrayBuffer, {
        contentType: photo.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Chyba při uploadu fotky:", uploadError);
      redirect("/admin/prestupy?error=upload");
    }

    const { data: publicUrlData } = supabase.storage
      .from("transfers")
      .getPublicUrl(storagePath);

    imageUrl = publicUrlData.publicUrl;
  }

  const { error } = await supabase
    .from("club_transfers")
    .insert({
      direction,
      movement_type: movementType,
      player_id:
        direction === "departure" && selectedPlayerId
          ? Number(selectedPlayerId)
          : null,
      player_name: playerName,
      description: description || null,
      image_url: imageUrl,
      other_club: otherClub || null,
      occurred_on: occurredOn,
      published,
    });

  if (error) {
    console.error("Chyba při ukládání přestupu:", error);
    redirect("/admin/prestupy?error=database");
  }

  revalidatePath("/");
  redirect("/admin/prestupy?success=1");
}
