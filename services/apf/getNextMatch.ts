import * as cheerio from "cheerio";

import type { NextMatch } from "@/types/nextMatch";

import { fetchApfPage } from "./fetchApfPage";

type NextMatchConfig = {
  competitionId: number;
  competitionSlug: string;
  teamName: string;
};

type ParsedScheduleDate = {
  date: string;
  time: string;
  dateTimeIso: string | null;
  timestamp: number | null;
};

type NextMatchCandidate = {
  match: NextMatch;
  timestamp: number | null;
};

function clean(
  value: string,
): string {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * ============================================================
 * APF TEAM ID
 * ============================================================
 */

function getTeamIdFromHref(
  href: string | undefined,
): number | null {
  if (!href) {
    return null;
  }

  const match =
    href.match(
      /\/tym\/(\d+)(?:\/|$)/,
    );

  if (!match) {
    return null;
  }

  const id =
    Number(
      match[1],
    );

  return Number.isFinite(id)
    ? id
    : null;
}

/*
 * ============================================================
 * DATUM + ČAS Z APF
 * ============================================================
 *
 * Umíme například:
 *
 * 20.9. 13:00
 * 20. 9. 13:00
 * 20.9.2026 13:00
 * 20. 9. 2026 13:00
 *
 * APF často rok nezobrazuje.
 * V takovém případě ho dopočítáme.
 * ============================================================
 */

function parseScheduleDate(
  dateText: string,
  otherCellText: string,
): ParsedScheduleDate {
  const raw =
    clean(dateText);

  const match =
    raw.match(
      /(\d{1,2})\.\s*(\d{1,2})\.(?:\s*(\d{4}))?(?:\s+(\d{1,2}):(\d{2}))?/,
    );

  if (!match) {
    return {
      date: raw,
      time:
        extractTime(
          otherCellText,
        ),
      dateTimeIso:
        null,
      timestamp:
        null,
    };
  }

  const day =
    Number(
      match[1],
    );

  const month =
    Number(
      match[2],
    );

  const explicitYear =
    match[3]
      ? Number(match[3])
      : null;

  const timeFromDate =
    match[4] && match[5]
      ? {
          hour:
            Number(
              match[4],
            ),

          minute:
            Number(
              match[5],
            ),
        }
      : null;

  const otherTime =
    parseTime(
      otherCellText,
    );

  const hour =
    timeFromDate?.hour ??
    otherTime?.hour ??
    0;

  const minute =
    timeFromDate?.minute ??
    otherTime?.minute ??
    0;

  const now =
    new Date();

  let year =
    explicitYear ??
    now.getFullYear();

  /*
   * Pokud APF rok neukazuje a jsme například v prosinci,
   * zatímco další zápas je v lednu, jde už o další rok.
   */

  if (
    explicitYear === null
  ) {
    const provisional =
      new Date(
        year,
        month - 1,
        day,
        hour,
        minute,
      );

    const sixtyDays =
      60 *
      24 *
      60 *
      60 *
      1000;

    if (
      provisional.getTime() <
      now.getTime() -
        sixtyDays
    ) {
      year += 1;
    }
  }

  const timestamp =
    new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      0,
      0,
    ).getTime();

  if (
    !Number.isFinite(
      timestamp,
    )
  ) {
    return {
      date: raw,
      time:
        formatTime(
          hour,
          minute,
        ),
      dateTimeIso:
        null,
      timestamp:
        null,
    };
  }

  const date =
    `${pad(day)}. ${pad(month)}. ${year}`;

  const time =
    formatTime(
      hour,
      minute,
    );

  /*
   * Bez timezone offsetu.
   *
   * Browser návštěvníka jej interpretuje jako lokální čas,
   * což je pro český web a časy APF žádoucí.
   */

  const dateTimeIso =
    `${year}-${pad(month)}-${pad(day)}` +
    `T${pad(hour)}:${pad(minute)}:00`;

  return {
    date,
    time,
    dateTimeIso,
    timestamp,
  };
}

function parseTime(
  value: string,
): {
  hour: number;
  minute: number;
} | null {
  const match =
    clean(value).match(
      /(\d{1,2}):(\d{2})/,
    );

  if (!match) {
    return null;
  }

  const hour =
    Number(
      match[1],
    );

  const minute =
    Number(
      match[2],
    );

  if (
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return {
    hour,
    minute,
  };
}

function extractTime(
  value: string,
): string {
  const time =
    parseTime(value);

  if (!time) {
    return "";
  }

  return formatTime(
    time.hour,
    time.minute,
  );
}

function formatTime(
  hour: number,
  minute: number,
): string {
  return `${pad(hour)}:${pad(minute)}`;
}

function pad(
  value: number,
): string {
  return String(value)
    .padStart(
      2,
      "0",
    );
}

/*
 * ============================================================
 * NÁSLEDUJÍCÍ ZÁPAS
 * ============================================================
 */

export async function getNextMatch({
  competitionId,
  competitionSlug,
  teamName,
}: NextMatchConfig): Promise<NextMatch | null> {
  /*
   * Používáme rozpis soutěže.
   */

  const path =
    `/soutez/${competitionId}` +
    `/${competitionSlug}/rozpis`;

  const html =
    await fetchApfPage(path);

  const $ =
    cheerio.load(html);

  const candidates:
    NextMatchCandidate[] = [];

  $("tr").each(
    (_, rowElement) => {
      const row =
        $(rowElement);

      const text =
        clean(
          row.text(),
        );

      if (
        !text
          .toLowerCase()
          .includes(
            teamName.toLowerCase(),
          )
      ) {
        return;
      }

      const cells =
        row.find("td");

      if (
        cells.length < 4
      ) {
        return;
      }

      const homeCell =
        $(cells[1]);

      const scoreCell =
        $(cells[2]);

      const awayCell =
        $(cells[3]);

      const homeTeam =
        clean(
          homeCell.text(),
        );

      const awayTeam =
        clean(
          awayCell.text(),
        );

      const normalizedTeam =
        teamName.toLowerCase();

      const isOurMatch =
        homeTeam.toLowerCase() ===
          normalizedTeam ||
        awayTeam.toLowerCase() ===
          normalizedTeam;

      if (!isOurMatch) {
        return;
      }

      const scoreText =
        clean(
          scoreCell.text(),
        );

      /*
       * Pokud už je ve středním sloupci výsledek,
       * zápas je odehraný.
       */

      if (
        /\d+\s*:\s*\d+/.test(
          scoreText,
        )
      ) {
        return;
      }

      const dateText =
        clean(
          $(cells[0]).text(),
        );

      const parsedDate =
        parseScheduleDate(
          dateText,
          scoreText,
        );

      const homeTeamHref =
        homeCell
          .find(
            'a[href*="/tym/"]',
          )
          .first()
          .attr("href");

      const awayTeamHref =
        awayCell
          .find(
            'a[href*="/tym/"]',
          )
          .first()
          .attr("href");

      const homeTeamId =
        getTeamIdFromHref(
          homeTeamHref,
        );

      const awayTeamId =
        getTeamIdFromHref(
          awayTeamHref,
        );

      candidates.push({
        timestamp:
          parsedDate.timestamp,

        match: {
          day: "",

          date:
            parsedDate.date,

          time:
            parsedDate.time,

          dateTimeIso:
            parsedDate.dateTimeIso,

          venue: "",

          homeTeam,
          awayTeam,

          homeTeamId,
          awayTeamId,

          competition:
            competitionSlug,
        },
      });
    },
  );

  if (
    candidates.length === 0
  ) {
    return null;
  }

  const now =
    Date.now();

  /*
   * Nejprve skutečné budoucí zápasy.
   */

  const future =
    candidates
      .filter(
        (candidate) =>
          candidate.timestamp !==
            null &&
          candidate.timestamp >
            now,
      )
      .sort(
        (a, b) =>
          (a.timestamp ?? 0) -
          (b.timestamp ?? 0),
      );

  if (
    future.length > 0
  ) {
    return future[0].match;
  }

  /*
   * Nouzový fallback pro případ,
   * že APF neposkytne parsovatelné datum.
   */

  return (
    candidates.find(
      (candidate) =>
        candidate.timestamp ===
        null,
    )?.match ??
    null
  );
}