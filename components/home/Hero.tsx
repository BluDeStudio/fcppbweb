import { AnimatedLogo } from "@/components/ui/AnimatedLogo/AnimatedLogo";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="home" className={styles.hero}>
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.logoStage}>
          <div className={styles.logoRing} aria-hidden="true" />
          <AnimatedLogo size={350} priority />
        </div>

        <div className={styles.content}>
          <div className={styles.eyebrow}>
            <span>FUTSAL / PLZEŇ</span>
            <b>2018—2026</b>
          </div>

          <h1>
            <span>FC</span>
            <span>PPB</span>
          </h1>

          <div className={styles.values}>
            <span>Přátelství.</span><i />
            <span>Pokora.</span><i />
            <span>Bojovnost.</span>
          </div>

          <div className={styles.claim}>
            <span />
            <p>Spojuje nás víc než hra.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
