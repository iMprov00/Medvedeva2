export type SpecialtyTemplate = 'standard' | 'steps';

export interface SpecialtyHeroContent {
  subtitle?: string;
  description?: string;
  ctaLabel?: string;
  imageUrl?: string;
  bullets?: string[];
}

export interface SpecialtyCardContent {
  title: string;
  text: string;
}

export interface SpecialtyApproachContent {
  title?: string;
  cards: SpecialtyCardContent[];
}

export interface SpecialtyStepsContent {
  title?: string;
  items: SpecialtyCardContent[];
}

export interface SpecialtyFeaturesContent {
  title?: string;
  cards: SpecialtyCardContent[];
}

export interface SpecialtyWhenContent {
  title?: string;
  description?: string;
  items: string[];
}

export interface SpecialtyPageContent {
  hero?: SpecialtyHeroContent;
  approach?: SpecialtyApproachContent;
  steps?: SpecialtyStepsContent;
  features?: SpecialtyFeaturesContent;
  when?: SpecialtyWhenContent;
  doctorsSectionTitle?: string;
}

export const emptyPageContent = (): SpecialtyPageContent => ({});

export function parsePageContent(raw: string): SpecialtyPageContent {
  try {
    return JSON.parse(raw) as SpecialtyPageContent;
  } catch {
    return {};
  }
}
