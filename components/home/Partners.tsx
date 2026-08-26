import Link from "next/link";

import styles from "./Partners.module.css";

export function Partners() {
  return (
    <section id="partneri" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <span>PARTNEŘI</span>
          <h2>Hrají s námi.</h2>
          <p>Partneři, kteří stojí za FC PPB.</p>
        </div>

        <Link href="/partneri" className={styles.link}>
          Naši partneři <span>→</span>
        </Link>
      </div>
    </section>
  );
}
