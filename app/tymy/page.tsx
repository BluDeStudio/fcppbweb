import {
  clubConfig,
} from "@/config/club";

import {
  supabase,
} from "@/lib/supabase";

import {
  getSquad,
} from "@/services/apf/getSquad";

import TeamsClient, {
  type TeamsPlayer,
  type TeamsStatRow,
} from "./TeamsClient";


/* ============================================================
   TYPES
   ============================================================ */

type WebPlayerRow = {
  id: string;
  name: string;

  team:
    | "a"
    | "b"
    | "both";

  position:
    | "player"
    | "goalkeeper"
    | string;

  status:
    | "club"
    | "loan";

  shirt_number:
    number | null;

  image_url:
    string | null;

  apf_player_id:
    number | null;

  app_player_id:
    string | null;

  active:
    boolean | null;
};


type AppPlayerRow = {
  id: string;

  club_id:
    string;

  name:
    string;

  number:
    number | null;

  position:
    string | null;

  apf_player_id:
    number | null;

  is_active:
    boolean | null;
};


type FinishedMatchRow = {
  id: string;

  club_id:
    string;

  team:
    string;

  date:
    string;
};


type FinishedStatRow = {
  finished_match_id:
    string;

  player_id:
    string | null;

  player_number:
    number | null;

  goals:
    number | null;

  assists:
    number | null;

  average_rating:
    number | null;

  is_player_of_the_match:
    boolean | null;
};


type PeriodRow = {
  start_date:
    string | null;

  end_date:
    string | null;

  is_active:
    boolean | null;

  club_id:
    string | null;
};


type ApfSquadPlayer = Awaited<
  ReturnType<typeof getSquad>
>[number];


/* ============================================================
   PAGE
   ============================================================ */

export default async function TeamsPage() {
  const aTeam =
    clubConfig.teams.aTeam;

  const bTeam =
    clubConfig.teams.bTeam;


  /* ============================================================
     1. DATA NAČTEME PARALELNĚ
     ============================================================ */

  const [
    webPlayersResponse,
    appPlayersResponse,
    apfAResult,
    apfBResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "web_player_profiles",
        )
        .select("*")
        .eq(
          "active",
          true,
        )
        .order(
          "name",
          {
            ascending:
              true,
          },
        ),

      supabase
        .from(
          "players",
        )
        .select("*")
        .order(
          "name",
          {
            ascending:
              true,
          },
        ),

      safeGetSquad({
        teamId:
          aTeam.teamId,

        teamSlug:
          aTeam.teamSlug,

        team:
          "a",
      }),

      safeGetSquad({
        teamId:
          bTeam.teamId,

        teamSlug:
          bTeam.teamSlug,

        team:
          "b",
      }),
    ]);


  if (
    webPlayersResponse.error
  ) {
    console.error(
      "TÝMY – web_player_profiles:",
      webPlayersResponse.error,
    );
  }


  if (
    appPlayersResponse.error
  ) {
    console.error(
      "TÝMY – players:",
      appPlayersResponse.error,
    );
  }


  const webPlayers =
    (
      webPlayersResponse.data ??
      []
    ) as unknown as WebPlayerRow[];


  const appPlayers =
    (
      appPlayersResponse.data ??
      []
    ) as unknown as AppPlayerRow[];


  const apfAPlayers =
    apfAResult;


  const apfBPlayers =
    apfBResult;


  /* ============================================================
     2. MAPY HRÁČŮ Z APLIKACE
     ============================================================ */

  const appPlayerById =
    new Map<
      string,
      AppPlayerRow
    >();


  const appPlayerByApfId =
    new Map<
      number,
      AppPlayerRow
    >();


  for (
    const player
    of appPlayers
  ) {
    appPlayerById.set(
      player.id,
      player,
    );


    if (
      player.apf_player_id !==
      null &&
      player.apf_player_id !==
      undefined
    ) {
      appPlayerByApfId.set(
        Number(
          player.apf_player_id,
        ),
        player,
      );
    }
  }


  /* ============================================================
     3. MAPY WEBOVÉHO ADMINU
     ============================================================ */

  const webPlayerByAppId =
    new Map<
      string,
      WebPlayerRow
    >();


  const webPlayerByApfId =
    new Map<
      number,
      WebPlayerRow
    >();


  for (
    const player
    of webPlayers
  ) {
    if (
      player.app_player_id
    ) {
      webPlayerByAppId.set(
        player.app_player_id,
        player,
      );
    }


    if (
      player.apf_player_id !==
      null &&
      player.apf_player_id !==
      undefined
    ) {
      webPlayerByApfId.set(
        Number(
          player.apf_player_id,
        ),
        player,
      );
    }
  }


  /* ============================================================
     4. APF SOUPISKA
     ============================================================
     APF nám automaticky říká, kdo je na soupisce A a kdo B.

     Pokud je hráč na obou soupiskách APF:
     team = "both"

     WEB ADMIN je ale autorita nad APF.
     Pokud má hráč web_player_profiles.team,
     použije se ruční nastavení z adminu.
     ============================================================ */

  const apfMembership =
    new Map<
      number,
      "a" | "b" | "both"
    >();


  const apfPlayerById =
    new Map<
      number,
      ApfSquadPlayer
    >();


  for (
    const player
    of apfAPlayers
  ) {
    apfMembership.set(
      player.id,
      "a",
    );

    apfPlayerById.set(
      player.id,
      player,
    );
  }


  for (
    const player
    of apfBPlayers
  ) {
    const current =
      apfMembership.get(
        player.id,
      );


    apfMembership.set(
      player.id,
      current === "a"
        ? "both"
        : "b",
    );


    if (
      !apfPlayerById.has(
        player.id,
      )
    ) {
      apfPlayerById.set(
        player.id,
        player,
      );
    }
  }


  /* ============================================================
     5. SOUPISKA = UNION APF + WEB ADMIN
     ============================================================ */

  const squadByKey =
    new Map<
      string,
      TeamsPlayer
    >();


  /*
   * ------------------------------------------------------------
   * 5A. Nejprve všichni hráči z APF.
   * ------------------------------------------------------------
   */

  for (
    const [
      apfId,
      apfPlayer,
    ]
    of apfPlayerById
  ) {
    const appPlayer =
      appPlayerByApfId.get(
        apfId,
      );


    const webPlayer =
      webPlayerByApfId.get(
        apfId,
      ) ??
      (
        appPlayer
          ? webPlayerByAppId.get(
              appPlayer.id,
            )
          : undefined
      );


    /*
     * Když existuje webový profil,
     * jeho tým je ruční override z ADMINU.
     *
     * Jinak použijeme skutečnou APF soupisku.
     */

    const team =
      webPlayer
        ? normalizeSquadTeam(
            webPlayer.team,
          )
        : (
            apfMembership.get(
              apfId,
            ) ??
            apfPlayer.team
          );


    const appPlayerId =
      webPlayer?.app_player_id ??
      appPlayer?.id ??
      null;


    const number =
      webPlayer?.shirt_number ??
      appPlayer?.number ??
      apfPlayer.shirtNumber ??
      null;


    const position =
      normalizePosition(
        appPlayer?.position ??
        webPlayer?.position ??
        apfPlayer.position,
      );


    const imageUrl =
      webPlayer?.image_url ??
      `/images/${apfId}.png`;


    const id =
      webPlayer?.id ??
      `apf:${apfId}`;


    const key =
      appPlayerId
        ? `app:${appPlayerId}`
        : `apf:${apfId}`;


    squadByKey.set(
      key,
      {
        id,

        appPlayerId,

        apfPlayerId:
          apfId,

        name:
          webPlayer?.name ??
          appPlayer?.name ??
          apfPlayer.name,

        team,

        number,

        position,

        status:
          webPlayer?.status ===
            "loan" ||
          apfPlayer.status ===
            "loan"
            ? "loan"
            : "club",

        imageUrl,
      },
    );
  }


  /*
   * ------------------------------------------------------------
   * 5B. Přidáme webové hráče,
   * kteří ještě na APF soupisce nejsou.
   *
   * Typicky nová posila nebo hráč,
   * kterého chceš na webu zobrazit ručně.
   * ------------------------------------------------------------
   */

  for (
    const webPlayer
    of webPlayers
  ) {
    let appPlayer:
      AppPlayerRow | undefined;


    if (
      webPlayer.app_player_id
    ) {
      appPlayer =
        appPlayerById.get(
          webPlayer.app_player_id,
        );
    }


    if (
      !appPlayer &&
      webPlayer.apf_player_id !==
        null &&
      webPlayer.apf_player_id !==
        undefined
    ) {
      appPlayer =
        appPlayerByApfId.get(
          Number(
            webPlayer.apf_player_id,
          ),
        );
    }


    const apfId =
      webPlayer.apf_player_id ??
      appPlayer?.apf_player_id ??
      null;


    const appPlayerId =
      webPlayer.app_player_id ??
      appPlayer?.id ??
      null;


    const key =
      appPlayerId
        ? `app:${appPlayerId}`
        : apfId !==
            null
          ? `apf:${apfId}`
          : `web:${webPlayer.id}`;


    /*
     * Pokud už hráč přišel z APF,
     * pouze případně přepíšeme webová data.
     */

    const current =
      squadByKey.get(
        key,
      );


    const merged:
      TeamsPlayer = {
        id:
          webPlayer.id,

        appPlayerId,

        apfPlayerId:
          apfId,

        name:
          webPlayer.name ||
          current?.name ||
          appPlayer?.name ||
          "Neznámý hráč",

        team:
          normalizeSquadTeam(
            webPlayer.team,
          ),

        number:
          webPlayer.shirt_number ??
          current?.number ??
          appPlayer?.number ??
          null,

        position:
          normalizePosition(
            appPlayer?.position ??
            webPlayer.position ??
            current?.position ??
            "Hráč",
          ),

        status:
          webPlayer.status ===
          "loan"
            ? "loan"
            : current?.status ??
              "club",

        imageUrl:
          webPlayer.image_url ??
          current?.imageUrl ??
          (
            apfId !==
            null
              ? `/images/${apfId}.png`
              : null
          ),
      };


    squadByKey.set(
      key,
      merged,
    );
  }


  const squad =
    Array.from(
      squadByKey.values(),
    )
      .filter(
        (
          player,
        ) => {
          /*
           * Pokud je propojen s appkou a hráč
           * je tam explicitně neaktivní,
           * nechceme ho ukazovat pouze tehdy,
           * když zároveň není na APF soupisce.
           *
           * APF je pro aktuální soupisku silný signál.
           */
          if (
            !player.appPlayerId
          ) {
            return true;
          }


          const appPlayer =
            appPlayerById.get(
              player.appPlayerId,
            );


          if (
            appPlayer?.is_active !==
            false
          ) {
            return true;
          }


          return (
            player.apfPlayerId !==
              null &&
            apfMembership.has(
              player.apfPlayerId,
            )
          );
        },
      )
      .sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
            "cs",
          ),
      );


  /* ============================================================
     6. CLUB ID
     ============================================================ */

  let clubId:
    string | null =
      null;


  for (
    const player
    of squad
  ) {
    if (
      player.appPlayerId
    ) {
      const appPlayer =
        appPlayerById.get(
          player.appPlayerId,
        );


      if (
        appPlayer?.club_id
      ) {
        clubId =
          appPlayer.club_id;

        break;
      }
    }


    if (
      player.apfPlayerId !==
      null
    ) {
      const appPlayer =
        appPlayerByApfId.get(
          player.apfPlayerId,
        );


      if (
        appPlayer?.club_id
      ) {
        clubId =
          appPlayer.club_id;

        break;
      }
    }
  }


  /*
   * Fallback:
   * první aktivní hráč z aplikace.
   */

  if (
    !clubId
  ) {
    const firstActivePlayer =
      appPlayers.find(
        (
          player,
        ) =>
          player.is_active !==
          false,
      );


    clubId =
      firstActivePlayer?.club_id ??
      null;
  }


  /* ============================================================
     7. FINISHED MATCHES
     ============================================================ */

  let finishedMatches:
    FinishedMatchRow[] =
      [];


  if (
    clubId
  ) {
    const {
      data:
        rawMatches,
      error:
        matchesError,
    } =
      await supabase
        .from(
          "finished_matches",
        )
        .select("*")
        .eq(
          "club_id",
          clubId,
        );


    if (
      matchesError
    ) {
      console.error(
        "TÝMY – finished_matches:",
        matchesError,
      );
    }


    finishedMatches =
      (
        rawMatches ??
        []
      ) as unknown as FinishedMatchRow[];
  }


  /* ============================================================
     8. AKTIVNÍ OBDOBÍ
     ============================================================ */

  let periodStart:
    string | null =
      null;


  let periodEnd:
    string | null =
      null;


  if (
    clubId
  ) {
    const {
      data:
        rawPeriod,
      error:
        periodError,
    } =
      await supabase
        .from(
          "periods",
        )
        .select("*")
        .eq(
          "club_id",
          clubId,
        )
        .eq(
          "is_active",
          true,
        )
        .limit(1)
        .maybeSingle();


    if (
      periodError
    ) {
      console.error(
        "TÝMY – periods:",
        periodError,
      );
    }


    const period =
      rawPeriod
        ? (
            rawPeriod as unknown as PeriodRow
          )
        : null;


    if (
      period
    ) {
      periodStart =
        normalizeDate(
          period.start_date,
        );


      periodEnd =
        normalizeDate(
          period.end_date,
        );
    }
  }


  /* ============================================================
     9. ZÁPASY AKTIVNÍHO OBDOBÍ
     ============================================================ */

  const seasonMatches =
    finishedMatches.filter(
      (
        match,
      ) => {
        if (
          !periodStart ||
          !periodEnd
        ) {
          return true;
        }


        const matchDate =
          normalizeDate(
            match.date,
          );


        if (
          !matchDate
        ) {
          return false;
        }


        return (
          matchDate >=
            periodStart &&
          matchDate <=
            periodEnd
        );
      },
    );


  const matchById =
    new Map<
      string,
      FinishedMatchRow
    >();


  for (
    const match
    of seasonMatches
  ) {
    matchById.set(
      match.id,
      match,
    );
  }


  const matchIds =
    seasonMatches.map(
      (
        match,
      ) =>
        match.id,
    );


  /* ============================================================
     10. FINISHED MATCH PLAYER STATS
     ============================================================ */

  let statRows:
    FinishedStatRow[] =
      [];


  if (
    matchIds.length >
    0
  ) {
    const {
      data:
        rawStats,
      error:
        statsError,
    } =
      await supabase
        .from(
          "finished_match_player_stats",
        )
        .select("*")
        .in(
          "finished_match_id",
          matchIds,
        );


    if (
      statsError
    ) {
      console.error(
        "TÝMY – finished_match_player_stats:",
        statsError,
      );
    }


    statRows =
      (
        rawStats ??
        []
      ) as unknown as FinishedStatRow[];
  }


  /* ============================================================
     11. MAPY SOUPISKY PRO STATISTIKY
     ============================================================ */

  const squadByAppId =
    new Map<
      string,
      TeamsPlayer
    >();


  for (
    const player
    of squad
  ) {
    if (
      player.appPlayerId
    ) {
      squadByAppId.set(
        player.appPlayerId,
        player,
      );
    }
  }


  /* ============================================================
     12. STATISTIKY
     ============================================================
     DŮLEŽITÉ:
     soupiskové A/B zde vůbec nerozhoduje.

     Tým statistiky určuje pouze finished_matches.team.

     Identita hráče je pouze player_id.
     ============================================================ */

  const statsMap =
    new Map<
      string,
      TeamsStatRow
    >();


  for (
    const stat
    of statRows
  ) {
    if (
      !stat.player_id
    ) {
      continue;
    }


    const match =
      matchById.get(
        stat.finished_match_id,
      );


    if (
      !match
    ) {
      continue;
    }


    const team =
      normalizeStatsTeam(
        match.team,
      );


    if (
      !team
    ) {
      continue;
    }


    const appPlayer =
      appPlayerById.get(
        stat.player_id,
      );


    const squadPlayer =
      squadByAppId.get(
        stat.player_id,
      );


    const playerName =
      squadPlayer?.name ??
      appPlayer?.name ??
      "Neznámý hráč";


    const apfPlayerId =
      squadPlayer?.apfPlayerId ??
      appPlayer?.apf_player_id ??
      null;


    const key =
      `${team}:${stat.player_id}`;


    let row =
      statsMap.get(
        key,
      );


    if (
      !row
    ) {
      row = {
        playerId:
          stat.player_id,

        apfPlayerId,

        name:
          playerName,

        position:
          normalizePosition(
            appPlayer?.position ??
            squadPlayer?.position ??
            "Hráč",
          ),

        squadTeam:
          squadPlayer?.team ??
          null,

        team,

        matches:
          0,

        goals:
          0,

        assists:
          0,

        points:
          0,

        motm:
          0,

        rating:
          null,

        ratingSum:
          0,

        ratingCount:
          0,

        matchIds:
          [],
      };


      statsMap.set(
        key,
        row,
      );
    }


    /* --------------------------------------------------------
       STARTY
       -------------------------------------------------------- */

    if (
      !row.matchIds.includes(
        stat.finished_match_id,
      )
    ) {
      row.matchIds.push(
        stat.finished_match_id,
      );


      row.matches +=
        1;
    }


    /* --------------------------------------------------------
       GÓLY + ASISTENCE + BODY
       -------------------------------------------------------- */

    row.goals +=
      safeNumber(
        stat.goals,
      );


    row.assists +=
      safeNumber(
        stat.assists,
      );


    row.points =
      row.goals +
      row.assists;


    /* --------------------------------------------------------
       HRÁČ ZÁPASU
       -------------------------------------------------------- */

    if (
      stat.is_player_of_the_match ===
      true
    ) {
      row.motm +=
        1;
    }


    /* --------------------------------------------------------
       ZNÁMKA
       -------------------------------------------------------- */

    const rating =
      nullableNumber(
        stat.average_rating,
      );


    if (
      rating !==
      null
    ) {
      row.ratingSum +=
        rating;


      row.ratingCount +=
        1;


      row.rating =
        roundOne(
          row.ratingSum /
            row.ratingCount,
        );
    }
  }


  const stats =
    Array.from(
      statsMap.values(),
    );


  /* ============================================================
     OUTPUT
     ============================================================ */

  return (
    <TeamsClient
      squad={
        squad
      }
      stats={
        stats
      }
    />
  );
}


/* ============================================================
   APF SAFE WRAPPER
   ============================================================ */

async function safeGetSquad({
  teamId,
  teamSlug,
  team,
}: {
  teamId: number;
  teamSlug: string;
  team: "a" | "b";
}): Promise<
  ApfSquadPlayer[]
> {
  try {
    return await getSquad({
      teamId,
      teamSlug,
      team,
    });
  } catch (
    error
  ) {
    console.error(
      `TÝMY – APF soupiska ${team}:`,
      error,
    );

    return [];
  }
}


/* ============================================================
   HELPERS
   ============================================================ */

function normalizeSquadTeam(
  value:
    string | null,
):
  | "a"
  | "b"
  | "both" {
  const normalized =
    normalizeText(
      value,
    );


  if (
    normalized ===
      "b" ||
    normalized.includes(
      "b tym",
    )
  ) {
    return "b";
  }


  if (
    normalized ===
      "both" ||
    normalized ===
      "a b" ||
    normalized.includes(
      "oba",
    )
  ) {
    return "both";
  }


  return "a";
}


function normalizeStatsTeam(
  value:
    string | null,
):
  | "a"
  | "b"
  | null {
  const normalized =
    normalizeText(
      value,
    );


  if (
    normalized ===
      "a" ||
    normalized ===
      "a tym" ||
    normalized ===
      "ateam"
  ) {
    return "a";
  }


  if (
    normalized ===
      "b" ||
    normalized ===
      "b tym" ||
    normalized ===
      "bteam"
  ) {
    return "b";
  }


  return null;
}


function normalizePosition(
  value:
    string | null,
): string {
  const original =
    (
      value ??
      ""
    ).trim();


  const normalized =
    normalizeText(
      original,
    );


  if (
    normalized.includes(
      "brankar",
    ) ||
    normalized.includes(
      "goalkeeper",
    ) ||
    normalized ===
      "gk"
  ) {
    return "Brankář";
  }


  if (
    normalized.includes(
      "obrance",
    ) ||
    normalized.includes(
      "defender",
    )
  ) {
    return "Obránce";
  }


  if (
    normalized.includes(
      "zaloznik",
    ) ||
    normalized.includes(
      "midfielder",
    )
  ) {
    return "Záložník";
  }


  if (
    normalized.includes(
      "utocnik",
    ) ||
    normalized.includes(
      "forward",
    )
  ) {
    return "Útočník";
  }


  if (
    normalized ===
      "player" ||
    normalized ===
      "hrac" ||
    !normalized
  ) {
    return "Hráč";
  }


  return original ||
    "Hráč";
}


function normalizeText(
  value:
    string | null,
): string {
  return (
    value ??
    ""
  )
    .normalize(
      "NFD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      " ",
    )
    .trim();
}


function normalizeDate(
  value:
    string | null,
): string {
  if (
    !value
  ) {
    return "";
  }


  const trimmed =
    value.trim();


  /*
   * YYYY-MM-DD
   * YYYY-MM-DD HH:mm
   * YYYY-MM-DDTHH:mm
   */

  if (
    /^\d{4}-\d{2}-\d{2}/.test(
      trimmed,
    )
  ) {
    return trimmed.slice(
      0,
      10,
    );
  }


  /*
   * DD.MM.YYYY
   * DD.MM.YYYY HH:mm
   */

  const czechDate =
    trimmed.match(
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})/,
    );


  if (
    czechDate
  ) {
    const day =
      czechDate[1].padStart(
        2,
        "0",
      );


    const month =
      czechDate[2].padStart(
        2,
        "0",
      );


    const year =
      czechDate[3];


    return `${year}-${month}-${day}`;
  }


  const parsed =
    new Date(
      trimmed,
    );


  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return "";
  }


  const year =
    parsed.getFullYear();


  const month =
    String(
      parsed.getMonth() +
        1,
    ).padStart(
      2,
      "0",
    );


  const day =
    String(
      parsed.getDate(),
    ).padStart(
      2,
      "0",
    );


  return `${year}-${month}-${day}`;
}


function safeNumber(
  value:
    unknown,
): number {
  const parsed =
    Number(
      value,
    );


  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return 0;
  }


  return parsed;
}


function nullableNumber(
  value:
    unknown,
): number | null {
  if (
    value ===
      null ||
    value ===
      undefined ||
    value ===
      ""
  ) {
    return null;
  }


  const parsed =
    Number(
      value,
    );


  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return null;
  }


  return parsed;
}


function roundOne(
  value:
    number,
): number {
  return (
    Math.round(
      value *
        10,
    ) /
    10
  );
}
