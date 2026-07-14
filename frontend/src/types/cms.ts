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
  bullets?: string[];
  iconUrl?: string;
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
  items?: string[];
  groups?: { label: string; items: string[] }[];
}

export interface SpecialtyFaqItem {
  question: string;
  answer: string;
}

export interface SpecialtyFaqContent {
  title?: string;
  items: SpecialtyFaqItem[];
  ctaText?: string;
}

export interface SpecialtyPromotionContent {
  discount: string;
  title: string;
  text: string;
  validUntil?: string;
}

export interface SpecialtyFinalCtaContent {
  subtitle?: string;
}

export interface SpecialtyPageContent {
  hero?: SpecialtyHeroContent;
  approach?: SpecialtyApproachContent;
  steps?: SpecialtyStepsContent;
  features?: SpecialtyFeaturesContent;
  when?: SpecialtyWhenContent;
  faq?: SpecialtyFaqContent;
  promotion?: SpecialtyPromotionContent;
  finalCta?: SpecialtyFinalCtaContent;
  doctorsSectionTitle?: string;
}

export interface Promotion {
  id: number;
  badge: string;
  title: string;
  discount: string;
  text: string;
  tags: string[];
  imageUrl: string;
  accentColor: string;
  validUntil: string | null;
  active: boolean;
  sortOrder: number;
}

export interface Doctor {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string | null;
  role: string | null;
  fullName: string;
  photoUrl: string | null;
  bookingUrl: string;
  noBookingLink: boolean;
  published: boolean;
  sortOrder: number;
  specialtySlugs: string[];
}

export interface GalleryPhoto {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

export interface ClinicDocument {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string;
  originalFilename: string | null;
  sortOrder: number;
  active: boolean;
}
