"use client";

import { useMemo, useState } from "react";

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
}: PlayerRecentMatchesProps) {
  const [expanded, setExpanded] = useState(false);

  // Keep the optional `limit` prop in the type for compatibility with existing pages.
  // The requested preview always contains up to 10 matches.
  const sortedMatches = useMemo(
    () =>
      [...matches].sort((a, b) => {
        const aDate = parseMatchDate(a.date);
        const bDate = parseMatchDate(b.date);
        return bDate - aDate;
      }),
    [matches],
  );

  if (sortedMatches.length === 0) {
    return (
      <div className={styles.empty}>
        Z aplikace zatím nemáme žádné dokončené zápasy tohoto hráče.
      </div>
    );
  }

  const previewCount = 10;
  const visibleMatches = expanded
    ? sortedMatches
    : sortedMatches.slice(0, previewCount);
  const hasMore = sortedMatches.length > previewCount;

  return (
    <div className={styles.list}>
      {visibleMatches.map((match) => (
        <MatchRow key={match.matchId} match={match} />
      ))}

      {hasMore && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((previous) => !previous)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            padding: "15px 20px",
            marginTop: "8px",
            border: "1px solid rgba(83, 242, 10, 0.35)",
            borderRadius: "12px",
            background: "rgba(83, 242, 10, 0.07)",
            color: "#baff91",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <span aria-hidden="true">{expanded ? "▲" : "▼"}</span>
          {expanded
            ? "Sbalit historii zápasů"
            : `Zobrazit celou historii (${sortedMatches.length} zápasů)`}
        </button>
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

          {match.isPlayerOfTheMatch && (
            <span className={styles.motmDesktop} title="Hráč zápasu">HZ</span>
          )}

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

/**
 * Converts supported match dates to comparable timestamps.
 * Handles Czech DD.MM.YYYY, ISO YYYY-MM-DD, optional time and ISO timestamps.
 * Invalid dates sort to the end of the history.
 */
function parseMatchDate(value: string): number {
  const raw = String(value ?? "").trim();
  if (!raw) return Number.NEGATIVE_INFINITY;

  const czech = raw.match(
    /^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})(?:[\s,]+(\d{1,2}):(\d{2}))?/,
  );
  if (czech) {
    const [, day, month, year, hour = "0", minute = "0"] = czech;
    return validDateTimestamp(+year, +month, +day, +hour, +minute);
  }

  const iso = raw.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{2}))?/,
  );
  if (iso) {
    const [, year, month, day, hour = "0", minute = "0"] = iso;
    return validDateTimestamp(+year, +month, +day, +hour, +minute);
  }

  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function validDateTimestamp(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  const timestamp = Date.UTC(year, month - 1, day, hour, minute);
  const date = new Date(timestamp);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    date.getUTCHours() !== hour ||
    date.getUTCMinutes() !== minute
  ) {
    return Number.NEGATIVE_INFINITY;
  }
  return timestamp;
}

function formatDate(value: string): string {
  const timestamp = parseMatchDate(value);
  if (!Number.isFinite(timestamp)) return value;
  return new Date(timestamp).toLocaleDateString("cs-CZ", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
