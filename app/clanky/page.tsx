import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import styles from "./articles.module.css";

export const dynamic = "force-dynamic";

type Article = {
  id: string;
  slug: string;
  title: string;
  type: string;
  intro: string | null;
  cover_image_url: string | null;
  published_at: string | null;
};

type Props = {
  searchParams: Promise<{ kategorie?: string }>;
};

function formatDate(value: string | null) {
  if (!value) return "FC PPB";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "FC PPB";
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Prague",
  }).format(date);
}

export default async function ArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = params.kategorie === "rozhovory" ? "rozhovory" : params.kategorie === "clanky" ? "clanky" : "vse";
  let query = getSupabaseAdmin()
    .from("web_articles")
    .select("id,slug,title,type,intro,cover_image_url,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (category === "rozhovory") query = query.eq("type", "interview");
  if (category === "clanky") query = query.neq("type", "interview");

  const { data, error } = await query;
  if (error) console.error("Public articles", error);
  const articles = (data ?? []) as Article[];

  return (
    <main className={styles.page}>
      <div className={styles.heading}>
        <h1>ZPRÁVY Z KABINY.</h1>
      </div>

      <nav className={styles.filters} aria-label="Kategorie zpráv">
        <Link href="/clanky" className={`${styles.filter} ${category === "vse" ? styles.active : ""}`}>VŠE</Link>
        <Link href="/clanky?kategorie=clanky" className={`${styles.filter} ${category === "clanky" ? styles.active : ""}`}>ČLÁNKY</Link>
        <Link href="/clanky?kategorie=rozhovory" className={`${styles.filter} ${category === "rozhovory" ? styles.active : ""}`}>ROZHOVORY</Link>
      </nav>

      {articles.length > 0 ? (
        <div className={styles.list}>
          {articles.map((article, index) => (
            <Link
              href={`/clanky/${encodeURIComponent(article.slug)}`}
              key={article.id}
              className={`${styles.card} ${index === 0 ? styles.featured : ""}`}
            >
              <div className={styles.visual}>
                {article.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.cover_image_url} alt="" loading={index === 0 ? "eager" : "lazy"} className={styles.cover} />
                ) : (
                  <div className={styles.placeholder} aria-hidden="true">
                    <span>FC PPB</span>
                  </div>
                )}
              </div>
              <div className={styles.overlay} />
              <div className={styles.content}>
                <div className={styles.meta}>
                  <span className={styles.category}>{article.type === "interview" ? "ROZHOVOR" : "ČLÁNEK"}</span>
                  <span className={styles.metaDot}>·</span>
                  <time>{formatDate(article.published_at)}</time>
                </div>
                <h2>{article.title}</h2>
                {index === 0 && article.intro && <p>{article.intro}</p>}
                <span className={styles.readMore}>ČÍST {article.type === "interview" ? "ROZHOVOR" : "ČLÁNEK"} <span aria-hidden="true">→</span></span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>V této kategorii zatím nejsou žádné publikované zprávy.</div>
      )}
    </main>
  );
}
