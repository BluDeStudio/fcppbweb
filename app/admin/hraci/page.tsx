import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getWebPlayers } from "@/lib/webPlayers";
import { getPlayerMeta } from "@/data/playerMeta";

import { AdminShell } from "@/components/admin/AdminShell";
import { PlayersAdmin } from "@/components/admin/PlayersAdmin";

type AppPlayerRow = {
  id: string;
  name: string;
  number: number | null;
  position: string | null;
  apf_player_id: number | null;
  is_active: boolean | null;
};

type TransferMarker = {
  player_id: number | null;
  player_name: string;
};

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function inferPosition(value: string | null) {
  const normalized = (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return normalized.includes("brankar") ||
    normalized.includes("goalkeeper")
    ? "goalkeeper"
    : "player";
}

export default async function AdminPlayersPage() {
  await requireAdmin();

  const supabase = getSupabaseAdmin();

  const [
    webPlayers,
    appResponse,
    arrivalsResponse,
  ] = await Promise.all([
    getWebPlayers(),

    supabase
      .from("players")
      .select(
        "id, name, number, position, apf_player_id, is_active",
      )
      .order("name", { ascending: true }),

    supabase
      .from("club_transfers")
      .select("player_id, player_name")
      .eq("direction", "arrival"),
  ]);

  const appPlayers = (
    (appResponse.data ?? []) as AppPlayerRow[]
  ).map((player) => ({
    id: String(player.id),
    name: String(player.name),
    number:
      player.number === null
        ? 0
        : Number(player.number),
    position: player.position,
    apfPlayerId:
      player.apf_player_id === null
        ? null
        : Number(player.apf_player_id),
    active:
      player.is_active !== false,
  }));

  const arrivalIds = new Set<number>();
  const arrivalNames = new Set<string>();

  (
    (arrivalsResponse.data ?? []) as TransferMarker[]
  ).forEach((row) => {
    if (row.player_id !== null) {
      arrivalIds.add(Number(row.player_id));
    }

    arrivalNames.add(
      normalizeName(String(row.player_name)),
    );
  });

  const webByAppId = new Map(
    webPlayers
      .filter((player) => player.appPlayerId)
      .map((player) => [
        String(player.appPlayerId),
        player,
      ]),
  );

  const webByApfId = new Map(
    webPlayers
      .filter((player) => player.apfPlayerId !== null)
      .map((player) => [
        Number(player.apfPlayerId),
        player,
      ]),
  );

  const webByName = new Map(
    webPlayers.map((player) => [
      normalizeName(player.name),
      player,
    ]),
  );

  const usedWebIds = new Set<string>();

  const mergedPlayers = appPlayers.map((appPlayer) => {
    const webPlayer =
      webByAppId.get(appPlayer.id) ??
      (
        appPlayer.apfPlayerId !== null
          ? webByApfId.get(appPlayer.apfPlayerId)
          : undefined
      ) ??
      webByName.get(normalizeName(appPlayer.name)) ??
      null;

    if (webPlayer) {
      usedWebIds.add(webPlayer.id);
    }

    const apfPlayerId =
      webPlayer?.apfPlayerId ??
      appPlayer.apfPlayerId ??
      null;

    const legacyMeta =
      apfPlayerId !== null
        ? getPlayerMeta(apfPlayerId)
        : null;

    const team =
      webPlayer?.team ??
      legacyMeta?.team ??
      "b";

    const position =
      webPlayer?.position ??
      legacyMeta?.position ??
      inferPosition(appPlayer.position);

    const status =
      webPlayer?.status ??
      legacyMeta?.status ??
      "club";

    const shirtNumber =
      webPlayer?.shirtNumber ??
      (
        appPlayer.number > 0
          ? appPlayer.number
          : null
      ) ??
      legacyMeta?.shirtNumber ??
      null;

    const active =
      webPlayer?.active ??
      appPlayer.active;

    const imageUrl =
      webPlayer?.imageUrl ??
      (
        apfPlayerId !== null
          ? `/images/${apfPlayerId}.jpg`
          : null
      );

    const hasArrival =
      (
        apfPlayerId !== null &&
        arrivalIds.has(apfPlayerId)
      ) ||
      arrivalNames.has(
        normalizeName(appPlayer.name),
      );

    return {
      id:
        webPlayer?.id ??
        `app:${appPlayer.id}`,

      webProfileId:
        webPlayer?.id ??
        null,

      name:
        webPlayer?.name ??
        appPlayer.name,

      team,
      position,
      status,
      shirtNumber,
      imageUrl,
      apfPlayerId,

      appPlayerId:
        appPlayer.id,

      active,
      hasArrival,

      source:
        webPlayer
          ? "web+app"
          : "app",
    };
  });

  webPlayers
    .filter(
      (player) =>
        !usedWebIds.has(player.id),
    )
    .forEach((player) => {
      mergedPlayers.push({
        id: player.id,
        webProfileId: player.id,
        name: player.name,
        team: player.team,
        position: player.position,
        status: player.status,
        shirtNumber: player.shirtNumber,
        imageUrl:
          player.imageUrl ??
          (
            player.apfPlayerId !== null
              ? `/images/${player.apfPlayerId}.jpg`
              : null
          ),
        apfPlayerId: player.apfPlayerId,
        appPlayerId: player.appPlayerId,
        active: player.active,

        hasArrival:
          (
            player.apfPlayerId !== null &&
            arrivalIds.has(player.apfPlayerId)
          ) ||
          arrivalNames.has(
            normalizeName(player.name),
          ),

        source: "web",
      });
    });

  mergedPlayers.sort((a, b) => {
    if (a.active !== b.active) {
      return a.active ? -1 : 1;
    }

    return a.name.localeCompare(
      b.name,
      "cs",
    );
  });

  return (
    <AdminShell title="Hráči">
      <PlayersAdmin
        players={mergedPlayers}
        appPlayers={appPlayers}
      />
    </AdminShell>
  );
}
