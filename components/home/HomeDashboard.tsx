"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { AnimatedLogo } from "@/components/ui/AnimatedLogo/AnimatedLogo";

import type { LeagueRow } from "@/types/league";
import type { MatchResult } from "@/types/match";
import type { NextMatch } from "@/types/nextMatch";
import type { SquadPlayer } from "@/types/player";
import type { ClubTransfer } from "@/types/transfer";

import styles from "./HomeDashboard.module.css";

export type PlayerOfMatch = {
  id: number;
  name: string;
  goals: number;
  assists: number;
  rating: number | null;
  ratingVotes: number;
  matchId: string;
  matchTitle: string;
  matchDate: string;
};

type Props = {
  aNextMatch: NextMatch | null;
  bNextMatch: NextMatch | null;
  aMatches: MatchResult[];
  bMatches: MatchResult[];
  aLeagueTable: LeagueRow[];
  bLeagueTable: LeagueRow[];
  aPlayers: SquadPlayer[];
  bPlayers: SquadPlayer[];
  aPlayerOfMatch: PlayerOfMatch | null;
  bPlayerOfMatch: PlayerOfMatch | null;
  transfers: ClubTransfer[];
};

type Team = "a" | "b";

const PNG_PLAYER_IDS = new Set([532, 997, 1562, 3937]);

const TIKTOK_URL = "https://www.tiktok.com/@fcppbfutsal";
const INSTAGRAM_URL = "https://www.instagram.com/fcppb_futsl/";

export function HomeDashboard(props: Props) {
  const [team, setTeam] = useState<Team>("a");

  const selectedRows =
    team === "a"
      ? props.aLeagueTable
      : props.bLeagueTable;

  const selectedPlayers =
    team === "a"
      ? props.aPlayers
      : props.bPlayers;

  const selectedLast =
    team === "a"
      ? props.aMatches[0] ?? null
      : props.bMatches[0] ?? null;

  const selectedPlayerOfMatch =
    team === "a"
      ? props.aPlayerOfMatch
      : props.bPlayerOfMatch;

  const selectedCompetition =
    team === "a"
      ? "1.B TŘÍDA"
      : "2.B TŘÍDA";

  const featuredPlayers = useMemo(
    () =>
      selectedPlayers.filter(
        (player) =>
          PNG_PLAYER_IDS.has(player.id) ||
          Boolean(player.imageUrl),
      ),
    [selectedPlayers],
  );

  return (
    <div className={styles.page}>
      <ClubIntro />

      <div className={styles.content}>
        <section className={styles.editorialGrid}>
          <HeroSlider transfers={props.transfers} />

          <aside className={styles.editorialSide}>
            <LastMatchCard
              match={selectedLast}
              team={team}
              setTeam={setTeam}
            />

            <PlayerOfMatchCard
              player={selectedPlayerOfMatch}
            />
          </aside>
        </section>

        <NextMatchesSection
          aMatch={props.aNextMatch}
          bMatch={props.bNextMatch}
          aRows={props.aLeagueTable}
          bRows={props.bLeagueTable}
        />

        <TeamsSection
          team={team}
          setTeam={setTeam}
          competition={selectedCompetition}
          players={featuredPlayers}
          rows={selectedRows}
        />

        <MatchesSection
          aLast={props.aMatches[0] ?? null}
          bLast={props.bMatches[0] ?? null}
          aNext={props.aNextMatch}
          bNext={props.bNextMatch}
        />

        <PartnersSection />

        <SocialStrip />
      </div>
    </div>
  );
}

function ClubIntro() {
  return (
    <section className={styles.clubIntro}>
      <div className={styles.introNoise} aria-hidden="true" />
      <div className={styles.introGlow} aria-hidden="true" />

      <div className={styles.clubIntroInner}>
        <div className={styles.introLogo}>
          <AnimatedLogo size={176} priority />
        </div>

        <div className={styles.introCopy}>
          <span>FC PPB · FUTSAL PLZEŇ</span>

          <h1>FC PPB</h1>

          <div className={styles.values}>
            <b>PŘÁTELSTVÍ.</b>
            <i />
            <b>POKORA.</b>
            <i />
            <b>BOJOVNOST.</b>
          </div>

          <p>SPOJUJE NÁS VÍC NEŽ HRA.</p>
        </div>
      </div>
    </section>
  );
}

function HeroSlider({ transfers }: { transfers: ClubTransfer[] }) {
  const slides = transfers.slice(0, 3);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <article className={styles.hero}>
        <div className={styles.heroFallback} />
        <div className={styles.heroShade} />

        <div className={styles.heroCopy}>
          <span>KLUB</span>
          <h2>SPOJUJE NÁS VÍC NEŽ HRA.</h2>
          <p>Přátelství. Pokora. Bojovnost.</p>

          <Link href="/klub" className={styles.primaryButton}>
            POZNAT KLUB <b>→</b>
          </Link>
        </div>
      </article>
    );
  }

  const transfer = slides[active];

  return (
    <article className={styles.hero}>
      {slides.map((slide, index) => (
        <img
          key={slide.id}
          className={`${styles.heroImage} ${
            index === active ? styles.heroImageActive : ""
          }`}
          src={getTransferImage(slide)}
          alt={slide.playerName}
        />
      ))}

      <div className={styles.heroShade} />
      <div className={styles.heroNoise} aria-hidden="true" />

      <div className={styles.heroCopy}>
        <span>AKTUALITY</span>

        <h2>
          {transfer.direction === "arrival"
            ? "NOVÁ TVÁŘ V FC PPB"
            : "ZMĚNA V KÁDRU"}
        </h2>

        <p>
          {transfer.playerName} · {movementLabel(transfer)}
          {transfer.otherClub ? ` · ${transfer.otherClub}` : ""}
        </p>

        <Link href="/prestupy" className={styles.primaryButton}>
          ČÍST VÍCE <b>→</b>
        </Link>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.heroArrow} ${styles.heroArrowLeft}`}
            onClick={() =>
              setActive((active - 1 + slides.length) % slides.length)
            }
            aria-label="Předchozí aktualita"
          >
            ‹
          </button>

          <button
            type="button"
            className={`${styles.heroArrow} ${styles.heroArrowRight}`}
            onClick={() => setActive((active + 1) % slides.length)}
            aria-label="Další aktualita"
          >
            ›
          </button>
        </>
      )}

      <div className={styles.heroPager}>
        <strong>{String(active + 1).padStart(2, "0")}</strong>
        <span>/</span>
        <b>{String(slides.length).padStart(2, "0")}</b>

        <div className={styles.heroDots}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={index === active ? styles.heroDotActive : ""}
              onClick={() => setActive(index)}
              aria-label={`Aktualita ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

function LastMatchCard({
  match,
  team,
  setTeam,
}: {
  match: MatchResult | null;
  team: Team;
  setTeam: (team: Team) => void;
}) {
  return (
    <section className={styles.sideBlock}>
      <div className={styles.sideHead}>
        <div>
          <span>VÝSLEDEK</span>
          <h2>POSLEDNÍ ZÁPAS</h2>
        </div>

        <TeamToggle team={team} setTeam={setTeam} compact />
      </div>

      {match ? (
        <>
          <div className={styles.lastMatch}>
            <MatchClub name={match.homeTeam} />

            <strong>
              {match.homeScore}
              <i>:</i>
              {match.awayScore}
            </strong>

            <MatchClub name={match.awayTeam} />
          </div>

          <div className={styles.matchMetaLine}>
            <span>{match.date}</span>

            {match.detailUrl && (
              <a
                href={match.detailUrl}
                target="_blank"
                rel="noreferrer"
              >
                DETAIL ↗
              </a>
            )}
          </div>
        </>
      ) : (
        <div className={styles.empty}>Bez odehraného zápasu.</div>
      )}
    </section>
  );
}

function PlayerOfMatchCard({
  player,
}: {
  player: PlayerOfMatch | null;
}) {
  if (!player) {
    return (
      <section className={`${styles.sideBlock} ${styles.playerMatchBlock}`}>
        <div className={styles.sideHead}>
          <div>
            <span>VÝKON</span>
            <h2>HRÁČ ZÁPASU</h2>
          </div>
        </div>

        <div className={styles.empty}>Hráč zápasu zatím není dostupný.</div>
      </section>
    );
  }

  const image = PNG_PLAYER_IDS.has(player.id)
    ? `/images/${player.id}.png`
    : `/images/${player.id}.jpg`;

  return (
    <section className={`${styles.sideBlock} ${styles.playerMatchBlock}`}>
      <div className={styles.sideHead}>
        <div>
          <span>VÝKON</span>
          <h2>HRÁČ ZÁPASU</h2>
        </div>

        {player.rating !== null && (
          <div className={styles.rating}>
            <span>ZNÁMKA</span>
            <b>{player.rating.toFixed(1)}</b>
          </div>
        )}
      </div>

      <Link
        href={`/hrac/${player.id}`}
        className={styles.playerMatchContent}
      >
        <div className={styles.playerMatchVisual}>
          <img
            className={styles.playerWatermark}
            src="/images/fc-ppb-logo.png"
            alt=""
            aria-hidden="true"
          />

          <img
            className={styles.playerMatchImage}
            src={image}
            alt={player.name}
          />
        </div>

        <div className={styles.playerMatchInfo}>
          <h3>{player.name}</h3>

          <div className={styles.performanceStats}>
            <span>
              <b>{player.goals}</b>
              GÓLY
            </span>

            <span>
              <b>{player.assists}</b>
              ASISTENCE
            </span>
          </div>

          <p>{player.matchTitle}</p>
        </div>
      </Link>
    </section>
  );
}

function NextMatchesSection({
  aMatch,
  bMatch,
  aRows,
  bRows,
}: {
  aMatch: NextMatch | null;
  bMatch: NextMatch | null;
  aRows: LeagueRow[];
  bRows: LeagueRow[];
}) {
  return (
    <section className={styles.section}>
      <SectionHeading
        eyebrow="NÁSLEDUJÍCÍ UTKÁNÍ"
        title="DALŠÍ ZÁPASY."
        href="/zapasy"
        link="CELÝ PROGRAM"
      />

      <div className={styles.nextMatchCards}>
        <NextMatchCompact
          teamLabel="A-TÝM"
          competition="1.B TŘÍDA"
          match={aMatch}
          rows={aRows}
        />

        <NextMatchCompact
          teamLabel="B-TÝM"
          competition="2.B TŘÍDA"
          match={bMatch}
          rows={bRows}
        />
      </div>
    </section>
  );
}

function NextMatchCompact({
  teamLabel,
  competition,
  match,
  rows,
}: {
  teamLabel: string;
  competition: string;
  match: NextMatch | null;
  rows: LeagueRow[];
}) {
  if (!match) {
    return (
      <article className={`${styles.matchTile} ${styles.nextCompactTile}`}>
        <div className={styles.matchTileTop}>
          <span>{teamLabel}</span>
          <b>DALŠÍ ZÁPAS</b>
        </div>

        <div className={styles.matchTileCompetition}>
          {competition}
        </div>

        <div className={styles.empty}>
          Další zápas zatím není v rozpisu APF.
        </div>

        <Link href="/zapasy" className={styles.tileButton}>
          PROGRAM <span>→</span>
        </Link>
      </article>
    );
  }

  const home = findTeamRow(rows, match.homeTeam);
  const away = findTeamRow(rows, match.awayTeam);
  const round = getRoundLabel(match);

  return (
    <article className={`${styles.matchTile} ${styles.nextCompactTile}`}>
      <div className={styles.matchTileTop}>
        <span>{teamLabel}</span>
        <b>DALŠÍ ZÁPAS</b>
      </div>

      <div className={styles.matchTileCompetition}>
        {competition}
        {round ? ` · ${round}` : ""}
      </div>

      <div className={styles.matchTileTeams}>
        <CompactMatchClub
          name={match.homeTeam}
          row={home}
        />

        <strong>VS</strong>

        <CompactMatchClub
          name={match.awayTeam}
          row={away}
        />
      </div>

      <div className={styles.compactMatchMeta}>
        <strong>{match.date || "—"}</strong>
        <span>{match.time || "—"}</span>
        {match.venue && <small>{match.venue}</small>}
      </div>

      <Link href="/zapasy" className={styles.tileButton}>
        DETAIL <span>→</span>
      </Link>
    </article>
  );
}

function CompactMatchClub({
  name,
  row,
}: {
  name: string;
  row: LeagueRow | null;
}) {
  return (
    <div className={styles.compactClub}>
      <TeamLogo name={name} />

      <b>{name}</b>

      <div className={styles.compactClubStats}>
        <span>
          <strong>{row ? `${row.position}.` : "—"}</strong>
          MÍSTO
        </span>

        <span>
          <strong>{row?.score ?? "—"}</strong>
          SKÓRE
        </span>
      </div>
    </div>
  );
}

function TeamsSection({
  team,
  setTeam,
  competition,
  players,
  rows,
}: {
  team: Team;
  setTeam: (team: Team) => void;
  competition: string;
  players: SquadPlayer[];
  rows: LeagueRow[];
}) {
  const miniRows = aroundOurTeam(rows, 6);
  const [showcasePlayers, setShowcasePlayers] = useState<SquadPlayer[]>([]);

  useEffect(() => {
    const pool = [...players];

    // Fisher-Yates: nový náhodný týmový náhled při načtení / přepnutí A-B.
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    setShowcasePlayers(pool.slice(0, Math.min(4, pool.length)));
  }, [team, players]);

  return (
    <section className={styles.section}>
      <SectionHeading
        eyebrow="KLUB"
        title="TÝMY."
        href="/tymy"
        link="DETAIL TÝMU"
      />

      <div className={styles.teamSectionBar}>
        <TeamToggle team={team} setTeam={setTeam} />
      </div>

      <div className={styles.teamsSplit}>
        <div className={styles.teamShowcase}>
          <img
            className={styles.teamShowcaseLogo}
            src="/images/fc-ppb-logo.png"
            alt=""
            aria-hidden="true"
          />

          <div className={styles.teamShowcasePlayers}>
            {showcasePlayers.length > 0 ? (
              showcasePlayers.map((player, index) => (
                <ShowcasePlayer
                  key={`${team}-${player.id}`}
                  player={player}
                  index={index}
                  count={showcasePlayers.length}
                />
              ))
            ) : (
              <div className={styles.empty}>
                Náhled hráčů zatím není dostupný.
              </div>
            )}
          </div>

          <div className={styles.teamShowcaseFade} />

          <Link href="/tymy" className={styles.teamShowcaseLink}>
            SOUPISKA <span>→</span>
          </Link>
        </div>

        <div className={styles.teamTable}>
          <div className={styles.teamTableTop}>
            <div>
              <span>SOUTĚŽ</span>
              <h3>{competition}</h3>
            </div>

            <Link href="/zapasy#tabulka">
              CELÁ TABULKA <b>→</b>
            </Link>
          </div>

          <div className={styles.tableHead}>
            <span>#</span>
            <span>TÝM</span>
            <span>Z</span>
            <span>SKÓRE</span>
            <span>B</span>
          </div>

          {miniRows.map((row) => (
            <div
              key={`${row.position}-${row.teamName}`}
              className={`${styles.tableRow} ${
                row.isOurTeam ? styles.ourTeamRow : ""
              }`}
            >
              <span>{row.position}.</span>
              <strong>{row.teamName}</strong>
              <span>{row.matches}</span>
              <span>{row.score}</span>
              <b>{row.points}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcasePlayer({
  player,
  index,
  count,
}: {
  player: SquadPlayer;
  index: number;
  count: number;
}) {
  const sources = [
    ...(PNG_PLAYER_IDS.has(player.id) ? [`/images/${player.id}.png`] : []),
    ...(player.imageUrl ? [player.imageUrl] : []),
  ];

  const [imageIndex, setImageIndex] = useState(0);
  const image = sources[imageIndex];

  useEffect(() => {
    setImageIndex(0);
  }, [player.id]);

  return (
    <div
      className={styles.showcasePlayer}
      data-slot={getShowcaseSlot(index, count)}
      title={player.name}
    >
      {image ? (
        <img
          src={image}
          alt={player.name}
          onError={() =>
            setImageIndex((current) =>
              current + 1 < sources.length ? current + 1 : sources.length,
            )
          }
        />
      ) : (
        <div className={styles.showcaseSilhouette}>PPB</div>
      )}
    </div>
  );
}

function getShowcaseSlot(index: number, count: number) {
  if (count <= 1) return "center";
  if (count === 2) return index === 0 ? "left" : "right";
  if (count === 3) return ["left", "center", "right"][index];

  // 4 hráči: dva vzadu, dva vpředu. Vizuálně se překrývají jako týmová fotka.
  return ["far-left", "left-center", "right-center", "far-right"][index];
}

function MatchesSection({
  aLast,
  bLast,
  aNext,
  bNext,
}: {
  aLast: MatchResult | null;
  bLast: MatchResult | null;
  aNext: NextMatch | null;
  bNext: NextMatch | null;
}) {
  const cards: MatchCardData[] = [
    ...(aLast
      ? [
          {
            key: "a-last",
            team: "A-TÝM",
            competition: "1.B TŘÍDA",
            kind: "POSLEDNÍ ZÁPAS",
            home: aLast.homeTeam,
            away: aLast.awayTeam,
            date: aLast.date,
            score: `${aLast.homeScore}:${aLast.awayScore}`,
            detailUrl: aLast.detailUrl,
          },
        ]
      : []),

    ...(aNext
      ? [
          {
            key: "a-next",
            team: "A-TÝM",
            competition: "1.B TŘÍDA",
            kind: "DALŠÍ ZÁPAS",
            home: aNext.homeTeam,
            away: aNext.awayTeam,
            date: [aNext.date, aNext.time].filter(Boolean).join(" · "),
            score: "VS",
            detailUrl: "/zapasy",
          },
        ]
      : []),

    ...(bLast
      ? [
          {
            key: "b-last",
            team: "B-TÝM",
            competition: "2.B TŘÍDA",
            kind: "POSLEDNÍ ZÁPAS",
            home: bLast.homeTeam,
            away: bLast.awayTeam,
            date: bLast.date,
            score: `${bLast.homeScore}:${bLast.awayScore}`,
            detailUrl: bLast.detailUrl,
          },
        ]
      : []),

    ...(bNext
      ? [
          {
            key: "b-next",
            team: "B-TÝM",
            competition: "2.B TŘÍDA",
            kind: "DALŠÍ ZÁPAS",
            home: bNext.homeTeam,
            away: bNext.awayTeam,
            date: [bNext.date, bNext.time].filter(Boolean).join(" · "),
            score: "VS",
            detailUrl: "/zapasy",
          },
        ]
      : []),
  ];

  return (
    <section className={styles.section}>
      <SectionHeading
        eyebrow="PROGRAM"
        title="ZÁPASY."
        href="/zapasy"
        link="VŠECHNY ZÁPASY"
      />

      <div className={styles.matchScroller}>
        {cards.map((card) => (
          <MatchTile key={card.key} card={card} />
        ))}
      </div>
    </section>
  );
}

type MatchCardData = {
  key: string;
  team: string;
  competition: string;
  kind: string;
  home: string;
  away: string;
  date: string;
  score: string;
  detailUrl?: string | null;
};

function MatchTile({ card }: { card: MatchCardData }) {
  return (
    <article className={styles.matchTile}>
      <div className={styles.matchTileTop}>
        <span>{card.team}</span>
        <b>{card.kind}</b>
      </div>

      <div className={styles.matchTileCompetition}>
        {card.competition}
      </div>

      <div className={styles.matchTileTeams}>
        <MatchClub name={card.home} />

        <strong>{card.score}</strong>

        <MatchClub name={card.away} />
      </div>

      <p>{card.date}</p>

      {card.detailUrl && (
        card.detailUrl.startsWith("http") ? (
          <a
            href={card.detailUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.tileButton}
          >
            DETAIL <span>→</span>
          </a>
        ) : (
          <Link href={card.detailUrl} className={styles.tileButton}>
            DETAIL <span>→</span>
          </Link>
        )
      )}
    </article>
  );
}

function PartnersSection() {
  return (
    <section className={`${styles.section} ${styles.partnersSection}`}>
      <SectionHeading
        eyebrow="HRAJÍ S NÁMI"
        title="PARTNEŘI."
        href="/partneri"
        link="PARTNEŘI KLUBU"
      />

      <div className={styles.partners}>
        <PartnerLogo
          name="PILSCO"
          href="https://www.pilsco.cz/"
          sources={[
            "/partners/pilsco.png",
          ]}
        />

        <PartnerLogo
          name="FEMOTEC"
          href="https://femotec.cz/"
          sources={[
            "/partners/femotec.png",
          ]}
        />
      </div>
    </section>
  );
}

function PartnerLogo({
  name,
  href,
  sources,
}: {
  name: string;
  href: string;
  sources: string[];
}) {
  const [index, setIndex] = useState(0);
  const src = sources[index];

  return (
    <a href={href} target="_blank" rel="noreferrer">
      {src ? (
        <img
          src={src}
          alt={name}
          onError={() =>
            setIndex((current) =>
              current + 1 < sources.length
                ? current + 1
                : sources.length,
            )
          }
        />
      ) : (
        <strong>{name}</strong>
      )}
    </a>
  );
}

function SocialStrip() {
  return (
    <section className={styles.socialStrip}>
      <div>
        <span>SLEDUJ FC PPB</span>
        <strong>ZÁPASY. KABINA. TRÉNINKY. ZÁKULISÍ.</strong>
      </div>

      <div>
        <a href={TIKTOK_URL} target="_blank" rel="noreferrer">
          TIKTOK <span>@fcppbfutsal</span>
        </a>

        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
          INSTAGRAM <span>fcppb_futsl</span>
        </a>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  href,
  link,
}: {
  eyebrow: string;
  title: string;
  href: string;
  link: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>

      <Link href={href}>
        {link} <b>→</b>
      </Link>
    </div>
  );
}

function TeamToggle({
  team,
  setTeam,
  compact = false,
}: {
  team: Team;
  setTeam: (team: Team) => void;
  compact?: boolean;
}) {
  return (
    <div className={`${styles.toggle} ${compact ? styles.toggleCompact : ""}`}>
      <button
        type="button"
        className={team === "a" ? styles.active : ""}
        onClick={() => setTeam("a")}
      >
        A-TÝM
      </button>

      <button
        type="button"
        className={team === "b" ? styles.active : ""}
        onClick={() => setTeam("b")}
      >
        B-TÝM
      </button>
    </div>
  );
}

function MatchClub({ name }: { name: string }) {
  return (
    <div className={styles.matchClub}>
      <TeamLogo name={name} />
      <b>{name}</b>
    </div>
  );
}

function TeamLogo({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  const ours = normalize(name).includes("fc ppb");

  const sources = ours
    ? ["/images/fc-ppb-logo.png"]
    : teamLogoSources(name);

  const [index, setIndex] = useState(0);
  const src = sources[index];

  return (
    <div className={`${styles.teamLogo} ${large ? styles.teamLogoLarge : ""}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          onError={() =>
            setIndex((current) =>
              current + 1 < sources.length
                ? current + 1
                : sources.length,
            )
          }
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}

function teamLogoSources(teamName: string): string[] {
  const slug = slugify(teamName);

  return [
    `/images/teams/${slug}.png`,
    `/images/teams/${slug}.webp`,
    `/images/teams/${slug}.jpg`,
    `/images/${slug}.png`,
  ];
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findTeamRow(
  rows: LeagueRow[],
  teamName: string,
): LeagueRow | null {
  const wanted = normalize(teamName);

  return (
    rows.find((row) => normalize(row.teamName) === wanted) ??
    rows.find((row) => {
      const current = normalize(row.teamName);

      return current.includes(wanted) || wanted.includes(current);
    }) ??
    null
  );
}

function aroundOurTeam(rows: LeagueRow[], count: number): LeagueRow[] {
  if (rows.length === 0) return [];

  const index = rows.findIndex((row) => row.isOurTeam);

  if (index < 0) return rows.slice(0, count);

  const half = Math.floor(count / 2);
  let start = Math.max(0, index - half);
  let end = Math.min(rows.length, start + count);

  start = Math.max(0, end - count);

  return rows.slice(start, end);
}

function getRoundLabel(match: NextMatch | null): string | null {
  if (!match) return null;

  const extended =
    match as NextMatch & {
      round?: string | number | null;
      roundName?: string | null;
      matchday?: string | number | null;
    };

  const raw =
    extended.roundName ??
    extended.round ??
    extended.matchday;

  if (
    raw === null ||
    raw === undefined ||
    String(raw).trim() === ""
  ) {
    return null;
  }

  const value = String(raw).trim();

  return /kolo/i.test(value)
    ? value.toUpperCase()
    : `${value}. KOLO`;
}

function movementLabel(transfer: ClubTransfer): string {
  switch (transfer.movementDetail) {
    case "transfer_from":
    case "transfer_to":
      return "PŘESTUP";

    case "loan_in":
      return "NA HOSTOVÁNÍ";

    case "loan_out":
      return "HOSTOVÁNÍ";

    case "loan_end":
      return "KONEC HOSTOVÁNÍ";

    case "released":
      return "UKONČENÍ PŮSOBENÍ";
  }
}

function getTransferImage(transfer: ClubTransfer): string {
  if (
    transfer.playerId &&
    PNG_PLAYER_IDS.has(transfer.playerId)
  ) {
    return `/images/${transfer.playerId}.png`;
  }

  return transfer.imageUrl || "/images/fc-ppb-logo.png";
}

function initials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
