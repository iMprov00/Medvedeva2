import { principles } from '../../content/principles';
import { FeatureCardsSection } from '../ui/FeatureCardsSection';

export function PrinciplesSection() {
  return (
    <FeatureCardsSection
      title="Наши принципы"
      cards={principles.map((item) => ({
        title: item.title,
        text: item.description,
      }))}
      tone="white"
    />
  );
}
