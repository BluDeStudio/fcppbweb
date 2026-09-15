"use client";

import {
  useMemo,
  useState,
} from "react";

import styles from "./MatchDetail.module.css";

type Props = {
  apfPlayerId:
    number | null;

  name:
    string;

  size?:
    "normal" | "large";
};

export default function PlayerAvatar({
  apfPlayerId,
  name,
  size = "normal",
}: Props) {
  const sources =
    useMemo(
      () =>
        apfPlayerId
          ? [
              `/images/${apfPlayerId}.png`,
              `/images/${apfPlayerId}.jpg`,
            ]
          : [],
      [
        apfPlayerId,
      ],
    );

  const [
    index,
    setIndex,
  ] =
    useState(0);

  const src =
    sources[index];

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part[0]?.toUpperCase() ??
          "",
      )
      .join("");

  return (
    <div
      className={[
        styles.playerAvatar,
        size === "large"
          ? styles.playerAvatarLarge
          : "",
        src
          ? styles.playerAvatarHasImage
          : styles.playerAvatarFallback,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          onError={() => {
            setIndex(
              (current) =>
                current + 1 <
                sources.length
                  ? current + 1
                  : sources.length,
            );
          }}
        />
      ) : (
        <span>
          {initials}
        </span>
      )}
    </div>
  );
}
