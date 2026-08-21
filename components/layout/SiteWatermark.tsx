import Image from "next/image";

import { clubConfig } from "@/config/club";

import styles from "./SiteWatermark.module.css";

export function SiteWatermark() {
  return (
    <div
      className={styles.watermark}
      aria-hidden="true"
    >
      <Image
        src={clubConfig.logo}
        alt=""
        width={900}
        height={900}
        priority={false}
        className={styles.logo}
      />
    </div>
  );
}
