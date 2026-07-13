import { philosophy } from '../../content/about';
import { siteImages } from '../../content/siteImages';
import { iconForCardTitle } from '../../content/tildaIcons';
import { StaticImage } from '../ui/ResponsiveImage';
import styles from './PhilosophySection.module.css';

export function PhilosophySection() {
  return (
    <section className="section sectionToneWhite">
      <div className={`container ${styles.grid}`}>
        <div className={styles.content}>
          <h2 className={styles.title}>{philosophy.title}</h2>
          <p className={styles.text}>{philosophy.text}</p>
          <div className={styles.cards}>
            {philosophy.cards.map((card) => (
              <article key={card.title} className={styles.card}>
                <div className={styles.cardHead}>
                  <img
                    src={iconForCardTitle(card.title)}
                    alt=""
                    className={styles.icon}
                    width={48}
                    height={48}
                  />
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                </div>
                <p className={styles.cardText}>{card.text}</p>
              </article>
            ))}
          </div>
        </div>
        <div className={styles.imageWrap}>
          <StaticImage
            image={siteImages.aboutHero}
            alt="Семья с ребёнком в уютной обстановке клиники"
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
