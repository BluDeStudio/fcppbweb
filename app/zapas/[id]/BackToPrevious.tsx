"use client";

import { useRouter } from "next/navigation";

export default function BackToPrevious({ className }: { className?: string }) {
  const router = useRouter();
  const goBack = () => {
    const params = new URLSearchParams(window.location.search);
    const fromMatches = params.get("from") === "zapasy";
    const fallback = fromMatches
      ? `/zapasy?team=${params.get("team") === "B" ? "B" : "A"}&filter=${["all", "played", "upcoming"].includes(params.get("filter") || "") ? params.get("filter") : "all"}`
      : "/";

    // Vrátíme se historií jen tehdy, když předchozí stránka patří našemu webu.
    try {
      if (document.referrer && new URL(document.referrer).origin === window.location.origin && window.history.length > 1) {
        router.back();
        return;
      }
    } catch { /* Přímý přístup: použijeme bezpečnou záložní cestu. */ }
    router.push(fallback);
  };
  return <button type="button" className={className} onClick={goBack} style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer" }}>← ZPĚT</button>;
}
