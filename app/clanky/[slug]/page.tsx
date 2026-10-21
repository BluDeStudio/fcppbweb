import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import styles from "./page.module.css";
export const dynamic = "force-dynamic";
type QA = { question: string; answer: string };
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: article, error } = await getSupabaseAdmin().from("web_articles").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  if (error || !article) notFound();
  const qa: QA[] = Array.isArray(article.qa) ? article.qa : [];
  return <main className={styles.page}><Link href="/clanky" className={styles.back}>← Zprávy z kabiny</Link><article className={styles.article}>
    <header className={styles.hero}><div className={styles.headline}><span className={styles.type}>{article.type === "interview" ? "ROZHOVOR" : "ČLÁNEK"}</span><h1>{article.title}</h1><div className={styles.titleUnderline} aria-hidden="true" />{article.published_at && <time>{new Date(article.published_at).toLocaleDateString("cs-CZ")}</time>}{article.intro && <p className={styles.intro}>{article.intro}</p>}</div>
    {article.type === "interview" && article.player_image_url && <div className={styles.photo}><img src={article.player_image_url} alt={article.player_name || "Hráč FC PPB"} /></div>}</header>
    {article.type === "interview" ? <div className={styles.qaList}>{qa.map((item, i) => <section key={i} className={styles.qa}><h2>{item.question}</h2><div className={styles.answer}>{item.answer}</div></section>)}</div> : <div className={styles.body}>{article.body}</div>}
    {article.type === "interview" && article.player_apf_id && <Link className={styles.playerLink} href={`/hrac/${article.player_apf_id}`}>Profil hráče: {article.player_name} →</Link>}
  </article></main>;
}
