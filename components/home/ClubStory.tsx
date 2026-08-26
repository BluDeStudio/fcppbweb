import Link from "next/link";

import styles from "./ClubStory.module.css";

export function ClubStory() {
  return (
    <section id="klub" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.index}>
          <span>01</span>
          <b>KLUB</b>
        </div>

        <div className={styles.content}>
          <h2>Náš příběh.</h2>
          <p className={styles.sub}>Píše se od roku 2018.</p>

          <p className={styles.text}>
            FC PPB je plzeňský futsalový klub, jehož příběh začal v roce 2018.
            Stavíme na přátelství, pokoře a bojovnosti — hodnotách, které nás
            spojují na hřišti i mimo něj.
          </p>

          <Link href="/klub" className={styles.link}>
            Poznat klub <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
