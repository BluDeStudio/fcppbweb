import { AnimatedLogo } from "@/components/ui/AnimatedLogo/AnimatedLogo";
import { clubConfig } from "@/config/club";

import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section
      id="home"
      className={styles.hero}
    >
      <div
        className={styles.glow}
        aria-hidden="true"
      />

      <div
        className={styles.content}
      >
        <div className={styles.brandRow}>
          <div className={styles.logoWrap}>
            <AnimatedLogo
              size={255}
              priority
            />
          </div>

          <div className={styles.heroText}>
            <h1>
              {clubConfig.name}
            </h1>

            <div
              className={styles.values}
              aria-label="Hodnoty klubu"
            >
              <span>
                PŘÁTELSTVÍ.
              </span>

              <i aria-hidden="true" />

              <span>
                POKORA.
              </span>

              <i aria-hidden="true" />

              <span>
                BOJOVNOST.
              </span>
            </div>

            <div
              className={styles.divider}
              aria-hidden="true"
            >
              <span />
              <b />
              <span />
            </div>

            <p className={styles.motto}>
              SPOJUJE NÁS VÍC NEŽ HRA.
            </p>
          </div>
        </div>

        <a
          href="#klub"
          className={styles.scroll}
          aria-label="Pokračovat na obsah webu"
        >
          <span>
            ↓
          </span>
        </a>
      </div>
    </section>
  );
}
