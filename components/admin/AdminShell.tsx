import Link from "next/link";
import { adminLogout } from "@/app/admin/login/actions";
import styles from "./AdminShell.module.css";

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          FC PPB
        </Link>

        <nav>
          <Link href="/admin">Přehled</Link>
          <Link href="/admin/prestupy">Přestupy</Link>
          <Link href="/admin/hraci">Hráči</Link>

          <span className={styles.disabled}>
            Články
            <small>brzy</small>
          </span>
        </nav>

        <form action={adminLogout}>
          <button>Odhlásit</button>
        </form>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <span>ADMINISTRACE</span>
          <h1>{title}</h1>
        </header>

        {children}
      </section>
    </main>
  );
}
