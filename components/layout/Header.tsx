"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { navigation } from "@/data/navigation";

import styles from "./Header.module.css";

const TIKTOK_URL =
  "https://www.tiktok.com/@fcppbfutsal";

const INSTAGRAM_URL =
  "https://www.instagram.com/fcppb_futsl/";

export function Header() {
  const [open, setOpen] =
    useState(false);

  useEffect(() => {
    document.body.style.overflow =
      open ? "hidden" : "";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          href="/"
          className={styles.brand}
          onClick={() =>
            setOpen(false)
          }
        >
          <Image
            src="/images/fc-ppb-logo.png"
            alt="FC PPB"
            width={52}
            height={52}
            priority
          />

          <strong>
            FC PPB
          </strong>
        </Link>

        <nav
          className={styles.desktopNav}
          aria-label="Hlavní navigace"
        >
          {navigation.map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div
          className={styles.socials}
          aria-label="Sociální sítě"
        >
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noreferrer"
          >
            TIKTOK
          </a>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
          >
            INSTAGRAM
          </a>
        </div>

        <button
          className={`${styles.menu} ${
            open
              ? styles.menuOpen
              : ""
          }`}
          onClick={() =>
            setOpen(
              (value) => !value,
            )
          }
          aria-expanded={open}
          aria-label={
            open
              ? "Zavřít menu"
              : "Otevřít menu"
          }
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        className={`${styles.mobilePanel} ${
          open
            ? styles.mobilePanelOpen
            : ""
        }`}
      >
        <nav>
          <Link
            href="/"
            onClick={() =>
              setOpen(false)
            }
          >
            Domů
          </Link>

          {navigation.map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  setOpen(false)
                }
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div
          className={
            styles.mobileSocials
          }
        >
          <span>
            SLEDUJ FC PPB
          </span>

          <div>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noreferrer"
            >
              TIKTOK
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
            >
              INSTAGRAM
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
