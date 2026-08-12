import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { TransferAdminForm } from "@/components/admin/TransferAdminForm";

type AdminTransfersPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function AdminTransfersPage({
  searchParams,
}: AdminTransfersPageProps) {
  const params = await searchParams;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("players")
    .select("apf_player_id, name")
    .not("apf_player_id", "is", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Nepodařilo se načíst hráče:", error);
  }

  const players = (data ?? []).map((player) => ({
    id: Number(player.apf_player_id),
    name: String(player.name),
  }));

  return (
    <main style={{ minHeight: "100vh", padding: "80px 18px" }}>
      <div style={{ width: "min(720px, 100%)", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px" }}>
          <span
            style={{
              color: "var(--primary)",
              fontSize: "9px",
              fontWeight: 950,
              letterSpacing: ".1em",
              textTransform: "uppercase",
            }}
          >
            FC PPB Admin
          </span>

          <h1
            style={{
              margin: "6px 0 0",
              fontSize: "clamp(38px, 7vw, 62px)",
              lineHeight: .95,
              letterSpacing: "-.05em",
            }}
          >
            Přestupy.
          </h1>
        </div>

        {params.success === "1" && <p>✅ Přestup byl uložen.</p>}

        {params.error && (
          <p>❌ Přestup se nepodařilo uložit. Chyba: {params.error}</p>
        )}

        <TransferAdminForm players={players} />
      </div>
    </main>
  );
}
