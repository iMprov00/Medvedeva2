import { useEffect, useState } from 'react';
import { fetchPromotions } from '../../api/cms';
import type { Promotion } from '../../types/cms';
import styles from './PromotionsSection.module.css';

export function PromotionsSection() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    fetchPromotions().then(setPromotions).catch(() => setPromotions([]));
  }, []);

  return (
    <section className="section sectionToneWhite" id="promotions">
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Акции и специальные предложения</h2>
          <p className={styles.subtitle}>Выгодные условия для наших пациентов</p>
        </div>
        <div className={styles.grid}>
          {promotions.map((item) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.cardHeader} style={{ backgroundColor: item.accentColor }}>
                <img src={item.imageUrl} alt="" className={styles.image} />
                <span className={styles.discount}>{item.discount}</span>
              </div>
              <div className={styles.cardBody}>
                <span className={styles.badge}>{item.badge}</span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.text}>{item.text}</p>
                {item.tags.length > 0 && (
                  <div className={styles.tags}>
                    {item.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
