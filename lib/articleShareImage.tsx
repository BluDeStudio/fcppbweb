import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type Article = { title: string; intro: string | null; type: string; cover_image_url: string | null; player_image_url: string | null; player_name: string | null };

async function imageData(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000), next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!/^image\/(png|jpeg|webp)/i.test(type)) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength > 8_000_000) return null;
    return `data:${type.split(";")[0]};base64,${buffer.toString("base64")}`;
  } catch { return null; }
}

async function logoData() {
  try {
    const file = await readFile(path.join(process.cwd(), "public", "images", "fc-ppb-logo.png"));
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch { return null; }
}

export async function articleImage(slug: string, kind: "story" | "og") {
  const { data } = await getSupabaseAdmin().from("web_articles")
    .select("title,intro,type,cover_image_url,player_image_url,player_name")
    .eq("slug", slug).eq("published", true).maybeSingle();
  if (!data) return null;
  const article = data as Article;
  const story = kind === "story";
  const width = story ? 1080 : 1200;
  const height = story ? 1920 : 630;
  const [logo, photo] = await Promise.all([
    logoData(),
    imageData(story ? (article.player_image_url || article.cover_image_url) : (article.cover_image_url || article.player_image_url)),
  ]);
  const category = article.type === "interview" ? "ROZHOVOR" : "ČLÁNEK";
  const titleSize = story ? (article.title.length > 95 ? 64 : article.title.length > 55 ? 76 : 94) : (article.title.length > 90 ? 46 : article.title.length > 55 ? 55 : 70);
  const textShadow = "0 3px 15px rgba(0,0,0,.9)";
  const layout = story ? (
    <div style={{ width, height, display:"flex", flexDirection:"column", position:"relative", overflow:"hidden", background:"linear-gradient(155deg,#102519,#020604 80%)", color:"white", fontFamily:"Arial,sans-serif" }}>
      <div style={{ position:"absolute", top:230, left:0, right:0, height:1150, display:"flex", justifyContent:"center", alignItems:"center", opacity:photo?1:.2 }}>
        {photo ? <img src={photo} alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }} /> : <div style={{ fontSize:200, color:"#4dea25" }}>FC PPB</div>}
      </div>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(0,0,0,.58) 0%,transparent 24%,transparent 46%,rgba(0,0,0,.82) 66%,#020604 95%)" }} />
      <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"88px 65px 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>{logo && <img src={logo} alt="" style={{ width:135,height:135,objectFit:"contain" }}/>}<span style={{ fontSize:40,fontWeight:900 }}>FC PPB</span></div>
        <span style={{ fontSize:26,fontWeight:900,letterSpacing:3,color:"#81fa51" }}>{category}</span>
      </div>
      <div style={{ flex:1 }}/>
      <div style={{ position:"relative", padding:"0 70px 160px", display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
        <div style={{ width:105,height:9,background:"#72f33a",marginBottom:34 }} />
        <div style={{ fontSize:titleSize,fontWeight:900,lineHeight:1.05,letterSpacing:-2,textShadow,overflowWrap:"anywhere" }}>{article.title}</div>
        <div style={{ fontSize:33,color:"#d6e6d9",marginTop:38,textShadow }}>{article.player_name && article.type === "interview" ? article.player_name + " • " : ""}FC PPB | Futsal Plzeň</div>
        <div style={{ display:"flex",border:"3px solid #76f442",borderRadius:40,padding:"19px 38px",marginTop:54,fontSize:31,fontWeight:900,color:"#8cff60" }}>PŘEČÍST NA FCPPB.CZ ↗</div>
      </div>
    </div>
  ) : (
    <div style={{ width,height,display:"flex",position:"relative",overflow:"hidden",background:"linear-gradient(110deg,#06100a,#15371c)",color:"white",fontFamily:"Arial,sans-serif" }}>
      {photo && <img src={photo} alt="" style={{ position:"absolute",right:0,top:0,width:550,height:630,objectFit:"contain",objectPosition:"center bottom" }} />}
      <div style={{ position:"absolute",inset:0,background:"linear-gradient(90deg,#06100a 0%,rgba(6,16,10,.96) 47%,rgba(6,16,10,.25) 100%)" }}/>
      <div style={{ position:"relative",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",padding:60,width:photo?790:1080 }}>
        <div style={{ display:"flex",alignItems:"center",gap:18,marginBottom:28 }}>{logo && <img src={logo} alt="" style={{ width:90,height:90,objectFit:"contain" }}/>}<span style={{ fontSize:31,fontWeight:900,color:"#78f346" }}>FC PPB • {category}</span></div>
        <div style={{ fontSize:titleSize,lineHeight:1.09,fontWeight:900,letterSpacing:-1,overflowWrap:"anywhere",textShadow }}>{article.title}</div>
        <div style={{ width:90,height:7,background:"#75ed3b",marginTop:28 }}/>
        <div style={{ fontSize:27,color:"#b9cbbd",marginTop:23 }}>Futsal Plzeň • fcppb.cz</div>
      </div>
    </div>
  );
  return new ImageResponse(layout, { width, height, headers: { "Cache-Control": "public, max-age=0, s-maxage=3600" } });
}
