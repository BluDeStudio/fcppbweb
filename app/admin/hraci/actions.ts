"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function saveWebPlayer(formData: FormData) {
  await requireAdmin();

  const id =
    String(
      formData.get("id") ?? "",
    );

  const name =
    String(
      formData.get("name") ?? "",
    ).trim();

  const team =
    String(
      formData.get("team") ?? "b",
    );

  const position =
    String(
      formData.get("position") ?? "player",
    );

  const status =
    String(
      formData.get("status") ?? "club",
    );

  const shirtNumberRaw =
    String(
      formData.get("shirtNumber") ?? "",
    ).trim();

  const apfIdRaw =
    String(
      formData.get("apfPlayerId") ?? "",
    ).trim();

  const appPlayerId =
    String(
      formData.get("appPlayerId") ?? "",
    ).trim();

  const active =
    formData.get("active") === "on";

  const imageUrl =
    String(
      formData.get("imageUrl") ?? "",
    ).trim();

  if (
    !name ||
    !["a", "b", "both"].includes(team) ||
    !["player", "goalkeeper"].includes(position) ||
    !["club", "loan"].includes(status)
  ) {
    redirect(
      "/admin/hraci?error=required",
    );
  }

  const apfPlayerId =
    apfIdRaw
      ? Number(apfIdRaw)
      : null;

  if (
    apfPlayerId !== null &&
    !Number.isInteger(apfPlayerId)
  ) {
    redirect(
      "/admin/hraci?error=apf",
    );
  }

  const payload = {
    name,
    team,
    position,
    status,

    shirt_number:
      shirtNumberRaw
        ? Number(
            shirtNumberRaw,
          )
        : null,

    image_url:
      imageUrl || null,

    apf_player_id:
      apfPlayerId,

    app_player_id:
      appPlayerId || null,

    active,

    updated_at:
      new Date().toISOString(),
  };

  const supabase =
    getSupabaseAdmin();

  const response =
    id
      ? await supabase
          .from(
            "web_player_profiles",
          )
          .update(
            payload,
          )
          .eq(
            "id",
            id,
          )
      : await supabase
          .from(
            "web_player_profiles",
          )
          .insert(
            payload,
          );

  if (
    response.error
  ) {
    console.error(
      "Save web player:",
      response.error,
    );

    redirect(
      "/admin/hraci?error=database",
    );
  }

  /*
   * ========================================
   * PROPOJENÍ STATPPKA ↔ APF
   * ========================================
   *
   * Když v adminu vybereš hráče z aplikace
   * a zároveň doplníš APF Player ID,
   * synchronizujeme stejné APF ID i do
   * tabulky players v aplikaci.
   *
   * Díky tomu dál funguje současný
   * getPlayerAppStats(apfPlayerId):
   * docházka, známky, asistence,
   * góly/karty z aplikace.
   * ========================================
   */

  if (
    appPlayerId &&
    apfPlayerId !== null
  ) {
    const {
      error: appLinkError,
    } =
      await supabase
        .from(
          "players",
        )
        .update({
          apf_player_id:
            apfPlayerId,
        })
        .eq(
          "id",
          appPlayerId,
        );

    if (
      appLinkError
    ) {
      console.error(
        "Propojení hráče STATPPKA ↔ APF:",
        appLinkError,
      );

      redirect(
        "/admin/hraci?error=app-link",
      );
    }
  }

  revalidatePath(
    "/admin/hraci",
  );

  revalidatePath(
    "/",
  );

  revalidatePath(
    "/statistiky",
  );

  redirect(
    "/admin/hraci?success=1",
  );
}
