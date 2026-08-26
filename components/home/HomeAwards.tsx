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
          <div className={styles.index}>
            <span>03</span>
            <b>OCENĚNÍ</b>
          </div>

          <div>
            <h2>
              Hráči.
              <span>Ti, kteří jsou vidět.</span>
            </h2>
          </div>

          <div className={styles.switch}>
            <button type="button" className={team === "a" ? styles.active : ""} onClick={() => setTeam("a")}>A-tým</button>
            <button type="button" className={team === "b" ? styles.active : ""} onClick={() => setTeam("b")}>B-tým</button>
          </div>
        </div>

        <div className={styles.grid}>
          <AwardPlaceholder
            number="01"
            label="Hráč měsíce"
            title="Připravujeme"
            text="Klubové ocenění budeme doplňovat z administrace."
          />

          <TopScorerAward scorer={scorer} />

          <AwardPlaceholder
            number="03"
            label="Nejlepší nahrávač"
            title="Připravujeme"
            text="Karta je připravená pro napojení na stabilní zdroj asistencí."
          />
        </div>
      </div>
    </section>
  );
}

function TopScorerAward({ scorer }: { scorer: TopScorer | null }) {
  return (
    <article className={`${styles.card} ${styles.featured}`}>
      <div className={styles.cardNumber}>02</div>

      {scorer ? (
        <>
          <PlayerImage player={scorer} />
          <div className={styles.shade} />

          <div className={styles.featuredContent}>
            <span>NEJLEPŠÍ STŘELEC</span>
            <strong>{scorer.goals}</strong>
            <h3>{scorer.name}</h3>
            <p>{scorer.matches} utkání</p>
          </div>
        </>
      ) : (
        <div className={styles.placeholderContent}>
          <span>NEJLEPŠÍ STŘELEC</span>
          <h3>Bez dat</h3>
        </div>
      )}
    </article>
  );
}

function PlayerImage({ player }: { player: TopScorer }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [player.id]);

  if (failed) return <div className={styles.photoFallback} />;

  return (
    <Image
      src={`/images/${player.id}.jpg`}
      alt={player.name}
      fill
      sizes="420px"
      className={styles.playerImage}
      onError={() => setFailed(true)}
    />
  );
}

function AwardPlaceholder({
  number,
  label,
  title,
  text,
}: {
  number: string;
  label: string;
  title: string;
  text: string;
}) {
  return (
    <article className={styles.card}>
      <div className={styles.cardNumber}>{number}</div>

      <div className={styles.placeholderContent}>
        <span>{label}</span>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}
