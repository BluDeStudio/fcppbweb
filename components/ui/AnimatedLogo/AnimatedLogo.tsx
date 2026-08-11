import Image from "next/image";

import { clubConfig } from "@/config/club";

import styles from "./AnimatedLogo.module.css";

type AnimatedLogoProps = {
  size?: number;
  priority?: boolean;
  className?: string;
};

export function AnimatedLogo({
  size = 64,
  priority = false,
  className = "",
}: AnimatedLogoProps) {
  return (
    <div
      className={`${styles.wrapper} ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <div
        className={styles.outerGlow}
      />

      <div
        className={styles.rotatingRing}
      />

      <div
        className={styles.logoContainer}
      >
        <Image
          className={styles.logo}
          src={clubConfig.logo}
          alt={`Logo ${clubConfig.name}`}
          fill
          sizes={`${size}px`}
          priority={priority}
        />
      </div>
    </div>
  );
}