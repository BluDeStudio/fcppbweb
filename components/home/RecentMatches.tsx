import { SectionHeader } from "@/components/ui/SectionHeader";

import type { MatchResult } from "@/types/match";

import { MatchResultCard } from "./MatchResultCard";

import styles from "./RecentMatches.module.css";

type RecentMatchesProps = {
  matches: MatchResult[];
};

export function RecentMatches({
  matches,
}: RecentMatchesProps) {
  const visibleMatches = matches.slice(0, 3);

  return (
    <section
      id="zapasy"
      className={styles.section}
    >
      <SectionHeader
        number="03"
        label="Zápasy"
        title="Poslední zápasy."
        secondLine="Výsledky FC PPB."
        meta="Sezóna 2025/26"
      />

      {visibleMatches.length > 0 ? (
        <div className={styles.grid}>
          {visibleMatches.map((match) => (
            <MatchResultCard
              key={match.id}
              match={match}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          Zápasy se nepodařilo načíst.
        </div>
      )}
    </section>
  );
}