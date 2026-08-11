import { supabase } from "./supabase";

import type {
  PlayerAppMatch,
  PlayerAppSeasonStats,
  PlayerAppStats,
} from "@/types/playerAppStats";

/*
 * ========================================
 * TYPY
 * ========================================
 */

type PlayerRow = {
  id: string;
  club_id: string;
  name: string;
  number: number;
  position: string;
  apf_player_id: number;
};

type PlayerMatchStatRow = {
  finished_match_id: string;
  player_number: number;
  player_id: string | null;
  goals: number | null;
  assists: number | null;
  yellow_cards: number | null;
  red_cards: number | null;
};

type FinishedMatchRow = {
  id: string;
  club_id: string;
  match_title: string;
  team: string;
  date: string;
  score: string | null;
  time: string | null;
  location: string | null;
  finished_at: string | null;
};

type TrainingPresenceRow = {
  training_id: string;
  player_id: string;
  present: boolean;
};

type TrainingRow = {
  id: string;
  club_id: string;
  date: string;
};

type RatingRow = {
  finished_match_id: string;
  player_number: number;
  player_id?: string | null;
  rating: number;
};

type PeriodRow = {
  id: string;
  club_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

/*
 * ========================================
 * ZAOKROUHLENÍ
 * ========================================
 */

function roundToOne(
  value: number,
): number {
  return (
    Math.round(
      value * 10,
    ) / 10
  );
}

/*
 * ========================================
 * NORMALIZACE DATA
 * ========================================
 */

function normalizeDate(
  value?: string | null,
): string {
  if (!value) {
    return "";
  }

  const trimmed =
    value.trim();

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      trimmed,
    )
  ) {
    return trimmed;
  }

  if (
    /^\d{4}-\d{2}-\d{2}[T\s]/.test(
      trimmed,
    )
  ) {
    return trimmed.slice(
      0,
      10,
    );
  }

  if (
    /^\d{2}\.\d{2}\.\d{4}/.test(
      trimmed,
    )
  ) {
    const [datePart] =
      trimmed.split(" ");

    const [
      day,
      month,
      year,
    ] =
      datePart.split(".");

    return `${year}-${month}-${day}`;
  }

  if (
    /^\d{2}\/\d{2}\/\d{4}/.test(
      trimmed,
    )
  ) {
    const [datePart] =
      trimmed.split(" ");

    const [
      day,
      month,
      year,
    ] =
      datePart.split("/");

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
      parsed.getMonth() + 1,
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

/*
 * ========================================
 * ZÁPAS PATŘÍ DO OBDOBÍ?
 * ========================================
 */

function isDateInsidePeriod(
  date: string,
  period: PeriodRow,
): boolean {
  const matchDate =
    normalizeDate(
      date,
    );

  const startDate =
    normalizeDate(
      period.start_date,
    );

  const endDate =
    normalizeDate(
      period.end_date,
    );

  if (
    !matchDate ||
    !startDate ||
    !endDate
  ) {
    return false;
  }

  return (
    matchDate >= startDate &&
    matchDate <= endDate
  );
}

/*
 * ========================================
 * SEZÓNA PODLE DATA
 *
 * 1. SRPNA = ZAČÁTEK NOVÉ SEZÓNY
 *
 * 2026-07-31 -> 2025/26
 * 2026-08-01 -> 2026/27
 * 2026-08-10 -> 2026/27
 * ========================================
 */

function getSeasonFromDate(
  value: string,
): string | null {
  const normalized =
    normalizeDate(
      value,
    );

  if (
    !normalized
  ) {
    return null;
  }

  const [
    yearText,
    monthText,
  ] =
    normalized.split("-");

  const year =
    Number(
      yearText,
    );

  const month =
    Number(
      monthText,
    );

  if (
    !Number.isFinite(
      year,
    ) ||
    !Number.isFinite(
      month,
    )
  ) {
    return null;
  }

  const startYear =
    month >= 8
      ? year
      : year - 1;

  const endYear =
    startYear + 1;

  return `${startYear}/${String(
    endYear,
  ).slice(-2)}`;
}

/*
 * ========================================
 * PRŮMĚR Z HLASŮ
 *
 * ZATÍM STEJNÝ STARÝ SYSTÉM
 * JAKO V APLIKACI.
 * ========================================
 */

function calculateRating(
  rows: RatingRow[],
): {
  averageRating: number | null;
  votes: number;
} {
  if (
    rows.length === 0
  ) {
    return {
      averageRating:
        null,

      votes:
        0,
    };
  }

  const points =
    rows.reduce(
      (
        sum,
        row,
      ) => {
        return (
          sum +
          Number(
            row.rating,
          )
        );
      },
      0,
    );

  return {
    averageRating:
      roundToOne(
        points /
          rows.length,
      ),

    votes:
      rows.length,
  };
}

/*
 * ========================================
 * HLAVNÍ FUNKCE
 * ========================================
 */

export async function getPlayerAppStats(
  apfPlayerId: number,
): Promise<PlayerAppStats | null> {
  /*
   * ========================================
   * HRÁČ
   * ========================================
   */

  const {
    data: playerData,
    error: playerError,
  } =
    await supabase
      .from(
        "players",
      )
      .select(
        [
          "id",
          "club_id",
          "name",
          "number",
          "position",
          "apf_player_id",
        ].join(", "),
      )
      .eq(
        "apf_player_id",
        apfPlayerId,
      )
      .maybeSingle();

  if (
    playerError
  ) {
    console.error(
      "Nepodařilo se načíst hráče:",
      playerError,
    );

    return null;
  }

  if (
    !playerData
  ) {
    return null;
  }

  const player =
    playerData as unknown as PlayerRow;

  /*
   * ========================================
   * VŠECHNY DOKONČENÉ ZÁPASY KLUBU
   * ========================================
   */

  const {
    data: matchesData,
    error: matchesError,
  } =
    await supabase
      .from(
        "finished_matches",
      )
      .select(
        [
          "id",
          "club_id",
          "match_title",
          "team",
          "date",
          "score",
          "time",
          "location",
          "finished_at",
        ].join(", "),
      )
      .eq(
        "club_id",
        player.club_id,
      );

  if (
    matchesError
  ) {
    console.error(
      "Nepodařilo se načíst zápasy klubu:",
      matchesError,
    );

    return null;
  }

  const clubMatches =
    (
      matchesData ??
      []
    ) as unknown as FinishedMatchRow[];

  const clubMatchIds =
    clubMatches.map(
      (
        match,
      ) =>
        match.id,
    );

  /*
   * ========================================
   * DOCHÁZKA + OBDOBÍ
   * ========================================
   */

  const today =
    new Date()
      .toISOString()
      .slice(
        0,
        10,
      );

  const [
    presenceResponse,
    trainingsResponse,
    periodsResponse,
  ] =
    await Promise.all([
      supabase
        .from(
          "training_presence",
        )
        .select(
          "training_id, player_id, present",
        )
        .eq(
          "player_id",
          player.id,
        ),

      /*
       * Pouze již proběhlé tréninky.
       */

      supabase
        .from(
          "trainings",
        )
        .select(
          "id, club_id, date",
        )
        .eq(
          "club_id",
          player.club_id,
        )
        .lte(
          "date",
          today,
        ),

      supabase
        .from(
          "periods",
        )
        .select(
          [
            "id",
            "club_id",
            "start_date",
            "end_date",
            "is_active",
          ].join(", "),
        )
        .eq(
          "club_id",
          player.club_id,
        )
        .order(
          "start_date",
          {
            ascending:
              false,
          },
        ),
    ]);

  if (
    presenceResponse.error
  ) {
    console.error(
      "Nepodařilo se načíst docházku:",
      presenceResponse.error,
    );
  }

  if (
    trainingsResponse.error
  ) {
    console.error(
      "Nepodařilo se načíst tréninky:",
      trainingsResponse.error,
    );
  }

  if (
    periodsResponse.error
  ) {
    console.error(
      "Nepodařilo se načíst období:",
      periodsResponse.error,
    );
  }

  const presenceRows =
    (
      presenceResponse.data ??
      []
    ) as TrainingPresenceRow[];

  const trainingRows =
    (
      trainingsResponse.data ??
      []
    ) as TrainingRow[];

  const periods =
    (
      periodsResponse.data ??
      []
    ) as unknown as PeriodRow[];

  const activePeriod =
    periods.find(
      (
        period,
      ) =>
        period.is_active ===
        true,
    ) ??
    null;

  /*
   * ========================================
   * MAPA DOCHÁZKY HRÁČE
   * ========================================
   */

  const presenceByTrainingId =
    new Map<
      string,
      TrainingPresenceRow
    >();

  presenceRows.forEach(
    (
      row,
    ) => {
      presenceByTrainingId.set(
        row.training_id,
        row,
      );
    },
  );

  /*
   * ========================================
   * CELKOVÁ DOCHÁZKA
   * ========================================
   */

  const attendedTrainings =
    presenceRows.filter(
      (
        row,
      ) =>
        row.present ===
        true,
    ).length;

  const totalTrainings =
    trainingRows.length;

  const attendancePercentage =
    totalTrainings > 0
      ? Math.round(
          (
            attendedTrainings /
            totalTrainings
          ) *
            100,
        )
      : null;

  /*
   * ========================================
   * KLUB NEMÁ ŽÁDNÉ ZÁPASY
   * ========================================
   */

  if (
    clubMatchIds.length ===
    0
  ) {
    return {
      playerId:
        player.id,

      apfPlayerId:
        player.apf_player_id,

      name:
        player.name,

      number:
        player.number,

      position:
        player.position,

      matches: [],

      attendancePercentage,

      averageRating:
        null,

      ratingVotes:
        0,

      activePeriod:
        activePeriod
          ? {
              id:
                activePeriod.id,

              startDate:
                activePeriod.start_date,

              endDate:
                activePeriod.end_date,

              averageRating:
                null,

              ratingVotes:
                0,

              assists:
                0,

              matches:
                0,
            }
          : null,

      seasons: [],

      totals: {
        matches:
          0,

        goals:
          0,

        assists:
          0,

        yellowCards:
          0,

        redCards:
          0,
      },
    };
  }

  /*
   * ========================================
   * STATISTIKY TOHOTO HRÁČE
   * ========================================
   *
   * DŮLEŽITÉ:
   * Netaháme už všechny řádky celého klubu.
   * Supabase má standardně limit počtu vrácených
   * řádků a u tisíců statistik/hodnocení se nám
   * proto ztrácely hlavně některé novější známky.
   *
   * Bereme:
   * 1) řádky přímo přes player_id
   * 2) starší řádky bez player_id přes číslo hráče
   * ========================================
   */

  const {
    data: statsData,
    error: statsError,
  } =
    await supabase
      .from(
        "finished_match_player_stats",
      )
      .select(
        [
          "finished_match_id",
          "player_number",
          "player_id",
          "goals",
          "assists",
          "yellow_cards",
          "red_cards",
        ].join(", "),
      )
      .in(
        "finished_match_id",
        clubMatchIds,
      )
      .or(
        [
          `player_id.eq.${player.id}`,
          `and(player_id.is.null,player_number.eq.${player.number})`,
        ].join(","),
      );

  if (
    statsError
  ) {
    console.error(
      "Nepodařilo se načíst statistiky hráče:",
      statsError,
    );

    return null;
  }

  const playerStats =
    (
      statsData ??
      []
    ) as unknown as PlayerMatchStatRow[];

  /*
   * ========================================
   * HODNOCENÍ POUZE PRO ZÁPASY HRÁČE
   * ========================================
   *
   * Tohle je hlavní oprava chybějících známek.
   * Předtím web načítal hodnocení všech hráčů
   * ze všech zápasů klubu najednou. U většího
   * množství řádků Supabase výsledek ořízl.
   *
   * Teď načteme pouze zápasy, ve kterých tento
   * hráč skutečně má statistický řádek.
   * ========================================
   */

  const playerMatchIds =
    Array.from(
      new Set(
        playerStats.map(
          (
            stat,
          ) =>
            stat.finished_match_id,
        ),
      ),
    );

  const historicalNumbers =
    Array.from(
      new Set(
        playerStats.map(
          (
            stat,
          ) =>
            Number(
              stat.player_number,
            ),
        ),
      ),
    ).filter(
      (
        number,
      ) =>
        Number.isFinite(
          number,
        ),
    );

  let allRatings:
    RatingRow[] = [];

  if (
    playerMatchIds.length >
    0
  ) {
    const ratingFilters = [
      `player_id.eq.${player.id}`,
      ...historicalNumbers.map(
        (
          number,
        ) =>
          `player_number.eq.${number}`,
      ),
    ];

    const {
      data: ratingsData,
      error: ratingsError,
    } =
      await supabase
        .from(
          "match_player_ratings",
        )
        .select(
          [
            "finished_match_id",
            "player_number",
            "player_id",
            "rating",
          ].join(", "),
        )
        .in(
          "finished_match_id",
          playerMatchIds,
        )
        .or(
          ratingFilters.join(
            ",",
          ),
        );

    if (
      ratingsError
    ) {
      console.error(
        "Nepodařilo se načíst hodnocení hráče:",
        ratingsError,
      );
    }

    allRatings =
      (
        ratingsData ??
        []
      ) as unknown as RatingRow[];
  }

  /*
   * ========================================
   * MAPA ZÁPASŮ
   * ========================================
   */

  const matchById =
    new Map<
      string,
      FinishedMatchRow
    >();

  clubMatches.forEach(
    (
      match,
    ) => {
      matchById.set(
        match.id,
        match,
      );
    },
  );

  /*
   * ========================================
   * STAT HRÁČE PRO ZÁPAS
   * ========================================
   */

  function getPlayerStatForMatch(
    matchId: string,
  ): PlayerMatchStatRow | null {
    return (
      playerStats.find(
        (
          stat,
        ) =>
          stat.finished_match_id ===
          matchId,
      ) ??
      null
    );
  }

  /*
   * ========================================
   * ZNÁMKY HRÁČE PRO ZÁPAS
   * ========================================
   */

  function getRatingsForMatch(
    matchId: string,
  ): RatingRow[] {
    const stat =
      getPlayerStatForMatch(
        matchId,
      );

    if (
      !stat
    ) {
      return [];
    }

    return allRatings.filter(
      (
        rating,
      ) => {
        if (
          rating.finished_match_id !==
          matchId
        ) {
          return false;
        }

        const samePlayerId =
          rating.player_id ===
          player.id;

        const sameHistoricalNumber =
          Number(
            rating.player_number,
          ) ===
          Number(
            stat.player_number,
          );

        return (
          samePlayerId ||
          sameHistoricalNumber
        );
      },
    );
  }

  /*
   * ========================================
   * POSLEDNÍ ZÁPASY
   * ========================================
   */

  const playerMatches:
    PlayerAppMatch[] =
    playerStats
      .map(
        (
          stat,
        ): PlayerAppMatch | null => {
          const match =
            matchById.get(
              stat.finished_match_id,
            );

          if (
            !match
          ) {
            return null;
          }

          const ratingRows =
            getRatingsForMatch(
              match.id,
            );

          const rating =
            calculateRating(
              ratingRows,
            );

          return {
            matchId:
              match.id,

            matchTitle:
              match.match_title,

            team:
              match.team,

            date:
              match.date,

            time:
              match.time,

            location:
              match.location,

            score:
              match.score,

            finishedAt:
              match.finished_at,

            goals:
              Number(
                stat.goals ??
                  0,
              ),

            assists:
              Number(
                stat.assists ??
                  0,
              ),

            yellowCards:
              Number(
                stat.yellow_cards ??
                  0,
              ),

            redCards:
              Number(
                stat.red_cards ??
                  0,
              ),

            averageRating:
              rating.averageRating,

            ratingVotes:
              rating.votes,

            isPlayerOfTheMatch:
              false,
          };
        },
      )
      .filter(
        (
          match,
        ): match is PlayerAppMatch =>
          match !== null,
      );

  playerMatches.sort(
    (
      a,
      b,
    ) => {
      const aDate =
        new Date(
          a.finishedAt ??
            a.date,
        ).getTime();

      const bDate =
        new Date(
          b.finishedAt ??
            b.date,
        ).getTime();

      return (
        bDate -
        aDate
      );
    },
  );

  /*
   * ========================================
   * KARIÉRNÍ ZNÁMKA
   * ========================================
   */

  const careerRatingRows =
    playerStats.flatMap(
      (
        stat,
      ) =>
        getRatingsForMatch(
          stat.finished_match_id,
        ),
    );

  const careerRating =
    calculateRating(
      careerRatingRows,
    );

  /*
   * ========================================
   * AKTIVNÍ OBDOBÍ
   * ========================================
   */

  const activeStats =
    activePeriod
      ? playerStats.filter(
          (
            stat,
          ) => {
            const match =
              matchById.get(
                stat.finished_match_id,
              );

            if (
              !match
            ) {
              return false;
            }

            return isDateInsidePeriod(
              match.date,
              activePeriod,
            );
          },
        )
      : [];

  const activeRatingRows =
    activeStats.flatMap(
      (
        stat,
      ) =>
        getRatingsForMatch(
          stat.finished_match_id,
        ),
    );

  const activeRating =
    calculateRating(
      activeRatingRows,
    );

  const activeAssists =
    activeStats.reduce(
      (
        sum,
        stat,
      ) => {
        return (
          sum +
          Number(
            stat.assists ??
              0,
          )
        );
      },
      0,
    );

  /*
   * ========================================
   * SEZÓNA PO SEZÓNĚ
   *
   * ZÁPASY
   * ASISTENCE
   * ZNÁMKY
   * DOCHÁZKA
   * ========================================
   */

  const seasonMap =
    new Map<
      string,
      {
        matches: number;
        assists: number;
        ratings: RatingRow[];
        attendedTrainings: number;
        totalTrainings: number;
      }
    >();

  /*
   * Nejdřív zápasy.
   */

  playerStats.forEach(
    (
      stat,
    ) => {
      const match =
        matchById.get(
          stat.finished_match_id,
        );

      if (
        !match
      ) {
        return;
      }

      const season =
        getSeasonFromDate(
          match.date,
        );

      if (
        !season
      ) {
        return;
      }

      const current =
        seasonMap.get(
          season,
        ) ?? {
          matches:
            0,

          assists:
            0,

          ratings:
            [],

          attendedTrainings:
            0,

          totalTrainings:
            0,
        };

      current.matches +=
        1;

      current.assists +=
        Number(
          stat.assists ??
            0,
        );

      current.ratings.push(
        ...getRatingsForMatch(
          stat.finished_match_id,
        ),
      );

      seasonMap.set(
        season,
        current,
      );
    },
  );

  /*
   * ========================================
   * TEĎ TRÉNINKY
   *
   * Každý proběhlý trénink zařadíme
   * do správné sezóny.
   * ========================================
   */

  trainingRows.forEach(
    (
      training,
    ) => {
      const season =
        getSeasonFromDate(
          training.date,
        );

      if (
        !season
      ) {
        return;
      }

      const current =
        seasonMap.get(
          season,
        ) ?? {
          matches:
            0,

          assists:
            0,

          ratings:
            [],

          attendedTrainings:
            0,

          totalTrainings:
            0,
        };

      /*
       * Každý proběhlý trénink
       * se počítá do jmenovatele.
       */

      current.totalTrainings +=
        1;

      const presence =
        presenceByTrainingId.get(
          training.id,
        );

      /*
       * Jen present = true
       * se počítá jako účast.
       */

      if (
        presence?.present ===
        true
      ) {
        current.attendedTrainings +=
          1;
      }

      seasonMap.set(
        season,
        current,
      );
    },
  );

  /*
   * ========================================
   * FINÁLNÍ SEZÓNNÍ DATA
   * ========================================
   */

  const seasons:
    PlayerAppSeasonStats[] =
    Array.from(
      seasonMap.entries(),
    )
      .map(
        ([
          season,
          data,
        ]) => {
          const rating =
            calculateRating(
              data.ratings,
            );

          const seasonAttendance =
            data.totalTrainings >
            0
              ? Math.round(
                  (
                    data.attendedTrainings /
                    data.totalTrainings
                  ) *
                    100,
                )
              : null;

          return {
            season,

            matches:
              data.matches,

            assists:
              data.assists,

            averageRating:
              rating.averageRating,

            ratingVotes:
              rating.votes,

            attendancePercentage:
              seasonAttendance,

            attendedTrainings:
              data.attendedTrainings,

            totalTrainings:
              data.totalTrainings,
          };
        },
      )
      .sort(
        (
          a,
          b,
        ) =>
          b.season.localeCompare(
            a.season,
          ),
      );

  /*
   * ========================================
   * CELKOVÉ STATISTIKY Z APLIKACE
   * ========================================
   */

  const totals =
    playerStats.reduce(
      (
        total,
        stat,
      ) => {
        total.matches +=
          1;

        total.goals +=
          Number(
            stat.goals ??
              0,
          );

        total.assists +=
          Number(
            stat.assists ??
              0,
          );

        total.yellowCards +=
          Number(
            stat.yellow_cards ??
              0,
          );

        total.redCards +=
          Number(
            stat.red_cards ??
              0,
          );

        return total;
      },
      {
        matches:
          0,

        goals:
          0,

        assists:
          0,

        yellowCards:
          0,

        redCards:
          0,
      },
    );

  /*
   * ========================================
   * KONTROLA
   * ========================================
   */

  console.log(
    `DATA WEB ${player.name}:`,
    {
      playerId:
        player.id,

      number:
        player.number,

      matchesFromApp:
        playerStats.length,

      ratingsLoaded:
        allRatings.length,

      latestMatches:
        playerMatches
          .slice(
            0,
            5,
          )
          .map(
            (
              match,
            ) => ({
              title:
                match.matchTitle,

              date:
                match.date,

              rating:
                match.averageRating,

              votes:
                match.ratingVotes,
            }),
          ),

      attendance:
        attendancePercentage,

      careerRating:
        careerRating.averageRating,

      careerVotes:
        careerRating.votes,

      activeRating:
        activeRating.averageRating,

      activeVotes:
        activeRating.votes,

      activeAssists,

      activePeriod:
        activePeriod
          ? `${activePeriod.start_date} → ${activePeriod.end_date}`
          : null,

      seasons,
    },
  );

  /*
   * ========================================
   * HOTOVO
   * ========================================
   */

  return {
    playerId:
      player.id,

    apfPlayerId:
      player.apf_player_id,

    name:
      player.name,

    number:
      player.number,

    position:
      player.position,

    matches:
      playerMatches,

    attendancePercentage,

    averageRating:
      careerRating.averageRating,

    ratingVotes:
      careerRating.votes,

    activePeriod:
      activePeriod
        ? {
            id:
              activePeriod.id,

            startDate:
              activePeriod.start_date,

            endDate:
              activePeriod.end_date,

            averageRating:
              activeRating.averageRating,

            ratingVotes:
              activeRating.votes,

            assists:
              activeAssists,

            matches:
              activeStats.length,
          }
        : null,

    seasons,

    totals,
  };
}