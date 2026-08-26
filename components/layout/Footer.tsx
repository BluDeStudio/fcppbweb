import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer(){return <footer className={styles.footer}><div className={styles.inner}><div className={styles.brand}><Image src="/images/fc-ppb-logo.png" alt="FC PPB" width={54} height={54}/><div><strong>FC PPB</strong><span>FUTSAL PLZEŇ</span></div></div><nav><Link href="/tymy">Týmy</Link><Link href="/zapasy">Zápasy</Link><Link href="/klub">Klub</Link><Link href="/#partneri">Partneři</Link></nav><p>Vyrobilo BluDe Studio 2026</p></div></footer>}
