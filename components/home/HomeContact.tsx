import Link from "next/link";

import styles from "./HomeContact.module.css";

export function HomeContact() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.index}><span>05</span><b>KONTAKT</b></div>

        <div className={styles.content}>
          <span>FC PPB / FUTSAL PLZEŇ</span>
          <h2>Jsme jeden tým.</h2>
          <p>Klub, hráči, partneři i lidé kolem nás.</p>

          <Link href="/klub" className={styles.button}>
            Kontaktovat klub <b>→</b>
          </Link>
        </div>
      </div>
    </section>
  );
}
