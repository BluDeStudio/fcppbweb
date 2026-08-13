import { SectionHeader } from "@/components/ui/SectionHeader";
import type { ClubTransfer } from "@/types/transfer";
import { TransferPlayerImage } from "./TransferPlayerImage";
import styles from "./Transfers.module.css";

export function Transfers({
  transfers,
}: {
  transfers: ClubTransfer[];
}) {
  const arrivals = transfers.filter(
    (transfer) => transfer.direction === "arrival",
  );

  const departures = transfers.filter(
    (transfer) => transfer.direction === "departure",
  );

  return (
    <section id="prestupy" className={styles.section}>
      <div className={styles.container}>
        <SectionHeader
          number="05"
          label="Přestupy"
          title="Pohyby v kádru."
          secondLine="Příchody a odchody FC PPB."
          meta="Sezóna 2026/27"
        />

        <div className={styles.transferGrid}>
          <TransferSide
            title="PŘÍCHODY"
            arrows="<<"
            subtitle="NOVÉ POSILY FC PPB"
            direction="arrival"
            transfers={arrivals}
          />

          <TransferSide
            title="ODCHODY"
            arrows=">>"
            subtitle="OPUSTILI FC PPB"
            direction="departure"
            transfers={departures}
          />
        </div>
      </div>
    </section>
  );
}

function TransferSide({
  title,
  arrows,
  subtitle,
  direction,
  transfers,
}: {
  title: string;
  arrows: string;
  subtitle: string;
  direction: "arrival" | "departure";
  transfers: ClubTransfer[];
}) {
  const isArrival = direction === "arrival";

  return (
    <div
      className={`${styles.side} ${
        isArrival ? styles.sideArrival : styles.sideDeparture
      }`}
    >
      <div className={styles.sideHeader}>
        <div>
          <h3>
            {title} <span>{arrows}</span>
          </h3>
          <p>{subtitle}</p>
        </div>

        <div className={styles.counter}>{transfers.length}</div>
      </div>

      <div className={styles.list}>
        {transfers.map((transfer) => (
          <TransferCard
            key={transfer.id}
            transfer={transfer}
          />
        ))}

        {transfers.length === 0 && (
          <div className={styles.noTransfers}>
            Zatím žádný {isArrival ? "příchod" : "odchod"}.
          </div>
        )}
      </div>
    </div>
  );
}

function TransferCard({
  transfer,
}: {
  transfer: ClubTransfer;
}) {
  const isArrival = transfer.direction === "arrival";

  const clubUrl = transfer.otherClubApfId
    ? `https://futsalvplzni.cz/tym/${transfer.otherClubApfId}/team`
    : null;

  const clubContent = (
    <>
      <ClubLogo transfer={transfer} />

      <span className={styles.clubDirection}>
        {isArrival ? "Z KLUBU" : "DO KLUBU"}
      </span>

      <strong className={styles.clubName}>
        {transfer.otherClub || "Klub neuveden"}
      </strong>

      {clubUrl && (
        <span className={styles.externalArrow}>
          ↗
        </span>
      )}
    </>
  );

  return (
    <article
      className={`${styles.transferCard} ${
        isArrival ? styles.cardArrival : styles.cardDeparture
      }`}
    >
      <div className={styles.photo}>
        <TransferPlayerImage
          src={transfer.imageUrl}
          name={transfer.playerName}
        />
      </div>

      <div className={styles.playerData}>
        <h4>{transfer.playerName}</h4>

        <div className={styles.accentLine} />

        <span className={styles.transferType}>
          {transfer.movementType === "loan"
            ? "HOSTOVÁNÍ"
            : "PŘESTUP"}
        </span>

        <strong className={styles.transferDate}>
          {new Date(transfer.occurredOn).toLocaleDateString("cs-CZ")}
        </strong>
      </div>

      <div className={styles.clubData}>
        {clubUrl ? (
          <a
            href={clubUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.clubLink}
          >
            {clubContent}
          </a>
        ) : (
          <div className={styles.clubStatic}>
            {clubContent}
          </div>
        )}
      </div>

      {transfer.description && (
        <p className={styles.description}>
          {transfer.description}
        </p>
      )}
    </article>
  );
}

function ClubLogo({
  transfer,
}: {
  transfer: ClubTransfer;
}) {
  if (transfer.otherClubLogoUrl) {
    return (
      <img
        src={transfer.otherClubLogoUrl}
        alt={transfer.otherClub || "Klub"}
        className={styles.clubLogo}
      />
    );
  }

  return (
    <div className={styles.clubLogoFallback}>
      FC
    </div>
  );
}
