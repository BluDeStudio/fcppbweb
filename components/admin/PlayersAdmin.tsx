"use client";

import { useState } from "react";

import { saveWebPlayer } from "@/app/admin/hraci/actions";
import type { WebPlayerProfile } from "@/lib/webPlayers";

import styles from "./PlayersAdmin.module.css";

type AppPlayer = {
  id: string;
  name: string;
  number: number;
};

export function PlayersAdmin({
  players,
  appPlayers,
}: {
  players: WebPlayerProfile[];
  appPlayers: AppPlayer[];
}) {
  const [editing, setEditing] = useState<WebPlayerProfile | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className={styles.wrap}>
      <button
        className={styles.newButton}
        onClick={() => {
          setEditing(null);
          setCreating(true);
        }}
      >
        + NOVÝ HRÁČ
      </button>

      {(creating || editing) && (
        <PlayerForm
          player={editing}
          appPlayers={appPlayers}
          onCancel={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}

      <div className={styles.list}>
        {players.map((player) => (
          <article key={player.id} className={styles.row}>
            <div>
              <strong>{player.name}</strong>

              <span>
                {player.team === "a" ? "A-TÝM" : "B-TÝM"}
                {" • "}
                {player.active ? "AKTIVNÍ" : "NEAKTIVNÍ"}
              </span>
            </div>

            <div className={styles.links}>
              <span>APF: {player.apfPlayerId ?? "—"}</span>
              <span>APP: {player.appPlayerId ? "PROPOJENO" : "—"}</span>
            </div>

            <button
              onClick={() => {
                setCreating(false);
                setEditing(player);
              }}
            >
              UPRAVIT
            </button>
          </article>
        ))}

        {players.length === 0 && (
          <div className={styles.empty}>
            Zatím nejsou vytvořené žádné webové profily.
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerForm({
  player,
  appPlayers,
  onCancel,
}: {
  player: WebPlayerProfile | null;
  appPlayers: AppPlayer[];
  onCancel: () => void;
}) {
  return (
    <form action={saveWebPlayer} className={styles.form}>
      <input type="hidden" name="id" value={player?.id ?? ""} />

      <h2>{player ? "Upravit hráče" : "Nový hráč"}</h2>

      <div className={styles.two}>
        <label>
          <span>Jméno</span>
          <input name="name" defaultValue={player?.name ?? ""} required />
        </label>

        <label>
          <span>Kmen</span>
          <select name="team" defaultValue={player?.team ?? "b"}>
            <option value="a">A-tým</option>
            <option value="b">B-tým</option>
          </select>
        </label>
      </div>

      <div className={styles.two}>
        <label>
          <span>Pozice</span>
          <select name="position" defaultValue={player?.position ?? "player"}>
            <option value="player">Hráč</option>
            <option value="goalkeeper">Brankář</option>
          </select>
        </label>

        <label>
          <span>Status</span>
          <select name="status" defaultValue={player?.status ?? "club"}>
            <option value="club">Kmenový</option>
            <option value="loan">Hostování</option>
          </select>
        </label>
      </div>

      <div className={styles.two}>
        <label>
          <span>Číslo dresu</span>
          <input
            name="shirtNumber"
            type="number"
            defaultValue={player?.shirtNumber ?? ""}
          />
        </label>

        <label>
          <span>APF Player ID</span>
          <input
            name="apfPlayerId"
            type="number"
            defaultValue={player?.apfPlayerId ?? ""}
            placeholder="Např. 3937"
          />
        </label>
      </div>

      <label>
        <span>Propojení na STATPPKA</span>
        <select name="appPlayerId" defaultValue={player?.appPlayerId ?? ""}>
          <option value="">Nepropojeno</option>

          {appPlayers.map((appPlayer) => (
            <option key={appPlayer.id} value={appPlayer.id}>
              #{appPlayer.number} {appPlayer.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>URL fotky</span>
        <input
          name="imageUrl"
          defaultValue={player?.imageUrl ?? ""}
          placeholder="/images/3937.jpg nebo Supabase URL"
        />
      </label>

      <label className={styles.check}>
        <input
          name="active"
          type="checkbox"
          defaultChecked={player?.active ?? true}
        />
        Aktivní hráč
      </label>

      <div className={styles.actions}>
        <button type="button" onClick={onCancel}>
          ZRUŠIT
        </button>

        <button type="submit" className={styles.save}>
          ULOŽIT
        </button>
      </div>
    </form>
  );
}
