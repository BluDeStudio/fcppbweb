"use client";

import { useMemo, useState } from "react";
import { createTransfer } from "@/app/admin/prestupy/actions";
import styles from "./TransferAdminForm.module.css";

type PlayerOption = {
  id: number;
  name: string;
};

export function TransferAdminForm({
  players,
}: {
  players: PlayerOption[];
}) {
  const [direction, setDirection] =
    useState<"arrival" | "departure">("arrival");

  const [selectedPlayerName, setSelectedPlayerName] = useState("");

  const sortedPlayers = useMemo(
    () => players.slice().sort((a, b) => a.name.localeCompare(b.name, "cs")),
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
          className={
            direction === "departure"
              ? styles.activeDeparture
              : undefined
          }
          onClick={() => setDirection("departure")}
        >
          Odchod
        </button>
      </div>

      <input type="hidden" name="direction" value={direction} />
      <input
        type="hidden"
        name="selectedPlayerName"
        value={selectedPlayerName}
      />

      {direction === "departure" ? (
        <label>
          <span>Hráč ze soupisky</span>

          <select
            name="playerId"
            required
            defaultValue=""
            onChange={(event) => {
              const option = event.currentTarget.selectedOptions[0];
              setSelectedPlayerName(option?.dataset.name ?? "");
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
        </label>
      ) : (
        <label>
          <span>Jméno hráče</span>
          <input name="arrivalName" required />
        </label>
      )}

      <div className={styles.twoCols}>
        <label>
          <span>Druh pohybu</span>

          <select
            name="movementDetail"
            defaultValue={
              direction === "arrival"
                ? "transfer_from"
                : "transfer_to"
            }
            key={direction}
          >
            {direction === "arrival" ? (
              <>
                <option value="transfer_from">Přestup z týmu</option>
                <option value="loan_in">Na hostování</option>
                <option value="loan_end">Konec hostování / návrat</option>
              </>
            ) : (
              <>
                <option value="transfer_to">Přestup do týmu</option>
                <option value="loan_out">Na hostování</option>
                <option value="loan_end">Konec hostování</option>
                <option value="released">Vyřazení z týmu</option>
              </>
            )}
          </select>
        </label>

        <label>
          <span>Datum</span>
          <input name="occurredOn" type="date" required />
        </label>
      </div>

      <div className={styles.clubBox}>
        <div className={styles.clubBoxTitle}>
          {direction === "arrival"
            ? "Klub, ze kterého přichází"
            : "Klub, do kterého odchází"}
        </div>

        <label>
          <span>APF ID týmu</span>
          <input name="otherClubApfId" inputMode="numeric" />
          <small>
            Když zadáš APF ID, web doplní název/znak a na veřejné kartě
            vytvoří proklik na profil týmu.
          </small>
        </label>

        <label>
          <span>Název klubu ručně</span>
          <input name="otherClub" />
        </label>
      </div>

      <label>
        <span>Krátký popis</span>
        <textarea name="description" rows={3} />
      </label>

      {direction === "arrival" && (
        <label>
          <span>Fotka hráče</span>
          <input name="photo" type="file" accept="image/*" />
        </label>
      )}

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
