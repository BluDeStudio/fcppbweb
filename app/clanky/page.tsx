import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import styles from "./articles.module.css";
export const dynamic = "force-dynamic";
export default async function ArticlesPage() {
  const { data, error } = await getSupabaseAdmin().from("web_articles").select("id,slug,title,type,intro,published_at").eq("published", true).order("published_at", { ascending: false });
  if (error) console.error("Public articles", error);
  return <main className={styles.page}><Link href="/" className={styles.back}>← FC PPB</Link><h1>Zprávy z kabiny</h1><div className={styles.list}>{(data ?? []).map((a) => <Link className={styles.card} href={`/clanky/${a.slug}`} key={a.id}><span>{a.type === "interview" ? "ROZHOVOR" : "ČLÁNEK"}</span><h2>{a.title}</h2><p>{a.intro}</p></Link>)}{!data?.length && <p>Žádné publikované články.</p>}</div></main>;
}
