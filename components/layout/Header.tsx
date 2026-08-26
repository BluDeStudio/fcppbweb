"use client";

import Link from "next/link";
import { useState } from "react";

import { AnimatedLogo } from "@/components/ui/AnimatedLogo/AnimatedLogo";
import { clubConfig } from "@/config/club";

import styles from "./Header.module.css";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand} onClick={closeMenu}>
          <AnimatedLogo size={52} priority />
          <div className={styles.brandText}>
            <strong>{clubConfig.name}</strong>
            <span>Futsal Plzeň</span>
          </div>
        </Link>

        <nav className={styles.desktopNav} aria-label="Hlavní navigace">
          <Link href="/">Domů</Link>
          <Link href="/klub">Klub</Link>
          <Link href="/tymy">Týmy</Link>
          <Link href="/zapasy">Zápasy</Link>
          <Link href="/partneri">Partneři</Link>
        </nav>

        <button
          type="button"
          className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""}`}
          aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </div>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}>
        <nav className={styles.mobileInner} aria-label="Mobilní navigace">
          <Link href="/" onClick={closeMenu}>Domů</Link>
          <Link href="/klub" onClick={closeMenu}>Klub</Link>
          <Link href="/tymy" onClick={closeMenu}>Týmy</Link>
          <Link href="/zapasy" onClick={closeMenu}>Zápasy</Link>
          <Link href="/partneri" onClick={closeMenu}>Partneři</Link>
        </nav>
      </div>
    </header>
  );
}
