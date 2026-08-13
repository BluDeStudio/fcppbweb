import * as cheerio from "cheerio";

export type ApfTeamInfo = {
  id: number;
  name: string;
  logoUrl: string | null;
};

const APF_ORIGIN =
  "https://futsalvplzni.cz";

function absoluteUrl(
  value: string | undefined,
): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(
      value,
      APF_ORIGIN,
    ).toString();
  } catch {
    return null;
  }
}

export async function getApfTeamInfo(
  teamId: number,
): Promise<ApfTeamInfo | null> {
  if (
    !Number.isInteger(teamId) ||
    teamId <= 0
  ) {
    return null;
  }

  /*
   * APF routuje tým primárně podle ID.
   * Slug "team" slouží jen jako bezpečný
   * zástupný slug pro načtení stránky.
   */
  const response =
    await fetch(
      `${APF_ORIGIN}/tym/${teamId}/team`,
      {
        cache: "no-store",
        headers: {
          "User-Agent":
            "Mozilla/5.0 FC-PPB-Web/1.0",
        },
      },
    );

  if (!response.ok) {
    return null;
  }

  const html =
    await response.text();

  const $ =
    cheerio.load(html);

  const heading =
    $("h1")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();

  if (!heading) {
    return null;
  }

  let logoUrl:
    string | null =
    null;

  /*
   * Na týmových profilech APF je znak
   * obrázek u názvu týmu. Nejprve hledáme
   * podle alt textu, potom nejbližší obrázek
   * před H1.
   */
  $("img").each(
    (_, element) => {
      if (logoUrl) {
        return;
      }

      const image =
        $(element);

      const alt =
        (
          image.attr("alt") ??
          ""
        )
          .replace(/\s+/g, " ")
          .trim();

      if (
        alt &&
        alt.toLocaleLowerCase(
          "cs",
        ) ===
          heading.toLocaleLowerCase(
            "cs",
          )
      ) {
        logoUrl =
          absoluteUrl(
            image.attr("src") ??
            image.attr(
              "data-src",
            ),
          );
      }
    },
  );

  if (!logoUrl) {
    const h1 =
      $("h1").first();

    const nearbyImage =
      h1
        .prevAll("img")
        .first();

    logoUrl =
      absoluteUrl(
        nearbyImage.attr("src") ??
        nearbyImage.attr(
          "data-src",
        ),
      );
  }

  return {
    id:
      teamId,
    name:
      heading,
    logoUrl,
  };
}
