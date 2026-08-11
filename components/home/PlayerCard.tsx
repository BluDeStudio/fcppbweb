"use client";

import Image from "next/image";

import {
  useEffect,
  useState,
} from "react";

import type {
  SquadPlayer,
} from "@/types/player";

import styles from "./PlayerCard.module.css";

type PlayerCardProps = {
  player: SquadPlayer;
};

export function PlayerCard({
  player,
}: PlayerCardProps) {
  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [player.id]);

  return (
    <a
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
              (max-width: 430px) 100vw,
              (max-width: 760px) 50vw,
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
            {player.team === "a"
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
          <div>
            <span>
              Zápasy
            </span>

            <strong>
              {
                player.matches
              }
            </strong>
          </div>

          <div>
            <span>
              Góly
            </span>

            <strong>
              {
                player.goals
              }
            </strong>
          </div>
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
    </a>
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