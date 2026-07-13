import { useEffect, useRef } from 'react';
import { reviewsSection } from '../../content/about';
import styles from './ProDoctorovReviews.module.css';

const LPU_ID = '112528';
const WIDGET_SCRIPT = 'https://prodoctorov.ru/static/js/widget_big.js?v07';

export function ProDoctorovReviews() {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = document.querySelector(`script[src="${WIDGET_SCRIPT}"]`);
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.src = WIDGET_SCRIPT;
    script.defer = true;
    widgetRef.current?.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <section className="section sectionToneMuted" id="reviews">
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>{reviewsSection.title}</h2>
          <p className={styles.subtitle}>{reviewsSection.subtitle}</p>
        </div>

        <div className={styles.widgetWrap} ref={widgetRef}>
          <div id="pd_widget_big" data-lpu={LPU_ID} className={styles.widget}>
            <div className="pd_rate_header">
              Оценки о «Клиника доктора Медведевой»
              <br />
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="pd_rate_new"
                href={`https://prodoctorov.ru/new/rate/lpu/${LPU_ID}/`}
              >
                Оставить отзыв
              </a>
            </div>
            <div id="pd_widget_big_content" />
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://prodoctorov.ru/barnaul/lpu/${LPU_ID}-klinika-doktora-medvedevoy/#otzivi`}
              className="pd_read_all"
            >
              Читать все отзывы
            </a>
            <span id="pd_powered_by">
              <a target="_blank" rel="noopener noreferrer" href="https://prodoctorov.ru">
                <img
                  className="pd_logo"
                  src="https://prodoctorov.ru/static/_v1/pd/logos/logo-pd-widget.png"
                  alt="ПроДокторов"
                  width={120}
                  height={24}
                  loading="lazy"
                />
              </a>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
