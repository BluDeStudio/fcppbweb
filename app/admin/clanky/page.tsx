import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export default async function AdminArticlesPage() {
  await requireAdmin();
  const db = getSupabaseAdmin();
  const [articles, players] = await Promise.all([
    db.from("web_articles").select("*").order("updated_at", { ascending: false }),
    db.from("players").select("id,name,apf_player_id").order("name", { ascending: true }),
  ]);
  if (articles.error) console.error("Articles", articles.error);
  if (players.error) console.error("Players", players.error);
  return <AdminShell title="Články"><ArticleEditor articles={articles.data ?? []} players={players.data ?? []} databaseError={Boolean(articles.error)} /></AdminShell>;
}
