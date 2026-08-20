"use client";

import styles from "./TeamSwitch.module.css";

export type TeamView =
  | "a"
  | "b"
  | "all";

type TeamSwitchProps = {
  value: TeamView;
  onChange: (value: TeamView) => void;
  showAll?: boolean;
};

export function TeamSwitch({
  value,
  onChange,
  showAll = true,
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
        onClick={() =>
          onChange("a")
        }
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
        onClick={() =>
          onChange("b")
        }
      >
        B-tým
      </button>

      {showAll && (
        <button
          type="button"
          className={
            value === "all"
              ? styles.active
              : undefined
          }
          onClick={() =>
            onChange("all")
          }
        >
          Celkem
        </button>
      )}
    </div>
  );
}