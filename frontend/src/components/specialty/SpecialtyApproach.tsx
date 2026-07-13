import type { SpecialtyApproachContent } from '../../types/cms';
import { FeatureCardsSection } from '../ui/FeatureCardsSection';

interface SpecialtyApproachProps {
  data?: SpecialtyApproachContent;
  decorImageUrl?: string;
}

export function SpecialtyApproach({ data, decorImageUrl }: SpecialtyApproachProps) {
  if (!data?.cards?.length) return null;

  return (
    <FeatureCardsSection
      title={data.title || 'Наш подход'}
      cards={data.cards}
      decorImageUrl={decorImageUrl}
      tone="white"
    />
  );
}
