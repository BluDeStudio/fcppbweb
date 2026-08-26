"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  SquadPlayer,
} from "@/types/player";

import styles from "./PlayerCard.module.css";

type PlayerCardProps = {
  player: SquadPlayer;
  team: "a" | "b";
  stats: {
    matches: number;
    goals: number;
    assists: number;
  };
  statsLoaded: boolean;
};

const PNG_PLAYER_IDS =
  new Set([
    532,
    997,
    1562,
    3937,
  ]);

export function PlayerCard({
  player,
  team,
  stats,
  statsLoaded,
}: PlayerCardProps) {
  const sources =
    useMemo(
      () => {
        const result:
          Array<{
            src: string;
            cutout: boolean;
          }> = [];

        if (
          PNG_PLAYER_IDS.has(
            player.id,
          )
        ) {
          result.push({
            src:
              `/images/${player.id}.png`,
            cutout: true,
          });
        }

        if (
          player.imageUrl
        ) {
          result.push({
            src:
              player.imageUrl,
            cutout: false,
          });
        }

        return result;
      },
      [
        player.id,
        player.imageUrl,
      ],
    );

  const [
    sourceIndex,
    setSourceIndex,
  ] =
    useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [player.id]);

  const source =
    sources[
      sourceIndex
    ];

  return (
    <Link
      className={
        styles.card
      }
      href={
        player.profileUrl
      }
      title={`Profil hráče ${player.name}`}
    >
      <div
        className={
          styles.visual
        }
      >
        <Image
          className={
            styles.watermark
          }
          src="/images/fc-ppb-logo.png"
          alt=""
          fill
          sizes="25vw"
          aria-hidden="true"
        />

        <div
          className={
            styles.glow
          }
        />

        {source ? (
          <Image
            className={`${styles.image} ${
              source.cutout
                ? styles.cutout
                : styles.photo
            }`}
            src={
              source.src
            }
            alt={
              player.name
            }
            fill
            sizes="
              (max-width: 760px) 50vw,
              (max-width: 1100px) 33vw,
              25vw
            "
            onError={() =>
              setSourceIndex(
                (
                  current,
                ) =>
                  current +
                  1,
              )
            }
          />
        ) : (
          <PlayerSilhouette />
        )}

        <div
          className={
            styles.shade
          }
        />

        {player.shirtNumber !==
          null && (
          <span
            className={
              styles.number
            }
          >
            #
            {
              player.shirtNumber
            }
          </span>
        )}

        <div
          className={
            styles.name
          }
        >
          <span>
            {team ===
            "a"
              ? "A-TÝM"
              : "B-TÝM"}
          </span>

          <h3>
            {player.name}
          </h3>

          <p>
            {player.position ===
            "goalkeeper"
              ? "BRANKÁŘ"
              : "HRÁČ"}
          </p>
        </div>
      </div>

      <div
        className={
          styles.footer
        }
      >
        <Stat
          label="ZÁPASY"
          value={
            statsLoaded
              ? stats.matches
              : "·"
          }
        />

        <Stat
          label="GÓLY"
          value={
            statsLoaded
              ? stats.goals
              : "·"
          }
        />

        <Stat
          label="ASISTENCE"
          value={
            statsLoaded
              ? stats.assists
              : "·"
          }
        />

        <span
          className={
            styles.arrow
          }
        >
          →
        </span>
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value:
    number |
    string;
}) {
  return (
    <div>
      <span>
        {label}
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
          styles.fallbackHead
        }
      />

      <div
        className={
          styles.fallbackBody
        }
      />
    </div>
  );
}
