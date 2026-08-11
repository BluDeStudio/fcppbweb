"use client";

import { useState } from "react";

import { SectionHeader } from "@/components/ui/SectionHeader";

import type { SquadPlayer } from "@/types/player";

import { PlayerCard } from "./PlayerCard";

import styles from "./Squad.module.css";

type TeamView = "a" | "b";

type SquadProps = {
  aPlayers: SquadPlayer[];
  bPlayers: SquadPlayer[];
};

export function Squad({
  aPlayers,
  bPlayers,
}: SquadProps) {
  const [team, setTeam] =
    useState<TeamView>("a");

  const players =
    team === "a"
      ? aPlayers
      : bPlayers;

  return (
    <section
      id="soupiska"
      className={styles.section}
    >
      <div className={styles.container}>
        <SectionHeader
          number="05"
          label="Soupiska"
          title="Naši hráči."
          secondLine={
            team === "a"
              ? "A-tým FC PPB."
              : "B-tým FC PPB."
          }
          meta="Sezóna 2025/26"
        />

        <div className={styles.toolbar}>
          <div className={styles.switch}>
            <button
              type="button"
              className={
                team === "a"
                  ? styles.active
                  : undefined
              }
              onClick={() =>
                setTeam("a")
              }
            >
              A-tým
            </button>

            <button
              type="button"
              className={
                team === "b"
                  ? styles.active
                  : undefined
              }
              onClick={() =>
                setTeam("b")
              }
            >
              B-tým
            </button>
          </div>
        </div>

        {players.length > 0 ? (
          <div
            key={team}
            className={styles.grid}
          >
            {players.map(
              (player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                />
              ),
            )}
          </div>
        ) : (
          <div className={styles.empty}>
            Soupiska není dostupná.
          </div>
        )}
      </div>
    </section>
  );
}