import type { SpecialtyStepsContent, SpecialtyFeaturesContent } from '../../types/cms';
import { FeatureCardsSection } from '../ui/FeatureCardsSection';
import styles from './SpecialtySteps.module.css';

interface SpecialtyStepsProps {
  steps?: SpecialtyStepsContent;
  features?: SpecialtyFeaturesContent;
  featuresDecorImageUrl?: string;
}

export function SpecialtySteps({ steps, features, featuresDecorImageUrl }: SpecialtyStepsProps) {
  if (!steps?.items?.length && !features?.cards?.length) return null;

  return (
    <>
      {steps?.items?.length ? (
        <section className="section sectionToneWhite">
          <div className="container">
            <h2 className={styles.sectionTitle}>{steps.title || 'Вызов на дом'}</h2>
            <div className={styles.stepsRow}>
              {steps.items.map((item, index) => (
                <article key={item.title} className={styles.step}>
                  <div className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</div>
                  <h3 className={styles.stepTitle}>{item.title}</h3>
                  <p className={styles.stepText}>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {features?.cards?.length ? (
        <FeatureCardsSection
          title={features.title || ''}
          cards={features.cards}
          decorImageUrl={featuresDecorImageUrl}
          tone="muted"
        />
      ) : null}
    </>
  );
}
