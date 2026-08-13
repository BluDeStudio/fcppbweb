import { redirect } from "next/navigation";
import { adminLogin } from "./actions";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const params = await searchParams;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <form
        action={adminLogin}
        style={{
          width: "min(430px, 100%)",
          display: "grid",
          gap: "14px",
          padding: "24px",
          border: "1px solid var(--border)",
          borderRadius: "18px",
          background: "rgba(255,255,255,.018)",
        }}
      >
        <div>
          <span
            style={{
              color: "var(--primary)",
              fontSize: "9px",
              fontWeight: 950,
              letterSpacing: ".1em",
            }}
          >
            FC PPB
          </span>

          <h1
            style={{
              margin: "5px 0 0",
              fontSize: "42px",
              letterSpacing: "-.05em",
            }}
          >
            Administrace
          </h1>
        </div>

        {params.error && (
          <div style={{ color: "#ff7474", fontSize: "12px" }}>
            Nesprávné heslo.
          </div>
        )}

        <input
          name="password"
          type="password"
          placeholder="Admin heslo"
          required
          autoFocus
          style={{
            padding: "12px",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            color: "var(--text)",
            background: "#0b100d",
          }}
        />

        <button
          type="submit"
          style={{
            minHeight: "44px",
            border: 0,
            borderRadius: "10px",
            color: "#061007",
            background: "var(--primary)",
            fontWeight: 950,
            cursor: "pointer",
          }}
        >
          PŘIHLÁSIT
        </button>
      </form>
    </main>
  );
}
