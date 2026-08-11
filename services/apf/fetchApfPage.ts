import { clubConfig } from "@/config/club";

export async function fetchApfPage(path: string): Promise<string> {
  const url = `${clubConfig.apf.baseUrl}${path}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "FC-PPB-Club-Web/1.0",
      Accept: "text/html",
    },

    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Nepodařilo se načíst APF. HTTP stav: ${response.status}`,
    );
  }

  return response.text();
}