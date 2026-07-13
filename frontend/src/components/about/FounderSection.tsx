import { founder } from '../../content/about';
import { siteImages } from '../../content/siteImages';
import { FeatureIcon } from '../ui/FeatureIcon';
import { StaticImage } from '../ui/ResponsiveImage';
import styles from './FounderSection.module.css';

export function FounderSection() {
  return (
    <section className="section sectionToneMuted" id="founder">
      <div className="container">
        <header className={styles.header}>
          <h2 className={styles.title}>{founder.title}</h2>
          <h3 className={styles.name}>{founder.name}</h3>
          <p className={styles.role}>{founder.role}</p>
        </header>

        <div className={styles.grid}>
          <div className={styles.imageWrap}>
            <StaticImage
              image={siteImages.founder}
              alt="Доктор Медведева, основатель клиники"
              className={styles.image}
            />
          </div>

          <div className={styles.content}>
            <blockquote className={styles.quote}>{founder.quote}</blockquote>
            <div className={styles.highlights}>
              {founder.highlights.map((item) => (
                <div key={item.text} className={styles.highlight}>
                  <FeatureIcon name={item.icon} size={16} className={styles.highlightIcon} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <p className={styles.note}>{founder.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
