import { AnimatedLogo } from "@/components/ui/AnimatedLogo/AnimatedLogo";

import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.logo}>
          <AnimatedLogo size={240} priority />
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>FC PPB</h1>

          <div className={styles.values}>
            <span>PŘÁTELSTVÍ.</span>
            <i />
            <span>POKORA.</span>
            <i />
            <span>BOJOVNOST.</span>
          </div>

          <div className={styles.line}>
            <span />
            <b />
            <span />
          </div>

          <p className={styles.claim}>SPOJUJE NÁS VÍC NEŽ HRA.</p>
        </div>
      </div>
    </section>
  );
}
