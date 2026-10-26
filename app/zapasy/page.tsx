import { clubConfig } from "@/config/club";
import { supabase } from "@/lib/supabase";
import { getSeasonMatches, type SeasonMatch } from "@/services/apf/getSeasonMatches";
import MatchesClient from "./MatchesClient";

export const revalidate = 600;

type Finished = { id: string; team: string | null; match_title: string | null; date: string | null; score: string | null };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
function dateKey(raw: string | null) {
  if (!raw) return "";
  const iso = raw.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  const cz = raw.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  return cz ? `${cz[3]}-${cz[2].padStart(2, "0")}-${cz[1].padStart(2, "0")}` : "";
}
function matchDbId(match: SeasonMatch, rows: Finished[]) {
  const teamRows = rows.filter(row => (row.team || "A").toUpperCase() === match.team);
  const dated = teamRows.filter(row => dateKey(row.date) === match.sortDate);
  const home = normalize(match.home), away = normalize(match.away);
  const named = dated.filter(row => {
    const title = normalize(row.match_title || "");
    return home.length > 0 && away.length > 0 && title.includes(home) && title.includes(away);
  });
  return named.length === 1 ? named[0].id : null;
}
export default async function MatchesPage() {
  const [a, b, db] = await Promise.allSettled([
    getSeasonMatches("A"), getSeasonMatches("B"),
    supabase.from("finished_matches").select("id,team,match_title,date,score"),
  ]);
  const aMatches = a.status === "fulfilled" ? a.value : [];
  const bMatches = b.status === "fulfilled" ? b.value : [];
  if (a.status === "rejected") console.error("APF A-team schedule:", a.reason);
  if (b.status === "rejected") console.error("APF B-team schedule:", b.reason);
  const dbRows = db.status === "fulfilled" && !db.value.error ? (db.value.data || []) as Finished[] : [];
  const matches = [...aMatches, ...bMatches].map(match => ({
    ...match,
    detailId: match.homeScore !== null ? matchDbId(match, dbRows) : null,
  }));
  return <MatchesClient matches={matches} season={clubConfig.season} />;
}
