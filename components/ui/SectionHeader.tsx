import styles from "./SectionHeader.module.css";

type SectionHeaderProps = {
  number: string;
  label: string;
  title: string;
  secondLine?: string;
  meta?: string;
};

export function SectionHeader({
  number,
  label,
  title,
  secondLine,
  meta,
}: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.top}>
        <div className={styles.label}>
          {number} / {label}
        </div>

        {meta && (
          <div className={styles.meta}>
            {meta}
          </div>
        )}
      </div>

      <div className={styles.heading}>
        <h2 className={styles.title}>
          {title}
        </h2>

        {secondLine && (
          <p className={styles.secondLine}>
            {secondLine}
          </p>
        )}
      </div>
    </div>
  );
}
