"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clubConfig } from "@/config/club";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getApfTeamInfo } from "@/services/apf/getApfTeamInfo";

const text = (
  formData: FormData,
  key: string,
) =>
  String(
    formData.get(key) ?? "",
  ).trim();

type ArrivalDetail =
  | "transfer_from"
  | "loan_in"
  | "loan_end";

type DepartureDetail =
  | "transfer_to"
  | "loan_out"
  | "loan_end"
  | "released";

function isArrivalDetail(
  value: string,
): value is ArrivalDetail {
  return [
    "transfer_from",
    "loan_in",
    "loan_end",
  ].includes(value);
}

function isDepartureDetail(
  value: string,
): value is DepartureDetail {
  return [
    "transfer_to",
    "loan_out",
    "loan_end",
    "released",
  ].includes(value);
}

function movementType(
  detail:
    | ArrivalDetail
    | DepartureDetail,
) {
  return [
    "loan_in",
    "loan_out",
    "loan_end",
  ].includes(detail)
    ? "loan"
    : "transfer";
}

function seasonFromDate(
  value: string,
): string {
  const date =
    new Date(
      `${value}T12:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return clubConfig.season;
  }

  const year =
    date.getFullYear();

  const month =
    date.getMonth() + 1;

  const startYear =
    month >= 8
      ? year
      : year - 1;

  return `${startYear}/${String(
    startYear + 1,
  ).slice(-2)}`;
}

async function resolveClub(
  formData: FormData,
  manualKey: string,
  apfKey: string,
) {
  const manual =
    text(
      formData,
      manualKey,
    );

  const apfRaw =
    text(
      formData,
      apfKey,
    );

  const apfId =
    apfRaw
      ? Number(apfRaw)
      : null;

  let name:
    string | null =
      manual || null;

  let logoUrl:
    string | null =
      null;

  if (
    apfId &&
    Number.isInteger(
      apfId,
    )
  ) {
    try {
      const team =
        await getApfTeamInfo(
          apfId,
        );

      if (
        team
      ) {
        name =
          team.name;

        logoUrl =
          team.logoUrl;
      }
    } catch (
      error
    ) {
      console.error(
        "APF club lookup:",
        error,
      );
    }
  }

  return {
    apfId,
    name,
    logoUrl,
  };
}

function refreshPlayers() {
  revalidatePath("/");
  revalidatePath("/prestupy");
  revalidatePath("/statistiky");
  revalidatePath("/admin/hraci");
  revalidatePath("/admin/prestupy");
}

export async function saveWebPlayer(
  formData: FormData,
) {
  await requireAdmin();

  const supabase =
    getSupabaseAdmin();

  const id =
    text(
      formData,
      "id",
    );

  const isCreating =
    !id;

  const name =
    text(
      formData,
      "name",
    );

  const team =
    text(
      formData,
      "team",
    ) || "b";

  const position =
    text(
      formData,
      "position",
    ) || "player";

  const status =
    text(
      formData,
      "status",
    ) || "club";

  const shirtNumberRaw =
    text(
      formData,
      "shirtNumber",
    );

  const apfIdRaw =
    text(
      formData,
      "apfPlayerId",
    );

  const appPlayerId =
    text(
      formData,
      "appPlayerId",
    );

  const imageUrl =
    text(
      formData,
      "imageUrl",
    );

  const active =
    formData.get(
      "active",
    ) === "on";

  if (
    !name ||
    ![
      "a",
      "b",
      "both",
    ].includes(team) ||
    ![
      "player",
      "goalkeeper",
    ].includes(
      position,
    ) ||
    ![
      "club",
      "loan",
    ].includes(status)
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
    apfPlayerId !==
      null &&
    !Number.isInteger(
      apfPlayerId,
    )
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

  const profileResponse =
    isCreating
      ? await supabase
          .from(
            "web_player_profiles",
          )
          .insert(
            payload,
          )
          .select("id")
          .single()
      : await supabase
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
          .select("id")
          .single();

  if (
    profileResponse.error
  ) {
    console.error(
      "Save web player:",
      profileResponse.error,
    );

    redirect(
      "/admin/hraci?error=database",
    );
  }

  /*
   * Propojení STATPPKA ↔ APF.
   */
  if (
    appPlayerId &&
    apfPlayerId !==
      null
  ) {
    const {
      error:
        appLinkError,
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
        "STATPPKA/APF link:",
        appLinkError,
      );

      redirect(
        "/admin/hraci?error=app-link",
      );
    }
  }

  /*
   * ========================================
   * NOVÝ HRÁČ = AUTOMATICKÝ PŘÍCHOD
   * ========================================
   */
  if (
    isCreating
  ) {
    const arrivalDate =
      text(
        formData,
        "arrivalDate",
      );

    const arrivalDetailRaw =
      text(
        formData,
        "arrivalMovementDetail",
      );

    if (
      !arrivalDate ||
      !isArrivalDetail(
        arrivalDetailRaw,
      )
    ) {
      /*
       * Profil už je uložený, ale příchod nebyl.
       * Admin pak nabídne "DOPLNIT PŘÍCHOD".
       */
      refreshPlayers();

      redirect(
        "/admin/hraci?success=player-created&warning=arrival",
      );
    }

    const club =
      await resolveClub(
        formData,
        "arrivalClub",
        "arrivalClubApfId",
      );

    const {
      error:
        transferError,
    } =
      await supabase
        .from(
          "club_transfers",
        )
        .insert({
          direction:
            "arrival",

          movement_type:
            movementType(
              arrivalDetailRaw,
            ),

          movement_detail:
            arrivalDetailRaw,

          player_id:
            apfPlayerId,

          player_name:
            name,

          description:
            null,

          image_url:
            imageUrl ||
            (
              apfPlayerId
                ? `/images/${apfPlayerId}.jpg`
                : null
            ),

          other_club:
            club.name,

          other_club_apf_id:
            club.apfId,

          other_club_logo_url:
            club.logoUrl,

          occurred_on:
            arrivalDate,

          season:
            seasonFromDate(
              arrivalDate,
            ),

          published:
            true,
        });

    if (
      transferError
    ) {
      console.error(
        "Automatic arrival:",
        transferError,
      );

      refreshPlayers();

      redirect(
        "/admin/hraci?success=player-created&warning=arrival",
      );
    }
  }

  refreshPlayers();

  redirect(
    isCreating
      ? "/admin/hraci?success=created"
      : "/admin/hraci?success=updated",
  );
}

export async function createMissingArrival(
  formData: FormData,
) {
  await requireAdmin();

  const supabase =
    getSupabaseAdmin();

  const profileId =
    text(
      formData,
      "profileId",
    );

  const occurredOn =
    text(
      formData,
      "occurredOn",
    );

  const detailRaw =
    text(
      formData,
      "movementDetail",
    );

  if (
    !profileId ||
    !occurredOn ||
    !isArrivalDetail(
      detailRaw,
    )
  ) {
    redirect(
      "/admin/hraci?error=arrival-required",
    );
  }

  const {
    data:
      profile,
    error:
      profileError,
  } =
    await supabase
      .from(
        "web_player_profiles",
      )
      .select(
        "id, name, apf_player_id, image_url",
      )
      .eq(
        "id",
        profileId,
      )
      .single();

  if (
    profileError ||
    !profile
  ) {
    redirect(
      "/admin/hraci?error=player",
    );
  }

  const club =
    await resolveClub(
      formData,
      "otherClub",
      "otherClubApfId",
    );

  const {
    error,
  } =
    await supabase
      .from(
        "club_transfers",
      )
      .insert({
        direction:
          "arrival",

        movement_type:
          movementType(
            detailRaw,
          ),

        movement_detail:
          detailRaw,

        player_id:
          profile.apf_player_id
            ? Number(
                profile.apf_player_id,
              )
            : null,

        player_name:
          String(
            profile.name,
          ),

        description:
          null,

        image_url:
          profile.image_url ||
          (
            profile.apf_player_id
              ? `/images/${profile.apf_player_id}.jpg`
              : null
          ),

        other_club:
          club.name,

        other_club_apf_id:
          club.apfId,

        other_club_logo_url:
          club.logoUrl,

        occurred_on:
          occurredOn,

        season:
          seasonFromDate(
            occurredOn,
          ),

        published:
          true,
      });

  if (
    error
  ) {
    console.error(
      "Missing arrival:",
      error,
    );

    redirect(
      "/admin/hraci?error=arrival",
    );
  }

  refreshPlayers();

  redirect(
    "/admin/hraci?success=arrival",
  );
}

export async function registerPlayerDeparture(
  formData: FormData,
) {
  await requireAdmin();

  const supabase =
    getSupabaseAdmin();

  const profileId =
    text(
      formData,
      "profileId",
    );

  const occurredOn =
    text(
      formData,
      "occurredOn",
    );

  const detailRaw =
    text(
      formData,
      "movementDetail",
    );

  if (
    !profileId ||
    !occurredOn ||
    !isDepartureDetail(
      detailRaw,
    )
  ) {
    redirect(
      "/admin/hraci?error=departure-required",
    );
  }

  const {
    data:
      profile,
    error:
      profileError,
  } =
    await supabase
      .from(
        "web_player_profiles",
      )
      .select(
        "id, name, apf_player_id, image_url",
      )
      .eq(
        "id",
        profileId,
      )
      .single();

  if (
    profileError ||
    !profile
  ) {
    redirect(
      "/admin/hraci?error=player",
    );
  }

  const club =
    await resolveClub(
      formData,
      "otherClub",
      "otherClubApfId",
    );

  const {
    error:
      transferError,
  } =
    await supabase
      .from(
        "club_transfers",
      )
      .insert({
        direction:
          "departure",

        movement_type:
          movementType(
            detailRaw,
          ),

        movement_detail:
          detailRaw,

        player_id:
          profile.apf_player_id
            ? Number(
                profile.apf_player_id,
              )
            : null,

        player_name:
          String(
            profile.name,
          ),

        description:
          null,

        image_url:
          profile.image_url ||
          (
            profile.apf_player_id
              ? `/images/${profile.apf_player_id}.jpg`
              : null
          ),

        other_club:
          detailRaw ===
            "released"
            ? null
            : club.name,

        other_club_apf_id:
          detailRaw ===
            "released"
            ? null
            : club.apfId,

        other_club_logo_url:
          detailRaw ===
            "released"
            ? null
            : club.logoUrl,

        occurred_on:
          occurredOn,

        season:
          seasonFromDate(
            occurredOn,
          ),

        published:
          true,
      });

  if (
    transferError
  ) {
    console.error(
      "Departure:",
      transferError,
    );

    redirect(
      "/admin/hraci?error=departure",
    );
  }

  const {
    error:
      profileUpdateError,
  } =
    await supabase
      .from(
        "web_player_profiles",
      )
      .update({
        active:
          false,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        profileId,
      );

  if (
    profileUpdateError
  ) {
    console.error(
      "Deactivate player:",
      profileUpdateError,
    );

    redirect(
      "/admin/hraci?error=deactivate",
    );
  }

  refreshPlayers();

  redirect(
    "/admin/hraci?success=departure",
  );
}
