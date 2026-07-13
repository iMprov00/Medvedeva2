import type { SpecialtyPageDefinition } from './part1';
import { directionImage } from '../siteImages';
import {
  pediatricsContent,
  homeVisitContent,
  certificatesContent,
} from './part1';
import {
  neurologyContent,
  epileptologyContent,
  nutritionContent,
  gastroenterologyContent,
  pulmonologyContent,
  endocrinologyContent,
  psychiatryContent,
  psychologyContent,
} from './part2';

export type { SpecialtyPageDefinition } from './part1';
export { firstVisitPromotion } from './part1';

export const specialtyPages: Record<string, SpecialtyPageDefinition> = {
  pediatrics: {
    slug: 'pediatrics',
    title: 'ПЕДИАТРИЯ',
    cardDescription: 'Приём детей от 0 до 18 лет. Осмотр, диагноз, лечение.',
    cardImageUrl: directionImage('pediatrics'),
    template: 'standard',
    pageContent: pediatricsContent,
  },
  'home-visit': {
    slug: 'home-visit',
    title: 'ВЫЗОВ ВРАЧА НА ДОМ / ПАТРОНАЖ',
    cardDescription: 'Врач приедет домой. Патронаж новорождённого.',
    cardImageUrl: directionImage('home-visit'),
    template: 'steps',
    pageContent: homeVisitContent,
  },
  certificates: {
    slug: 'certificates',
    title: 'МЕДИЦИНСКИЕ СПРАВКИ ДЛЯ ДЕТЕЙ',
    cardDescription: 'Лагерь, бассейн, секция, сад, школа — за один визит.',
    cardImageUrl: directionImage('certificates'),
    template: 'steps',
    pageContent: certificatesContent,
  },
  neurology: {
    slug: 'neurology',
    title: 'НЕВРОЛОГИЯ',
    cardDescription: 'СДВГ, задержка речи, тики, головные боли. Дети и взрослые.',
    cardImageUrl: directionImage('neurology'),
    template: 'standard',
    pageContent: neurologyContent,
  },
  epileptology: {
    slug: 'epileptology',
    title: 'НЕВРОЛОГ-ЭПИЛЕПТОЛОГ',
    cardDescription: 'Судороги, эпилепсия, подбор терапии. Дети и взрослые.',
    cardImageUrl: directionImage('epileptology'),
    template: 'standard',
    pageContent: epileptologyContent,
  },
  nutrition: {
    slug: 'nutrition',
    title: 'НУТРИЦИОЛОГ',
    cardDescription: 'Питание, вес, прикорм. Индивидуальный подход к рациону.',
    cardImageUrl: directionImage('nutrition'),
    template: 'standard',
    pageContent: nutritionContent,
  },
  gastroenterology: {
    slug: 'gastroenterology',
    title: 'ГАСТРОЭНТЕРОЛОГ',
    cardDescription: 'Боли в животе, запоры, рефлюкс, ЖКТ. Дети и взрослые.',
    cardImageUrl: directionImage('gastroenterology'),
    template: 'standard',
    pageContent: gastroenterologyContent,
  },
  pulmonology: {
    slug: 'pulmonology',
    title: 'ПУЛЬМОНОЛОГ',
    cardDescription: 'Кашель, астма, бронхиты. Спирометрия на приёме.',
    cardImageUrl: directionImage('pulmonology'),
    template: 'standard',
    pageContent: pulmonologyContent,
  },
  endocrinology: {
    slug: 'endocrinology',
    title: 'ЭНДОКРИНОЛОГ',
    cardDescription: 'Рост, вес, щитовидная железа, сахар. Дети и взрослые.',
    cardImageUrl: directionImage('endocrinology'),
    template: 'standard',
    pageContent: endocrinologyContent,
  },
  psychiatry: {
    slug: 'psychiatry',
    title: 'ПСИХИАТРИЯ И ПСИХОТЕРАПИЯ',
    cardDescription: 'Тревожные расстройства, депрессия, нарушения поведения.',
    cardImageUrl: directionImage('psychotherapy'),
    template: 'standard',
    pageContent: psychiatryContent,
  },
  psychology: {
    slug: 'psychology',
    title: 'ПСИХОЛОГ',
    cardDescription: 'Поведение, страхи, школа, отношения. Дети и взрослые.',
    cardImageUrl: directionImage('psychology'),
    template: 'standard',
    pageContent: psychologyContent,
  },
};

export function getSpecialtyPage(slug: string): SpecialtyPageDefinition | null {
  return specialtyPages[slug] ?? null;
}

export const specialtySlugs = Object.keys(specialtyPages);
