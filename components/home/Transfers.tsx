import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { ClubTransfer } from "@/types/transfer";
import styles from "./Transfers.module.css";

export function Transfers({ transfers }: { transfers: ClubTransfer[] }) {
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

        {transfers.length > 0 ? (
          <div className={styles.grid}>
            {transfers.map((transfer) => (
              <article
                key={transfer.id}
                className={`${styles.card} ${
                  transfer.direction === "arrival"
                    ? styles.arrival
                    : styles.departure
                }`}
              >
                <div className={styles.imageWrap}>
                  {transfer.imageUrl ? (
                    <Image
                      src={transfer.imageUrl}
                      alt={transfer.playerName}
                      fill
                      sizes="(max-width: 760px) 100vw, 33vw"
                      className={styles.image}
                    />
                  ) : (
                    <div className={styles.fallback}>FC PPB</div>
                  )}

                  <div className={styles.shade} />

                  <span className={styles.direction}>
                    {transfer.direction === "arrival" ? "PŘÍCHOD" : "ODCHOD"}
                  </span>

                  <span className={styles.type}>
                    {transfer.movementType === "loan" ? "HOSTOVÁNÍ" : "PŘESTUP"}
                  </span>
                </div>

                <div className={styles.content}>
                  <span className={styles.date}>
                    {new Date(transfer.occurredOn).toLocaleDateString("cs-CZ")}
                  </span>

                  <h3>{transfer.playerName}</h3>

                  {transfer.otherClub && (
                    <div className={styles.club}>
                      {transfer.direction === "arrival" ? "Z klubu" : "Do klubu"}
                      <strong>{transfer.otherClub}</strong>
                    </div>
                  )}

                  {transfer.description && <p>{transfer.description}</p>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            Aktuálně nejsou zveřejněné žádné přestupy.
          </div>
        )}
      </div>
    </section>
  );
}
