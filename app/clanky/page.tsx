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

function formatDate(value: string | null) {
  if (!value) return "FC PPB";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "FC PPB";
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Prague",
  }).format(date);
}

export default async function ArticlesPage() {
  const { data, error } = await getSupabaseAdmin()
    .from("web_articles")
    .select("id,slug,title,type,intro,cover_image_url,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) console.error("Public articles", error);
  const articles = (data ?? []) as Article[];

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.back}>← ZPĚT NA FC PPB</Link>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>NOVINKY · ROZHOVORY · KLUB</span>
        <h1>Zprávy <span>z kabiny.</span></h1>
        <p>Rozhovory s hráči, klubové novinky a příběhy ze světa FC PPB.</p>
      </div>

      {articles.length ? (
        <div className={styles.list}>
          {articles.map((article) => (
            <Link
              className={styles.card}
              href={`/clanky/${encodeURIComponent(article.slug)}`}
              key={article.id}
            >
              <div className={styles.visual}>
                {article.cover_image_url ? (
                  // Titulní obrázky pocházejí z veřejného Supabase Storage.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.cover_image_url}
                    alt=""
                    className={styles.cover}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.placeholder} aria-hidden="true">
                    <span>FC</span><strong>PPB</strong>
                  </div>
                )}
                <span className={styles.imageAccent} />
              </div>
              <div className={styles.content}>
                <div className={styles.meta}>
                  <span className={styles.category}>
                    {article.type === "interview" ? "ROZHOVOR" : "ČLÁNEK"}
                  </span>
                  <time>{formatDate(article.published_at)}</time>
                </div>
                <h2>{article.title}</h2>
                {article.intro && <p>{article.intro}</p>}
                <span className={styles.readMore}>
                  {article.type === "interview" ? "ČÍST ROZHOVOR" : "ČÍST ČLÁNEK"}
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>Zatím nebyl publikován žádný článek.</div>
      )}
    </main>
  );
}
