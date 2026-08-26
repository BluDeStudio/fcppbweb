"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { navigation } from "@/data/navigation";
import styles from "./Header.module.css";

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
          <Image src="/images/fc-ppb-logo.png" alt="FC PPB" width={52} height={52} priority />
          <strong>FC PPB</strong>
        </Link>

        <nav className={styles.desktopNav} aria-label="Hlavní navigace">
          {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>

        <div className={styles.socials} aria-label="Sociální sítě">
          <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer">TT</a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">IG</a>
          <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">FB</a>
        </div>

        <button className={`${styles.menu} ${open ? styles.menuOpen : ""}`} onClick={() => setOpen(v => !v)} aria-expanded={open} aria-label={open ? "Zavřít menu" : "Otevřít menu"}>
          <span /><span /><span />
        </button>
      </div>

      <div className={`${styles.mobilePanel} ${open ? styles.mobilePanelOpen : ""}`}>
        <nav>
          <Link href="/" onClick={() => setOpen(false)}>Domů</Link>
          {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}
        </nav>
        <div className={styles.mobileSocials}><span>SLEDUJ FC PPB</span><b>TIKTOK · INSTAGRAM · FACEBOOK</b></div>
      </div>
    </header>
  );
}
