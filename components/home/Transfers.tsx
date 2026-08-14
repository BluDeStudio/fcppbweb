import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { ClubTransfer, TransferMovementDetail } from "@/types/transfer";
import { TransferPlayerImage } from "./TransferPlayerImage";
import styles from "./Transfers.module.css";

export function Transfers({ transfers }: { transfers: ClubTransfer[] }) {
  const arrivals = transfers.filter(t => t.direction === "arrival").slice(0, 2);
  const departures = transfers.filter(t => t.direction === "departure").slice(0, 2);

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

        <div className={styles.previewGrid}>
          {arrivals.map(t => <TransferCard key={t.id} transfer={t} />)}
          {Array.from({ length: Math.max(0, 2 - arrivals.length) }).map((_, i) => (
            <TransferEmptyCard key={`a-${i}`} direction="arrival" />
          ))}
          {departures.map(t => <TransferCard key={t.id} transfer={t} />)}
          {Array.from({ length: Math.max(0, 2 - departures.length) }).map((_, i) => (
            <TransferEmptyCard key={`d-${i}`} direction="departure" />
          ))}
        </div>

        <div className={styles.allTransfersWrap}>
          <Link href="/prestupy" className={styles.allTransfersButton}>
            <span>VŠECHNY PŘESTUPY</span>
            <strong>→</strong>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function TransferCard({ transfer }: { transfer: ClubTransfer }) {
  const arrival = transfer.direction === "arrival";
  const clubUrl = buildApfTeamUrl(transfer.otherClubApfId, transfer.otherClub);

  return (
    <article className={`${styles.transferCard} ${arrival ? styles.cardArrival : styles.cardDeparture}`}>
      <div className={styles.photo}>
        <TransferPlayerImage src={transfer.imageUrl} name={transfer.playerName} />
        <span className={styles.directionBadge}>
          {arrival ? "PŘÍCHOD <<" : "ODCHOD >>"}
        </span>
      </div>

      <div className={styles.cardBody}>
        <h4>{transfer.playerName}</h4>
        <span className={styles.transferType}>{movementLabel(transfer.movementDetail)}</span>

        <div className={styles.clubRow}>
          {clubUrl ? (
            <a href={clubUrl} target="_blank" rel="noreferrer" className={styles.clubLink}>
              <ClubLogo transfer={transfer} />
              <div>
                <span className={styles.clubDirection}>
                  {clubDirectionLabel(transfer.movementDetail, arrival)}
                </span>
                <strong className={styles.clubName}>
                  {transfer.otherClub || "Klub neuveden"}
                </strong>
              </div>
              <span className={styles.externalArrow}>↗</span>
            </a>
          ) : (
            <div className={styles.clubStatic}>
              <ClubLogo transfer={transfer} />
              <div>
                <span className={styles.clubDirection}>
                  {clubDirectionLabel(transfer.movementDetail, arrival)}
                </span>
                <strong className={styles.clubName}>
                  {transfer.otherClub || "Klub neuveden"}
                </strong>
              </div>
            </div>
          )}
        </div>

        <strong className={styles.transferDate}>
          {new Date(transfer.occurredOn).toLocaleDateString("cs-CZ")}
        </strong>

        {transfer.description && <p className={styles.description}>{transfer.description}</p>}
      </div>
    </article>
  );
}

function TransferEmptyCard({ direction }: { direction: "arrival" | "departure" }) {
  const arrival = direction === "arrival";
  return (
    <article className={`${styles.transferCard} ${styles.emptyCard} ${arrival ? styles.cardArrival : styles.cardDeparture}`}>
      <div className={styles.emptyIcon}>{arrival ? "+" : "—"}</div>
      <strong>{arrival ? "ČEKÁME NA POSILU" : "ŽÁDNÝ DALŠÍ ODCHOD"}</strong>
      <span>{arrival ? "Nový příchod se zobrazí zde." : "Další odchod se zobrazí zde."}</span>
    </article>
  );
}

function ClubLogo({ transfer }: { transfer: ClubTransfer }) {
  return transfer.otherClubLogoUrl ? (
    <img src={transfer.otherClubLogoUrl} alt={transfer.otherClub || "Klub"} className={styles.clubLogo} />
  ) : (
    <div className={styles.clubLogoFallback}>FC</div>
  );
}

function movementLabel(detail: TransferMovementDetail): string {
  switch (detail) {
    case "transfer_from":
    case "transfer_to": return "PŘESTUP";
    case "loan_in":
    case "loan_out": return "HOSTOVÁNÍ";
    case "loan_end": return "KONEC HOSTOVÁNÍ";
    case "released": return "VYŘAZENÍ Z TÝMU";
  }
}

function clubDirectionLabel(detail: TransferMovementDetail, arrival: boolean): string {
  switch (detail) {
    case "transfer_from": return "Z TÝMU";
    case "transfer_to": return "DO TÝMU";
    case "loan_in": return "Z TÝMU";
    case "loan_out": return "DO TÝMU";
    case "loan_end": return arrival ? "NÁVRAT Z" : "NÁVRAT DO";
    case "released": return "BEZ KLUBU";
  }
}

function buildApfTeamUrl(teamId: number | null, teamName: string | null): string | null {
  if (!teamId || !teamName) return null;
  const slug = teamName.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug ? `https://futsalvplzni.cz/tym/${teamId}/${slug}` : null;
}
