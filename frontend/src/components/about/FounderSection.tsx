import { founder } from '../../content/about';
import { FeatureIcon } from '../ui/FeatureIcon';
import styles from './FounderSection.module.css';

export function FounderSection() {
  return (
    <section className="section sectionToneMuted" id="founder">
      <div className={`container ${styles.grid}`}>
        <div className={styles.imageWrap}>
          <img
            src="/images/medvedeva3.jpeg"
            alt="Доктор Медведева, основатель клиники"
            className={styles.image}
          />
        </div>
        <div className={styles.content}>
          <h2 className={styles.title}>{founder.title}</h2>
          <h3 className={styles.name}>{founder.name}</h3>
          <p className={styles.role}>{founder.role}</p>
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
    </section>
  );
}
