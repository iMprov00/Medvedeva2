import { directionImage } from './siteImages';

export interface DirectionCard {
  title: string;
  description: string;
  path: string;
  image: string;
}

export const directions: DirectionCard[] = [
  {
    title: 'ПЕДИАТРИЯ',
    description: 'Приём детей от 0 до 18 лет. Осмотр, диагноз, лечение.',
    path: '/pediatrics',
    image: directionImage('pediatrics'),
  },
  {
    title: 'ВЫЗОВ ВРАЧА НА ДОМ / ПАТРОНАЖ',
    description: 'Врач приедет домой. Патронаж новорождённого.',
    path: '/home-visit',
    image: directionImage('home-visit'),
  },
  {
    title: 'СПРАВКИ',
    description: 'Лагерь, бассейн, секция, сад, школа — за один визит.',
    path: '/certificates',
    image: directionImage('certificates'),
  },
  {
    title: 'НЕВРОЛОГИЯ',
    description: 'СДВГ, задержка речи, тики, головные боли. Дети и взрослые.',
    path: '/neurology',
    image: directionImage('neurology'),
  },
  {
    title: 'НЕВРОЛОГ-ЭПИЛЕПТОЛОГ',
    description: 'Судороги, эпилепсия, подбор терапии. Дети и взрослые.',
    path: '/epileptology',
    image: directionImage('epileptology'),
  },
  {
    title: 'НУТРИЦИОЛОГ',
    description: 'Питание, вес, прикорм. Индивидуальный подход к рациону. Дети и взрослые.',
    path: '/nutrition',
    image: directionImage('nutrition'),
  },
  {
    title: 'ГАСТРОЭНТЕРОЛОГ',
    description: 'Боли в животе, запоры, рефлюкс, ЖКТ. Дети и взрослые.',
    path: '/gastroenterology',
    image: directionImage('gastroenterology'),
  },
  {
    title: 'ПУЛЬМОНОЛОГ',
    description: 'Кашель, астма, бронхиты. Спирометрия на приёме. Дети и взрослые.',
    path: '/pulmonology',
    image: directionImage('pulmonology'),
  },
  {
    title: 'ЭНДОКРИНОЛОГ',
    description: 'Рост, вес, щитовидная железа, сахар. Дети и взрослые.',
    path: '/endocrinology',
    image: directionImage('endocrinology'),
  },
  {
    title: 'ПСИХОТЕРАПИЯ',
    description: 'Тревожные расстройства, депрессия, нарушения поведения. Дети и взрослые.',
    path: '/psychiatry',
    image: directionImage('psychotherapy'),
  },
  {
    title: 'ПСИХОЛОГ',
    description: 'Поведение, страхи, школа, отношения. Дети и взрослые.',
    path: '/psychology',
    image: directionImage('psychology'),
  },
];
