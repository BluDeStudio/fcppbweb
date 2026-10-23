import styles from "./PageHeading.module.css";

type Props = { title: string; subtitle?: string; compact?: boolean };
export default function PageHeading({ title, subtitle, compact = false }: Props) {
  return <header className={`${styles.heading} ${compact ? styles.compact : ""}`}>
    <div className={styles.headingText}><h1>{title}<span>.</span></h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  </header>;
}
