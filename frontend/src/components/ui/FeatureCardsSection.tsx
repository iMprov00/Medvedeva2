import type { FeatureCardItem, Masonry4Slots } from './featureCards';
import {
  buildMasonry4Slots,
  DEFAULT_FEATURE_DECOR,
  DEFAULT_FEATURE_ICON,
  withCardIcons,
} from './featureCards';
import { useElementHeight } from '../../hooks/useElementHeight';
import styles from './FeatureCardsSection.module.css';

interface FeatureCardProps {
  card: FeatureCardItem;
  stretch?: boolean;
}

function FeatureCard({ card, stretch }: FeatureCardProps) {
  return (
    <article className={`${styles.card} ${stretch ? styles.cardStretch : ''}`}>
      <div className={styles.cardHead}>
        <img
          src={card.iconUrl || DEFAULT_FEATURE_ICON}
          alt=""
          className={styles.icon}
          width={48}
          height={48}
        />
        <h3 className={styles.cardTitle}>{card.title}</h3>
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardText}>{card.text}</p>
        {card.bullets && card.bullets.length > 0 && (
          <ul className={styles.bullets}>
            {card.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function Masonry4TallCenter({ slots, decorImageUrl }: { slots: Masonry4Slots; decorImageUrl: string }) {
  const { ref: leftRef, height: leftHeight } = useElementHeight<HTMLDivElement>();
  const syncedHeight = leftHeight ? `${leftHeight}px` : undefined;

  return (
    <div className={styles.masonry4Flex}>
      <div ref={leftRef} className={styles.leftStack}>
        <FeatureCard card={slots.topLeft} />
        <FeatureCard card={slots.bottomLeft} />
      </div>
      <div className={styles.centerCol} style={{ height: syncedHeight }}>
        <FeatureCard card={slots.center} stretch />
      </div>
      <div className={styles.rightStack} style={{ height: syncedHeight }}>
        <FeatureCard card={slots.topRight} />
        <div className={styles.decorSlot}>
          <img src={decorImageUrl} alt="" className={styles.decorImage} />
        </div>
      </div>
    </div>
  );
}

interface FeatureCardsSectionProps {
  title: string;
  subtitle?: string;
  cards: FeatureCardItem[];
  decorImageUrl?: string;
  tone?: 'white' | 'muted';
  variant?: 'masonry' | 'grid';
}

export function FeatureCardsSection({
  title,
  subtitle,
  cards,
  decorImageUrl = DEFAULT_FEATURE_DECOR,
  tone = 'white',
  variant = 'masonry',
}: FeatureCardsSectionProps) {
  if (!cards.length) return null;

  const resolvedCards = withCardIcons(cards);
  const sectionClass = tone === 'muted' ? 'section sectionToneMuted' : 'section sectionToneWhite';
  const gridClass = resolvedCards.length === 4 ? styles.grid2 : styles.grid;

  if (cards.length === 4 && variant === 'masonry') {
    const slots = buildMasonry4Slots(resolvedCards);

    return (
      <section className={sectionClass}>
        <div className="container">
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {slots.layout === 'tallCenter' ? (
            <Masonry4TallCenter slots={slots} decorImageUrl={decorImageUrl} />
          ) : (
            <div className={`${styles.masonry4} ${styles.masonry4Compact}`}>
              <div className={styles.slot0}>
                <FeatureCard card={slots.topLeft} />
              </div>
              <div className={styles.slot1}>
                <FeatureCard card={slots.bottomLeft} />
              </div>
              <div className={styles.slot2}>
                <FeatureCard card={slots.center} />
              </div>
              <div className={styles.slot3}>
                <FeatureCard card={slots.topRight} />
              </div>
              <div className={styles.decorSlot}>
                <img src={decorImageUrl} alt="" className={styles.decorImage} />
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClass}>
      <div className="container">
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <div className={gridClass}>
          {resolvedCards.map((card) => (
            <FeatureCard key={card.title} card={card} stretch />
          ))}
        </div>
      </div>
    </section>
  );
}
