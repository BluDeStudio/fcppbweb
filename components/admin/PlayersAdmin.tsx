"use client";

import {
  Fragment,
  useState,
} from "react";

import {
  createMissingArrival,
  registerPlayerDeparture,
  saveWebPlayer,
  setPlayerActive,
} from "@/app/admin/hraci/actions";

import styles from "./PlayersAdmin.module.css";

type TeamValue =
  | "a"
  | "b"
  | "both";

type PositionValue =
  | "player"
  | "goalkeeper";

type StatusValue =
  | "club"
  | "loan";

type AdminMovement = {
  id: string;
  direction:
    | "arrival"
    | "departure";
  detail: string | null;
  date: string;
  season: string | null;
  otherClub: string | null;
};

type AppPlayer = {
  id: string;
  name: string;
  number: number;
  position: string | null;
  apfPlayerId: number | null;
  active: boolean;
};

type ManagedPlayer = {
  id: string;
  webProfileId: string | null;
  name: string;
  team: TeamValue;
  position: PositionValue;
  status: StatusValue;
  shirtNumber: number | null;
  imageUrl: string | null;
  apfPlayerId: number | null;
  appPlayerId: string | null;
  active: boolean;
  inactiveFrom: string | null;
  source: "app" | "web" | "web+app";
  clubFrom: string | null;
  clubTo: string | null;
  movements: AdminMovement[];
};

type MovementState = {
  playerId: string;
  direction:
    | "arrival"
    | "departure";
} | null;

export function PlayersAdmin({
  players,
  appPlayers,
}: {
  players: ManagedPlayer[];
  appPlayers: AppPlayer[];
}) {
  const [
    editingPlayerId,
    setEditingPlayerId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    creating,
    setCreating,
  ] =
    useState(false);

  const [
    movement,
    setMovement,
  ] =
    useState<MovementState>(
      null,
    );

  const [
    inactivePlayerId,
    setInactivePlayerId,
  ] =
    useState<string | null>(
      null,
    );

  function closeForms() {
    setEditingPlayerId(
      null,
    );

    setCreating(
      false,
    );

    setMovement(
      null,
    );

    setInactivePlayerId(
      null,
    );
  }

  return (
    <div
      className={
        styles.wrap
      }
    >
      <div
        className={
          styles.topbar
        }
      >
        <div>
          <strong>
            Registr hráčů
          </strong>

          <span>
            {players.length} hráčů
          </span>
        </div>

        <button
          type="button"
          className={
            styles.newButton
          }
          onClick={() => {
            closeForms();

            setCreating(
              true,
            );
          }}
        >
          + NOVÝ HRÁČ
        </button>
      </div>

      {creating && (
        <PlayerForm
          player={
            null
          }
          appPlayers={
            appPlayers
          }
          onCancel={
            closeForms
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
          ) => {
            const isEditing =
              editingPlayerId ===
              player.id;

            const isMovementOpen =
              movement?.playerId ===
              player.id;

            return (
              <Fragment
                key={
                  player.id
                }
              >
                <article
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

                    <span>
                      V KLUBU OD:{" "}
                      {
                        formatDate(
                          player.clubFrom,
                        )
                      }
                      {" • "}
                      DO:{" "}
                      {
                        player.clubTo
                          ? formatDate(
                              player.clubTo,
                            )
                          : player.active
                            ? "SOUČASNOST"
                            : "—"
                      }
                    </span>

                    {!player.active &&
                      player.inactiveFrom && (
                      <span>
                        NEAKTIVNÍ OD:{" "}
                        {formatDate(
                          player.inactiveFrom,
                        )}
                      </span>
                    )}
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
                      POHYBY:{" "}
                      {
                        player.movements
                          .length
                      }
                    </span>
                  </div>

                  <div
                    className={
                      styles.actions
                    }
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setCreating(
                          false,
                        );

                        setEditingPlayerId(
                          null,
                        );

                        setMovement({
                          playerId:
                            player.id,

                          direction:
                            "arrival",
                        });
                      }}
                    >
                      PŘÍCHOD
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCreating(
                          false,
                        );

                        setEditingPlayerId(
                          null,
                        );

                        setMovement({
                          playerId:
                            player.id,

                          direction:
                            "departure",
                        });
                      }}
                    >
                      ODCHOD
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCreating(
                          false,
                        );

                        setMovement(
                          null,
                        );

                        setEditingPlayerId(
                          player.id,
                        );
                      }}
                    >
                      UPRAVIT
                    </button>

                    {player.active ? (
                      <button
                        type="button"
                        onClick={() => {
                          setCreating(false);
                          setEditingPlayerId(null);
                          setMovement(null);
                          setInactivePlayerId(
                            player.id,
                          );
                        }}
                      >
                        NEAKTIVNÍ
                      </button>
                    ) : (
                      <ActiveToggle
                        player={player}
                      />
                    )}
                  </div>

                  {player.movements.length >
                    0 && (
                    <div
                      className={
                        styles.history
                      }
                    >
                      {player.movements.map(
                        (
                          item,
                        ) => (
                          <span
                            key={
                              item.id
                            }
                          >
                            {
                              item.direction ===
                              "arrival"
                                ? "PŘÍCHOD"
                                : "ODCHOD"
                            }
                            {" • "}
                            {
                              formatDate(
                                item.date,
                              )
                            }
                            {
                              item.otherClub
                                ? ` • ${item.otherClub}`
                                : ""
                            }
                            {
                              item.season
                                ? ` • ${item.season}`
                                : ""
                            }
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </article>

                {isEditing && (
                  <PlayerForm
                    player={
                      player
                    }
                    appPlayers={
                      appPlayers
                    }
                    onCancel={
                      closeForms
                    }
                  />
                )}

                {isMovementOpen &&
                  movement && (
                  <MovementForm
                    player={
                      player
                    }
                    direction={
                      movement.direction
                    }
                    onCancel={
                      closeForms
                    }
                  />
                )}

                {inactivePlayerId ===
                  player.id && (
                  <InactiveForm
                    player={player}
                    onCancel={closeForms}
                  />
                )}
              </Fragment>
            );
          },
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
  player:
    ManagedPlayer |
    null;

  appPlayers:
    AppPlayer[];

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
          player?.webProfileId ??
          ""
        }
      />

      <h2>
        {
          player
            ? "Upravit hráče"
            : "Nový hráč"
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
            (
              player?.apfPlayerId !==
                null &&
              player?.apfPlayerId !==
                undefined
                ? `/images/${player.apfPlayerId}.jpg`
                : ""
            )
          }
          placeholder="/images/532.jpg"
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
          ULOŽIT
        </button>
      </div>
    </form>
  );
}

function MovementForm({
  player,
  direction,
  onCancel,
}: {
  player:
    ManagedPlayer;

  direction:
    | "arrival"
    | "departure";

  onCancel:
    () => void;
}) {
  const isArrival =
    direction ===
    "arrival";

  return (
    <form
      action={
        isArrival
          ? createMissingArrival
          : registerPlayerDeparture
      }
      className={
        styles.form
      }
    >
      <PlayerIdentityInputs
        player={
          player
        }
      />

      <h2>
        {
          isArrival
            ? `Příchod — ${player.name}`
            : `Odchod — ${player.name}`
        }
      </h2>

      <div
        className={
          styles.two
        }
      >
        <label>
          <span>
            {
              isArrival
                ? "Datum příchodu"
                : "Datum odchodu"
            }
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
            defaultValue={
              isArrival
                ? "transfer_from"
                : "transfer_to"
            }
          >
            {isArrival ? (
              <>
                <option value="transfer_from">
                  Přestup z týmu
                </option>

                <option value="loan_in">
                  Na hostování
                </option>

                <option value="loan_end">
                  Návrat z hostování
                </option>
              </>
            ) : (
              <>
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
              </>
            )}
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
            {
              isArrival
                ? "APF ID původního klubu"
                : "APF ID nového klubu"
            }
          </span>

          <input
            name="otherClubApfId"
            inputMode="numeric"
          />
        </label>

        <label>
          <span>
            {
              isArrival
                ? "Původní klub ručně"
                : "Nový klub ručně"
            }
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
          {
            isArrival
              ? "ZAPSAT PŘÍCHOD"
              : "POTVRDIT ODCHOD"
          }
        </button>
      </div>
    </form>
  );
}

function InactiveForm({
  player,
  onCancel,
}: {
  player: ManagedPlayer;
  onCancel: () => void;
}) {
  return (
    <form
      action={setPlayerActive}
      className={styles.form}
    >
      <PlayerIdentityInputs
        player={player}
      />

      <input
        type="hidden"
        name="targetActive"
        value="false"
      />

      <h2>
        Zneaktivnit — {player.name}
      </h2>

      <p>
        Hráč zmizí z aktuálního webu,
        ale jeho historické statistiky
        zůstanou zachované.
      </p>

      <label>
        <span>Neaktivní od</span>

        <input
          type="date"
          name="inactiveFrom"
          defaultValue={
            player.inactiveFrom ?? ""
          }
          required
        />
      </label>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
        >
          ZRUŠIT
        </button>

        <button
          type="submit"
          className={styles.save}
        >
          POTVRDIT NEAKTIVNÍ
        </button>
      </div>
    </form>
  );
}

function ActiveToggle({
  player,
}: {
  player:
    ManagedPlayer;
}) {
  return (
    <form
      action={
        setPlayerActive
      }
    >
      <PlayerIdentityInputs
        player={
          player
        }
      />

      <input
        type="hidden"
        name="targetActive"
        value="true"
      />

      <button
        type="submit"
      >
        AKTIVOVAT
      </button>
    </form>
  );
}

function PlayerIdentityInputs({
  player,
}: {
  player:
    ManagedPlayer;
}) {
  return (
    <>
      <input
        type="hidden"
        name="profileId"
        value={
          player.webProfileId ??
          ""
        }
      />

      <input
        type="hidden"
        name="appPlayerId"
        value={
          player.appPlayerId ??
          ""
        }
      />

      <input
        type="hidden"
        name="playerName"
        value={
          player.name
        }
      />

      <input
        type="hidden"
        name="apfPlayerId"
        value={
          player.apfPlayerId ??
          ""
        }
      />

      <input
        type="hidden"
        name="team"
        value={
          player.team
        }
      />

      <input
        type="hidden"
        name="position"
        value={
          player.position
        }
      />

      <input
        type="hidden"
        name="status"
        value={
          player.status
        }
      />

      <input
        type="hidden"
        name="shirtNumber"
        value={
          player.shirtNumber ??
          ""
        }
      />

      <input
        type="hidden"
        name="imageUrl"
        value={
          player.imageUrl ??
          (
            player.apfPlayerId !==
              null
              ? `/images/${player.apfPlayerId}.jpg`
              : ""
          )
        }
      />
    </>
  );
}

function formatTeam(
  team:
    TeamValue,
): string {
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

function formatDate(
  value:
    string |
    null,
): string {
  if (
    !value
  ) {
    return "—";
  }

  const date =
    new Date(
      `${value}T12:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "cs-CZ",
  ).format(
    date,
  );
}
