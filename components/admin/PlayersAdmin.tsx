"use client";

import {
  useState,
} from "react";

import {
  createMissingArrival,
  registerPlayerDeparture,
  saveWebPlayer,
} from "@/app/admin/hraci/actions";

import type {
  WebPlayerProfile,
} from "@/lib/webPlayers";

import styles from "./PlayersAdmin.module.css";

type AppPlayer = {
  id: string;
  name: string;
  number: number;
};

type ManagedPlayer =
  WebPlayerProfile & {
    hasArrival:
      boolean;
  };

export function PlayersAdmin({
  players,
  appPlayers,
}: {
  players:
    ManagedPlayer[];

  appPlayers:
    AppPlayer[];
}) {
  const [
    editing,
    setEditing,
  ] =
    useState<ManagedPlayer | null>(
      null,
    );

  const [
    creating,
    setCreating,
  ] =
    useState(
      false,
    );

  const [
    departurePlayer,
    setDeparturePlayer,
  ] =
    useState<ManagedPlayer | null>(
      null,
    );

  const [
    arrivalPlayer,
    setArrivalPlayer,
  ] =
    useState<ManagedPlayer | null>(
      null,
    );

  return (
    <div
      className={
        styles.wrap
      }
    >
      <button
        className={
          styles.newButton
        }
        onClick={() => {
          setEditing(
            null,
          );

          setDeparturePlayer(
            null,
          );

          setArrivalPlayer(
            null,
          );

          setCreating(
            true,
          );
        }}
      >
        + PŘIDAT HRÁČE
      </button>

      {creating && (
        <PlayerForm
          player={
            null
          }
          appPlayers={
            appPlayers
          }
          creating
          onCancel={() =>
            setCreating(
              false,
            )
          }
        />
      )}

      {editing && (
        <PlayerForm
          player={
            editing
          }
          appPlayers={
            appPlayers
          }
          creating={
            false
          }
          onCancel={() =>
            setEditing(
              null,
            )
          }
        />
      )}

      {arrivalPlayer && (
        <ArrivalForm
          player={
            arrivalPlayer
          }
          onCancel={() =>
            setArrivalPlayer(
              null,
            )
          }
        />
      )}

      {departurePlayer && (
        <DepartureForm
          player={
            departurePlayer
          }
          onCancel={() =>
            setDeparturePlayer(
              null,
            )
          }
        />
      )}

      <div
        className={
          styles.list
        }
      >
        {players.map(
          (
            player,
          ) => (
            <article
              key={
                player.id
              }
              className={
                styles.row
              }
            >
              <div>
                <strong>
                  {
                    player.name
                  }
                </strong>

                <span>
                  {
                    formatTeam(
                      player.team,
                    )
                  }
                  {" • "}
                  {
                    player.active
                      ? "AKTIVNÍ"
                      : "NEAKTIVNÍ"
                  }
                  {" • "}
                  {
                    player.status ===
                    "loan"
                      ? "HOSTOVÁNÍ"
                      : "KMENOVÝ"
                  }
                </span>
              </div>

              <div
                className={
                  styles.links
                }
              >
                <span>
                  APF:{" "}
                  {
                    player.apfPlayerId ??
                    "—"
                  }
                </span>

                <span>
                  APP:{" "}
                  {
                    player.appPlayerId
                      ? "PROPOJENO"
                      : "—"
                  }
                </span>

                <span>
                  PŘÍCHOD:{" "}
                  {
                    player.hasArrival
                      ? "ZAPSÁN"
                      : "CHYBÍ"
                  }
                </span>
              </div>

              <div
                className={
                  styles.actions
                }
              >
                {!player.hasArrival && (
                  <button
                    onClick={() => {
                      setEditing(
                        null,
                      );

                      setCreating(
                        false,
                      );

                      setDeparturePlayer(
                        null,
                      );

                      setArrivalPlayer(
                        player,
                      );
                    }}
                  >
                    DOPLNIT PŘÍCHOD
                  </button>
                )}

                <button
                  onClick={() => {
                    setCreating(
                      false,
                    );

                    setDeparturePlayer(
                      null,
                    );

                    setArrivalPlayer(
                      null,
                    );

                    setEditing(
                      player,
                    );
                  }}
                >
                  UPRAVIT
                </button>

                {player.active && (
                  <button
                    onClick={() => {
                      setEditing(
                        null,
                      );

                      setCreating(
                        false,
                      );

                      setArrivalPlayer(
                        null,
                      );

                      setDeparturePlayer(
                        player,
                      );
                    }}
                  >
                    ODCHOD
                  </button>
                )}
              </div>
            </article>
          ),
        )}

        {players.length ===
          0 && (
          <div
            className={
              styles.empty
            }
          >
            Zatím nejsou vytvořené
            žádné webové profily.
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerForm({
  player,
  appPlayers,
  creating,
  onCancel,
}: {
  player:
    ManagedPlayer |
    null;

  appPlayers:
    AppPlayer[];

  creating:
    boolean;

  onCancel:
    () => void;
}) {
  return (
    <form
      action={
        saveWebPlayer
      }
      className={
        styles.form
      }
    >
      <input
        type="hidden"
        name="id"
        value={
          player?.id ??
          ""
        }
      />

      <h2>
        {
          creating
            ? "Přidat hráče"
            : "Upravit hráče"
        }
      </h2>

      <div
        className={
          styles.two
        }
      >
        <label>
          <span>
            Jméno
          </span>

          <input
            name="name"
            defaultValue={
              player?.name ??
              ""
            }
            required
          />
        </label>

        <label>
          <span>
            Kmen
          </span>

          <select
            name="team"
            defaultValue={
              player?.team ??
              "b"
            }
          >
            <option value="a">
              A-tým
            </option>

            <option value="b">
              B-tým
            </option>

            <option value="both">
              A-tým + B-tým
            </option>
          </select>
        </label>
      </div>

      <div
        className={
          styles.two
        }
      >
        <label>
          <span>
            Pozice
          </span>

          <select
            name="position"
            defaultValue={
              player?.position ??
              "player"
            }
          >
            <option value="player">
              Hráč
            </option>

            <option value="goalkeeper">
              Brankář
            </option>
          </select>
        </label>

        <label>
          <span>
            Status
          </span>

          <select
            name="status"
            defaultValue={
              player?.status ??
              "club"
            }
          >
            <option value="club">
              Kmenový
            </option>

            <option value="loan">
              Hostování
            </option>
          </select>
        </label>
      </div>

      <div
        className={
          styles.two
        }
      >
        <label>
          <span>
            Číslo dresu
          </span>

          <input
            name="shirtNumber"
            type="number"
            defaultValue={
              player?.shirtNumber ??
              ""
            }
          />
        </label>

        <label>
          <span>
            APF Player ID
          </span>

          <input
            name="apfPlayerId"
            type="number"
            defaultValue={
              player?.apfPlayerId ??
              ""
            }
          />
        </label>
      </div>

      <label>
        <span>
          Propojení na STATPPKA
        </span>

        <select
          name="appPlayerId"
          defaultValue={
            player?.appPlayerId ??
            ""
          }
        >
          <option value="">
            Nepropojeno
          </option>

          {appPlayers.map(
            (
              appPlayer,
            ) => (
              <option
                key={
                  appPlayer.id
                }
                value={
                  appPlayer.id
                }
              >
                #
                {
                  appPlayer.number
                }{" "}
                {
                  appPlayer.name
                }
              </option>
            ),
          )}
        </select>
      </label>

      <label>
        <span>
          URL fotky
        </span>

        <input
          name="imageUrl"
          defaultValue={
            player?.imageUrl ??
            ""
          }
          placeholder="/images/4247.jpg nebo Supabase URL"
        />
      </label>

      <label
        className={
          styles.check
        }
      >
        <input
          name="active"
          type="checkbox"
          defaultChecked={
            player?.active ??
            true
          }
        />

        Aktivní hráč
      </label>

      {creating && (
        <fieldset>
          <legend>
            PŘÍCHOD DO FC PPB
          </legend>

          <div
            className={
              styles.two
            }
          >
            <label>
              <span>
                Datum příchodu
              </span>

              <input
                name="arrivalDate"
                type="date"
                required
              />
            </label>

            <label>
              <span>
                Typ příchodu
              </span>

              <select
                name="arrivalMovementDetail"
                defaultValue="transfer_from"
              >
                <option value="transfer_from">
                  Přestup z týmu
                </option>

                <option value="loan_in">
                  Na hostování
                </option>

                <option value="loan_end">
                  Návrat z hostování
                </option>
              </select>
            </label>
          </div>

          <div
            className={
              styles.two
            }
          >
            <label>
              <span>
                APF ID původního klubu
              </span>

              <input
                name="arrivalClubApfId"
                inputMode="numeric"
              />
            </label>

            <label>
              <span>
                Původní klub ručně
              </span>

              <input
                name="arrivalClub"
              />
            </label>
          </div>
        </fieldset>
      )}

      <div
        className={
          styles.actions
        }
      >
        <button
          type="button"
          onClick={
            onCancel
          }
        >
          ZRUŠIT
        </button>

        <button
          type="submit"
          className={
            styles.save
          }
        >
          {
            creating
              ? "PŘIDAT HRÁČE"
              : "ULOŽIT"
          }
        </button>
      </div>
    </form>
  );
}

function ArrivalForm({
  player,
  onCancel,
}: {
  player:
    ManagedPlayer;

  onCancel:
    () => void;
}) {
  return (
    <form
      action={
        createMissingArrival
      }
      className={
        styles.form
      }
    >
      <input
        type="hidden"
        name="profileId"
        value={
          player.id
        }
      />

      <h2>
        Doplnit příchod —{" "}
        {player.name}
      </h2>

      <div
        className={
          styles.two
        }
      >
        <label>
          <span>
            Datum příchodu
          </span>

          <input
            name="occurredOn"
            type="date"
            required
          />
        </label>

        <label>
          <span>
            Typ
          </span>

          <select
            name="movementDetail"
            defaultValue="transfer_from"
          >
            <option value="transfer_from">
              Přestup z týmu
            </option>

            <option value="loan_in">
              Na hostování
            </option>

            <option value="loan_end">
              Návrat z hostování
            </option>
          </select>
        </label>
      </div>

      <div
        className={
          styles.two
        }
      >
        <label>
          <span>
            APF ID původního klubu
          </span>

          <input
            name="otherClubApfId"
          />
        </label>

        <label>
          <span>
            Původní klub ručně
          </span>

          <input
            name="otherClub"
          />
        </label>
      </div>

      <div
        className={
          styles.actions
        }
      >
        <button
          type="button"
          onClick={
            onCancel
          }
        >
          ZRUŠIT
        </button>

        <button
          type="submit"
          className={
            styles.save
          }
        >
          ZAPSAT PŘÍCHOD
        </button>
      </div>
    </form>
  );
}

function DepartureForm({
  player,
  onCancel,
}: {
  player:
    ManagedPlayer;

  onCancel:
    () => void;
}) {
  return (
    <form
      action={
        registerPlayerDeparture
      }
      className={
        styles.form
      }
    >
      <input
        type="hidden"
        name="profileId"
        value={
          player.id
        }
      />

      <h2>
        Odchod —{" "}
        {player.name}
      </h2>

      <div
        className={
          styles.two
        }
      >
        <label>
          <span>
            Datum odchodu
          </span>

          <input
            name="occurredOn"
            type="date"
            required
          />
        </label>

        <label>
          <span>
            Typ odchodu
          </span>

          <select
            name="movementDetail"
            defaultValue="transfer_to"
          >
            <option value="transfer_to">
              Přestup do týmu
            </option>

            <option value="loan_out">
              Na hostování
            </option>

            <option value="loan_end">
              Konec hostování
            </option>

            <option value="released">
              Vyřazení z týmu
            </option>
          </select>
        </label>
      </div>

      <div
        className={
          styles.two
        }
      >
        <label>
          <span>
            APF ID nového klubu
          </span>

          <input
            name="otherClubApfId"
          />
        </label>

        <label>
          <span>
            Nový klub ručně
          </span>

          <input
            name="otherClub"
          />
        </label>
      </div>

      <div
        className={
          styles.actions
        }
      >
        <button
          type="button"
          onClick={
            onCancel
          }
        >
          ZRUŠIT
        </button>

        <button
          type="submit"
          className={
            styles.save
          }
        >
          POTVRDIT ODCHOD
        </button>
      </div>
    </form>
  );
}

function formatTeam(
  team:
    "a" |
    "b" |
    "both",
) {
  if (
    team ===
    "a"
  ) {
    return "A-TÝM";
  }

  if (
    team ===
    "b"
  ) {
    return "B-TÝM";
  }

  return "A-TÝM + B-TÝM";
}
