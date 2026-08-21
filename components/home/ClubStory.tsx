import { SectionHeader } from "@/components/ui/SectionHeader";

import styles from "./ClubStory.module.css";

const timeline = [
  {
    year: "2018",
    title: "Pilsen Boys",
    text: "První sezóna v soutěžích APF.",
  },
  {
    year: "2021",
    title: "Vznik B-týmu",
    text: "Klub se rozrůstá o druhé mužstvo.",
  },
  {
    year: "2022",
    title: "Vznik FC PPB",
    text: "Spojení Pilsen Boys a Playmakers.",
  },
  {
    year: "2024/25",
    title: "Návrat do 1. třídy",
    text: "A-tým končí druhý a postupuje zpět do 1. třídy.",
  },
  {
    year: "2026",
    title: "Vznik spolku FC PPB z. s.",
    text: "Další krok v rozvoji klubu – FC PPB se stává oficiálním spolkem.",
  },
];

export function ClubStory() {
  return (
    <section
      id="klub"
      className={styles.section}
    >
      <div className={styles.container}>
        <SectionHeader
          number="01"
          label="Klub"
          title="Náš příběh."
          secondLine="Píše se od roku 2018."
        />

        <div className={styles.content}>
          <div className={styles.text}>
            <p className={styles.lead}>
              FC PPB je plzeňský futsalový klub,
              jehož historie se začala psát v roce
              2018.
            </p>

            <p>
              Z původní party kamarádů a kolegů,
              která hrávala fotbálky a letní turnaje
              pod názvem Thermo Boys, vznikl tým
              Pilsen Boys.
            </p>

            <p>
              V roce 2021 jsme založili B-tým
              a o rok později přišlo spojení
              s tradičním plzeňským týmem
              Playmakers.
            </p>

            <p>
              Právě spojením Pilsen Boys
              a Playmakers vznikl současný
              název FC PPB.
            </p>

            <p>
              FC PPB ale není jen o výsledcích.
              Stojíme na přátelství, týmovém duchu,
              soutěživosti a společné vášni
              pro futsal.
            </p>

            <p>
              Píšeme novou éru našeho klubu.
              Chceme se neustále posouvat vpřed a FC PPB
              reprezentovat v tom nejlepším světle – nejen
              svými výkony na hřišti, ale také tím, jak
              fungujeme a vystupujeme mimo něj.
            </p>
          </div>

          <div className={styles.timeline}>
            {timeline.map((item) => (
              <div
                className={styles.timelineItem}
                key={item.year}
              >
                <strong>
                  {item.year}
                </strong>

                <div>
                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
