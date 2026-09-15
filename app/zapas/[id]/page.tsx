import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { clubConfig } from "@/config/club";
import { getMatches } from "@/services/apf/getMatches";

import PlayerAvatar from "./PlayerAvatar";
import styles from "./MatchDetail.module.css";

type PageProps = {
  params:
    | Promise<{
        id: string;
      }>
    | {
        id: string;
      };
};

type FinishedMatchDbRow = {
  id: string;
  club_id: string;
  match_title: string | null;
  team: string | null;
  date: string | null;
  score: string | null;
  time: string | null;
  location: string | null;
  finished_at: string | null;
  player_of_the_match_number:
    number | null;
};

type PlayerDbRow = {
  id: string;
  name: string;
  number: number | null;
  position: string | null;
  apf_player_id: number | null;
};

type PlayerStatDbRow = {
  finished_match_id: string;
  player_id: string | null;
  player_number: number | null;
  goals: number | null;
  assists: number | null;
  yellow_cards: number | null;
  red_cards: number | null;
  played_seconds: number | null;
  average_rating: number | null;
  is_player_of_the_match:
    boolean | null;
};

type MatchEventDbRow = {
  id: string | null;
  type:
    | "goal_for"
    | "goal_against"
    | "yellow_card"
    | "red_card";
  period: number | null;
  minute: number | null;
  match_minute: number | null;
  scorer: number | null;
  assist: number | null;
  scorer_player_id:
    string | null;
  assist_player_id:
    string | null;
  card_player_number:
    number | null;
  card_player_id:
    string | null;
};

type RatingDbRow = {
  player_id: string | null;
  player_number: number | null;
  rating: number | null;
};

type MatchSide =
  | "home"
  | "away";

type DisplayEvent = {
  id: string;
  type:
    MatchEventDbRow["type"];
  minute: number;
  period: number;
  side: MatchSide;
  title: string;
  subtitle: string | null;
  score: string | null;
};

type RatedPlayer = {
  playerId: string | null;
  apfPlayerId: number | null;
  number: number | null;
  name: string;
  position: string | null;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  playedSeconds: number;
  rating: number | null;
  isPlayerOfTheMatch: boolean;
};

export default async function MatchDetailPage({
  params,
}: PageProps) {
  const resolvedParams =
    await params;

  const matchId =
    resolvedParams.id;

  const {
    data: matchData,
    error: matchError,
  } = await supabase
    .from("finished_matches")
    .select(
      [
        "id",
        "club_id",
        "match_title",
        "team",
        "date",
        "score",
        "time",
        "location",
        "finished_at",
        "player_of_the_match_number",
      ].join(", "),
    )
    .eq("id", matchId)
    .maybeSingle();

  if (
    matchError
  ) {
    console.error(
      "Detail zápasu – finished_matches:",
      matchError,
    );
  }

  if (
    !matchData
  ) {
    notFound();
  }

  const match =
    matchData as unknown as
      FinishedMatchDbRow;

  const [
    statsResponse,
    eventsResponse,
    playersResponse,
    ratingsResponse,
  ] =
    await Promise.all([
      supabase
        .from(
          "finished_match_player_stats",
        )
        .select(
          [
            "finished_match_id",
            "player_id",
            "player_number",
            "goals",
            "assists",
            "yellow_cards",
            "red_cards",
            "played_seconds",
            "average_rating",
            "is_player_of_the_match",
          ].join(", "),
        )
        .eq(
          "finished_match_id",
          match.id,
        ),

      supabase
        .from(
          "finished_match_events",
        )
        .select(
          [
            "id",
            "type",
            "period",
            "minute",
            "match_minute",
            "scorer",
            "assist",
            "scorer_player_id",
            "assist_player_id",
            "card_player_number",
            "card_player_id",
          ].join(", "),
        )
        .eq(
          "finished_match_id",
          match.id,
        ),

      supabase
        .from("players")
        .select(
          [
            "id",
            "name",
            "number",
            "position",
            "apf_player_id",
          ].join(", "),
        )
        .eq(
          "club_id",
          match.club_id,
        ),

      supabase
        .from(
          "match_player_ratings",
        )
        .select(
          [
            "player_id",
            "player_number",
            "rating",
          ].join(", "),
        )
        .eq(
          "finished_match_id",
          match.id,
        ),
    ]);

  if (
    statsResponse.error
  ) {
    console.error(
      "Detail zápasu – statistiky:",
      statsResponse.error,
    );
  }

  if (
    eventsResponse.error
  ) {
    console.error(
      "Detail zápasu – události:",
      eventsResponse.error,
    );
  }

  if (
    playersResponse.error
  ) {
    console.error(
      "Detail zápasu – hráči:",
      playersResponse.error,
    );
  }

  if (
    ratingsResponse.error
  ) {
    console.error(
      "Detail zápasu – hodnocení:",
      ratingsResponse.error,
    );
  }

  const stats =
    (
      statsResponse.data ??
      []
    ) as unknown as
      PlayerStatDbRow[];

  const events =
    (
      eventsResponse.data ??
      []
    ) as unknown as
      MatchEventDbRow[];

  const players =
    (
      playersResponse.data ??
      []
    ) as unknown as
      PlayerDbRow[];

  const ratings =
    (
      ratingsResponse.data ??
      []
    ) as unknown as
      RatingDbRow[];

  const playerById =
    new Map(
      players.map(
        (player) => [
          player.id,
          player,
        ],
      ),
    );

  const playerByNumber =
    new Map(
      players
        .filter(
          (player) =>
            player.number !==
            null,
        )
        .map(
          (player) => [
            Number(
              player.number,
            ),
            player,
          ],
        ),
    );

  const ratingByPlayerId =
    new Map<
      string,
      number[]
    >();

  const ratingByNumber =
    new Map<
      number,
      number[]
    >();

  for (
    const row
    of ratings
  ) {
    const value =
      toFiniteNumber(
        row.rating,
      );

    if (
      value === null
    ) {
      continue;
    }

    if (
      row.player_id
    ) {
      const list =
        ratingByPlayerId.get(
          row.player_id,
        ) ?? [];

      list.push(
        value,
      );

      ratingByPlayerId.set(
        row.player_id,
        list,
      );
    } else if (
      row.player_number !==
      null
    ) {
      const number =
        Number(
          row.player_number,
        );

      const list =
        ratingByNumber.get(
          number,
        ) ?? [];

      list.push(
        value,
      );

      ratingByNumber.set(
        number,
        list,
      );
    }
  }

  const ratedPlayers:
    RatedPlayer[] =
      stats
        .map(
          (stat) => {
            const player =
              stat.player_id
                ? playerById.get(
                    stat.player_id,
                  )
                : stat.player_number !==
                    null
                  ? playerByNumber.get(
                      Number(
                        stat.player_number,
                      ),
                    )
                  : undefined;

            const persistedRating =
              toFiniteNumber(
                stat.average_rating,
              );

            const rawRatings =
              stat.player_id
                ? ratingByPlayerId.get(
                    stat.player_id,
                  ) ?? []
                : stat.player_number !==
                    null
                  ? ratingByNumber.get(
                      Number(
                        stat.player_number,
                      ),
                    ) ?? []
                  : [];

            const fallbackRating =
              rawRatings.length >
              0
                ? roundOne(
                    rawRatings.reduce(
                      (
                        sum,
                        value,
                      ) =>
                        sum +
                        value,
                      0,
                    ) /
                      rawRatings.length,
                  )
                : null;

            return {
              playerId:
                stat.player_id,

              apfPlayerId:
                player?.apf_player_id ??
                null,

              number:
                player?.number ??
                stat.player_number,

              name:
                player?.name ??
                `Hráč #${
                  stat.player_number ??
                  "?"
                }`,

              position:
                player?.position ??
                null,

              goals:
                Number(
                  stat.goals ??
                  0,
                ),

              assists:
                Number(
                  stat.assists ??
                  0,
                ),

              yellowCards:
                Number(
                  stat.yellow_cards ??
                  0,
                ),

              redCards:
                Number(
                  stat.red_cards ??
                  0,
                ),

              playedSeconds:
                Number(
                  stat.played_seconds ??
                  0,
                ),

              rating:
                persistedRating ??
                fallbackRating,

              isPlayerOfTheMatch:
                stat.is_player_of_the_match ===
                true,
            };
          },
        )
        .sort(
          (
            left,
            right,
          ) => {
            if (
              left.rating ===
                null &&
              right.rating !==
                null
            ) {
              return 1;
            }

            if (
              left.rating !==
                null &&
              right.rating ===
                null
            ) {
              return -1;
            }

            if (
              left.rating !==
                null &&
              right.rating !==
                null &&
              right.rating !==
                left.rating
            ) {
              return (
                right.rating -
                left.rating
              );
            }

            if (
              right.goals !==
              left.goals
            ) {
              return (
                right.goals -
                left.goals
              );
            }

            return left.name.localeCompare(
              right.name,
              "cs",
            );
          },
        );

  const [
    homeTeam,
    awayTeam,
  ] =
    splitMatchTitle(
      match.match_title ??
      "FC PPB",
    );

  const homeIsOurs =
    isFcPpb(
      homeTeam,
    );

  const awayIsOurs =
    isFcPpb(
      awayTeam,
    );

  const [
    ownScore,
    opponentScore,
  ] =
    parseScore(
      match.score,
    );

  let homeScore =
    ownScore;

  let awayScore =
    opponentScore;

  if (
    awayIsOurs &&
    !homeIsOurs
  ) {
    homeScore =
      opponentScore;

    awayScore =
      ownScore;
  }

  const ourSide:
    MatchSide =
      awayIsOurs &&
      !homeIsOurs
        ? "away"
        : "home";

  const opponentSide:
    MatchSide =
      ourSide === "home"
        ? "away"
        : "home";

  const sortedEvents =
    [...events].sort(
      (
        left,
        right,
      ) => {
        const leftMinute =
          getEventMinute(
            left,
          );

        const rightMinute =
          getEventMinute(
            right,
          );

        if (
          leftMinute !==
          rightMinute
        ) {
          return (
            leftMinute -
            rightMinute
          );
        }

        return (
          Number(
            left.period ??
            1,
          ) -
          Number(
            right.period ??
            1,
          )
        );
      },
    );

  let runningHome = 0;
  let runningAway = 0;

  const displayEvents:
    DisplayEvent[] =
      sortedEvents.map(
        (
          event,
          index,
        ) => {
          const type =
            event.type;

          const side =
            type ===
            "goal_for"
              ? ourSide
              : type ===
                  "goal_against"
                ? opponentSide
                : ourSide;

          let title =
            eventLabel(
              type,
            );

          let subtitle:
            string | null =
              null;

          let score:
            string | null =
              null;

          if (
            type ===
            "goal_for"
          ) {
            const scorer =
              resolvePlayer(
                event.scorer_player_id,
                event.scorer,
                playerById,
                playerByNumber,
              );

            const assist =
              resolvePlayer(
                event.assist_player_id,
                event.assist,
                playerById,
                playerByNumber,
              );

            title =
              scorer?.name ??
              "GÓL FC PPB";

            subtitle =
              assist
                ? `Asistence: ${assist.name}`
                : null;

            if (
              ourSide ===
              "home"
            ) {
              runningHome += 1;
            } else {
              runningAway += 1;
            }

            score =
              `${runningHome}:${runningAway}`;
          } else if (
            type ===
            "goal_against"
          ) {
            title =
              "GÓL SOUPEŘE";

            if (
              opponentSide ===
              "home"
            ) {
              runningHome += 1;
            } else {
              runningAway += 1;
            }

            score =
              `${runningHome}:${runningAway}`;
          } else {
            const cardPlayer =
              resolvePlayer(
                event.card_player_id,
                event.card_player_number,
                playerById,
                playerByNumber,
              );

            title =
              cardPlayer?.name ??
              eventLabel(
                type,
              );

            subtitle =
              type ===
              "yellow_card"
                ? "Žlutá karta"
                : "Červená karta";
          }

          return {
            id:
              event.id ??
              `${type}-${getEventMinute(event)}-${index}`,

            type,
            minute:
              getEventMinute(
                event,
              ),

            period:
              Number(
                event.period ??
                1,
              ),

            side,
            title,
            subtitle,
            score,
          };
        },
      );

  const playerOfTheMatch =
    ratedPlayers.find(
      (player) =>
        player.isPlayerOfTheMatch,
    ) ??
    ratedPlayers[0] ??
    null;

  const rankedPlayers =
    ratedPlayers.filter(
      (player) =>
        player !==
        playerOfTheMatch,
    );

  let homeTeamId:
    number | null =
      homeIsOurs
        ? match.team === "B"
          ? clubConfig.teams.bTeam.teamId
          : clubConfig.teams.aTeam.teamId
        : null;

  let awayTeamId:
    number | null =
      awayIsOurs
        ? match.team === "B"
          ? clubConfig.teams.bTeam.teamId
          : clubConfig.teams.aTeam.teamId
        : null;

  try {
    const teamConfig =
      match.team === "B"
        ? clubConfig.teams.bTeam
        : clubConfig.teams.aTeam;

    const apfMatches =
      await getMatches({
        competitionId:
          teamConfig.competition.id,
        competitionSlug:
          teamConfig.competition.slug,
        teamId:
          teamConfig.teamId,
        teamSlug:
          teamConfig.teamSlug,
      });

    const normalizedHome =
      normalize(homeTeam);

    const normalizedAway =
      normalize(awayTeam);

    const matchingApfMatch =
      apfMatches.find(
        (apfMatch) =>
          normalize(
            apfMatch.homeTeam,
          ) ===
            normalizedHome &&
          normalize(
            apfMatch.awayTeam,
          ) ===
            normalizedAway,
      ) ??
      apfMatches.find(
        (apfMatch) =>
          apfMatch.homeScore ===
            homeScore &&
          apfMatch.awayScore ===
            awayScore,
      );

    if (
      matchingApfMatch
    ) {
      homeTeamId =
        matchingApfMatch.homeTeamId ??
        homeTeamId;

      awayTeamId =
        matchingApfMatch.awayTeamId ??
        awayTeamId;
    }
  } catch (error) {
    console.error(
      "Detail zápasu – APF logo soupeře:",
      error,
    );
  }

  return (
    <main
      className={
        styles.page
      }
    >
      <div
        className={
          styles.shell
        }
      >
        <Link
          href="/"
          className={
            styles.backLink
          }
        >
          ← ZPĚT NA HLAVNÍ STRÁNKU
        </Link>

        <section
          className={
            styles.hero
          }
        >
          <div
            className={
              styles.heroWatermark
            }
            aria-hidden="true"
          >
            FC PPB
          </div>

          <div
            className={
              styles.heroTop
            }
          >
            <span>
              {match.team ===
              "B"
                ? "B-TÝM"
                : "A-TÝM"}
            </span>

            <div>
              {formatDate(
                match.date,
              )}

              {match.time
                ? ` · ${match.time}`
                : ""}

              {match.location
                ? ` · ${match.location}`
                : ""}
            </div>
          </div>

          <div
            className={
              styles.scoreboard
            }
          >
            <TeamBlock
              name={
                homeTeam
              }
              ours={
                homeIsOurs
              }
              teamId={
                homeTeamId
              }
            />

            <div
              className={
                styles.scoreBlock
              }
            >
              <small>
                KONEČNÝ VÝSLEDEK
              </small>

              <strong>
                <span>
                  {homeScore}
                </span>

                <i>
                  :
                </i>

                <span>
                  {awayScore}
                </span>
              </strong>
            </div>

            <TeamBlock
              name={
                awayTeam
              }
              ours={
                awayIsOurs
              }
              teamId={
                awayTeamId
              }
            />
          </div>
        </section>

        <div
          className={
            styles.contentGrid
          }
        >
          <section
            className={
              styles.card
            }
          >
            <SectionHeading
              eyebrow="PRŮBĚH UTKÁNÍ"
              title="ZÁPAS."
            />

            {displayEvents.length >
            0 ? (
              <div
                className={
                  styles.timeline
                }
              >
                {displayEvents.map(
                  (event) => (
                    <EventRow
                      key={
                        event.id
                      }
                      event={
                        event
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <div
                className={
                  styles.empty
                }
              >
                Průběh utkání
                zatím není
                uložený.
              </div>
            )}
          </section>

          <aside
            className={
              styles.sideColumn
            }
          >
            {playerOfTheMatch ? (
              <section
                className={`${styles.card} ${styles.motmCard}`}
              >
                <SectionHeading
                  eyebrow="NEJLEPŠÍ VÝKON"
                  title="HRÁČ UTKÁNÍ."
                />

                <div
                  className={
                    styles.motmBody
                  }
                >
                  <div
                    className={
                      styles.motmRank
                    }
                  >
                    1.
                  </div>

                  <PlayerAvatar
                    apfPlayerId={
                      playerOfTheMatch.apfPlayerId
                    }
                    name={
                      playerOfTheMatch.name
                    }
                    size="large"
                  />

                  <div
                    className={
                      styles.motmCopy
                    }
                  >
                    <strong>
                      {
                        playerOfTheMatch.name
                      }
                    </strong>

                    <span>
                      {
                        playerOfTheMatch.position
                      }
                    </span>

                    <div
                      className={
                        styles.motmStats
                      }
                    >
                      <b>
                        {
                          playerOfTheMatch.goals
                        }
                        <small>
                          G
                        </small>
                      </b>

                      <b>
                        {
                          playerOfTheMatch.assists
                        }
                        <small>
                          A
                        </small>
                      </b>
                    </div>
                  </div>

                  <div
                    className={
                      styles.motmRating
                    }
                  >
                    <small>
                      ZNÁMKA
                    </small>

                    <strong>
                      {playerOfTheMatch.rating !==
                      null
                        ? playerOfTheMatch.rating.toFixed(
                            1,
                          )
                        : "—"}
                    </strong>
                  </div>
                </div>
              </section>
            ) : null}

            <section
              className={
                styles.card
              }
            >
              <SectionHeading
                eyebrow="SOUPISKA"
                title="HODNOCENÍ."
              />

              <div
                className={
                  styles.ranking
                }
              >
                {rankedPlayers.length >
                0 ? (
                  rankedPlayers.map(
                    (
                      player,
                      index,
                    ) => (
                      <PlayerRatingRow
                        key={
                          player.playerId ??
                          `${player.number}-${player.name}`
                        }
                        player={
                          player
                        }
                        position={
                          index +
                          2
                        }
                      />
                    ),
                  )
                ) : (
                  <div
                    className={
                      styles.empty
                    }
                  >
                    Hodnocení hráčů
                    není k dispozici.
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function TeamBlock({
  name,
  ours,
  teamId,
}: {
  name: string;
  ours: boolean;
  teamId: number | null;
}) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part[0]?.toUpperCase() ??
          "",
      )
      .join("");

  const logoSrc =
    ours
      ? "/images/fc-ppb-logo.png"
      : teamId
        ? `/teams/${teamId}.png`
        : null;

  return (
    <div
      className={
        styles.team
      }
    >
      <div
        className={
          styles.teamLogo
        }
      >
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={`Logo ${name}`}
          />
        ) : (
          <span>
            {initials}
          </span>
        )}
      </div>

      <strong>
        {name}
      </strong>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div
      className={
        styles.sectionHeading
      }
    >
      <span>
        {eyebrow}
      </span>

      <h2>
        {title}
      </h2>
    </div>
  );
}

function EventRow({
  event,
}: {
  event:
    DisplayEvent;
}) {
  const isHome =
    event.side ===
    "home";

  const isGoal =
    event.type ===
      "goal_for" ||
    event.type ===
      "goal_against";

  const isYellow =
    event.type ===
    "yellow_card";

  const isRed =
    event.type ===
    "red_card";

  return (
    <div
      className={`${styles.eventRow} ${
        event.type === "goal_against"
          ? styles.eventRowAgainst
          : event.type === "goal_for"
            ? styles.eventRowFor
            : ""
      }`}
    >
      <div
        className={`${styles.eventContent} ${
          isHome
            ? styles.eventHome
            : styles.eventAway
        }`}
      >
        <div
          className={
            styles.eventText
          }
        >
          <strong>
            {event.title}
          </strong>

          {event.subtitle ? (
            <span>
              {event.subtitle}
            </span>
          ) : null}
        </div>

        <div
          className={
            styles.eventBadge
          }
        >
          {isGoal ? (
            <span
              className={
                styles.goalIcon
              }
            >
              ⚽
            </span>
          ) : null}

          {isYellow ? (
            <span
              className={
                styles.yellowCard
              }
            />
          ) : null}

          {isRed ? (
            <span
              className={
                styles.redCard
              }
            />
          ) : null}

          {event.score ? (
            <b>
              {event.score}
            </b>
          ) : null}
        </div>
      </div>

      <div
        className={
          styles.minute
        }
      >
        <strong>
          {event.minute}
          '
        </strong>

        <small>
          {event.period}.
          POLOČAS
        </small>
      </div>
    </div>
  );
}

function PlayerRatingRow({
  player,
  position,
}: {
  player:
    RatedPlayer;

  position:
    number;
}) {
  const content = (
    <>
      <div
        className={
          styles.rank
        }
      >
        {position}.
      </div>

      <PlayerAvatar
        apfPlayerId={
          player.apfPlayerId
        }
        name={
          player.name
        }
      />

      <div
        className={
          styles.playerInfo
        }
      >
        <div
          className={
            styles.playerNameLine
          }
        >
          <strong>
            {player.name}
          </strong>

          {player.isPlayerOfTheMatch ? (
            <span>
              HRÁČ UTKÁNÍ
            </span>
          ) : null}
        </div>

        <small>
          {[
            player.position,
            player.number !==
            null
              ? `#${player.number}`
              : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </small>
      </div>

      <div
        className={
          styles.playerMiniStats
        }
      >
        <span>
          <b>
            {
              player.goals
            }
          </b>
          G
        </span>

        <span>
          <b>
            {
              player.assists
            }
          </b>
          A
        </span>

        {player.yellowCards > 0 ? (
          <span className={styles.cardStat}>
            <i className={styles.yellowCardMini} />
            <b>{player.yellowCards}</b>
          </span>
        ) : null}

        {player.redCards > 0 ? (
          <span className={styles.cardStat}>
            <i className={styles.redCardMini} />
            <b>{player.redCards}</b>
          </span>
        ) : null}
      </div>

      <div
        className={
          styles.playerRating
        }
      >
        {player.rating !==
        null
          ? player.rating.toFixed(
              1,
            )
          : "—"}
      </div>
    </>
  );

  if (
    player.apfPlayerId
  ) {
    return (
      <Link
        href={`/hrac/${player.apfPlayerId}`}
        className={
          styles.playerRow
        }
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={
        styles.playerRow
      }
    >
      {content}
    </div>
  );
}

function resolvePlayer(
  playerId:
    string | null,
  playerNumber:
    number | null,
  playerById:
    Map<string, PlayerDbRow>,
  playerByNumber:
    Map<number, PlayerDbRow>,
): PlayerDbRow | null {
  if (
    playerId
  ) {
    const byId =
      playerById.get(
        playerId,
      );

    if (
      byId
    ) {
      return byId;
    }
  }

  if (
    playerNumber !==
    null
  ) {
    return (
      playerByNumber.get(
        Number(
          playerNumber,
        ),
      ) ??
      null
    );
  }

  return null;
}

function getEventMinute(
  event:
    MatchEventDbRow,
): number {
  return Number(
    event.match_minute ??
    event.minute ??
    0,
  );
}

function eventLabel(
  type:
    MatchEventDbRow["type"],
): string {
  switch (
    type
  ) {
    case "goal_for":
      return "GÓL FC PPB";

    case "goal_against":
      return "GÓL SOUPEŘE";

    case "yellow_card":
      return "ŽLUTÁ KARTA";

    case "red_card":
      return "ČERVENÁ KARTA";

    default:
      return "UDÁLOST";
  }
}

function splitMatchTitle(
  value:
    string,
): [
  string,
  string,
] {
  const cleaned =
    value.trim();

  const separators = [
    /\s+vs\.?\s+/i,
    /\s+–\s+/,
    /\s+—\s+/,
    /\s+-\s+/,
  ];

  for (
    const separator
    of separators
  ) {
    const parts =
      cleaned.split(
        separator,
      );

    if (
      parts.length >=
      2
    ) {
      return [
        parts[0].trim(),
        parts
          .slice(1)
          .join(" - ")
          .trim(),
      ];
    }
  }

  return [
    cleaned ||
      "FC PPB",
    "SOUPEŘ",
  ];
}

function parseScore(
  value:
    string | null,
): [
  number,
  number,
] {
  const match =
    String(
      value ??
      "",
    ).match(
      /(\d+)\s*[:\-]\s*(\d+)/,
    );

  if (
    !match
  ) {
    return [
      0,
      0,
    ];
  }

  return [
    Number(
      match[1],
    ),
    Number(
      match[2],
    ),
  ];
}

function isFcPpb(
  value:
    string,
): boolean {
  return normalize(
    value,
  ).includes(
    "fc ppb",
  );
}

function normalize(
  value:
    string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      " ",
    )
    .trim();
}

function toFiniteNumber(
  value:
    unknown,
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number =
    Number(
      value,
    );

  return Number.isFinite(
    number,
  )
    ? number
    : null;
}

function roundOne(
  value:
    number,
): number {
  return Math.round(
    value *
      10,
  ) / 10;
}

function formatDate(
  value:
    string | null,
): string {
  if (
    !value
  ) {
    return "DATUM NEUVEDENO";
  }

  const iso =
    value.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})/,
    );

  if (
    iso
  ) {
    return `${iso[3]}.${iso[2]}.${iso[1]}`;
  }

  return value;
}
