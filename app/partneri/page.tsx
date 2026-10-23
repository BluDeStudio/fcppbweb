import Link from "next/link";
import PageHeading from "@/components/PageHeading";
import styles from "./page.module.css";
export const metadata = { title: "Partneři | FC PPB", description: "Partneři a podpora futsalového klubu FC PPB Plzeň." };
export default function PartneriPage() {
  return <main className={styles.page}><div className={styles.shell}>
    <PageHeading title="PARTNEŘI" subtitle="SPOLUPRÁCE / PODPORA / FC PPB" />
    <p className={styles.lead}>Za každým klubem stojí lidé a firmy, kteří mu pomáhají růst. Tady bude prostor pro prezentaci partnerů FC PPB.</p>
    <div className={styles.grid}>
      <section className={styles.panel}><span className={styles.tag}>01 / PARTNEŘI KLUBU</span><h2>NAŠI PARTNEŘI</h2><p>Připravujeme přehled klubových partnerů a jejich prezentaci. Loga a odkazy doplníme podle potvrzených podkladů.</p></section>
      <section className={styles.panel}><span className={styles.tag}>02 / SPOLUPRÁCE</span><h2>BUĎTE SOUČÁSTÍ FC PPB.</h2><p>Podpora klubu pomáhá vytvářet zázemí pro tréninky, zápasy a další klubové aktivity.</p><Link className={styles.link} href="/klub">POZNAT NÁŠ KLUB →</Link></section>
    </div>
    <p className={styles.notice}>Stránka je funkční. Konkrétní nabídku partnerství, loga a kontaktní formulář připravíme v další fázi.</p>
  </div></main>;
}
