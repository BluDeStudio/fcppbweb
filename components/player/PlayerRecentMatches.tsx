import type {
  PlayerAppMatch,
} from "@/types/playerAppStats";

import styles from "./PlayerRecentMatches.module.css";

type PlayerRecentMatchesProps = {
  matches:
    PlayerAppMatch[];

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
        (
          match,
        ) => (
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
  match:
    PlayerAppMatch;
}) {
  return (
    <article
      className={
        styles.match
      }
    >
      <div
        className={
          styles.topRow
        }
      >
        <div
          className={
            styles.dateTeam
          }
        >
          <span
            className={
              styles.date
            }
          >
            {formatDate(
              match.date,
            )}
          </span>

          <span
            className={
              styles.team
            }
          >
            {formatTeam(
              match.team,
            )}
          </span>
        </div>

        <div
          className={
            styles.matchInfo
          }
        >
          <h3>
            {
              match.matchTitle
            }
          </h3>

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
                  {
                    match.time
                  }
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className={
            styles.result
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
              className={`${styles.rating} ${getRatingClass(
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
        </div>
      </div>

      <div
        className={
          styles.statsRow
        }
      >
        <MiniStat
          label="G"
          title="Góly"
          value={
            match.goals
          }
        />

        <MiniStat
          label="A"
          title="Asistence"
          value={
            match.assists
          }
        />

        <MiniStat
          label="ŽK"
          title="Žluté karty"
          value={
            match.yellowCards
          }
          card="yellow"
        />

        <MiniStat
          label="ČK"
          title="Červené karty"
          value={
            match.redCards
          }
          card="red"
        />

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
  title,
  value,
  card,
}: {
  label:
    string;

  title:
    string;

  value:
    number |
    string;

  card?:
    "yellow" |
    "red";
}) {
  return (
    <div
      className={
        styles.miniStat
      }
      title={
        title
      }
    >
      {card && (
        <i
          className={
            card ===
            "yellow"
              ? styles.yellowCard
              : styles.redCard
          }
        />
      )}

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function formatTeam(
  value: string,
): string {
  if (
    value === "A"
  ) {
    return "A-TÝM";
  }

  if (
    value === "B"
  ) {
    return "B-TÝM";
  }

  return value;
}

function getRatingClass(
  rating: number,
): string {
  if (
    rating >= 8
  ) {
    return styles.ratingDarkGreen;
  }

  if (
    rating >= 7
  ) {
    return styles.ratingGreen;
  }

  if (
    rating >= 6
  ) {
    return styles.ratingOrange;
  }

  return styles.ratingRed;
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
