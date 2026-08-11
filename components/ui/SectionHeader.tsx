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

      <h2>
        {title}

        {secondLine && (
          <>
            <br />
            <span>{secondLine}</span>
          </>
        )}
      </h2>
    </div>
  );
}