import styles from "./PageHeading.module.css";

type Props = { title: string; subtitle?: string; compact?: boolean };

export default function PageHeading({ title, subtitle }: Props) {
  return (
    <header className={styles.wrapper}>
      <div className={styles.heading}>
        <h1>{title.replace(/\.$/, "")}.</h1>
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  );
}
