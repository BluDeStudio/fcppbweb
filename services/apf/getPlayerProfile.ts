import * as cheerio from "cheerio";

import type {
  PlayerProfile,
  PlayerSeasonHistory,
} from "@/types/player";

import {
  fetchApfPage,
} from "./fetchApfPage";

function clean(
  value: string,
): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(
  value:
    string |
    undefined,
): number {
  if (
    !value
  ) {
    return 0;
  }

  const parsed =
    Number(
      value.replace(
        /[^\d]/g,
        "",
      ),
    );

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0;
}

function unique(
  values:
    string[],
): string[] {
  return Array.from(
    new Set(
      values.filter(
        Boolean,
      ),
    ),
  );
}

function reverseSlug(
  value: string,
): string {
  const parts =
    value
      .split("-")
      .filter(Boolean);

  if (
    parts.length < 2
  ) {
    return value;
  }

  return [
    parts[
      parts.length - 1
    ],
    ...parts.slice(
      0,
      -1,
    ),
  ].join("-");
}

async function loadProfileHtml(
  playerId: number,
  apfSlug: string,
): Promise<{
  html: string;
  slug: string;
} | null> {
  /*
   * APF profil je identifikovaný především ID.
   * U nového hráče ale nemusíme mít slug ještě
   * zachycený v týmové soupisce.
   *
   * Proto zkusíme:
   * 1) dodaný slug
   * 2) obrácené pořadí jména
   * 3) obecný fallback
   */
  const candidates =
    unique([
      apfSlug,
      reverseSlug(
        apfSlug,
      ),
      "hrac",
    ]);

  for (
    const candidate
    of candidates
  ) {
    try {
      const html =
        await fetchApfPage(
          `/hrac/${playerId}/${candidate}`,
        );

      const $ =
        cheerio.load(
          html,
        );

      const name =
        clean(
          $("h1")
            .first()
            .text(),
        );

      /*
       * Pokud APF vrátil normální profil,
       * máme vyhráno.
       */
      if (
        name
      ) {
        return {
          html,
          slug:
            candidate,
        };
      }
    } catch (
      error
    ) {
      console.warn(
        `APF profil ${playerId}/${candidate} nebyl dostupný.`,
      );
    }
  }

  return null;
}

export async function getPlayerProfile(
  playerId: number,
  apfSlug: string,
): Promise<
  PlayerProfile | null
> {
  const loaded =
    await loadProfileHtml(
      playerId,
      apfSlug,
    );

  if (
    !loaded
  ) {
    return null;
  }

  const {
    html,
    slug:
      resolvedSlug,
  } =
    loaded;

  const $ =
    cheerio.load(
      html,
    );

  /*
   * ========================================
   * JMÉNO
   * ========================================
   */

  const name =
    clean(
      $("h1")
        .first()
        .text(),
    );

  if (
    !name
  ) {
    return null;
  }

  /*
   * ========================================
   * CELÝ TEXT PROFILU
   * ========================================
   */

  const bodyText =
    clean(
      $("body").text(),
    );

  /*
   * ========================================
   * VĚK
   * ========================================
   */

  let age:
    number | null =
      null;

  const ageMatch =
    bodyText.match(
      /Věk\s*:?\s*(\d+)\s*let/i,
    );

  if (
    ageMatch
  ) {
    age =
      Number(
        ageMatch[1],
      );
  }

  /*
   * ========================================
   * KARIÉRNÍ SOUČTY APF
   * ========================================
   */

  let careerSeasons =
    0;

  let careerMatches =
    0;

  let careerGoals =
    0;

  let careerAssists =
    0;

  const careerMatch =
    bodyText.match(
      /(\d+)\s*Sezóny\s*(\d+)\s*Zápasy\s*(\d+)\s*Góly\s*(\d+)\s*Asistence/i,
    );

  if (
    careerMatch
  ) {
    careerSeasons =
      parseNumber(
        careerMatch[1],
      );

    careerMatches =
      parseNumber(
        careerMatch[2],
      );

    careerGoals =
      parseNumber(
        careerMatch[3],
      );

    careerAssists =
      parseNumber(
        careerMatch[4],
      );
  }

  /*
   * ========================================
   * HISTORIE SEZÓN
   * ========================================
   */

  const seasons:
    PlayerSeasonHistory[] =
      [];

  const seasonRegex =
    /(20\d{2})-(20\d{2})\s*Zápasy:\s*(\d+)\s*Góly:\s*(\d+)\s*AS:\s*(\d+)\s*ŽK:\s*(\d+)\s*ČK:\s*(\d+)/gi;

  let match:
    RegExpExecArray |
    null;

  while (
    (
      match =
        seasonRegex.exec(
          bodyText,
        )
    ) !==
    null
  ) {
    const startYear =
      match[1];

    const endYear =
      match[2];

    const season =
      `${startYear.slice(
        2,
      )}/${endYear.slice(
        2,
      )}`;

    seasons.push({
      season,

      team:
        "FC PPB",

      matches:
        parseNumber(
          match[3],
        ),

      goals:
        parseNumber(
          match[4],
        ),

      assists:
        parseNumber(
          match[5],
        ),

      yellowCards:
        parseNumber(
          match[6],
        ),

      redCards:
        parseNumber(
          match[7],
        ),

      rating:
        null,

      attendance:
        null,
    });
  }

  seasons.sort(
    (
      a,
      b,
    ) =>
      getSeasonStartYear(
        b.season,
      ) -
      getSeasonStartYear(
        a.season,
      ),
  );

  /*
   * ========================================
   * FALLBACK KARIÉRY
   * ========================================
   */

  if (
    careerMatches ===
      0 &&
    seasons.length >
      0
  ) {
    careerSeasons =
      seasons.length;

    careerMatches =
      seasons.reduce(
        (
          sum,
          season,
        ) =>
          sum +
          season.matches,
        0,
      );

    careerGoals =
      seasons.reduce(
        (
          sum,
          season,
        ) =>
          sum +
          season.goals,
        0,
      );

    careerAssists =
      seasons.reduce(
        (
          sum,
          season,
        ) =>
          sum +
          season.assists,
        0,
      );
  }

  return {
    id:
      playerId,

    name,

    age,

    apfSlug:
      resolvedSlug,

    career: {
      seasons:
        careerSeasons,

      matches:
        careerMatches,

      goals:
        careerGoals,

      assists:
        careerAssists,
    },

    seasons,
  };
}

function getSeasonStartYear(
  season: string,
): number {
  const match =
    season.match(
      /(\d{2})\/(\d{2})/,
    );

  if (
    !match
  ) {
    return 0;
  }

  return (
    2000 +
    Number(
      match[1],
    )
  );
}
