import Link from "next/link";

import styles from "./Partners.module.css";

export function Partners() {
  return (
    <section id="partneri" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.index}><span>04</span><b>PARTNEŘI</b></div>

        <div className={styles.content}>
          <h2>Hrají s námi.</h2>
          <p>Partneři, kteří stojí za FC PPB.</p>

          <Link href="/partneri" className={styles.link}>
            Naši partneři <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
