"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ImageCropper.module.css";

type Props = { onApply: (file: File, preview: string) => void; onClose: () => void; source: File };
const OUTPUT_W = 1280;
const OUTPUT_H = 720;

export function ImageCropper({ source, onApply, onClose }: Props) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [url, setUrl] = useState("");
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(source);
    setUrl(objectUrl);
    setReady(false);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(objectUrl);
  }, [source]);

  function getGeometry() {
    const img = imageRef.current;
    if (!img) return null;
    const rect = img.parentElement?.getBoundingClientRect();
    if (!rect) return null;
    const scale = Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight) * zoom;
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    return { w, h, maxX: Math.max(0, (w - rect.width) / 2), maxY: Math.max(0, (h - rect.height) / 2), rect };
  }

  function clamp(x: number, y: number) {
    const g = getGeometry();
    if (!g) return { x: 0, y: 0 };
    return { x: Math.max(-g.maxX, Math.min(g.maxX, x)), y: Math.max(-g.maxY, Math.min(g.maxY, y)) };
  }

  function changeZoom(next: number) {
    setZoom(next);
    // Recompute bounds using the new zoom, without relying on a stale DOM layout.
    const img = imageRef.current;
    const rect = img?.parentElement?.getBoundingClientRect();
    if (img && rect) {
      const s = Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight) * next;
      const maxX = Math.max(0, (img.naturalWidth * s - rect.width) / 2);
      const maxY = Math.max(0, (img.naturalHeight * s - rect.height) / 2);
      setPosition((v) => ({ x: Math.max(-maxX, Math.min(maxX, v.x)), y: Math.max(-maxY, Math.min(maxY, v.y)) }));
    }
  }

  async function apply() {
    const img = imageRef.current;
    const g = getGeometry();
    if (!img || !g || busy) return;
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_W;
      canvas.height = OUTPUT_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas není dostupný.");
      const scaleX = OUTPUT_W / g.rect.width;
      const scaleY = OUTPUT_H / g.rect.height;
      ctx.drawImage(img, (g.rect.width - g.w) / 2 * scaleX + position.x * scaleX, (g.rect.height - g.h) / 2 * scaleY + position.y * scaleY, g.w * scaleX, g.h * scaleY);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
      if (!blob) throw new Error("Obrázek se nepodařilo zpracovat.");
      const file = new File([blob], `nahled-${Date.now()}.webp`, { type: "image/webp" });
      onApply(file, URL.createObjectURL(blob));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Ořez se nezdařil.");
    } finally { setBusy(false); }
  }

  const g = ready ? getGeometry() : null;
  return <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Ořez náhledového obrázku">
    <div className={styles.dialog}>
      <div className={styles.top}><h3>Upravit náhled (16:9)</h3><button type="button" onClick={onClose}>Zavřít</button></div>
      <p>Posuň fotografii myší nebo prstem. Přiblížení upravíš posuvníkem.</p>
      <div className={styles.viewport} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, startX: position.x, startY: position.y }; }} onPointerMove={(e) => { if (!drag.current) return; setPosition(clamp(drag.current.startX + e.clientX - drag.current.x, drag.current.startY + e.clientY - drag.current.y)); }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
        {url && <img ref={imageRef} src={url} alt="Fotografie k ořezu" draggable={false} onLoad={() => setReady(true)} style={g ? { width: g.w, height: g.h, transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))` } : { opacity: 0 }} />}
      </div>
      <label className={styles.zoom}>Přiblížení <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => changeZoom(Number(e.target.value))} /> {Math.round(zoom * 100)} %</label>
      <div className={styles.buttons}><button type="button" onClick={onClose}>Zrušit</button><button type="button" onClick={apply} disabled={!ready || busy}>{busy ? "Zpracovávám…" : "Použít ořez"}</button></div>
    </div>
  </div>;
}
