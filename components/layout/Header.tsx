"use client";

import Link from "next/link";
import { useState } from "react";

import { AnimatedLogo } from "@/components/ui/AnimatedLogo/AnimatedLogo";
import { clubConfig } from "@/config/club";

import styles from "./Header.module.css";

const teamLinks = [
  { label: "A-tým", href: "/tymy/a" },
  { label: "B-tým", href: "/tymy/b" },
  { label: "Soupisky", href: "/tymy#soupisky" },
  { label: "Statistiky", href: "/tymy#statistiky" },
  { label: "Přestupy", href: "/prestupy" },
  { label: "Realizační tým", href: "/tymy#realizacni-tym" },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [teamsOpen, setTeamsOpen] = useState(false);

  function closeAll() {
    setMenuOpen(false);
    setTeamsOpen(false);
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand} onClick={closeAll}>
          <AnimatedLogo size={52} priority />

          <div className={styles.brandText}>
            <strong>{clubConfig.name}</strong>
            <span>Futsal Plzeň</span>
          </div>
        </Link>

        <nav className={styles.desktopNav} aria-label="Hlavní navigace">
          <Link href="/">Domů</Link>

          <div className={styles.desktopDropdown}>
            <button type="button" className={styles.dropdownTrigger}>
              Týmy
              <span aria-hidden="true">⌄</span>
            </button>

            <div className={styles.megaMenu}>
              <div className={styles.megaIntro}>
                <span>FC PPB</span>
                <strong>Dva týmy.<br />Jeden klub.</strong>
              </div>

              <div className={styles.megaTeams}>
                <Link href="/tymy/a" className={styles.teamCard}>
                  <span>01</span>
                  <strong>A-TÝM</strong>
                  <small>{clubConfig.teams.aTeam.competition.name}</small>
                  <b>→</b>
                </Link>

                <Link href="/tymy/b" className={styles.teamCard}>
                  <span>02</span>
                  <strong>B-TÝM</strong>
                  <small>{clubConfig.teams.bTeam.competition.name}</small>
                  <b>→</b>
                </Link>
              </div>

              <div className={styles.megaLinks}>
                {teamLinks.slice(2).map((item) => (
                  <Link key={item.href + item.label} href={item.href}>
                    {item.label}
                    <span>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/#klub">Klub</Link>
          <Link href="/#partneri">Partneři</Link>
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
        <div className={styles.mobileInner}>
          <Link href="/" onClick={closeAll}>Domů</Link>

          <button
            type="button"
            className={styles.mobileTeamsTrigger}
            onClick={() => setTeamsOpen((value) => !value)}
          >
            <span>Týmy</span>
            <b>{teamsOpen ? "−" : "+"}</b>
          </button>

          <div className={`${styles.mobileTeams} ${teamsOpen ? styles.mobileTeamsOpen : ""}`}>
            {teamLinks.map((item) => (
              <Link key={item.href + item.label} href={item.href} onClick={closeAll}>
                {item.label}
                <span>→</span>
              </Link>
            ))}
          </div>

          <Link href="/#klub" onClick={closeAll}>Klub</Link>
          <Link href="/#partneri" onClick={closeAll}>Partneři</Link>

          <div className={styles.mobileClaim}>
            <span>Přátelství.</span>
            <span>Pokora.</span>
            <span>Bojovnost.</span>
          </div>
        </div>
      </div>
    </header>
  );
}
