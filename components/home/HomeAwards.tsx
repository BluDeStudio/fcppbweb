"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { TopScorer } from "@/types/player";

import styles from "./HomeAwards.module.css";

type Props = {
  aTopScorer: TopScorer | null;
  bTopScorer: TopScorer | null;
};

export function HomeAwards({ aTopScorer, bTopScorer }: Props) {
  const [team, setTeam] = useState<"a" | "b">("a");
  const scorer = team === "a" ? aTopScorer : bTopScorer;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.head}>
          <div className={styles.index}><span>03</span><b>OCENĚNÍ</b></div>

          <div>
            <h2>Ocenění.</h2>
            <p>Výkony, které jsou vidět.</p>
          </div>

          <div className={styles.switch}>
            <button className={team === "a" ? styles.active : ""} onClick={() => setTeam("a")}>A-tým</button>
            <button className={team === "b" ? styles.active : ""} onClick={() => setTeam("b")}>B-tým</button>
          </div>
        </div>

        <div className={styles.grid}>
          <article className={styles.monthCard}>
            <div className={styles.label}>HRÁČ MĚSÍCE</div>
            <div className={styles.monthVisual}>
              <span>FC</span>
              <strong>PPB</strong>
            </div>
            <div className={styles.monthBottom}>
              <strong>Hráč měsíce</strong>
              <span>Klubové ocenění</span>
            </div>
          </article>

          <TopScorerCard scorer={scorer} />
        </div>
      </div>
    </section>
  );
}

function TopScorerCard({ scorer }: { scorer: TopScorer | null }) {
  return (
    <article className={styles.scorerCard}>
      <div className={styles.label}>NEJLEPŠÍ STŘELEC</div>

      {scorer ? (
        <>
          <PlayerImage player={scorer} />
          <div className={styles.shade} />
          <div className={styles.scorerContent}>
            <strong>{scorer.goals}</strong>
            <div>
              <h3>{scorer.name}</h3>
              <p>{scorer.matches} utkání</p>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.noData}>Bez dostupných statistik.</div>
      )}
    </article>
  );
}

function PlayerImage({ player }: { player: TopScorer }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [player.id]);

  if (failed) return null;

  return (
    <Image
      src={`/images/${player.id}.jpg`}
      alt={player.name}
      fill
      sizes="600px"
      className={styles.playerImage}
      onError={() => setFailed(true)}
    />
  );
}
