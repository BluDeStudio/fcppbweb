import Link from "next/link";

import { requireAdmin } from "@/lib/adminAuth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminPage() {
  await requireAdmin();

  const cards = [
    {
      href: "/admin/prestupy",
      title: "Přestupy",
      text: "Příchody, odchody, editace a kluby APF.",
    },
    {
      href: "/admin/hraci",
      title: "Hráči",
      text: "Profily hráčů, A/B tým a propojení na APF + STATPPKA.",
    },
  ];

  return (
    <AdminShell title="Přehled">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0,1fr))",
          gap: "12px",
        }}
      >
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            style={{
              minHeight: "150px",
              padding: "20px",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              color: "inherit",
              background: "rgba(255,255,255,.018)",
              textDecoration: "none",
            }}
          >
            <strong style={{ display: "block", fontSize: "24px" }}>
              {card.title}
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "8px",
                color: "var(--text-muted)",
                lineHeight: 1.5,
              }}
            >
              {card.text}
            </span>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
