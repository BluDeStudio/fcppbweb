import { SectionHeader } from "@/components/ui/SectionHeader";

import type {
  ClubTransfer,
  TransferMovementDetail,
} from "@/types/transfer";

import { TransferPlayerImage } from "./TransferPlayerImage";

import styles from "./Transfers.module.css";

export function Transfers({
  transfers,
}: {
  transfers: ClubTransfer[];
}) {
  const arrivals =
    transfers.filter(
      (transfer) =>
        transfer.direction === "arrival",
    );

  const departures =
    transfers.filter(
      (transfer) =>
        transfer.direction === "departure",
    );

  return (
    <section
      id="prestupy"
      className={styles.section}
    >
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
  const arrival =
    direction === "arrival";

  return (
    <div
      className={`${styles.side} ${
        arrival
          ? styles.sideArrival
          : styles.sideDeparture
      }`}
    >
      <div className={styles.sideHeader}>
        <div>
          <h3>
            {title}{" "}
            <span>
              {arrows}
            </span>
          </h3>

          <p>
            {subtitle}
          </p>
        </div>

        <div className={styles.counter}>
          {transfers.length}
        </div>
      </div>

      <div className={styles.cardsGrid}>
        {transfers.map(
          (transfer) => (
            <TransferCard
              key={transfer.id}
              transfer={transfer}
            />
          ),
        )}

        {transfers.length === 0 && (
          <div className={styles.noTransfers}>
            Zatím žádný{" "}
            {arrival
              ? "příchod"
              : "odchod"}
            .
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
  const arrival =
    transfer.direction === "arrival";

  const clubUrl =
    buildApfTeamUrl(
      transfer.otherClubApfId,
      transfer.otherClub,
    );

  const clubLabel =
    clubDirectionLabel(
      transfer.movementDetail,
      arrival,
    );

  return (
    <article
      className={`${styles.transferCard} ${
        arrival
          ? styles.cardArrival
          : styles.cardDeparture
      }`}
    >
      <div className={styles.photo}>
        <TransferPlayerImage
          src={transfer.imageUrl}
          name={transfer.playerName}
        />
      </div>

      <div className={styles.cardBody}>
        <h4>
          {transfer.playerName}
        </h4>

        <span className={styles.transferType}>
          {movementLabel(
            transfer.movementDetail,
          )}
        </span>

        <div className={styles.clubRow}>
          {clubUrl ? (
            <a
              href={clubUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.clubLink}
            >
              <ClubLogo
                transfer={transfer}
              />

              <div>
                <span className={styles.clubDirection}>
                  {clubLabel}
                </span>

                <strong className={styles.clubName}>
                  {transfer.otherClub ||
                    "Klub neuveden"}
                </strong>
              </div>

              <span className={styles.externalArrow}>
                ↗
              </span>
            </a>
          ) : (
            <div className={styles.clubStatic}>
              <ClubLogo
                transfer={transfer}
              />

              <div>
                <span className={styles.clubDirection}>
                  {clubLabel}
                </span>

                <strong className={styles.clubName}>
                  {transfer.otherClub ||
                    "Klub neuveden"}
                </strong>
              </div>
            </div>
          )}
        </div>

        <strong className={styles.transferDate}>
          {new Date(
            transfer.occurredOn,
          ).toLocaleDateString(
            "cs-CZ",
          )}
        </strong>

        {transfer.description && (
          <p className={styles.description}>
            {transfer.description}
          </p>
        )}
      </div>
    </article>
  );
}

function ClubLogo({
  transfer,
}: {
  transfer: ClubTransfer;
}) {
  if (
    transfer.otherClubLogoUrl
  ) {
    return (
      <img
        src={
          transfer.otherClubLogoUrl
        }
        alt={
          transfer.otherClub ||
          "Klub"
        }
        className={
          styles.clubLogo
        }
      />
    );
  }

  return (
    <div className={styles.clubLogoFallback}>
      FC
    </div>
  );
}

function movementLabel(
  detail: TransferMovementDetail,
): string {
  switch (detail) {
    case "transfer_from":
    case "transfer_to":
      return "PŘESTUP";

    case "loan_in":
    case "loan_out":
      return "HOSTOVÁNÍ";

    case "loan_end":
      return "KONEC HOSTOVÁNÍ";

    case "released":
      return "VYŘAZENÍ Z TÝMU";
  }
}

function clubDirectionLabel(
  detail: TransferMovementDetail,
  arrival: boolean,
): string {
  switch (detail) {
    case "transfer_from":
      return "Z TÝMU";

    case "transfer_to":
      return "DO TÝMU";

    case "loan_in":
      return "Z TÝMU";

    case "loan_out":
      return "DO TÝMU";

    case "loan_end":
      return arrival
        ? "NÁVRAT Z"
        : "NÁVRAT DO";

    case "released":
      return "BEZ KLUBU";
  }
}

function buildApfTeamUrl(
  teamId: number | null,
  teamName: string | null,
): string | null {
  if (
    !teamId ||
    !teamName
  ) {
    return null;
  }

  const slug =
    teamName
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-|-$/g,
        "",
      );

  return slug
    ? `https://futsalvplzni.cz/tym/${teamId}/${slug}`
    : null;
}
