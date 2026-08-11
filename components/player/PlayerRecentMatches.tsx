import type {
  PlayerAppMatch,
} from "@/types/playerAppStats";

import styles from "./PlayerRecentMatches.module.css";

type PlayerRecentMatchesProps = {
  matches: PlayerAppMatch[];

  limit?: number;
};

export function PlayerRecentMatches({
  matches,
  limit = 6,
}: PlayerRecentMatchesProps) {
  const visibleMatches =
    matches.slice(
      0,
      limit,
    );

  if (
    visibleMatches.length ===
    0
  ) {
    return (
      <div
        className={
          styles.empty
        }
      >
        Z aplikace zatím nemáme
        žádné dokončené zápasy
        tohoto hráče.
      </div>
    );
  }

  return (
    <div
      className={
        styles.list
      }
    >
      {visibleMatches.map(
        (match) => (
          <MatchRow
            key={
              match.matchId
            }
            match={
              match
            }
          />
        ),
      )}
    </div>
  );
}

function MatchRow({
  match,
}: {
  match: PlayerAppMatch;
}) {
  return (
    <article
      className={
        styles.match
      }
    >
      <div
        className={
          styles.matchDate
        }
      >
        <span>
          {formatDate(
            match.date,
          )}
        </span>

        <strong>
          {formatTeam(
            match.team,
          )}
        </strong>
      </div>

      <div
        className={
          styles.matchContent
        }
      >
        <h3>
          {
            match.matchTitle
          }
        </h3>

        <div
          className={
            styles.performanceStats
          }
        >
          <MiniStat
            label="Góly"
            value={
              match.goals
            }
          />

          <MiniStat
            label="Asistence"
            value={
              match.assists
            }
          />

          <MiniStat
            label="ŽK"
            value={
              match.yellowCards
            }
            card="yellow"
          />

          <MiniStat
            label="ČK"
            value={
              match.redCards
            }
            card="red"
          />
        </div>

        {(match.location ||
          match.time) && (
          <div
            className={
              styles.meta
            }
          >
            {match.location && (
              <span>
                {
                  match.location
                }
              </span>
            )}

            {match.time && (
              <span>
                {match.time}
              </span>
            )}
          </div>
        )}
      </div>

      <div
        className={
          styles.resultBlock
        }
      >
        <strong
          className={
            styles.score
          }
        >
          {match.score ??
            "—"}
        </strong>

        {match.averageRating !==
        null ? (
          <span
            className={`${styles.ratingBadge} ${getRatingClass(
              match.averageRating,
            )}`}
          >
            {match.averageRating.toFixed(
              1,
            )}
          </span>
        ) : (
          <span
            className={
              styles.ratingEmpty
            }
          >
            —
          </span>
        )}

        {match.isPlayerOfTheMatch && (
          <span
            className={
              styles.motm
            }
          >
            HZ
          </span>
        )}
      </div>
    </article>
  );
}

function MiniStat({
  label,
  value,
  card,
}: {
  label: string;

  value:
    | number
    | string;

  card?:
    | "yellow"
    | "red";
}) {
  return (
    <div
      className={
        styles.miniStat
      }
    >
      {card && (
        <span
          className={
            card === "yellow"
              ? styles.yellowCard
              : styles.redCard
          }
          aria-hidden="true"
        />
      )}

      <span
        className={
          styles.miniLabel
        }
      >
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function getRatingClass(
  rating: number,
): string {
  if (
    rating >= 8
  ) {
    return styles.ratingExcellent;
  }

  if (
    rating >= 7
  ) {
    return styles.ratingGood;
  }

  if (
    rating >= 6.5
  ) {
    return styles.ratingAverage;
  }

  if (
    rating >= 6
  ) {
    return styles.ratingWeak;
  }

  return styles.ratingBad;
}

function formatTeam(
  team: string,
): string {
  if (
    team === "A"
  ) {
    return "A-TÝM";
  }

  if (
    team === "B"
  ) {
    return "B-TÝM";
  }

  return team;
}

function formatDate(
  value: string,
): string {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "cs-CZ",
    {
      day: "2-digit",

      month: "2-digit",

      year: "numeric",
    },
  );
}
