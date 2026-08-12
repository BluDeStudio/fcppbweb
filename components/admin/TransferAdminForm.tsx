"use client";

import { useMemo, useState } from "react";
import { createTransfer } from "@/app/admin/prestupy/actions";
import styles from "./TransferAdminForm.module.css";

type PlayerOption = {
  id: number;
  name: string;
};

export function TransferAdminForm({ players }: { players: PlayerOption[] }) {
  const [direction, setDirection] =
    useState<"arrival" | "departure">("arrival");

  const sortedPlayers = useMemo(
    () =>
      players
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, "cs")),
    [players],
  );

  return (
    <form action={createTransfer} className={styles.form}>
      <div className={styles.switch}>
        <button
          type="button"
          className={direction === "arrival" ? styles.active : undefined}
          onClick={() => setDirection("arrival")}
        >
          Příchod
        </button>

        <button
          type="button"
          className={direction === "departure" ? styles.activeDeparture : undefined}
          onClick={() => setDirection("departure")}
        >
          Odchod
        </button>
      </div>

      <input type="hidden" name="direction" value={direction} />

      {direction === "departure" ? (
        <label>
          <span>Hráč ze soupisky</span>

          <select
            name="playerId"
            required
            onChange={(event) => {
              const option = event.currentTarget.selectedOptions[0];
              const hidden = document.querySelector(
                'input[name="selectedPlayerName"]',
              ) as HTMLInputElement | null;

              if (hidden) {
                hidden.value = option?.dataset.name ?? "";
              }
            }}
          >
            <option value="">Vyber hráče</option>

            {sortedPlayers.map((player) => (
              <option
                key={player.id}
                value={player.id}
                data-name={player.name}
              >
                {player.name}
              </option>
            ))}
          </select>

          <input type="hidden" name="selectedPlayerName" />
        </label>
      ) : (
        <label>
          <span>Jméno hráče</span>
          <input
            name="arrivalName"
            placeholder="Např. Jan Novák"
            required
          />
        </label>
      )}

      <div className={styles.twoCols}>
        <label>
          <span>Typ</span>
          <select name="movementType" defaultValue="transfer">
            <option value="transfer">Přestup</option>
            <option value="loan">Hostování</option>
          </select>
        </label>

        <label>
          <span>Datum</span>
          <input name="occurredOn" type="date" required />
        </label>
      </div>

      <label>
        <span>
          {direction === "arrival"
            ? "Přichází z klubu"
            : "Odchází do klubu"}
        </span>

        <input name="otherClub" placeholder="Volitelné" />
      </label>

      <label>
        <span>Krátký popis</span>
        <textarea
          name="description"
          rows={4}
          placeholder="Krátký text k přestupu..."
        />
      </label>

      <label>
        <span>Fotka</span>
        <input name="photo" type="file" accept="image/*" />
      </label>

      <label>
        <span>Admin heslo</span>
        <input
          name="adminPassword"
          type="password"
          required
          autoComplete="off"
        />
      </label>

      <label className={styles.check}>
        <input name="published" type="checkbox" defaultChecked />
        <span>Zveřejnit ihned</span>
      </label>

      <button type="submit" className={styles.submit}>
        Uložit přestup
      </button>
    </form>
  );
}
