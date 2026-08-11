"use client";

import Link from "next/link";
import { useState } from "react";

import { AnimatedLogo } from "@/components/ui/AnimatedLogo/AnimatedLogo";
import { clubConfig } from "@/config/club";
import { navigation } from "@/data/navigation";

import styles from "./Header.module.css";

const socialLinks = [
  {
    label: "Instagram",
    shortLabel: "IG",
    href: "",
  },
  {
    label: "Facebook",
    shortLabel: "FB",
    href: "",
  },
  {
    label: "TikTok",
    shortLabel: "TT",
    href: "",
  },
] as const;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link
          className={styles.brand}
          href="/"
          onClick={closeMenu}
        >
          <AnimatedLogo
            size={58}
            priority
          />

          <div className={styles.brandText}>
            <strong>
              {clubConfig.name}
            </strong>

            <span>
              Futsal Plzeň
            </span>
          </div>
        </Link>

        <nav
          className={
            styles.desktopNavigation
          }
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className={styles.menuButton}
          type="button"
          aria-label={
            isMenuOpen
              ? "Zavřít hlavní menu"
              : "Otevřít hlavní menu"
          }
          aria-expanded={isMenuOpen}
          onClick={() =>
            setIsMenuOpen(
              (current) => !current,
            )
          }
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav
        className={`${styles.mobileNavigation} ${
          isMenuOpen
            ? styles.mobileNavigationOpen
            : ""
        }`}
      >
        <div
          className={
            styles.mobileNavigationInner
          }
        >
          <div
            className={
              styles.mobileLinks
            }
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div
            className={
              styles.mobileSocials
            }
          >
            <span>
              Sleduj nás
            </span>

            <div
              className={
                styles.mobileSocialLinks
              }
            >
              {socialLinks.map(
                (social) =>
                  social.href ? (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={
                        social.label
                      }
                    >
                      {
                        social.shortLabel
                      }
                    </a>
                  ) : (
                    <span
                      key={social.label}
                      className={
                        styles.socialDisabled
                      }
                      title={`${social.label} doplníme`}
                    >
                      {
                        social.shortLabel
                      }
                    </span>
                  ),
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
