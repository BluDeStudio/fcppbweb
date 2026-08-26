import styles from "./Partners.module.css";

export function Partners() {
  return (
    <section id="partneri" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.head}>
          <div className={styles.index}>
            <span>04</span>
            <b>PARTNEŘI</b>
          </div>

          <h2>
            Hrají s námi.
            <span>Podpora, která má smysl.</span>
          </h2>
        </div>

        <div className={styles.partnerStage}>
          <div className={styles.mainPartner}>
            <span>HLAVNÍ PARTNER</span>
            <strong>FC PPB</strong>
            <p>Prostor pro logo hlavního partnera klubu.</p>
          </div>

          <div className={styles.partnerSlots}>
            <div>PARTNER 01</div>
            <div>PARTNER 02</div>
            <div>PARTNER 03</div>
            <div>PARTNER 04</div>
          </div>
        </div>
      </div>
    </section>
  );
}
