"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import type {
  SquadPlayer,
} from "@/types/player";

import styles from "./PlayerCard.module.css";

type PlayerCardProps = {
  player:
    SquadPlayer;

  team:
    "a" |
    "b";

  stats: {
    matches: number;

    goals: number;

    assists: number;
  };

  statsLoaded: boolean;
};

export function PlayerCard({
  player,
  team,
  stats,
  statsLoaded,
}: PlayerCardProps) {
  const [
    imageFailed,
    setImageFailed,
  ] =
    useState(false);

  useEffect(() => {
    setImageFailed(
      false,
    );
  }, [player.id]);

  return (
    <Link
      className={
        styles.card
      }
      href={
        player.profileUrl
      }
      title={
        `Profil hráče ${player.name}`
      }
    >
      <div
        className={
          styles.imageWrapper
        }
      >
        {!imageFailed ? (
          <Image
            className={
              styles.image
            }
            src={
              player.imageUrl
            }
            alt={
              player.name
            }
            fill
            sizes="
              (max-width: 760px) 33vw,
              (max-width: 1000px) 33vw,
              25vw
            "
            onError={() =>
              setImageFailed(
                true,
              )
            }
          />
        ) : (
          <PlayerSilhouette />
        )}

        <div
          className={
            styles.overlay
          }
        />

        <div
          className={
            styles.topInfo
          }
        >
          <span
            className={
              styles.position
            }
          >
            {player.position ===
            "goalkeeper"
              ? "Brankář"
              : "Hráč"}
          </span>

          {player.shirtNumber !==
            null && (
            <span
              className={
                styles.numberBadge
              }
            >
              #
              {
                player.shirtNumber
              }
            </span>
          )}
        </div>

        <div
          className={
            styles.teamInfo
          }
        >
          <span
            className={
              styles.teamBadge
            }
          >
            {team === "a"
              ? "A-tým"
              : "B-tým"}
          </span>

          {player.status ===
            "loan" && (
            <span
              className={
                styles.loanBadge
              }
            >
              Host
            </span>
          )}
        </div>
      </div>

      <div
        className={
          styles.content
        }
      >
        <h3>
          {player.name}
        </h3>

        <div
          className={
            styles.stats
          }
        >
          <Stat
            label="Zápasy"
            mobileLabel="Z"
            value={
              statsLoaded
                ? stats.matches
                : "·"
            }
          />

          <Stat
            label="Góly"
            mobileLabel="G"
            value={
              statsLoaded
                ? stats.goals
                : "·"
            }
          />

          <Stat
            label="Asistence"
            mobileLabel="A"
            value={
              statsLoaded
                ? stats.assists
                : "·"
            }
          />
        </div>

        <div
          className={
            styles.detail
          }
        >
          <span>
            Profil hráče
          </span>

          <span
            className={
              styles.arrow
            }
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function Stat({
  label,
  mobileLabel,
  value,
}: {
  label: string;

  mobileLabel: string;

  value:
    string |
    number;
}) {
  return (
    <div>
      <span
        className={
          styles.desktopStatLabel
        }
      >
        {label}
      </span>

      <span
        className={
          styles.mobileStatLabel
        }
      >
        {mobileLabel}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function PlayerSilhouette() {
  return (
    <div
      className={
        styles.fallback
      }
    >
      <div
        className={
          styles.fallbackGlow
        }
      />

      <div
        className={
          styles.fallbackHead
        }
      />

      <div
        className={
          styles.fallbackBody
        }
      />

      <span>
        FC PPB
      </span>
    </div>
  );
}
