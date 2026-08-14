import Link from "next/link";
import { clubConfig } from "@/config/club";
import { getPublishedTransfers } from "@/lib/getTransfers";
import { TransferCard } from "@/components/home/Transfers";
import styles from "./page.module.css";

export const revalidate = 300;

export default async function TransfersPage() {
  const transfers = await getPublishedTransfers();
  const arrivals = transfers.filter(t => t.direction === "arrival");
  const departures = transfers.filter(t => t.direction === "departure");

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div>
            <span className={styles.eyebrow}>Přestupy</span>
            <h1>Všechny pohyby v kádru.</h1>
            <p>
              Kompletní historie příchodů, odchodů, hostování
              a dalších změn v kádru FC PPB.
            </p>
          </div>

          <Link href="/#prestupy" className={styles.back}>
            ← Zpět na přehled
          </Link>
        </div>

        <div className={styles.meta}>
          <span>Aktuální sezóna</span>
          <strong>{clubConfig.season}</strong>
        </div>

        <TransferGroup
          title="PŘÍCHODY"
          direction="arrival"
          transfers={arrivals}
        />

        <TransferGroup
          title="ODCHODY"
          direction="departure"
          transfers={departures}
        />
      </div>
    </main>
  );
}

function TransferGroup({
  title,
  direction,
  transfers,
}: {
  title: string;
  direction: "arrival" | "departure";
  transfers: Awaited<ReturnType<typeof getPublishedTransfers>>;
}) {
  return (
    <section
      className={`${styles.group} ${
        direction === "arrival"
          ? styles.arrivalGroup
          : styles.departureGroup
      }`}
    >
      <div className={styles.groupHeader}>
        <h2>{title}</h2>
        <span>{transfers.length}</span>
      </div>

      {transfers.length > 0 ? (
        <div className={styles.grid}>
          {transfers.map(transfer => (
            <TransferCard
              key={transfer.id}
              transfer={transfer}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          Zatím zde není žádný záznam.
        </div>
      )}
    </section>
  );
}
