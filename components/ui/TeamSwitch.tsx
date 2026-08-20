"use client";

import styles from "./TeamSwitch.module.css";

export type TeamView =
  | "a"
  | "b";

type TeamSwitchProps = {
  value: TeamView;
  onChange: (value: TeamView) => void;
};

export function TeamSwitch({
  value,
  onChange,
}: TeamSwitchProps) {
  return (
    <div className={styles.switch}>
      <button
        type="button"
        className={
          value === "a"
            ? styles.active
            : undefined
        }
        onClick={() => onChange("a")}
      >
        A-tým
      </button>

      <button
        type="button"
        className={
          value === "b"
            ? styles.active
            : undefined
        }
        onClick={() => onChange("b")}
      >
        B-tým
      </button>
    </div>
  );
}