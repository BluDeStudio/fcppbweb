
"use client";

import { useState } from "react";
import styles from "./ArticleShare.module.css";

type Props = {
  slug: string;
  title: string;
};

export function ArticleShare({ slug, title }: Props) {
  const [notice, setNotice] = useState("");

  const url = `https://www.fcppb.cz/clanky/${encodeURIComponent(slug)}`;
  const storyUrl = `/clanky/${encodeURIComponent(slug)}/story`;

  function instagram() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      window.open(storyUrl, "_blank");
      setNotice(
        "Ulož obrázek do Fotek, otevři Instagram Stories a přidej nálepku Odkaz."
      );
      return;
    }

    const link = document.createElement("a");
    link.href = storyUrl;
    link.download = `FC-PPB-story-${slug}.png`;
    link.click();

    setNotice("Ulož grafiku a vlož ji do Instagram Stories.");
  }

  function whatsapp() {
    const message = `${title}\n${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Odkaz zkopírován!");
    } catch {
      setNotice(`Zkopíruj odkaz: ${url}`);
    }
  }

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>SDÍLET</span>

      <div className={styles.icons}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={instagram}
          aria-label="Připravit grafiku pro Instagram Stories"
          title="Instagram Stories"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="5"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <circle
              cx="12"
              cy="12"
              r="4"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
          </svg>
        </button>

        <button
          type="button"
          className={styles.iconButton}
          onClick={whatsapp}
          aria-label="Sdílet přes WhatsApp"
          title="WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20.2 11.6a8.2 8.2 0 0 1-12 7.3L4 20l1.1-4.1a8.2 8.2 0 1 1 15.1-4.3Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="M9 8.2c-.3-.5-.6-.5-.9-.5-.4 0-.8.4-1 1-.5 1.4.6 3.4 2.1 4.9 1.5 1.5 3.5 2.5 4.9 2.1.6-.2 1-.7 1.2-1.1.1-.3 0-.5-.3-.7l-1.8-.9c-.3-.1-.5 0-.7.3l-.5.6c-.2.2-.4.2-.7.1-1.1-.5-2-1.4-2.6-2.5-.2-.3-.1-.5.1-.7l.5-.6c.2-.2.2-.4.1-.7Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <button
          type="button"
          className={styles.iconButton}
          onClick={copy}
          aria-label="Kopírovat odkaz"
          title="Kopírovat odkaz"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m10 13 4-4M8.5 15.5l-1.2 1.2a3.5 3.5 0 0 1-5-5l4.2-4.2a3.5 3.5 0 0 1 5 0m1 1 1.2-1.2a3.5 3.5 0 0 1 5 5l-4.2 4.2a3.5 3.5 0 0 1-5 0"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}
    </div>
  );
}
