import { SectionHeader } from "@/components/ui/SectionHeader";

import styles from "./Partners.module.css";

export function Partners() {
  return (
    <section
      id="partneri"
      className={styles.section}
    >
      <div className={styles.wrapper}>
        <SectionHeader
          number="07"
          label="Partneři"
          title="Hrají s námi."
          secondLine="Partneři FC PPB."
        />

        <div className={styles.placeholder}>
          <span>
            FC PPB
          </span>

          <p>
            Místo pro hlavní partnery,
            sponzory a podporovatele klubu.
          </p>
        </div>
      </div>
    </section>
  );
}