import * as cheerio from "cheerio";

import {
  getPlayerMeta,
} from "@/data/playerMeta";

import type {
  SquadPlayer,
} from "@/types/player";

import { fetchApfPage } from "./fetchApfPage";

type SquadConfig = {
  teamId: number;
  teamSlug: string;

  team: "a" | "b";
};

function clean(
  value: string,
): string {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

function numberFromCell(
  value: string,
): number {
  const cleaned =
    clean(value).replace(
      /[^\d]/g,
      "",
    );

  return Number(cleaned) || 0;
}

function normalizeHeader(
  value: string,
): string {
  return clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    );
}

export async function getSquad({
  teamId,
  teamSlug,
  team,
}: SquadConfig): Promise<
  SquadPlayer[]
> {
  const html =
    await fetchApfPage(
      `/tym/${teamId}/${teamSlug}`,
    );

  const $ =
    cheerio.load(html);

  const players:
    SquadPlayer[] = [];

  let squadTable: ReturnType<
    typeof $
  > | null = null;

  $("table").each(
    (_, tableElement) => {
      if (squadTable) {
        return;
      }

      const table =
        $(tableElement);

      const header =
        normalizeHeader(
          table
            .find("thead")
            .text(),
        );

      const firstRow =
        normalizeHeader(
          table
            .find("tr")
            .first()
            .text(),
        );

      const headerText =
        `${header} ${firstRow}`;

      const isPlayerTable =
        headerText.includes(
          "jmeno hrace",
        ) &&
        headerText.includes(
          "utkani",
        ) &&
        headerText.includes(
          "goly",
        );

      if (isPlayerTable) {
        squadTable = table;
      }
    },
  );

  if (!squadTable) {
    return [];
  }

  const table = squadTable as ReturnType<
    typeof $
  >;

  const headerCells =
    table
      .find("thead th")
      .toArray()
      .map(
        (cell) =>
          normalizeHeader(
            $(cell).text(),
          ),
      );

  const findColumn = (
    candidates: string[],
    fallback: number,
  ): number => {
    const index =
      headerCells.findIndex(
        (header) =>
          candidates.some(
            (candidate) =>
              header === candidate ||
              header.includes(
                candidate,
              ),
          ),
      );

    return index >= 0
      ? index
      : fallback;
  };

  const matchesIndex =
    findColumn(
      [
        "utkani",
        "zapasy",
      ],
      2,
    );

  const goalsIndex =
    findColumn(
      [
        "goly",
        "gol",
      ],
      3,
    );

  const assistsIndex =
    findColumn(
      [
        "asistence",
        "asist",
      ],
      4,
    );

  const yellowCardsIndex =
    findColumn(
      [
        "zk",
        "zlute karty",
        "zluta karta",
      ],
      5,
    );

  const redCardsIndex =
    findColumn(
      [
        "ck",
        "cervene karty",
        "cervena karta",
      ],
      6,
    );

  table
    .find("tbody tr")
    .each(
      (_, rowElement) => {
        const row =
          $(rowElement);

        const cells =
          row.find("td");

        if (
          cells.length < 4
        ) {
          return;
        }

        const link =
          row
            .find(
              'a[href^="/hrac/"]',
            )
            .first();

        const href =
          link.attr("href");

        if (!href) {
          return;
        }

        const playerMatch =
          href.match(
            /\/hrac\/(\d+)\/([^/?#]+)/,
          );

        if (!playerMatch) {
          return;
        }

        const id =
          Number(
            playerMatch[1],
          );

        const apfSlug =
          playerMatch[2];

        const name =
          clean(
            link.text(),
          );

        if (!name) {
          return;
        }

        const matches =
          numberFromCell(
            $(
              cells[
                matchesIndex
              ],
            ).text(),
          );

        const goals =
          numberFromCell(
            $(
              cells[
                goalsIndex
              ],
            ).text(),
          );

        const assists =
          cells.length >
          assistsIndex
            ? numberFromCell(
                $(
                  cells[
                    assistsIndex
                  ],
                ).text(),
              )
            : 0;

        const yellowCards =
          cells.length >
          yellowCardsIndex
            ? numberFromCell(
                $(
                  cells[
                    yellowCardsIndex
                  ],
                ).text(),
              )
            : 0;

        const redCards =
          cells.length >
          redCardsIndex
            ? numberFromCell(
                $(
                  cells[
                    redCardsIndex
                  ],
                ).text(),
              )
            : 0;

        if (matches < 1) {
          return;
        }

        const exists =
          players.some(
            (player) =>
              player.id === id,
          );

        if (exists) {
          return;
        }

        const rowText =
          clean(
            row.text(),
          ).toLowerCase();

        const apfSaysLoan =
          rowText.includes(
            "host",
          );

        const meta =
          getPlayerMeta(id);

        players.push({
          id,

          name,

          matches,

          goals,

          assists,

          yellowCards,

          redCards,

          profileUrl:
            `/hrac/${id}`,

          imageUrl:
            `/images/${id}.jpg`,

          position:
            meta.position,

          team:
            meta.team,

          status:
            apfSaysLoan ||
            meta.status === "loan"
              ? "loan"
              : "club",

          shirtNumber:
            meta.shirtNumber,

          apfSlug,
        });
      },
    );

  players.sort(
    (a, b) => {
      if (
        a.position !==
        b.position
      ) {
        return a.position ===
          "goalkeeper"
          ? -1
          : 1;
      }

      return a.name.localeCompare(
        b.name,
        "cs",
      );
    },
  );

  return players;
}
