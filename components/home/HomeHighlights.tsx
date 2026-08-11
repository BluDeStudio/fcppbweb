"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { clubConfig } from "@/config/club";

import {
  TeamSwitch,
  type TeamView,
} from "@/components/ui/TeamSwitch";

import type { TopScorer } from "@/types/player";

import styles from "./HomeHighlights.module.css";

type HomeHighlightsProps = {
  aTopScorer: TopScorer | null;
  bTopScorer: TopScorer | null;
};

export function HomeHighlights({
  aTopScorer,
  bTopScorer,
}: HomeHighlightsProps) {
  const [view, setView] =
    useState<TeamView>("a");

  const clubTopScorer =
    getClubTopScorer(
      aTopScorer,
      bTopScorer,
    );

  const topScorer =
    view === "a"
      ? aTopScorer
      : view === "b"
        ? bTopScorer
        : clubTopScorer;

  return (
    <section
      id="statistiky"
      className={
        styles.section
      }
    >
      <div
        className={
          styles.wrapper
        }
      >
        <SectionHeader
          number="02"
          label="Statistiky"
          title="Hráči."
          secondLine={
            view === "a"
              ? "A-tým FC PPB."
              : view === "b"
                ? "B-tým FC PPB."
                : "Celý klub FC PPB."
          }
          meta={`Sezóna ${clubConfig.season}`}
        />

        <div
          className={
            styles.switchRow
          }
        >
          <TeamSwitch
            value={view}
            onChange={
              setView
            }
          />
        </div>

        <div
          className={
            styles.container
          }
        >
          {/* ==================================
              KLUBOVÁ KONSTANTA
          ================================== */}

          <StatCard
            label="Hráč měsíce"
            value="—"
            title="Brzy doplníme"
            text="Klubové ocenění napříč A-týmem a B-týmem."
          />

          {/* ==================================
              MĚNÍ SE PODLE A / B
          ================================== */}

          <StatCard
            label="Hráč posledního zápasu"
            value="—"
            title={
              view === "a"
                ? "A-tým"
                : view === "b"
                  ? "B-tým"
                  : "A-tým / B-tým"
            }
            text={
              view === "a"
                ? "Nejlépe hodnocený hráč posledního utkání A-týmu."
                : view === "b"
                  ? "Nejlépe hodnocený hráč posledního utkání B-týmu."
                  : "Nejlépe hodnocený hráč posledního utkání klubu."
            }
          />

          {/* ==================================
              MĚNÍ SE PODLE A / B
          ================================== */}

          <TopScorerCard
            player={
              topScorer
            }
            view={view}
          />

          {/* ==================================
              KLUBOVÁ KONSTANTA
          ================================== */}

          <Link
            href="/statistiky"
            className={
              styles.completeStatsCard
            }
          >
            <div
              className={
                styles.completeStatsGlow
              }
            />

            <span
              className={
                styles.label
              }
            >
              Kompletní statistiky
            </span>

            <div
              className={
                styles.completeStatsContent
              }
            >
              <strong>
                Všichni
                <br />
                hráči.
              </strong>

              <p>
                Góly, asistence,
                známky, docházka
                a kompletní pořadí.
              </p>
            </div>

            <div
              className={
                styles.completeStatsArrow
              }
              aria-hidden="true"
            >
              →
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

function getClubTopScorer(
  aPlayer: TopScorer | null,
  bPlayer: TopScorer | null,
): TopScorer | null {
  if (!aPlayer) {
    return bPlayer;
  }

  if (!bPlayer) {
    return aPlayer;
  }

  return aPlayer.goals >=
    bPlayer.goals
    ? aPlayer
    : bPlayer;
}

type StatCardProps = {
  label: string;
  value: string;
  title: string;
  text: string;
};

function StatCard({
  label,
  value,
  title,
  text,
}: StatCardProps) {
  return (
    <article
      className={
        styles.card
      }
    >
      <span
        className={
          styles.label
        }
      >
        {label}
      </span>

      <strong
        className={
          styles.number
        }
      >
        {value}
      </strong>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>
    </article>
  );
}

function TopScorerCard({
  player,
  view,
}: {
  player: TopScorer | null;
  view: TeamView;
}) {
  return (
    <article
      className={`${styles.card} ${styles.scorerCard}`}
    >
      {player && (
        <PlayerPhoto
          playerId={
            player.id
          }
          playerName={
            player.name
          }
        />
      )}

      <div
        className={
          styles.scorerShade
        }
      />

      <div
        className={
          styles.scorerGlow
        }
      />

      <div
        className={
          styles.scorerText
        }
      >
        <span
          className={
            styles.label
          }
        >
          Nejlepší střelec
        </span>

        {player ? (
          <>
            <strong
              className={
                styles.scorerNumber
              }
            >
              {player.goals}
            </strong>

            <h3>
              {player.name}
            </h3>

            <p>
              {player.matches} utkání
              {view === "all"
                ? " · nejlepší střelec klubu"
                : ""}
            </p>
          </>
        ) : (
          <>
            <strong
              className={
                styles.scorerNumber
              }
            >
              —
            </strong>

            <h3>
              Bez dat
            </h3>

            <p>
              Statistiky nejsou dostupné.
            </p>
          </>
        )}
      </div>
    </article>
  );
}

function PlayerPhoto({
  playerId,
  playerName,
}: {
  playerId: number;
  playerName: string;
}) {
  const [
    failed,
    setFailed,
  ] =
    useState(false);

  useEffect(() => {
    setFailed(false);
  }, [playerId]);

  if (failed) {
    return (
      <div
        className={
          styles.photoFallback
        }
        aria-label={`Bez fotografie: ${playerName}`}
      >
        <div
          className={
            styles.silhouetteHead
          }
        />

        <div
          className={
            styles.silhouetteBody
          }
        />
      </div>
    );
  }

  return (
    <div
      className={
        styles.playerPhoto
      }
    >
      <Image
        src={`/images/${playerId}.jpg`}
        alt={
          playerName
        }
        fill
        sizes="320px"
        className={
          styles.playerPhotoImage
        }
        onError={() =>
          setFailed(true)
        }
      />
    </div>
  );
}
