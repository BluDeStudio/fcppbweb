import Link from "next/link";
import type { Metadata } from "next";
import { ArticleShare } from "@/components/articles/ArticleShare";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import styles from "./page.module.css";
export const dynamic = "force-dynamic";
type QA = { question: string; answer: string };
const BASE_URL = "https://www.fcppb.cz";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: article } = await getSupabaseAdmin().from("web_articles")
    .select("title,intro,slug,type").eq("slug", slug).eq("published", true).maybeSingle();
  if (!article) return { title: "Článek nenalezen | FC PPB" };
  const url = `${BASE_URL}/clanky/${encodeURIComponent(article.slug)}`;
  const image = `${url}/opengraph-image`;
  const description = article.intro || `Novinky a rozhovory futsalového klubu FC PPB Plzeň.`;
  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title: article.title, description, url, siteName: "FC PPB | Futsal Plzeň", locale: "cs_CZ", images: [{ url: image, width: 1200, height: 630, alt: article.title }] },
    twitter: { card: "summary_large_image", title: article.title, description, images: [image] },
  };
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: article, error } = await getSupabaseAdmin().from("web_articles").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  if (error || !article) notFound();
  const qa: QA[] = Array.isArray(article.qa) ? article.qa : [];
  return <main className={styles.page}><Link href="/clanky" className={styles.back}>← Zprávy z kabiny</Link><article className={styles.article}>
    <header className={styles.hero}><div className={styles.headline}><span className={styles.type}>{article.type === "interview" ? "ROZHOVOR" : "ČLÁNEK"}</span><h1>{article.title}</h1><div className={styles.titleUnderline} aria-hidden="true" />{article.published_at && <time>{new Date(article.published_at).toLocaleDateString("cs-CZ")}</time>}{article.intro && <p className={styles.intro}>{article.intro}</p>}</div>
    {article.type === "interview" && article.player_image_url && <div className={styles.photo}><img src={article.player_image_url} alt={article.player_name || "Hráč FC PPB"} /></div>}</header>
    <ArticleShare slug={article.slug} title={article.title} />
    {article.type === "interview" ? <div className={styles.qaList}>{qa.map((item, i) => <section key={i} className={styles.qa}><h2>{item.question}</h2><div className={styles.answer}>{item.answer}</div></section>)}</div> : <div className={styles.body}>{article.body}</div>}
    {article.type === "interview" && article.player_apf_id && <Link className={styles.playerLink} href={`/hrac/${article.player_apf_id}`}>Profil hráče: {article.player_name} →</Link>}
  </article></main>;
}
