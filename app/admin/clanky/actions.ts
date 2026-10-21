"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type QA = { question: string; answer: string };
const field = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const slugify = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);

export async function saveArticle(data: FormData) {
  await requireAdmin();
  const db = getSupabaseAdmin();
  const id = field(data, "id");
  const title = field(data, "title");
  const type = field(data, "type") === "interview" ? "interview" : "article";
  if (!title) redirect("/admin/clanky?error=title");
  const slug = slugify(field(data, "slug") || title);
  if (!slug) redirect("/admin/clanky?error=slug");
  let qa: QA[] = [];
  try {
    const raw = JSON.parse(field(data, "qa") || "[]");
    if (Array.isArray(raw)) qa = raw.filter((v) => typeof v?.question === "string" && typeof v?.answer === "string").map((v) => ({question: v.question.trim(), answer: v.answer.trim()})).filter((v) => v.question && v.answer);
  } catch { redirect("/admin/clanky?error=questions"); }
  const playerId = field(data, "playerId");
  let player: { id: string; name: string; apf_player_id: number | null } | null = null;
  if (type === "interview") {
    if (!playerId) redirect("/admin/clanky?error=player");
    const result = await db.from("players").select("id,name,apf_player_id").eq("id", playerId).single();
    if (result.error || !result.data) redirect("/admin/clanky?error=player");
    player = result.data;
  }
  const published = field(data, "published") === "true";
  const upload = data.get("coverFile");
  const removeCover = field(data, "removeCover") === "true";
  let coverImageUrl: string | null | undefined;
  if (upload instanceof File && upload.size > 0) {
    if (upload.type !== "image/webp" || upload.size > 2 * 1024 * 1024) redirect("/admin/clanky?error=image");
    const fileName = `${crypto.randomUUID()}.webp`;
    const { error: uploadError } = await db.storage.from("article-covers").upload(fileName, upload, { contentType: "image/webp", upsert: false });
    if (uploadError) { console.error("Article image upload", uploadError); redirect("/admin/clanky?error=upload"); }
    coverImageUrl = db.storage.from("article-covers").getPublicUrl(fileName).data.publicUrl;
  } else if (removeCover) coverImageUrl = null;
  let oldPublishedAt: string | null = null;
  if (id) {
    const old = await db.from("web_articles").select("published_at").eq("id", id).single();
    if (old.error) redirect("/admin/clanky?error=notfound");
    oldPublishedAt = old.data?.published_at ?? null;
  }
  const payload = {
    title, slug, type, intro: field(data, "intro"), body: type === "article" ? field(data, "body") : "", qa: type === "interview" ? qa : [],
    player_id: player?.id ?? null, player_name: player?.name ?? null,
    player_apf_id: player?.apf_player_id ?? null,
    player_image_url: player?.apf_player_id ? `/images/${player.apf_player_id}.png` : null,
    ...(coverImageUrl !== undefined ? { cover_image_url: coverImageUrl } : {}),
    published, published_at: published ? oldPublishedAt ?? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  const result = id ? await db.from("web_articles").update(payload).eq("id", id) : await db.from("web_articles").insert(payload);
  if (result.error) { console.error("Save article", result.error); redirect("/admin/clanky?error=database"); }
  revalidatePath("/admin/clanky"); revalidatePath("/clanky"); revalidatePath(`/clanky/${slug}`); revalidatePath("/");
  redirect("/admin/clanky?success=saved");
}

export async function deleteArticle(data: FormData) {
  await requireAdmin();
  const id = field(data, "id");
  if (!id) redirect("/admin/clanky");
  const db = getSupabaseAdmin();
  const result = await db.from("web_articles").delete().eq("id", id);
  if (result.error) { console.error(result.error); redirect("/admin/clanky?error=delete"); }
  revalidatePath("/admin/clanky"); revalidatePath("/clanky"); revalidatePath("/");
  redirect("/admin/clanky?success=deleted");
}
