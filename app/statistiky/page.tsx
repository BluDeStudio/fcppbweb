import { clubConfig } from "@/config/club";

import { getStatisticsPlayers } from "@/lib/getStatisticsPlayers";

import { StatisticsTable } from "@/components/statistics/StatisticsTable";

import styles from "./page.module.css";

export const revalidate = 300;

export default async function StatisticsPage() {
  const players =
    await getStatisticsPlayers();

  return (
    <main
      className={
        styles.page
      }
    >
      <section
        className={
          styles.hero
        }
      >
        <div
          className={
            styles.container
          }
        >
          <div
            className={
              styles.heroGrid
            }
          >
            <div>
              <h1>
                Statistiky.
                <span>
                  Přehled hráčů.
                </span>
              </h1>

              <p>
                Kompletní přehled A-týmu
                a B-týmu.
              </p>
            </div>

            <div
              className={
                styles.season
              }
            >
              <span>
                Aktuální sezóna
              </span>

              <strong>
                {
                  clubConfig.season
                }
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section
        className={
          styles.content
        }
      >
        <div
          className={
            styles.container
          }
        >
          <StatisticsTable
            players={
              players
            }
            season={
              clubConfig.season
            }
          />
        </div>
      </section>
    </main>
  );
}
