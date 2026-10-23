import Link from "next/link";
import PageHeading from "@/components/PageHeading";
import styles from "./page.module.css";
export const metadata = { title: "Klub | FC PPB", description: "Informace o futsalovém klubu FC PPB Plzeň." };
export default function KlubPage() {
  return <main className={styles.page}><div className={styles.shell}>
    <PageHeading title="KLUB" subtitle="FC PPB / PLZEŇ / FUTSAL" />
    <p className={styles.lead}>FC PPB je plzeňský futsalový klub. Na hřišti nás spojuje přátelství, pokora a bojovnost.</p>
    <div className={styles.grid}>
      <section className={styles.panel}><span className={styles.tag}>01 / O NÁS</span><h2>JEDEN KLUB. DVA TÝMY.</h2><p>FC PPB tvoří A-tým a B-tým. Společně reprezentujeme klub v plzeňských futsalových soutěžích.</p><Link className={styles.link} href="/tymy">PROHLÉDNOUT TÝMY →</Link></section>
      <section className={styles.panel}><span className={styles.tag}>02 / NAŠE HODNOTY</span><h2>PŘÁTELSTVÍ. POKORA. BOJOVNOST.</h2><p>Hodnoty, které chceme přenášet do zápasů, tréninků i života mimo hřiště.</p><Link className={styles.link} href="/zapasy">PŘEJÍT NA ZÁPASY →</Link></section>
    </div>
    <p className={styles.notice}>Stránka klubu je připravená. Historii, vedení klubu a další informace doplníme postupně.</p>
  </div></main>;
}
