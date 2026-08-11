import type { MatchResult } from "@/types/match";

import styles from "./MatchResultCard.module.css";

type MatchResultCardProps = {
  match: MatchResult;
};

const resultLabels = {
  win: "Výhra",
  draw: "Remíza",
  loss: "Prohra",
} as const;

export function MatchResultCard({
  match,
}: MatchResultCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <span>{match.date}</span>

        <strong className={styles[match.result]}>
          {resultLabels[match.result]}
        </strong>
      </div>

      <div className={styles.match}>
        <div className={styles.team}>
          {match.homeTeam}
        </div>

        <div className={styles.score}>
          {match.homeScore}
          <span>:</span>
          {match.awayScore}
        </div>

        <div className={styles.team}>
          {match.awayTeam}
        </div>
      </div>

      {match.halfTimeScore && (
        <div className={styles.halfTime}>
          Poločas {match.halfTimeScore}
        </div>
      )}

      <a
        className={styles.detail}
        href={match.detailUrl}
        target="_blank"
        rel="noreferrer"
      >
        Detail zápasu
        <span>→</span>
      </a>
    </article>
  );
}