import { conditions } from '../../content/prices';
import { FeatureCardsSection } from '../ui/FeatureCardsSection';

export function ConditionsSection() {
  return (
    <FeatureCardsSection
      title={conditions.title}
      subtitle={conditions.subtitle}
      cards={conditions.items.map((item) => ({
        title: item.title,
        text: item.text,
      }))}
      tone="muted"
      variant="grid"
    />
  );
}
