export interface SpecialtyNavItem {
  title: string;
  path: string;
}

export const specialtyNavItems: SpecialtyNavItem[] = [
  { title: 'Педиатрия', path: '/pediatrics' },
  { title: 'Вызов врача на дом / Патронаж', path: '/home-visit' },
  { title: 'Медицинские справки', path: '/certificates' },
  { title: 'Неврология', path: '/neurology' },
  { title: 'Невролог-эпилептолог', path: '/epileptology' },
  { title: 'Нутрициолог', path: '/nutrition' },
  { title: 'Гастроэнтеролог', path: '/gastroenterology' },
  { title: 'Пульмонолог', path: '/pulmonology' },
  { title: 'Эндокринолог', path: '/endocrinology' },
  { title: 'Психиатрия и психотерапия', path: '/psychiatry' },
  { title: 'Психолог', path: '/psychology' },
];

export const mainNavItems = [
  { title: 'Главная', path: '/' },
  { title: 'О клинике', path: '/about' },
  { title: 'Услуги и цены', path: '/prices' },
  { title: 'Контакты', path: '/contacts' },
  { title: 'Документы', path: '/docs' },
];
