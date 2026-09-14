"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { AnimatedLogo } from "@/components/ui/AnimatedLogo/AnimatedLogo";

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

type Team =
  | "a"
  | "b";

type CountdownValue = {
  days: number;
  hours: number;
  minutes: number;
  finished: boolean;
};

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
    tableTeam,
    setTableTeam,
  ] =
    useState<Team>("a");

  const tableRows =
    tableTeam === "a"
      ? props.aLeagueTable
      : props.bLeagueTable;

  return (
    <main
      className={styles.page}
    >
      <Hero />

      <div
        className={styles.shell}
      >
        {/* ===================================================
            ZÁPASY
        =================================================== */}

        <section
          className={
            styles.scoreboardSection
          }
        >
          <SectionTitle
            title="ZÁPASY."
          />

          <TeamFrame
            label="A-TÝM"
          >
            <div
              className={
                styles.scoreGrid
              }
            >
              <NextMatchPanel
                match={
                  props.aNextMatch
                }
                rows={
                  props.aLeagueTable
                }
              />

              <LastMatchPanel
                match={
                  props.aMatches[0] ??
                  null
                }
              />
            </div>
          </TeamFrame>

          <TeamFrame
            label="B-TÝM"
          >
            <div
              className={
                styles.scoreGrid
              }
            >
              <NextMatchPanel
                match={
                  props.bNextMatch
                }
                rows={
                  props.bLeagueTable
                }
              />

              <LastMatchPanel
                match={
                  props.bMatches[0] ??
                  null
                }
              />
            </div>
          </TeamFrame>
        </section>

        {/* ===================================================
            HRÁČI UTKÁNÍ
        =================================================== */}

        <section
          className={
            styles.section
          }
        >
          <SectionTitle
            title="HRÁČI UTKÁNÍ."
          />

          <div
            className={
              styles.playersOfMatchGrid
            }
          >
            <TeamCardFrame
              label="A-TÝM"
            >
              <PlayerOfMatchCard
                player={
                  props.aPlayerOfMatch
                }
              />
            </TeamCardFrame>

            <TeamCardFrame
              label="B-TÝM"
            >
              <PlayerOfMatchCard
                player={
                  props.bPlayerOfMatch
                }
              />
            </TeamCardFrame>
          </div>
        </section>

        {/* ===================================================
            NOVINKY
        =================================================== */}

        <NewsSection
          props={props}
        />

        {/* ===================================================
            TABULKA
        =================================================== */}

        <section
          className={
            styles.section
          }
        >
          <div
            className={
              styles.sectionHeaderRow
            }
          >
            <SectionTitle
              title="TABULKA."
              compact
            />

            <TeamToggle
              team={tableTeam}
              setTeam={
                setTableTeam
              }
            />
          </div>

          <LeaguePreview
            rows={tableRows}
          />
        </section>

        {/* ===================================================
            NAŠE TÝMY
        =================================================== */}

        <TeamsPreview
          aPlayers={
            props.aPlayers
          }
          bPlayers={
            props.bPlayers
          }
        />

        <Partners />

        <Social />
      </div>
    </main>
  );
}

/* =========================================================
   HERO
   ========================================================= */

function Hero() {
  return (
    <section
      className={styles.hero}
    >
      <div
        className={
          styles.heroNoise
        }
      />

      <div
        className={
          styles.heroLight
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.heroLogoGhost
        }
        aria-hidden="true"
      >
        <AnimatedLogo
          size={470}
          priority
        />
      </div>

      <div
        className={
          styles.heroInner
        }
      >
        <div
          className={
            styles.heroBrand
          }
        >
          <div
            className={
              styles.heroLogo
            }
          >
            <div
              className={
                styles.heroLogoShine
              }
              aria-hidden="true"
            />

            <div
              className={
                styles.heroLogoGraphic
              }
            >
              <AnimatedLogo
                size={118}
                priority
              />
            </div>
          </div>

          <div
            className={
              styles.heroBrandCopy
            }
          >
            <span>
              FC PPB · FUTSAL PLZEŇ
            </span>

            <h1>
              FC PPB
            </h1>
          </div>
        </div>

        <div
          className={
            styles.heroClaim
          }
        >
          <strong>
            PŘÁTELSTVÍ.
          </strong>

          <strong>
            POKORA.
          </strong>

          <strong>
            BOJOVNOST.
          </strong>
        </div>

        <p>
          SPOJUJE NÁS VÍC NEŽ HRA.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   RÁMEČEK TÝMU
   ┌── A-TÝM ─────────────┐
   ========================================================= */

function TeamFrame({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className={
        styles.teamFrame
      }
    >
      <span
        className={
          styles.teamFrameLegend
        }
      >
        {label}
      </span>

      {children}
    </div>
  );
}

/* =========================================================
   RÁMEČEK JEDNÉ KARTY
   ========================================================= */

function TeamCardFrame({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className={
        styles.teamCardFrame
      }
    >
      <span
        className={
          styles.teamCardFrameLegend
        }
      >
        {label}
      </span>

      <div
        className={
          styles.teamCardFrameInner
        }
      >
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   POSLEDNÍ ZÁPAS
   ========================================================= */

function LastMatchPanel({
  match,
}: {
  match:
    MatchResult | null;
}) {
  return (
    <article
      className={
        styles.matchPanel
      }
    >
      <CardSweep />

      <div
        className={
          styles.panelTopline
        }
      >
        <span>
          POSLEDNÍ ZÁPAS
        </span>
      </div>

      {match ? (
        <>
          <div
            className={
              styles.matchMain
            }
          >
            <MatchClub
              name={
                match.homeTeam
              }
              teamId={
                match.homeTeamId
              }
            />

            <div
              className={
                styles.score
              }
            >
              {match.homeScore}

              <i>
                :
              </i>

              {match.awayScore}
            </div>

            <MatchClub
              name={
                match.awayTeam
              }
              teamId={
                match.awayTeamId
              }
            />
          </div>

          <div
            className={
              styles.matchFoot
            }
          >
            <span>
              {match.date}
            </span>

            {match.detailUrl ? (
              <a
                href={
                  match.detailUrl
                }
                target="_blank"
                rel="noreferrer"
              >
                DETAIL ↗
              </a>
            ) : null}
          </div>
        </>
      ) : (
        <Empty
          text="Bez odehraného zápasu."
        />
      )}
    </article>
  );
}

/* =========================================================
   NÁSLEDUJÍCÍ ZÁPAS
   ========================================================= */

function NextMatchPanel({
  match,
  rows,
}: {
  match:
    NextMatch | null;

  rows:
    LeagueRow[];
}) {
  const home =
    match
      ? findTeamRow(
          rows,
          match.homeTeam,
        )
      : null;

  const away =
    match
      ? findTeamRow(
          rows,
          match.awayTeam,
        )
      : null;

  return (
    <article
      className={`${styles.matchPanel} ${styles.nextPanel}`}
    >
      <CardSweep />

      <div
        className={
          styles.panelTopline
        }
      >
        <span>
          NÁSLEDUJÍCÍ ZÁPAS
        </span>
      </div>

      {match ? (
        <>
          <div
            className={
              styles.matchMain
            }
          >
            <MatchClub
              name={
                match.homeTeam
              }
              teamId={
                match.homeTeamId
              }
              position={
                home?.position
              }
            />

            <div
              className={
                styles.versus
              }
            >
              VS
            </div>

            <MatchClub
              name={
                match.awayTeam
              }
              teamId={
                match.awayTeamId
              }
              position={
                away?.position
              }
            />
          </div>

          <MatchCountdown
            dateTimeIso={
              match.dateTimeIso
            }
          />

          <div
            className={
              styles.matchFoot
            }
          >
            <span>
              {[
                match.date,
                match.time,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>

            <Link
              href="/zapasy"
            >
              PROGRAM →
            </Link>
          </div>

          {match.venue ? (
            <div
              className={
                styles.venue
              }
            >
              {match.venue}
            </div>
          ) : null}
        </>
      ) : (
        <Empty
          text="Další zápas zatím není v rozpisu."
        />
      )}
    </article>
  );
}

/* =========================================================
   ODPOČET
   ========================================================= */

function MatchCountdown({
  dateTimeIso,
}: {
  dateTimeIso:
    string | null;
}) {
  const [
    countdown,
    setCountdown,
  ] =
    useState<
      CountdownValue | null
    >(null);

  useEffect(() => {
    if (!dateTimeIso) {
      setCountdown(null);
      return;
    }

    const update = () => {
      const target =
        new Date(
          dateTimeIso,
        ).getTime();

      if (
        !Number.isFinite(
          target,
        )
      ) {
        setCountdown(null);
        return;
      }

      const difference =
        target -
        Date.now();

      if (
        difference <= 0
      ) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          finished: true,
        });

        return;
      }

      const totalMinutes =
        Math.ceil(
          difference /
            60_000,
        );

      const days =
        Math.floor(
          totalMinutes /
            1440,
        );

      const hours =
        Math.floor(
          (totalMinutes %
            1440) /
            60,
        );

      const minutes =
        totalMinutes %
        60;

      setCountdown({
        days,
        hours,
        minutes,
        finished: false,
      });
    };

    update();

    const timer =
      window.setInterval(
        update,
        30_000,
      );

    return () => {
      window.clearInterval(
        timer,
      );
    };
  }, [dateTimeIso]);

  if (!dateTimeIso) {
    return null;
  }

  return (
    <div
      className={
        styles.matchCountdown
      }
    >
      <span>
        HRAJEME ZA:
      </span>

      {countdown ===
      null ? (
        <strong>
          -- d / -- h / -- m
        </strong>
      ) : countdown.finished ? (
        <strong>
          ZÁPAS ZAČAL
        </strong>
      ) : (
        <strong>
          {padCountdown(
            countdown.days,
          )}

          <small>
            d
          </small>

          <i>
            /
          </i>

          {padCountdown(
            countdown.hours,
          )}

          <small>
            h
          </small>

          <i>
            /
          </i>

          {padCountdown(
            countdown.minutes,
          )}

          <small>
            m
          </small>
        </strong>
      )}
    </div>
  );
}

/* =========================================================
   HRÁČ UTKÁNÍ
   ========================================================= */

function PlayerOfMatchCard({
  player,
}: {
  player:
    PlayerOfMatch | null;
}) {
  if (!player) {
    return (
      <article
        className={
          styles.pomCard
        }
      >
        <CardSweep />

        <Empty
          text="Hráč utkání zatím není dostupný."
        />
      </article>
    );
  }

  return (
    <Link
      href={`/hrac/${player.id}`}
      className={
        styles.pomCard
      }
    >
      <CardSweep />

      <div
        className={
          styles.pomStage
        }
      >
        <img
          className={
            styles.pomWatermark
          }
          src="/images/fc-ppb-logo.png"
          alt=""
          aria-hidden="true"
        />

        <img
          className={
            styles.pomPlayer
          }
          src={`/images/${player.id}.png`}
          alt={player.name}
          onError={(
            event,
          ) => {
            const image =
              event.currentTarget;

            if (
              image.dataset
                .fallback !==
              "jpg"
            ) {
              image.dataset
                .fallback =
                "jpg";

              image.src =
                `/images/${player.id}.jpg`;

              return;
            }

            image.style.display =
              "none";
          }}
        />
      </div>

      {player.rating !==
        null ? (
        <div
          className={
            styles.pomRatingCorner
          }
        >
          {player.rating.toFixed(
            1,
          )}
        </div>
      ) : null}

      <div
        className={
          styles.pomCopy
        }
      >
        <h3>
          {formatPlayerName(
            player.name,
          )}
        </h3>

        <span
          className={
            styles.pomMatchTitle
          }
        >
          {player.matchTitle}
        </span>

        <div
          className={
            styles.pomStats
          }
        >
          <div>
            <b>
              {player.goals}
            </b>

            <small>
              GÓLY
            </small>
          </div>

          <div>
            <b>
              {player.assists}
            </b>

            <small>
              ASISTENCE
            </small>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatPlayerName(
  name: string,
) {
  const parts =
    name
      .trim()
      .split(/\s+/);

  if (
    parts.length < 2
  ) {
    return name;
  }

  const last =
    parts.pop();

  return (
    <>
      {parts.join(" ")}

      <strong>
        {last}
      </strong>
    </>
  );
}

/* =========================================================
   NOVINKY
   ========================================================= */

function NewsSection({
  props,
}: {
  props: Props;
}) {
  const cards =
    useMemo(() => {
      const transferCards =
        props.transfers
          .slice(0, 3)
          .map(
            (transfer) => ({
              key:
                `transfer-${transfer.id}`,

              tag:
                transfer.direction ===
                "arrival"
                  ? "PŘÍCHOD"
                  : "ODCHOD",

              title:
                `${transfer.playerName} · ${movementLabel(transfer)}`,

              date:
                "AKTUALITA KLUBU",

              image:
                getTransferImage(
                  transfer,
                ),

              href:
                "/prestupy",
            }),
          );

      if (
        transferCards.length >=
        3
      ) {
        return transferCards;
      }

      const matchCards =
        [
          props.aMatches[0]
            ? {
                key:
                  "a-result",

                tag:
                  "A-TÝM",

                title:
                  `${props.aMatches[0].homeTeam} ${props.aMatches[0].homeScore}:${props.aMatches[0].awayScore} ${props.aMatches[0].awayTeam}`,

                date:
                  props.aMatches[0]
                    .date,

                image:
                  "/images/fc-ppb-logo.png",

                href:
                  "/zapasy",
              }
            : null,

          props.bMatches[0]
            ? {
                key:
                  "b-result",

                tag:
                  "B-TÝM",

                title:
                  `${props.bMatches[0].homeTeam} ${props.bMatches[0].homeScore}:${props.bMatches[0].awayScore} ${props.bMatches[0].awayTeam}`,

                date:
                  props.bMatches[0]
                    .date,

                image:
                  "/images/fc-ppb-logo.png",

                href:
                  "/zapasy",
              }
            : null,
        ].filter(
          Boolean,
        ) as Array<{
          key: string;
          tag: string;
          title: string;
          date: string;
          image: string;
          href: string;
        }>;

      return [
        ...transferCards,
        ...matchCards,
      ].slice(0, 3);
    }, [
      props.transfers,
      props.aMatches,
      props.bMatches,
    ]);

  if (
    cards.length === 0
  ) {
    return null;
  }

  return (
    <section
      className={
        styles.section
      }
    >
      <div
        className={
          styles.sectionHeaderRow
        }
      >
        <SectionTitle
          title="ZPRÁVY Z KABINY."
          compact
        />

        <Link
          className={
            styles.textLink
          }
          href="/novinky"
        >
          VŠECHNY NOVINKY →
        </Link>
      </div>

      <div
        className={
          styles.newsGrid
        }
      >
        {cards.map(
          (card) => (
            <Link
              href={
                card.href
              }
              className={
                styles.newsCard
              }
              key={
                card.key
              }
            >
              <CardSweep />

              <div
                className={
                  styles.newsVisual
                }
              >
                <img
                  src={
                    card.image
                  }
                  alt=""
                />
              </div>

              <div
                className={
                  styles.newsShade
                }
              />

              <div
                className={
                  styles.newsCopy
                }
              >
                <span>
                  {card.tag}
                </span>

                <h3>
                  {card.title}
                </h3>

                <small>
                  {card.date}
                </small>
              </div>
            </Link>
          ),
        )}
      </div>
    </section>
  );
}

/* =========================================================
   TABULKA
   ========================================================= */

function LeaguePreview({
  rows,
}: {
  rows:
    LeagueRow[];
}) {
  const visible =
    aroundOurTeam(
      rows,
      5,
    );

  return (
    <div
      className={
        styles.tableCard
      }
    >
      <div
        className={
          styles.tableHead
        }
      >
        <span>
          #
        </span>

        <span>
          TÝM
        </span>

        <span>
          ZÁPASY
        </span>

        <span
          className={
            styles.tableDesktopOnly
          }
        >
          VÝHRY
        </span>

        <span
          className={
            styles.tableDesktopOnly
          }
        >
          REMÍZY
        </span>

        <span
          className={
            styles.tableDesktopOnly
          }
        >
          PROHRY
        </span>

        <span>
          SKÓRE
        </span>

        <span>
          BODY
        </span>
      </div>

      {visible.map(
        (row) => (
          <div
            key={`${row.position}-${row.teamName}`}
            className={`${styles.tableRow} ${
              row.isOurTeam
                ? styles.ourRow
                : ""
            }`}
          >
            <span>
              {row.position}.
            </span>

            <strong>
              {row.teamName}
            </strong>

            <span>
              {row.matches}
            </span>

            <span
              className={
                styles.tableDesktopOnly
              }
            >
              {row.wins}
            </span>

            <span
              className={
                styles.tableDesktopOnly
              }
            >
              {row.draws}
            </span>

            <span
              className={
                styles.tableDesktopOnly
              }
            >
              {row.losses}
            </span>

            <span>
              {row.score}
            </span>

            <b>
              {row.points}
            </b>
          </div>
        ),
      )}

      <Link
        href="/zapasy#tabulka"
        className={
          styles.tableLink
        }
      >
        CELÁ TABULKA

        <span>
          →
        </span>
      </Link>
    </div>
  );
}

/* =========================================================
   NAŠE TÝMY
   ========================================================= */

function TeamsPreview({
  aPlayers,
  bPlayers,
}: {
  aPlayers:
    SquadPlayer[];

  bPlayers:
    SquadPlayer[];
}) {
  return (
    <section
      className={
        styles.section
      }
    >
      <SectionTitle
        title="NAŠE TÝMY."
      />

      <div
        className={
          styles.teamsGrid
        }
      >
        <TeamCardFrame
          label="A-TÝM"
        >
          <TeamPreviewCard
            players={
              aPlayers
            }
            href="/tymy?team=a"
          />
        </TeamCardFrame>

        <TeamCardFrame
          label="B-TÝM"
        >
          <TeamPreviewCard
            players={
              bPlayers
            }
            href="/tymy?team=b"
          />
        </TeamCardFrame>
      </div>
    </section>
  );
}

function TeamPreviewCard({
  players,
  href,
}: {
  players:
    SquadPlayer[];

  href:
    string;
}) {
  const featured =
    players
      .filter(
        (player) =>
          PNG_PLAYER_IDS.has(
            player.id,
          ) ||
          Boolean(
            player.imageUrl,
          ),
      )
      .slice(0, 3);

  return (
    <Link
      href={href}
      className={
        styles.teamCard
      }
    >
      <CardSweep />

      <img
        className={
          styles.teamGhost
        }
        src="/images/fc-ppb-logo.png"
        alt=""
        aria-hidden="true"
      />

      <div
        className={
          styles.teamPlayers
        }
      >
        {featured.map(
          (
            player,
            index,
          ) => (
            <RosterImage
              key={
                player.id
              }
              player={
                player
              }
              index={
                index
              }
            />
          ),
        )}
      </div>

      <div
        className={
          styles.teamCardShade
        }
      />

      <div
        className={
          styles.teamCardCopy
        }
      >
        <div
          className={
            styles.teamMenu
          }
        >
          <span>
            SOUPISKA
          </span>

          <span>
            STATISTIKY
          </span>
        </div>

        <b>
          ZOBRAZIT TÝM →
        </b>
      </div>
    </Link>
  );
}

function RosterImage({
  player,
  index,
}: {
  player:
    SquadPlayer;

  index:
    number;
}) {
  return (
    <img
      src={`/images/${player.id}.png`}
      alt={player.name}
      style={{
        zIndex:
          index + 1,
      }}
      onError={(
        event,
      ) => {
        const img =
          event.currentTarget;

        const fallback =
          img.dataset
            .fallback ||
          "";

        if (
          fallback === ""
        ) {
          img.dataset
            .fallback =
            "jpg";

          img.src =
            `/images/${player.id}.jpg`;

          return;
        }

        if (
          fallback ===
            "jpg" &&
          player.imageUrl
        ) {
          img.dataset
            .fallback =
            "remote";

          img.src =
            player.imageUrl;

          return;
        }

        img.style.display =
          "none";
      }}
    />
  );
}

/* =========================================================
   PARTNEŘI
   ========================================================= */

function Partners() {
  return (
    <section
      className={
        styles.partners
      }
    >
      <span>
        HRAJÍ S NÁMI
      </span>

      <a
        href="https://www.pilsco.cz/"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="/partners/pilsco.png"
          alt="PILSCO"
        />
      </a>

      <a
        href="https://femotec.cz/"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="/partners/femotec.png"
          alt="FEMOTEC"
        />
      </a>
    </section>
  );
}

/* =========================================================
   SOCIAL
   ========================================================= */

function Social() {
  return (
    <section
      className={
        styles.social
      }
    >
      <div>
        <span>
          SLEDUJ FC PPB
        </span>

        <strong>
          ZÁPASY. KABINA. TRÉNINKY.
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
          TIKTOK ↗
        </a>

        <a
          href={
            INSTAGRAM_URL
          }
          target="_blank"
          rel="noreferrer"
        >
          INSTAGRAM ↗
        </a>
      </div>
    </section>
  );
}

/* =========================================================
   TITULEK SEKCE
   ========================================================= */

function SectionTitle({
  title,
  compact = false,
}: {
  title:
    string;

  compact?:
    boolean;
}) {
  return (
    <div
      className={`${styles.sectionTitle} ${
        compact
          ? styles.sectionTitleCompact
          : ""
      }`}
    >
      <h2>
        {title}
      </h2>
    </div>
  );
}

/* =========================================================
   PŘEPÍNAČ TABULKY
   ========================================================= */

function TeamToggle({
  team,
  setTeam,
}: {
  team:
    Team;

  setTeam:
    (
      team: Team,
    ) => void;
}) {
  return (
    <div
      className={
        styles.toggle
      }
    >
      <button
        type="button"
        className={
          team === "a"
            ? styles.active
            : ""
        }
        onClick={() =>
          setTeam("a")
        }
      >
        A-TÝM
      </button>

      <button
        type="button"
        className={
          team === "b"
            ? styles.active
            : ""
        }
        onClick={() =>
          setTeam("b")
        }
      >
        B-TÝM
      </button>
    </div>
  );
}

/* =========================================================
   KLUB
   ========================================================= */

function MatchClub({
  name,
  teamId,
  position,
}: {
  name:
    string;

  teamId:
    number | null;

  position?:
    number;
}) {
  return (
    <div
      className={
        styles.club
      }
    >
      <TeamLogo
        name={name}
        teamId={teamId}
      />

      <strong>
        {name}
      </strong>

      {position ? (
        <small>
          {position}. MÍSTO
        </small>
      ) : null}
    </div>
  );
}

function TeamLogo({
  name,
  teamId,
}: {
  name:
    string;

  teamId:
    number | null;
}) {
  const ours =
    normalize(name).includes(
      "fc ppb",
    );

  const src =
    ours
      ? "/images/fc-ppb-logo.png"
      : teamId !== null
        ? `/teams/${teamId}.png`
        : null;

  const [
    failed,
    setFailed,
  ] =
    useState(false);

  if (
    !src ||
    failed
  ) {
    return (
      <div
        className={
          styles.logoFallback
        }
      >
        {initials(name)}
      </div>
    );
  }

  return (
    <img
      className={
        styles.clubLogo
      }
      src={src}
      alt={name}
      onError={() =>
        setFailed(true)
      }
    />
  );
}

/* =========================================================
   EFFECT
   ========================================================= */

function CardSweep() {
  return (
    <span
      className={
        styles.cardSweep
      }
      aria-hidden="true"
    />
  );
}

/* =========================================================
   EMPTY
   ========================================================= */

function Empty({
  text,
}: {
  text:
    string;
}) {
  return (
    <div
      className={
        styles.empty
      }
    >
      {text}
    </div>
  );
}

/* =========================================================
   HELPERS
   ========================================================= */

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
      (row) =>
        normalize(
          row.teamName,
        ) ===
        wanted,
    ) ??
    rows.find(
      (row) => {
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
    rows.length === 0
  ) {
    return [];
  }

  const index =
    rows.findIndex(
      (row) =>
        row.isOurTeam,
    );

  if (
    index < 0
  ) {
    return rows.slice(
      0,
      count,
    );
  }

  let start =
    Math.max(
      0,
      index -
        Math.floor(
          count / 2,
        ),
    );

  let end =
    Math.min(
      rows.length,
      start + count,
    );

  start =
    Math.max(
      0,
      end - count,
    );

  return rows.slice(
    start,
    end,
  );
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

    default:
      return "ZMĚNA V KÁDRU";
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

function padCountdown(
  value:
    number,
): string {
  return String(value)
    .padStart(
      2,
      "0",
    );
}

function normalize(
  value:
    string,
): string {
  return value
    .normalize("NFD")
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

function initials(
  value:
    string,
): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (word) =>
        word[0]
          ?.toUpperCase() ??
        "",
    )
    .join("");
}