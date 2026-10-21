"use client";

import { useState } from "react";
import styles from "./ArticleShare.module.css";

type Props = { slug: string; title: string };
export function ArticleShare({ slug, title }: Props) {
  const [notice, setNotice] = useState("");
  const url = `https://www.fcppb.cz/clanky/${encodeURIComponent(slug)}`;

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await copy();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setNotice("Sdílení se nepodařilo. Zkus zkopírovat odkaz.");
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Odkaz zkopírován.");
    } catch {
      setNotice("Odkaz: " + url);
    }
  }
  async function stories() {
    const imageUrl = `/clanky/${encodeURIComponent(slug)}/story`;
    // Na iOS Safari je spolehlivější otevřít PNG, odkud lze obrázek uložit.
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      window.open(imageUrl, "_blank", "noopener,noreferrer");
      setNotice("Podrž obrázek a ulož jej do Fotek. Pak ho vlož do Instagram Stories a přidej nálepku Odkaz.");
      return;
    }
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Generování obrázku selhalo");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `FC-PPB-story-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 3000);
      setNotice("Grafika je připravená. Vlož ji do Stories a přidej nálepku Odkaz.");
    } catch {
      window.open(imageUrl, "_blank", "noopener,noreferrer");
      setNotice("Otevři obrázek a ulož jej do zařízení.");
    }
  }
  return <div className={styles.wrap}>
    <div className={styles.actions}>
      <button type="button" className={styles.primary} onClick={stories}>▣ SDÍLET DO STORIES ↓</button>
      <button type="button" onClick={share}>↗ SDÍLET ČLÁNEK</button>
      <button type="button" onClick={copy}>↗ KOPÍROVAT ODKAZ</button>
    </div>
    {notice && <p className={styles.notice} role="status">{notice}</p>}
  </div>;
}
