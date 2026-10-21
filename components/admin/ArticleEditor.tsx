"use client";

import { useEffect, useRef, useState } from "react";
import { ImageCropper } from "./ImageCropper";
import { saveArticle, deleteArticle } from "@/app/admin/clanky/actions";
import styles from "./ArticleEditor.module.css";

type QA = { question: string; answer: string };
type Player = { id: string; name: string; apf_player_id: number | null };
type Article = { id: string; title: string; slug: string; type: string; intro: string; body: string; qa: QA[] | null; player_id: string | null; published: boolean; cover_image_url: string | null; updated_at: string };
const blank = { id: "", title: "", slug: "", type: "article", intro: "", body: "", qa: [] as QA[], player_id: "", published: false, cover_image_url: "" };
export function ArticleEditor({ articles, players, databaseError }: { articles: Article[]; players: Player[]; databaseError: boolean }) {
  const [item, setItem] = useState(blank);
  const [showForm, setShowForm] = useState(false);
  const [cropSource, setCropSource] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [removeCover, setRemoveCover] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);
  function resetCover(url: string) { setCoverFile(null); setPreview(url); setRemoveCover(false); }
  function handleSave(formData: FormData) { if (coverFile) formData.set("coverFile", coverFile); return saveArticle(formData); }
  const change = (key: keyof typeof blank, value: string | boolean | QA[]) => setItem((v) => ({ ...v, [key]: value }));
  const edit = (a: Article) => { setItem({ id: a.id, title: a.title, slug: a.slug, type: a.type, intro: a.intro ?? "", body: a.body ?? "", qa: Array.isArray(a.qa) ? a.qa : [], player_id: a.player_id ?? "", published: a.published, cover_image_url: a.cover_image_url ?? "" }); resetCover(a.cover_image_url ?? ""); setShowForm(true); };
  return <div className={styles.wrap}>
    {databaseError && <p className={styles.error}>Tabulka web_articles není dostupná. Nejdřív spusť přiložené SQL v Supabase.</p>}
    <div className={styles.toolbar}><h2>Správa článků</h2><button type="button" onClick={() => { setItem(blank); resetCover(""); setShowForm(true); }}>+ Nový článek</button></div>
    {showForm && <form ref={formRef} action={handleSave} className={styles.form}>
      <div className={styles.toolbar}><h2>{item.id ? "Upravit článek" : "Nový článek"}</h2><button type="button" className={styles.secondary} onClick={() => setShowForm(false)}>Zavřít</button></div>
      <input type="hidden" name="id" value={item.id} /><input type="hidden" name="removeCover" value={String(removeCover)} /><input type="hidden" name="qa" value={JSON.stringify(item.qa)} /><input type="hidden" name="published" value={String(item.published)} />
      <label>Typ článku<select name="type" value={item.type} onChange={(e) => change("type", e.target.value)}><option value="article">ČLÁNEK</option><option value="interview">ROZHOVOR</option></select></label>
      <label>Nadpis<input name="title" required value={item.title} onChange={(e) => change("title", e.target.value)} placeholder="Nadpis článku" /></label>
      <label>URL článku (můžeš nechat prázdné)<input name="slug" value={item.slug} onChange={(e) => change("slug", e.target.value)} placeholder="Automaticky z nadpisu" /></label>
      {item.type === "interview" && <label>Hráč ze soupisky<select name="playerId" required value={item.player_id} onChange={(e) => change("player_id", e.target.value)}><option value="">Vyber hráče</option>{players.map((p) => <option key={p.id} value={p.id}>{p.name}{p.apf_player_id ? ` (APF ${p.apf_player_id})` : ""}</option>)}</select></label>}
      <section className={styles.coverSection}>
        <h3>Náhledový obrázek článku</h3>
        <p>Poměr 16:9 · výsledný obrázek 1280 × 720 px · WEBP</p>
        {preview && <img className={styles.coverPreview} src={preview} alt="Náhled článku" />}
        <div className={styles.coverActions}>
          <label className={styles.uploadButton}>Vybrat obrázek
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0]; e.currentTarget.value = ""; if (!f) return; if (f.size > 15 * 1024 * 1024) { window.alert("Fotografie může mít nejvýše 15 MB."); return; } setCropSource(f); }} />
          </label>
          {preview && <button type="button" className={styles.secondary} onClick={() => { resetCover(""); setRemoveCover(true); }}>Odebrat náhled</button>}
        </div>
      </section>
      <label>Úvodní text<textarea name="intro" rows={3} value={item.intro} onChange={(e) => change("intro", e.target.value)} /></label>
      {item.type === "article" ? <label>Text článku<textarea name="body" rows={12} value={item.body} onChange={(e) => change("body", e.target.value)} /></label> : <section className={styles.questions}><h3>Otázky a odpovědi</h3>{item.qa.map((qa, i) => <div className={styles.qa} key={i}><label>Otázka {i + 1}<input value={qa.question} onChange={(e) => change("qa", item.qa.map((v, j) => j === i ? { ...v, question: e.target.value } : v))} /></label><label>Odpověď<textarea rows={4} value={qa.answer} onChange={(e) => change("qa", item.qa.map((v, j) => j === i ? { ...v, answer: e.target.value } : v))} /></label><button type="button" className={styles.secondary} onClick={() => change("qa", item.qa.filter((_, j) => j !== i))}>Odstranit otázku</button></div>)}<button type="button" className={styles.secondary} onClick={() => change("qa", [...item.qa, { question: "", answer: "" }])}>+ Přidat otázku</button></section>}
      <label className={styles.check}><input type="checkbox" checked={item.published} onChange={(e) => change("published", e.target.checked)} /> Zveřejnit článek (jinak uložit jako koncept)</label>
      <button type="submit">Uložit {item.published ? "a publikovat" : "koncept"}</button>
    </form>}
    {cropSource && <ImageCropper source={cropSource} onClose={() => setCropSource(null)} onApply={(file, url) => { setCoverFile(file); setPreview(url); setRemoveCover(false); setCropSource(null); }} />}
    <div className={styles.list}>{articles.length === 0 && <p>Zatím žádné články.</p>}{articles.map((a) => <div className={styles.entry} key={a.id}><div><strong>{a.title}</strong><p>{a.type === "interview" ? "Rozhovor" : "Článek"} · {a.published ? "Publikováno" : "Koncept"}</p></div><div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => edit(a)}>Upravit</button><form action={deleteArticle} onSubmit={(e) => { if (!window.confirm("Opravdu smazat tento článek?")) e.preventDefault(); }}><input type="hidden" name="id" value={a.id}/><button type="submit" className={styles.danger}>Smazat</button></form></div></div>)}</div>
  </div>;
}
