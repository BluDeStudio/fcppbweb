import Link from "next/link";
import styles from "./ClubStory.module.css";

export function ClubStory() {
  return (
    <section id="klub" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.head}>
          <div className={styles.index}>
            <span>01</span>
            <b>O KLUBU</b>
          </div>

          <div className={styles.heading}>
            <h2>
              Náš příběh.
              <span>Píše se od roku 2018.</span>
            </h2>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.story}>
            <p className={styles.lead}>
              Jsme plzeňský futsalový klub postavený na přátelství,
              soutěživosti a společné vášni pro hru.
            </p>

            <p>
              Začínali jsme jako parta kamarádů. Dnes máme dva týmy,
              vlastní klubovou identitu a chuť posouvat FC PPB dál
              na hřišti i mimo něj.
            </p>

            <Link href="/klub" className={styles.link}>
              Poznat celý příběh
              <span>→</span>
            </Link>
          </div>

          <div className={styles.facts}>
            <div className={styles.fact}>
              <span>01</span>
              <strong>2018</strong>
              <p>Začátek našeho příběhu</p>
            </div>

            <div className={styles.fact}>
              <span>02</span>
              <strong>2</strong>
              <p>A-tým a B-tým</p>
            </div>

            <div className={styles.fact}>
              <span>03</span>
              <strong>PLZEŇ</strong>
              <p>Město, které reprezentujeme</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
