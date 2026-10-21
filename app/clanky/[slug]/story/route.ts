import { articleImage } from "@/lib/articleShareImage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) return new Response("Chybí identifikátor článku", { status: 400 });
    const image = await articleImage(slug, "story");
    if (!image) return new Response("Článek nenalezen", { status: 404 });
    return image;
  } catch (error) {
    console.error("FC PPB story image generation failed:", error);
    return new Response("Generování obrázku selhalo", { status: 500 });
  }
}
