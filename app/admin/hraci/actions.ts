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

async function syncAppApf(
  appPlayerId: string,
  apfPlayerId: number | null,
) {
  if (
    !appPlayerId ||
    apfPlayerId === null
  ) {
    return;
  }

  const supabase =
    getSupabaseAdmin();

  const {
    error,
  } =
    await supabase
      .from("players")
      .update({
        apf_player_id:
          apfPlayerId,
      })
      .eq(
        "id",
        appPlayerId,
      );

  if (
    error
  ) {
    throw error;
  }
}

async function ensureWebProfile(
  formData: FormData,
) {
  const supabase =
    getSupabaseAdmin();

  const profileId =
    text(
      formData,
      "profileId",
    );

  const appPlayerId =
    text(
      formData,
      "appPlayerId",
    );

  const name =
    text(
      formData,
      "playerName",
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

  const apfRaw =
    text(
      formData,
      "apfPlayerId",
    );

  const imageUrlRaw =
    text(
      formData,
      "imageUrl",
    );

  const apfPlayerId =
    apfRaw
      ? Number(apfRaw)
      : null;

  if (
    profileId
  ) {
    const {
      data,
      error,
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
      error ||
      !data
    ) {
      throw (
        error ??
        new Error(
          "Web profile not found",
        )
      );
    }

    return {
      id:
        String(data.id),

      name:
        String(data.name),

      apfPlayerId:
        data.apf_player_id ===
        null
          ? null
          : Number(
              data.apf_player_id,
            ),

      imageUrl:
        data.image_url
          ? String(
              data.image_url,
            )
          : (
              data.apf_player_id
                ? `/images/${data.apf_player_id}.jpg`
                : null
            ),
    };
  }

  let existingId:
    string | null =
      null;

  if (
    appPlayerId
  ) {
    const {
      data,
    } =
      await supabase
        .from(
          "web_player_profiles",
        )
        .select("id")
        .eq(
          "app_player_id",
          appPlayerId,
        )
        .maybeSingle();

    existingId =
      data?.id
        ? String(
            data.id,
          )
        : null;
  }

  if (
    !existingId &&
    apfPlayerId !==
      null
  ) {
    const {
      data,
    } =
      await supabase
        .from(
          "web_player_profiles",
        )
        .select("id")
        .eq(
          "apf_player_id",
          apfPlayerId,
        )
        .maybeSingle();

    existingId =
      data?.id
        ? String(
            data.id,
          )
        : null;
  }

  if (
    existingId
  ) {
    const {
      data,
      error,
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
          existingId,
        )
        .single();

    if (
      error ||
      !data
    ) {
      throw (
        error ??
        new Error(
          "Existing web profile not found",
        )
      );
    }

    return {
      id:
        String(data.id),

      name:
        String(data.name),

      apfPlayerId:
        data.apf_player_id ===
        null
          ? null
          : Number(
              data.apf_player_id,
            ),

      imageUrl:
        data.image_url
          ? String(
              data.image_url,
            )
          : (
              data.apf_player_id
                ? `/images/${data.apf_player_id}.jpg`
                : null
            ),
    };
  }

  if (
    !name
  ) {
    throw new Error(
      "Missing player name",
    );
  }

  const imageUrl =
    imageUrlRaw ||
    (
      apfPlayerId !==
      null
        ? `/images/${apfPlayerId}.jpg`
        : null
    );

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "web_player_profiles",
      )
      .insert({
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
          imageUrl,

        apf_player_id:
          apfPlayerId,

        app_player_id:
          appPlayerId || null,

        active:
          true,

        updated_at:
          new Date().toISOString(),
      })
      .select(
        "id, name, apf_player_id, image_url",
      )
      .single();

  if (
    error ||
    !data
  ) {
    throw (
      error ??
      new Error(
        "Could not create web profile",
      )
    );
  }

  await syncAppApf(
    appPlayerId,
    apfPlayerId,
  );

  return {
    id:
      String(data.id),

    name:
      String(data.name),

    apfPlayerId:
      data.apf_player_id ===
      null
        ? null
        : Number(
            data.apf_player_id,
          ),

    imageUrl:
      data.image_url
        ? String(
            data.image_url,
          )
        : (
            data.apf_player_id
              ? `/images/${data.apf_player_id}.jpg`
              : null
          ),
  };
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

  const imageUrlRaw =
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
      imageUrlRaw ||
      (
        apfPlayerId !==
        null
          ? `/images/${apfPlayerId}.jpg`
          : null
      ),

    apf_player_id:
      apfPlayerId,

    app_player_id:
      appPlayerId || null,

    active,

    updated_at:
      new Date().toISOString(),
  };

  let response;

  if (
    id
  ) {
    response =
      await supabase
        .from(
          "web_player_profiles",
        )
        .update(
          payload,
        )
        .eq(
          "id",
          id,
        );
  } else {
    let existingId:
      string | null =
        null;

    if (
      appPlayerId
    ) {
      const {
        data,
      } =
        await supabase
          .from(
            "web_player_profiles",
          )
          .select("id")
          .eq(
            "app_player_id",
            appPlayerId,
          )
          .maybeSingle();

      existingId =
        data?.id
          ? String(
              data.id,
            )
          : null;
    }

    if (
      !existingId &&
      apfPlayerId !==
        null
    ) {
      const {
        data,
      } =
        await supabase
          .from(
            "web_player_profiles",
          )
          .select("id")
          .eq(
            "apf_player_id",
            apfPlayerId,
          )
          .maybeSingle();

      existingId =
        data?.id
          ? String(
              data.id,
            )
          : null;
    }

    response =
      existingId
        ? await supabase
            .from(
              "web_player_profiles",
            )
            .update(
              payload,
            )
            .eq(
              "id",
              existingId,
            )
        : await supabase
            .from(
              "web_player_profiles",
            )
            .insert(
              payload,
            );
  }

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

  try {
    await syncAppApf(
      appPlayerId,
      apfPlayerId,
    );
  } catch (
    error
  ) {
    console.error(
      "STATPPKA/APF link:",
      error,
    );

    redirect(
      "/admin/hraci?error=app-link",
    );
  }

  refreshPlayers();

  redirect(
    "/admin/hraci?success=updated",
  );
}

export async function createMissingArrival(
  formData: FormData,
) {
  await requireAdmin();

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
    !occurredOn ||
    !isArrivalDetail(
      detailRaw,
    )
  ) {
    redirect(
      "/admin/hraci?error=arrival-required",
    );
  }

  let profile;

  try {
    profile =
      await ensureWebProfile(
        formData,
      );
  } catch (
    error
  ) {
    console.error(
      "Ensure player for arrival:",
      error,
    );

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

  const supabase =
    getSupabaseAdmin();

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
          profile.apfPlayerId,

        player_name:
          profile.name,

        description:
          null,

        image_url:
          profile.imageUrl,

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
      "Arrival:",
      error,
    );

    redirect(
      "/admin/hraci?error=arrival",
    );
  }

  await supabase
    .from(
      "web_player_profiles",
    )
    .update({
      active:
        true,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      profile.id,
    );

  refreshPlayers();

  redirect(
    "/admin/hraci?success=arrival",
  );
}

export async function registerPlayerDeparture(
  formData: FormData,
) {
  await requireAdmin();

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
    !occurredOn ||
    !isDepartureDetail(
      detailRaw,
    )
  ) {
    redirect(
      "/admin/hraci?error=departure-required",
    );
  }

  let profile;

  try {
    profile =
      await ensureWebProfile(
        formData,
      );
  } catch (
    error
  ) {
    console.error(
      "Ensure player for departure:",
      error,
    );

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

  const supabase =
    getSupabaseAdmin();

  const {
    error,
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
          profile.apfPlayerId,

        player_name:
          profile.name,

        description:
          null,

        image_url:
          profile.imageUrl,

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
    error
  ) {
    console.error(
      "Departure:",
      error,
    );

    redirect(
      "/admin/hraci?error=departure",
    );
  }

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
      profile.id,
    );

  refreshPlayers();

  redirect(
    "/admin/hraci?success=departure",
  );
}

export async function setPlayerActive(
  formData: FormData,
) {
  await requireAdmin();

  const targetActive =
    text(
      formData,
      "targetActive",
    ) === "true";

  let profile;

  try {
    profile =
      await ensureWebProfile(
        formData,
      );
  } catch (
    error
  ) {
    console.error(
      "Ensure player for active toggle:",
      error,
    );

    redirect(
      "/admin/hraci?error=player",
    );
  }

  const {
    error,
  } =
    await getSupabaseAdmin()
      .from(
        "web_player_profiles",
      )
      .update({
        active:
          targetActive,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        profile.id,
      );

  if (
    error
  ) {
    console.error(
      "Player active toggle:",
      error,
    );

    redirect(
      "/admin/hraci?error=active",
    );
  }

  refreshPlayers();

  redirect(
    targetActive
      ? "/admin/hraci?success=activated"
      : "/admin/hraci?success=deactivated",
  );
}
