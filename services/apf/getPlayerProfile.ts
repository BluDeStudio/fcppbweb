import * as cheerio from "cheerio";

import type {
  PlayerProfile,
  PlayerSeasonHistory,
} from "@/types/player";

import { fetchApfPage } from "./fetchApfPage";

function clean(
  value: string,
): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(
  value: string | undefined,
): number {
  if (!value) {
    return 0;
  }

  const parsed =
    Number(
      value.replace(
        /[^\d]/g,
        "",
      ),
    );

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

export async function getPlayerProfile(
  playerId: number,
  apfSlug: string,
): Promise<PlayerProfile | null> {
  const html =
    await fetchApfPage(
      `/hrac/${playerId}/${apfSlug}`,
    );

  const $ =
    cheerio.load(html);

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

  if (!name) {
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

  if (ageMatch) {
    age =
      Number(
        ageMatch[1],
      );
  }

  /*
   * ========================================
   * KARIÉRNÍ SOUČTY APF
   * ========================================
   *
   * APF například:
   *
   * 8
   * Sezóny
   * 105
   * Zápasy
   * 64
   * Góly
   * 8
   * Asistence
   */

  let careerSeasons = 0;
  let careerMatches = 0;
  let careerGoals = 0;
  let careerAssists = 0;

  const careerMatch =
    bodyText.match(
      /(\d+)\s*Sezóny\s*(\d+)\s*Zápasy\s*(\d+)\s*Góly\s*(\d+)\s*Asistence/i,
    );

  if (careerMatch) {
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
   *
   * APF například:
   *
   * 2014-2015
   * Zápasy: 14
   * Góly: 15
   * AS: 0
   * ŽK: 1
   * ČK: 0
   *
   * 2015-2016
   * Zápasy: 13
   * Góly: 10
   * ...
   */

  const seasons:
    PlayerSeasonHistory[] = [];

  const seasonRegex =
    /(20\d{2})-(20\d{2})\s*Zápasy:\s*(\d+)\s*Góly:\s*(\d+)\s*AS:\s*(\d+)\s*ŽK:\s*(\d+)\s*ČK:\s*(\d+)/gi;

  let match:
    RegExpExecArray | null;

  while (
    (
      match =
        seasonRegex.exec(
          bodyText,
        )
    ) !== null
  ) {
    const startYear =
      match[1];

    const endYear =
      match[2];

    const season =
      `${startYear.slice(2)}/${endYear.slice(2)}`;

    const team =
      "FC PPB";

    seasons.push({
      season,

      team,

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

      /*
       * Doplníme později
       * ze Supabase.
       */
      rating: null,

      attendance: null,
    });
  }

  /*
   * ========================================
   * ŘAZENÍ SEZÓN
   * ========================================
   *
   * Nejnovější nahoře.
   */

  seasons.sort(
    (a, b) =>
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
   *
   * Kdyby APF někdy odstranilo horní
   * kariérní čítače, spočítáme je
   * ze sezon.
   */

  if (
    careerMatches === 0 &&
    seasons.length > 0
  ) {
    careerSeasons =
      seasons.length;

    careerMatches =
      seasons.reduce(
        (sum, season) =>
          sum +
          season.matches,
        0,
      );

    careerGoals =
      seasons.reduce(
        (sum, season) =>
          sum +
          season.goals,
        0,
      );

    careerAssists =
      seasons.reduce(
        (sum, season) =>
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

    apfSlug,

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

/*
 * ========================================
 * POMOCNÉ FUNKCE
 * ========================================
 */

function getSeasonStartYear(
  season: string,
): number {
  const match =
    season.match(
      /(\d{2})\/(\d{2})/,
    );

  if (!match) {
    return 0;
  }

  return 2000 +
    Number(
      match[1],
    );
}

/*
 * Tohle zatím označuje starší sezony
 * obecně.
 *
 * A/B rozdělení historických statistik
 * uděláme přesněji samostatným parserem,
 * protože hlavní APF profil sezonu
 * agreguje dohromady.
 */

function getSeasonTeam(
  startYear: number,
): string {
  if (
    startYear >= 2022
  ) {
    return "FC PPB";
  }

  return "Před FC PPB";
}