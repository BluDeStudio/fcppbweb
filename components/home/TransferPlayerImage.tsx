"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Transfers.module.css";

export function TransferPlayerImage({
  src,
  name,
}: {
  src: string | null;
  name: string;
}) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <div className={styles.silhouette} aria-label={`Bez fotky: ${name}`}>
        <div className={styles.silhouetteHead} />
        <div className={styles.silhouetteBody} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      fill
      sizes="(max-width: 600px) 108px, 180px"
      className={styles.image}
      onError={() => setFailed(true)}
    />
  );
}
