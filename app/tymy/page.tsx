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
   AUTORITATIVNÍ SOUPISKA 2026/27
   ============================================================ */

const A_TEAM_IDS =
  new Set<number>([
    2945,
    6703,
    7040,
    1385,
    6209,
    4397,
    6919,
    1562,
    5143,
    3746,
    963,
    6700,
  ]);


const B_TEAM_IDS =
  new Set<number>([
    532,
    2024,
    2947,
    6917,
    4455,
    6615,
    6616,
    4637,
    6946,
    3389,
    4247,
    6959,
    6387,
    5161,
    1743,
    1744,
    3937,
    997,
    3931,
  ]);


const LOAN_PLAYER_IDS =
  new Set<number>([
    1385,
    4397,
    963,
    532,
    4247,
    3931,
  ]);


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

type TeamsPageProps = {
  searchParams?:
    | Promise<{
        team?:
          | string
          | string[];
      }>
    | {
        team?:
          | string
          | string[];
      };
};


export default async function TeamsPage({
  searchParams,
}: TeamsPageProps) {
  const resolvedSearchParams =
    searchParams
      ? await searchParams
      : undefined;

  const requestedTeam =
    Array.isArray(
      resolvedSearchParams?.team,
    )
      ? resolvedSearchParams?.team[0]
      : resolvedSearchParams?.team;

  const initialSquadTeam:
    "a" | "b" =
      requestedTeam === "b"
        ? "b"
        : "a";
  const aTeam =
    clubConfig.teams.aTeam;

  const bTeam =
    clubConfig.teams.bTeam;


  /* ============================================================
     1. DATA
     ============================================================ */

  const [
    webPlayersResponse,
    appPlayersResponse,
    apfAPlayers,
    apfBPlayers,
  ] =
    await Promise.all([
      supabase
        .from(
          "web_player_profiles",
        )
        .select("*")
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


  /* ============================================================
     2. MAPY
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


  const appPlayerByName =
    new Map<
      string,
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


    const nameKey =
      normalizePlayerNameKey(
        player.name,
      );


    if (
      nameKey
    ) {
      appPlayerByName.set(
        nameKey,
        player,
      );
    }
  }


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


  const apfPlayerById =
    new Map<
      number,
      ApfSquadPlayer
    >();


  for (
    const player
    of [
      ...apfAPlayers,
      ...apfBPlayers,
    ]
  ) {
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
     3. SOUPISKA
     ============================================================ */

  const rosterIds =
    [
      ...A_TEAM_IDS,
      ...B_TEAM_IDS,
    ];


  const squad =
    rosterIds
      .map<TeamsPlayer | null>(
        (
          apfPlayerId,
        ) => {
            const apfPlayer =
              apfPlayerById.get(
                apfPlayerId,
              );


            const webPlayerByApf =
              webPlayerByApfId.get(
                apfPlayerId,
              );


            let appPlayer =
              appPlayerByApfId.get(
                apfPlayerId,
              );


            /*
             * Pokud v players chybí APF ID,
             * zkusíme nejdřív explicitní propojení
             * z web_player_profiles.app_player_id.
             */
            if (
              !appPlayer &&
              webPlayerByApf?.app_player_id
            ) {
              appPlayer =
                appPlayerById.get(
                  webPlayerByApf.app_player_id,
                );
            }


            /*
             * Poslední bezpečný fallback je jméno.
             *
             * Klíč je nezávislý na pořadí slov,
             * takže spojí například:
             * "Pejšek Karel" <-> "Karel Pejšek".
             */
            if (
              !appPlayer
            ) {
              const candidateName =
                webPlayerByApf?.name ??
                apfPlayer?.name ??
                "";


              const nameKey =
                normalizePlayerNameKey(
                  candidateName,
                );


              if (
                nameKey
              ) {
                appPlayer =
                  appPlayerByName.get(
                    nameKey,
                  );
              }
            }


            const webPlayer =
              webPlayerByApf ??
              (
                appPlayer
                  ? webPlayerByAppId.get(
                      appPlayer.id,
                    )
                  : undefined
              );


            const name =
              clean(
                webPlayer?.name ??
                appPlayer?.name ??
                apfPlayer?.name ??
                "",
              );


            if (
              !name
            ) {
              console.warn(
                `TÝMY – hráč APF #${apfPlayerId} nebyl nalezen.`,
              );

              return null;
            }


            const position =
              normalizePosition(
                appPlayer?.position ??
                webPlayer?.position ??
                apfPlayer?.position ??
                "Hráč",
              );


            const number =
              webPlayer?.shirt_number ??
              appPlayer?.number ??
              apfPlayer?.shirtNumber ??
              null;


            const team:
              "a" | "b" =
                A_TEAM_IDS.has(
                  apfPlayerId,
                )
                  ? "a"
                  : "b";


            const status:
              "club" | "loan" =
                LOAN_PLAYER_IDS.has(
                  apfPlayerId,
                ) ||
                webPlayer?.status ===
                  "loan" ||
                apfPlayer?.status ===
                  "loan"
                  ? "loan"
                  : "club";


            const imageUrl =
              webPlayer?.image_url ??
              `/images/${apfPlayerId}.png`;


            return {
              id:
                webPlayer?.id ??
                appPlayer?.id ??
                `apf:${apfPlayerId}`,

              appPlayerId:
                webPlayer?.app_player_id ??
                appPlayer?.id ??
                null,

              apfPlayerId,

              name,

              team,

              number,

              position,

              status,

              imageUrl,
            } satisfies TeamsPlayer;
        },
      )
      .filter(
        (
          player,
        ): player is TeamsPlayer =>
          player !== null,
      )
      .sort(
          (
            a,
            b,
          ) => {
            const positionDifference =
              positionOrder(
                a.position,
              ) -
              positionOrder(
                b.position,
              );


            if (
              positionDifference !==
              0
            ) {
              return positionDifference;
            }


            return a.name.localeCompare(
              b.name,
              "cs",
            );
          },
        );


  /* ============================================================
     4. CLUB ID
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
     5. FINISHED MATCHES
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
     6. AKTIVNÍ OBDOBÍ
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
     7. ZÁPASY AKTIVNÍHO OBDOBÍ
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
     8. FINISHED MATCH PLAYER STATS
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
     9. SOUPISKA PODLE APP PLAYER ID
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
     10. STATISTIKY
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


    if (
      stat.is_player_of_the_match ===
      true
    ) {
      row.motm +=
        1;
    }


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


  return (
    <TeamsClient
      squad={
        squad
      }
      stats={
        stats
      }
      initialSquadTeam={
        initialSquadTeam
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

function clean(
  value:
    string,
): string {
  return value
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}


function normalizePlayerNameKey(
  value:
    string,
): string {
  const normalized =
    normalizeText(
      value,
    );


  if (
    !normalized
  ) {
    return "";
  }


  return normalized
    .split(" ")
    .filter(Boolean)
    .sort(
      (
        a,
        b,
      ) =>
        a.localeCompare(
          b,
          "cs",
        ),
    )
    .join(" ");
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


function positionOrder(
  position:
    string,
): number {
  if (
    position ===
    "Brankář"
  ) {
    return 0;
  }


  if (
    position ===
    "Obránce"
  ) {
    return 1;
  }


  if (
    position ===
    "Záložník"
  ) {
    return 2;
  }


  if (
    position ===
    "Útočník"
  ) {
    return 3;
  }


  return 4;
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
