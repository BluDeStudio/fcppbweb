import { articleImage } from "@/lib/articleShareImage";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const image = await articleImage(slug, "story");
  if (!image) return new Response("Článek nenalezen", { status: 404 });
  return image;
}
