import Link from "next/link";

import { clubConfig } from "@/config/club";

import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <strong>{clubConfig.name}</strong>
            <div>
              <span>PŘÁTELSTVÍ.</span>
              <span>POKORA.</span>
              <span>BOJOVNOST.</span>
            </div>
          </div>

          <nav className={styles.links}>
            <Link href="/klub">Klub</Link>
            <Link href="/tymy">Týmy</Link>
            <Link href="/zapasy">Zápasy</Link>
            <Link href="/partneri">Partneři</Link>
          </nav>
        </div>

        <div className={styles.bottom}>
          <span>© 2026 FC PPB</span>
          <span>FUTSAL / PLZEŇ</span>
          <span>Vyrobilo BluDe Studio 2026</span>
        </div>
      </div>
    </footer>
  );
}
