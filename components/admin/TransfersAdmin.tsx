"use client";

import { useState } from "react";

import {
  deleteTransfer,
  toggleTransferPublished,
  updateTransfer,
} from "@/app/admin/prestupy/actions";

import type {
  TransferMovementDetail,
} from "@/types/transfer";

import styles from "./TransfersAdmin.module.css";

export type AdminTransfer = {
  id: string;
  direction: "arrival" | "departure";
  movementType: "transfer" | "loan";
  movementDetail: TransferMovementDetail;
  playerId: number | null;
  playerName: string;
  description: string | null;
  imageUrl: string | null;
  otherClub: string | null;
  otherClubApfId: number | null;
  otherClubLogoUrl: string | null;
  occurredOn: string;
  published: boolean;
};

export function TransfersAdmin({
  transfers,
}: {
  transfers: AdminTransfer[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <section className={styles.section}>
      <div className={styles.title}>
        <span>EXISTUJÍCÍ PŘESTUPY</span>
        <strong>{transfers.length}</strong>
      </div>

      <div className={styles.list}>
        {transfers.map((transfer) => {
          const editing = editingId === transfer.id;

          return (
            <article key={transfer.id} className={styles.card}>
              <div className={styles.summary}>
                <div className={styles.kind}>
                  <span
                    className={
                      transfer.direction === "arrival"
                        ? styles.arrival
                        : styles.departure
                    }
                  >
                    {transfer.direction === "arrival" ? "PŘÍCHOD" : "ODCHOD"}
                  </span>

                  <span>{detailLabel(transfer.movementDetail)}</span>
                </div>

                <div className={styles.player}>
                  <strong>{transfer.playerName}</strong>
                  <span>{transfer.otherClub ?? "Klub neuveden"}</span>
                </div>

                <span
                  className={
                    transfer.published
                      ? styles.published
                      : styles.hidden
                  }
                >
                  {transfer.published ? "ZVEŘEJNĚNO" : "SKRYTO"}
                </span>

                <div className={styles.rowActions}>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingId(editing ? null : transfer.id)
                    }
                  >
                    {editing ? "ZAVŘÍT" : "UPRAVIT"}
                  </button>

                  <form action={toggleTransferPublished}>
                    <input type="hidden" name="id" value={transfer.id} />
                    <input
                      type="hidden"
                      name="published"
                      value={String(transfer.published)}
                    />
                    <button type="submit">
                      {transfer.published ? "SKRÝT" : "ZVEŘEJNIT"}
                    </button>
                  </form>

                  <form
                    action={deleteTransfer}
                    onSubmit={(event) => {
                      if (
                        !window.confirm(
                          `Opravdu smazat záznam hráče ${transfer.playerName}?`,
                        )
                      ) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={transfer.id} />
                    <button type="submit" className={styles.delete}>
                      SMAZAT
                    </button>
                  </form>
                </div>
              </div>

              {editing && (
                <EditTransfer transfer={transfer} />
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function EditTransfer({
  transfer,
}: {
  transfer: AdminTransfer;
}) {
  const [direction, setDirection] =
    useState<"arrival" | "departure">(transfer.direction);

  return (
    <form action={updateTransfer} className={styles.editForm}>
      <input type="hidden" name="id" value={transfer.id} />
      <input
        type="hidden"
        name="currentImageUrl"
        value={transfer.imageUrl ?? ""}
      />

      <div className={styles.two}>
        <label>
          <span>Příchod / odchod</span>
          <select
            name="direction"
            value={direction}
            onChange={(event) =>
              setDirection(event.target.value as "arrival" | "departure")
            }
          >
            <option value="arrival">Příchod</option>
            <option value="departure">Odchod</option>
          </select>
        </label>

        <label>
          <span>Druh pohybu</span>
          <select
            key={direction}
            name="movementDetail"
            defaultValue={
              detailAllowed(transfer.movementDetail, direction)
                ? transfer.movementDetail
                : direction === "arrival"
                  ? "transfer_from"
                  : "transfer_to"
            }
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
      </div>

      <div className={styles.two}>
        <label>
          <span>Jméno hráče</span>
          <input
            name="playerName"
            defaultValue={transfer.playerName}
            required
          />
        </label>

        <label>
          <span>APF ID hráče</span>
          <input
            name="playerId"
            type="number"
            defaultValue={transfer.playerId ?? ""}
          />
        </label>
      </div>

      <div className={styles.two}>
        <label>
          <span>APF ID klubu</span>
          <input
            name="otherClubApfId"
            type="number"
            defaultValue={transfer.otherClubApfId ?? ""}
          />
        </label>

        <label>
          <span>Klub ručně</span>
          <input
            name="otherClub"
            defaultValue={transfer.otherClub ?? ""}
          />
        </label>
      </div>

      <label>
        <span>Popis</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={transfer.description ?? ""}
        />
      </label>

      <div className={styles.two}>
        <label>
          <span>Datum</span>
          <input
            name="occurredOn"
            type="date"
            defaultValue={transfer.occurredOn.slice(0, 10)}
            required
          />
        </label>

        <label>
          <span>Nová fotka</span>
          <input name="photo" type="file" accept="image/*" />
        </label>
      </div>

      <label className={styles.check}>
        <input
          name="published"
          type="checkbox"
          defaultChecked={transfer.published}
        />
        <span>Zveřejněno</span>
      </label>

      <button type="submit" className={styles.save}>
        ULOŽIT ZMĚNY
      </button>
    </form>
  );
}

function detailAllowed(
  detail: TransferMovementDetail,
  direction: "arrival" | "departure",
) {
  return direction === "arrival"
    ? ["transfer_from", "loan_in", "loan_end"].includes(detail)
    : ["transfer_to", "loan_out", "loan_end", "released"].includes(detail);
}

function detailLabel(detail: TransferMovementDetail) {
  switch (detail) {
    case "transfer_from":
      return "PŘESTUP Z TÝMU";
    case "transfer_to":
      return "PŘESTUP DO TÝMU";
    case "loan_in":
      return "NA HOSTOVÁNÍ";
    case "loan_out":
      return "NA HOSTOVÁNÍ";
    case "loan_end":
      return "KONEC HOSTOVÁNÍ";
    case "released":
      return "VYŘAZENÍ";
  }
}
