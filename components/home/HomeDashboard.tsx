"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { LeagueRow } from "@/types/league";
import type { MatchResult } from "@/types/match";
import type { NextMatch } from "@/types/nextMatch";
import type { SquadPlayer } from "@/types/player";
import type { ClubTransfer } from "@/types/transfer";

import styles from "./HomeDashboard.module.css";

export type PlayerOfMatch = {
  id: number;
  name: string;
  goals: number;
  assists: number;
  rating: number | null;
  ratingVotes: number;
  matchId: string;
  matchTitle: string;
  matchDate: string;
};

type Props = {
  aNextMatch: NextMatch | null;
  bNextMatch: NextMatch | null;
  aMatches: MatchResult[];
  bMatches: MatchResult[];
  aLeagueTable: LeagueRow[];
  bLeagueTable: LeagueRow[];
  aPlayers: SquadPlayer[];
  bPlayers: SquadPlayer[];
  aPlayerOfMatch: PlayerOfMatch | null;
  bPlayerOfMatch: PlayerOfMatch | null;
  transfers: ClubTransfer[];
};

type Team = "a" | "b";

const PNG_PLAYER_IDS =
  new Set([
    532,
    997,
    1562,
    3937,
  ]);

const TIKTOK_URL =
  "https://www.tiktok.com/@fcppbfutsal";

const INSTAGRAM_URL =
  "https://www.instagram.com/fcppb_futsl/";

export function HomeDashboard(
  props: Props,
) {
  const [
    team,
    setTeam,
  ] =
    useState<Team>(
      "a",
    );

  const nextMatch =
    team === "a"
      ? props.aNextMatch
      : props.bNextMatch;

  const matches =
    team === "a"
      ? props.aMatches
      : props.bMatches;

  const table =
    team === "a"
      ? props.aLeagueTable
      : props.bLeagueTable;

  const players =
    team === "a"
      ? props.aPlayers
      : props.bPlayers;

  const playerOfMatch =
    team === "a"
      ? props.aPlayerOfMatch
      : props.bPlayerOfMatch;

  const competition =
    team === "a"
      ? "1.B TŘÍDA"
      : "2.B TŘÍDA";

  const latestMatch =
    matches[0] ??
    null;

  const miniTable =
    useMemo(
      () =>
        aroundOurTeam(
          table,
          5,
        ),
      [
        table,
      ],
    );

  const pngPlayers =
    useMemo(
      () =>
        players.filter(
          (
            player,
          ) =>
            PNG_PLAYER_IDS.has(
              player.id,
            ),
        ),
      [
        players,
      ],
    );

  return (
    <div
      className={
        styles.page
      }
    >
      <div
        className={
          styles.shell
        }
      >
        <div
          className={
            styles.topGrid
          }
        >
          <main
            className={
              styles.main
            }
          >
            <HeroSlider
              transfers={
                props.transfers
              }
            />

            <NextMatchWide
              match={
                nextMatch
              }
              table={
                table
              }
              competition={
                competition
              }
            />
          </main>

          <aside
            className={
              styles.sidebar
            }
          >
            <LastMatchCard
              match={
                latestMatch
              }
              team={
                team
              }
              setTeam={
                setTeam
              }
            />

            <MiniTable
              rows={
                miniTable
              }
              competition={
                competition
              }
            />

            <PlayerOfMatchCard
              player={
                playerOfMatch
              }
            />

            <PartnersWidget />
          </aside>
        </div>

        <div
          className={
            styles.mobileTeamSwitch
          }
        >
          <TeamToggle
            team={
              team
            }
            setTeam={
              setTeam
            }
          />
        </div>

        <section
          className={
            styles.lowerGrid
          }
        >
          <TeamsEntry
            players={
              pngPlayers
            }
            team={
              team
            }
            setTeam={
              setTeam
            }
          />

          <MatchesEntry
            nextMatch={
              nextMatch
            }
            lastMatch={
              latestMatch
            }
            competition={
              competition
            }
          />
        </section>

        <SocialStrip />
      </div>
    </div>
  );
}

function HeroSlider({
  transfers,
}: {
  transfers:
    ClubTransfer[];
}) {
  const slides =
    transfers.slice(
      0,
      3,
    );

  const [
    active,
    setActive,
  ] =
    useState(0);

  useEffect(
    () => {
      if (
        slides.length <=
        1
      ) {
        return;
      }

      const timer =
        window.setInterval(
          () => {
            setActive(
              (
                current,
              ) =>
                (
                  current +
                  1
                ) %
                slides.length,
            );
          },
          6500,
        );

      return () =>
        window.clearInterval(
          timer,
        );
    },
    [
      slides.length,
    ],
  );

  if (
    slides.length ===
    0
  ) {
    return (
      <section
        className={
          styles.hero
        }
      >
        <div
          className={
            styles.heroFallback
          }
        />

        <div
          className={
            styles.heroShade
          }
        />

        <div
          className={
            styles.heroCopy
          }
        >
          <span>
            FC PPB
          </span>

          <h1>
            PŘÁTELSTVÍ.
            <br />
            POKORA.
            <br />
            BOJOVNOST.
          </h1>

          <p>
            Spojuje nás víc
            než hra.
          </p>

          <Link
            href="/klub"
            className={
              styles.heroButton
            }
          >
            POZNAT KLUB
            <b>
              →
            </b>
          </Link>
        </div>
      </section>
    );
  }

  const transfer =
    slides[
      active
    ];

  return (
    <section
      className={
        styles.hero
      }
    >
      {slides.map(
        (
          item,
          index,
        ) => (
          <img
            key={
              item.id
            }
            src={
              getTransferImage(
                item,
              )
            }
            alt={
              item.playerName
            }
            className={`${styles.heroImage} ${
              index ===
              active
                ? styles.heroImageActive
                : ""
            }`}
          />
        ),
      )}

      <div
        className={
          styles.heroShade
        }
      />

      <div
        className={
          styles.heroNoise
        }
        aria-hidden="true"
      />

      <button
        type="button"
        className={`${styles.heroArrow} ${styles.heroArrowLeft}`}
        onClick={() =>
          setActive(
            (
              active -
              1 +
              slides.length
            ) %
              slides.length,
          )
        }
        aria-label="Předchozí článek"
      >
        ‹
      </button>

      <button
        type="button"
        className={`${styles.heroArrow} ${styles.heroArrowRight}`}
        onClick={() =>
          setActive(
            (
              active +
              1
            ) %
              slides.length,
          )
        }
        aria-label="Další článek"
      >
        ›
      </button>

      <div
        className={
          styles.heroCopy
        }
      >
        <span>
          AKTUALITY
        </span>

        <h1>
          {transfer.direction ===
          "arrival"
            ? "NOVÁ TVÁŘ V FC PPB"
            : "ZMĚNA V KÁDRU"}
        </h1>

        <p>
          {transfer.playerName}
          {" · "}
          {movementLabel(
            transfer,
          )}
          {transfer.otherClub
            ? ` · ${transfer.otherClub}`
            : ""}
        </p>

        <Link
          href="/prestupy"
          className={
            styles.heroButton
          }
        >
          ČÍST VÍCE
          <b>
            →
          </b>
        </Link>
      </div>

      <div
        className={
          styles.heroPager
        }
      >
        <strong>
          {String(
            active +
              1,
          ).padStart(
            2,
            "0",
          )}
        </strong>

        <span>
          /
        </span>

        <b>
          {String(
            slides.length,
          ).padStart(
            2,
            "0",
          )}
        </b>

        <div
          className={
            styles.heroDots
          }
        >
          {slides.map(
            (
              item,
              index,
            ) => (
              <button
                key={
                  item.id
                }
                type="button"
                aria-label={`Článek ${index + 1}`}
                className={
                  index ===
                  active
                    ? styles.heroDotActive
                    : ""
                }
                onClick={() =>
                  setActive(
                    index,
                  )
                }
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function NextMatchWide({
  match,
  table,
  competition,
}: {
  match:
    NextMatch |
    null;

  table:
    LeagueRow[];

  competition:
    string;
}) {
  const home =
    match
      ? findTeamRow(
          table,
          match.homeTeam,
        )
      : null;

  const away =
    match
      ? findTeamRow(
          table,
          match.awayTeam,
        )
      : null;

  const round =
    getRoundLabel(
      match,
    );

  return (
    <section
      className={
        styles.nextMatch
      }
    >
      <div
        className={
          styles.nextMatchTitle
        }
      >
        <h2>
          DALŠÍ ZÁPAS
        </h2>

        <span>
          {competition}
          {round
            ? ` / ${round}`
            : ""}
        </span>
      </div>

      {match ? (
        <div
          className={
            styles.nextMatchBody
          }
        >
          <MatchTeamWide
            name={
              match.homeTeam
            }
            row={
              home
            }
          />

          <div
            className={
              styles.nextMatchCenter
            }
          >
            <div
              className={
                styles.nextMatchMeta
              }
            >
              <strong>
                {match.date ||
                  "—"}
              </strong>

              <b>
                {match.time ||
                  "—"}
              </b>

              <span>
                {match.venue ||
                  ""}
              </span>
            </div>

            <div
              className={
                styles.bigVs
              }
            >
              VS
            </div>

            <Link
              href="/zapasy"
              className={
                styles.detailLink
              }
            >
              DETAIL ZÁPASU
              <span>
                →
              </span>
            </Link>
          </div>

          <MatchTeamWide
            name={
              match.awayTeam
            }
            row={
              away
            }
          />
        </div>
      ) : (
        <div
          className={
            styles.noData
          }
        >
          Další zápas
          zatím není
          v rozpisu APF.
        </div>
      )}
    </section>
  );
}

function MatchTeamWide({
  name,
  row,
}: {
  name:
    string;

  row:
    LeagueRow |
    null;
}) {
  return (
    <div
      className={
        styles.matchTeamWide
      }
    >
      <TeamMark
        name={
          name
        }
        large
      />

      <div
        className={
          styles.matchTeamInfo
        }
      >
        <h3>
          {name}
        </h3>

        <div
          className={
            styles.teamLeagueStats
          }
        >
          <span>
            <b>
              {row
                ? `${row.position}.`
                : "—"}
            </b>
            MÍSTO
          </span>

          <span>
            <b>
              {row?.points ??
                "—"}
            </b>
            BODY
          </span>

          <span>
            <b>
              {row?.score ??
                "—"}
            </b>
            SKÓRE
          </span>
        </div>
      </div>
    </div>
  );
}

function LastMatchCard({
  match,
  team,
  setTeam,
}: {
  match:
    MatchResult |
    null;

  team:
    Team;

  setTeam:
    (
      team:
        Team,
    ) => void;
}) {
  return (
    <section
      className={
        styles.widget
      }
    >
      <div
        className={
          styles.widgetHead
        }
      >
        <h2>
          POSLEDNÍ ZÁPAS
        </h2>

        <TeamToggle
          team={
            team
          }
          setTeam={
            setTeam
          }
          compact
        />
      </div>

      {match ? (
        <>
          <div
            className={
              styles.lastTeams
            }
          >
            <div>
              <TeamMark
                name={
                  match.homeTeam
                }
              />

              <b>
                {match.homeTeam}
              </b>
            </div>

            <strong>
              {match.homeScore}
              <i>
                :
              </i>
              {match.awayScore}
            </strong>

            <div>
              <TeamMark
                name={
                  match.awayTeam
                }
              />

              <b>
                {match.awayTeam}
              </b>
            </div>
          </div>

          <div
            className={
              styles.lastMeta
            }
          >
            <span>
              {match.date}
            </span>

            {match.detailUrl && (
              <a
                href={
                  match.detailUrl
                }
                target="_blank"
                rel="noreferrer"
              >
                DETAIL
                ↗
              </a>
            )}
          </div>
        </>
      ) : (
        <div
          className={
            styles.noData
          }
        >
          Bez odehraného
          zápasu.
        </div>
      )}
    </section>
  );
}

function MiniTable({
  rows,
  competition,
}: {
  rows:
    LeagueRow[];

  competition:
    string;
}) {
  return (
    <section
      className={
        styles.widget
      }
    >
      <div
        className={
          styles.widgetHead
        }
      >
        <h2>
          TABULKA
        </h2>

        <span>
          {competition}
        </span>
      </div>

      <div
        className={
          styles.miniTable
        }
      >
        <div
          className={
            styles.miniTableHead
          }
        >
          <span>
            #
          </span>

          <span>
            TÝM
          </span>

          <span>
            Z
          </span>

          <span>
            SKÓRE
          </span>

          <span>
            B
          </span>
        </div>

        {rows.map(
          (
            row,
          ) => (
            <div
              key={`${row.position}-${row.teamName}`}
              className={`${styles.miniTableRow} ${
                row.isOurTeam
                  ? styles.ourRow
                  : ""
              }`}
            >
              <span>
                {row.position}.
              </span>

              <b>
                {row.teamName}
              </b>

              <span>
                {row.matches}
              </span>

              <span>
                {row.score}
              </span>

              <strong>
                {row.points}
              </strong>
            </div>
          ),
        )}
      </div>

      <Link
        href="/zapasy#tabulka"
        className={
          styles.widgetFooterLink
        }
      >
        CELÁ TABULKA
        <span>
          →
        </span>
      </Link>
    </section>
  );
}

function PlayerOfMatchCard({
  player,
}: {
  player:
    PlayerOfMatch |
    null;
}) {
  const image =
    player
      ? PNG_PLAYER_IDS.has(
          player.id,
        )
        ? `/images/${player.id}.png`
        : `/images/${player.id}.jpg`
      : "";

  return (
    <section
      className={`${styles.widget} ${styles.playerOfMatch}`}
    >
      <div
        className={
          styles.widgetHead
        }
      >
        <h2>
          HRÁČ ZÁPASU
        </h2>

        {player?.rating !==
          null &&
          player?.rating !==
            undefined && (
            <span
              className={
                styles.rating
              }
            >
              ZNÁMKA
              <b>
                {player.rating.toFixed(
                  1,
                )}
              </b>
            </span>
          )}
      </div>

      {player ? (
        <Link
          href={`/hrac/${player.id}`}
          className={
            styles.playerOfMatchBody
          }
        >
          <div
            className={
              styles.playerOfMatchPhoto
            }
          >
            <div
              className={
                styles.playerLogoWatermark
              }
            >
              PPB
            </div>

            <img
              src={
                image
              }
              alt={
                player.name
              }
            />
          </div>

          <div
            className={
              styles.playerOfMatchData
            }
          >
            <h3>
              {player.name}
            </h3>

            <div
              className={
                styles.playerMatchStats
              }
            >
              <span>
                <b>
                  {player.goals}
                </b>
                GÓLY
              </span>

              <span>
                <b>
                  {player.assists}
                </b>
                ASISTENCE
              </span>
            </div>

            <p>
              {player.matchTitle}
            </p>
          </div>
        </Link>
      ) : (
        <div
          className={
            styles.noData
          }
        >
          Hráč zápasu
          zatím není
          z aplikace
          dostupný.
        </div>
      )}
    </section>
  );
}

function PartnersWidget() {
  return (
    <section
      className={
        styles.widget
      }
    >
      <div
        className={
          styles.widgetHead
        }
      >
        <h2>
          PARTNEŘI
        </h2>
      </div>

      <div
        className={
          styles.partnerLogos
        }
      >
        <a
          href="https://www.pilsco.cz/"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="/images/partners/pilsco.png"
            alt="PILSCO"
          />
        </a>

        <a
          href="https://femotec.cz/"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="/images/partners/femotec.png"
            alt="FEMOTEC"
          />
        </a>
      </div>
    </section>
  );
}

function TeamsEntry({
  players,
  team,
  setTeam,
}: {
  players:
    SquadPlayer[];

  team:
    Team;

  setTeam:
    (
      team:
        Team,
    ) => void;
}) {
  return (
    <section
      className={
        styles.entryPanel
      }
    >
      <div
        className={
          styles.entryHead
        }
      >
        <div>
          <span>
            TÝMY
          </span>

          <h2>
            NAŠI HRÁČI.
          </h2>
        </div>

        <TeamToggle
          team={
            team
          }
          setTeam={
            setTeam
          }
        />
      </div>

      <div
        className={
          styles.teamPlayers
        }
      >
        {players.length >
        0 ? (
          players.map(
            (
              player,
            ) => (
              <Link
                href={`/hrac/${player.id}`}
                key={
                  player.id
                }
                className={
                  styles.teamPlayer
                }
              >
                <div
                  className={
                    styles.teamPlayerWatermark
                  }
                >
                  PPB
                </div>

                <img
                  src={`/images/${player.id}.png`}
                  alt={
                    player.name
                  }
                />

                <div>
                  <span>
                    #
                    {player.shirtNumber ??
                      "—"}
                  </span>

                  <strong>
                    {player.name}
                  </strong>
                </div>
              </Link>
            ),
          )
        ) : (
          <div
            className={
              styles.noData
            }
          >
            Pro tento tým
            zatím není
            dostupný PNG
            náhled hráče.
          </div>
        )}
      </div>

      <Link
        href="/tymy"
        className={
          styles.entryLink
        }
      >
        SOUPISKY · STATISTIKY · PŘESTUPY
        <span>
          →
        </span>
      </Link>
    </section>
  );
}

function MatchesEntry({
  nextMatch,
  lastMatch,
  competition,
}: {
  nextMatch:
    NextMatch |
    null;

  lastMatch:
    MatchResult |
    null;

  competition:
    string;
}) {
  return (
    <section
      className={`${styles.entryPanel} ${styles.matchesEntry}`}
    >
      <div
        className={
          styles.entryHead
        }
      >
        <div>
          <span>
            ZÁPASY
          </span>

          <h2>
            PROGRAM.
            <br />
            VÝSLEDKY.
          </h2>
        </div>
      </div>

      <div
        className={
          styles.matchEntryRows
        }
      >
        <div>
          <span>
            DALŠÍ
          </span>

          <strong>
            {nextMatch
              ? `${nextMatch.homeTeam} vs. ${nextMatch.awayTeam}`
              : "Rozpis zatím není dostupný"}
          </strong>

          <small>
            {nextMatch
              ? [
                  competition,
                  nextMatch.date,
                  nextMatch.time,
                ]
                  .filter(
                    Boolean,
                  )
                  .join(
                    " · ",
                  )
              : ""}
          </small>
        </div>

        <div>
          <span>
            POSLEDNÍ
          </span>

          <strong>
            {lastMatch
              ? `${lastMatch.homeTeam} ${lastMatch.homeScore}:${lastMatch.awayScore} ${lastMatch.awayTeam}`
              : "Bez odehraného zápasu"}
          </strong>

          <small>
            {lastMatch?.date ??
              ""}
          </small>
        </div>
      </div>

      <Link
        href="/zapasy"
        className={
          styles.entryLink
        }
      >
        PROGRAM · VÝSLEDKY · TABULKY
        <span>
          →
        </span>
      </Link>
    </section>
  );
}

function SocialStrip() {
  return (
    <section
      className={
        styles.socialStrip
      }
    >
      <div>
        <span>
          SLEDUJ FC PPB
        </span>

        <strong>
          ZÁPASY.
          KABINA.
          TRÉNINKY.
          ZÁKULISÍ.
        </strong>
      </div>

      <div>
        <a
          href={
            TIKTOK_URL
          }
          target="_blank"
          rel="noreferrer"
        >
          TIKTOK
          <span>
            @fcppbfutsal
          </span>
        </a>

        <a
          href={
            INSTAGRAM_URL
          }
          target="_blank"
          rel="noreferrer"
        >
          INSTAGRAM
          <span>
            fcppb_futsl
          </span>
        </a>
      </div>
    </section>
  );
}

function TeamToggle({
  team,
  setTeam,
  compact = false,
}: {
  team:
    Team;

  setTeam:
    (
      team:
        Team,
    ) => void;

  compact?:
    boolean;
}) {
  return (
    <div
      className={`${styles.toggle} ${
        compact
          ? styles.toggleCompact
          : ""
      }`}
    >
      <button
        type="button"
        className={
          team ===
          "a"
            ? styles.active
            : ""
        }
        onClick={() =>
          setTeam(
            "a",
          )
        }
      >
        A-TÝM
      </button>

      <button
        type="button"
        className={
          team ===
          "b"
            ? styles.active
            : ""
        }
        onClick={() =>
          setTeam(
            "b",
          )
        }
      >
        B-TÝM
      </button>
    </div>
  );
}

function TeamMark({
  name,
  large = false,
}: {
  name:
    string;

  large?:
    boolean;
}) {
  const ours =
    normalize(
      name,
    ).includes(
      "fc ppb",
    );

  return (
    <div
      className={`${styles.teamMark} ${
        large
          ? styles.teamMarkLarge
          : ""
      }`}
    >
      {ours ? (
        <img
          src="/images/fc-ppb-logo.png"
          alt={
            name
          }
        />
      ) : (
        <span>
          {initials(
            name,
          )}
        </span>
      )}
    </div>
  );
}

function findTeamRow(
  rows:
    LeagueRow[],
  teamName:
    string,
): LeagueRow | null {
  const wanted =
    normalize(
      teamName,
    );

  return (
    rows.find(
      (
        row,
      ) =>
        normalize(
          row.teamName,
        ) ===
        wanted,
    ) ??
    rows.find(
      (
        row,
      ) => {
        const current =
          normalize(
            row.teamName,
          );

        return (
          current.includes(
            wanted,
          ) ||
          wanted.includes(
            current,
          )
        );
      },
    ) ??
    null
  );
}

function aroundOurTeam(
  rows:
    LeagueRow[],
  count:
    number,
): LeagueRow[] {
  if (
    rows.length ===
    0
  ) {
    return [];
  }

  const index =
    rows.findIndex(
      (
        row,
      ) =>
        row.isOurTeam,
    );

  if (
    index <
    0
  ) {
    return rows.slice(
      0,
      count,
    );
  }

  const half =
    Math.floor(
      count /
        2,
    );

  let start =
    Math.max(
      0,
      index -
        half,
    );

  let end =
    Math.min(
      rows.length,
      start +
        count,
    );

  start =
    Math.max(
      0,
      end -
        count,
    );

  return rows.slice(
    start,
    end,
  );
}

function getRoundLabel(
  match:
    NextMatch |
    null,
): string | null {
  if (
    !match
  ) {
    return null;
  }

  const extended =
    match as NextMatch & {
      round?:
        string |
        number |
        null;

      roundName?:
        string |
        null;

      matchday?:
        string |
        number |
        null;
    };

  const raw =
    extended.roundName ??
    extended.round ??
    extended.matchday;

  if (
    raw ===
      null ||
    raw ===
      undefined ||
    String(
      raw,
    ).trim() ===
      ""
  ) {
    return null;
  }

  const value =
    String(
      raw,
    ).trim();

  return /kolo/i.test(
    value,
  )
    ? value.toUpperCase()
    : `${value}. KOLO`;
}

function movementLabel(
  transfer:
    ClubTransfer,
): string {
  switch (
    transfer.movementDetail
  ) {
    case "transfer_from":
    case "transfer_to":
      return "PŘESTUP";

    case "loan_in":
      return "NA HOSTOVÁNÍ";

    case "loan_out":
      return "HOSTOVÁNÍ";

    case "loan_end":
      return "KONEC HOSTOVÁNÍ";

    case "released":
      return "UKONČENÍ PŮSOBENÍ";
  }
}

function getTransferImage(
  transfer:
    ClubTransfer,
): string {
  if (
    transfer.playerId &&
    PNG_PLAYER_IDS.has(
      transfer.playerId,
    )
  ) {
    return `/images/${transfer.playerId}.png`;
  }

  return (
    transfer.imageUrl ||
    "/images/fc-ppb-logo.png"
  );
}

function initials(
  value:
    string,
): string {
  return value
    .split(
      /\s+/,
    )
    .filter(
      Boolean,
    )
    .slice(
      0,
      2,
    )
    .map(
      (
        word,
      ) =>
        word[0]
          ?.toUpperCase() ??
        "",
    )
    .join(
      "",
    );
}

function normalize(
  value:
    string,
): string {
  return value
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
