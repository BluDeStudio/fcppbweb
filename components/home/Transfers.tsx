import Link from "next/link";

import {
  SectionHeader,
} from "@/components/ui/SectionHeader";

import type {
  ClubTransfer,
} from "@/types/transfer";

import {
  TransferPlayerImage,
} from "./TransferPlayerImage";

import styles from "./Transfers.module.css";

export function Transfers({
  transfers,
}: {
  transfers:
    ClubTransfer[];
}) {
  const arrivals =
    transfers.filter(
      (
        transfer,
      ) =>
        transfer.direction ===
        "arrival",
    );

  const departures =
    transfers.filter(
      (
        transfer,
      ) =>
        transfer.direction ===
        "departure",
    );

  return (
    <section
      id="prestupy"
      className={
        styles.section
      }
    >
      <div
        className={
          styles.container
        }
      >
        <SectionHeader
          number="05"
          label="Přestupy"
          title="Pohyby v kádru."
          secondLine="Příchody a odchody FC PPB."
          meta="Sezóna 2026/27"
        />

        {transfers.length >
        0 ? (
          <div
            className={
              styles.board
            }
          >
            <TransferColumn
              title="PŘÍCHODY"
              subtitle="Nové posily FC PPB"
              direction="arrival"
              transfers={
                arrivals
              }
            />

            <TransferColumn
              title="ODCHODY"
              subtitle="Opustili FC PPB"
              direction="departure"
              transfers={
                departures
              }
            />
          </div>
        ) : (
          <div
            className={
              styles.empty
            }
          >
            Aktuálně nejsou
            zveřejněné žádné
            přestupy.
          </div>
        )}
      </div>
    </section>
  );
}

function TransferColumn({
  title,
  subtitle,
  direction,
  transfers,
}: {
  title:
    string;

  subtitle:
    string;

  direction:
    "arrival" |
    "departure";

  transfers:
    ClubTransfer[];
}) {
  const isArrival =
    direction ===
    "arrival";

  return (
    <div
      className={`${styles.column} ${
        isArrival
          ? styles.arrivalColumn
          : styles.departureColumn
      }`}
    >
      <div
        className={
          styles.columnHeader
        }
      >
        <div>
          <h3>
            {title}

            <span
              className={
                styles.chevrons
              }
            >
              {isArrival
                ? " <<"
                : " >>"}
            </span>
          </h3>

          <p>
            {subtitle}
          </p>
        </div>

        <span
          className={
            styles.count
          }
        >
          {
            transfers.length
          }
        </span>
      </div>

      <div
        className={
          styles.cards
        }
      >
        {transfers.map(
          (
            transfer,
          ) => (
            <TransferCard
              key={
                transfer.id
              }
              transfer={
                transfer
              }
            />
          ),
        )}

        {transfers.length ===
          0 && (
          <div
            className={
              styles.columnEmpty
            }
          >
            Zatím žádný{" "}
            {isArrival
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
  transfer:
    ClubTransfer;
}) {
  const isArrival =
    transfer.direction ===
    "arrival";

  const apfClubUrl =
    transfer.otherClubApfId
      ? `https://futsalvplzni.cz/tym/${transfer.otherClubApfId}/team`
      : null;

  return (
    <article
      className={`${styles.card} ${
        isArrival
          ? styles.arrivalCard
          : styles.departureCard
      }`}
    >
      <div
        className={
          styles.playerVisual
        }
      >
        <TransferPlayerImage
          src={
            transfer.imageUrl
          }
          name={
            transfer.playerName
          }
        />
      </div>

      <div
        className={
          styles.playerInfo
        }
      >
        <h4>
          {
            transfer.playerName
          }
        </h4>

        <div
          className={
            styles.shortLine
          }
        />

        <span
          className={
            styles.transferType
          }
        >
          {transfer.movementType ===
          "loan"
            ? "HOSTOVÁNÍ"
            : "PŘESTUP"}
        </span>

        <strong
          className={
            styles.date
          }
        >
          {new Date(
            transfer.occurredOn,
          ).toLocaleDateString(
            "cs-CZ",
          )}
        </strong>
      </div>

      <div
        className={
          styles.clubInfo
        }
      >
        {apfClubUrl ? (
          <a
            href={
              apfClubUrl
            }
            target="_blank"
            rel="noreferrer"
            className={
              styles.clubLink
            }
            title="Otevřít tým na APF"
          >
            <ClubLogo
              transfer={
                transfer
              }
            />

            <span
              className={
                styles.clubLabel
              }
            >
              {isArrival
                ? "Z KLUBU"
                : "DO KLUBU"}
            </span>

            <strong>
              {transfer.otherClub ||
                "Klub neuveden"}
            </strong>

            <span
              className={
                styles.external
              }
            >
              ↗
            </span>
          </a>
        ) : (
          <div
            className={
              styles.clubStatic
            }
          >
            <ClubLogo
              transfer={
                transfer
              }
            />

            <span
              className={
                styles.clubLabel
              }
            >
              {isArrival
                ? "Z KLUBU"
                : "DO KLUBU"}
            </span>

            <strong>
              {transfer.otherClub ||
                "Klub neuveden"}
            </strong>
          </div>
        )}
      </div>

      {transfer.description && (
        <div
          className={
            styles.description
          }
        >
          {
            transfer.description
          }
        </div>
      )}
    </article>
  );
}

function ClubLogo({
  transfer,
}: {
  transfer:
    ClubTransfer;
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
          transfer.otherClub ??
          "Klub"
        }
        className={
          styles.clubLogo
        }
      />
    );
  }

  return (
    <div
      className={
        styles.clubFallback
      }
    >
      FC
    </div>
  );
}
