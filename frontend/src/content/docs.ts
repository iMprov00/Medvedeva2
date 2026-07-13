export interface DocumentItem {
  title: string;
  description?: string;
  fileUrl: string;
  downloadName: string;
}

export const docsHero = {
  title: 'Документы',
  subtitle: 'Лицензии, сертификаты и разрешительная документация клиники',
};

export const documents: DocumentItem[] = [
  {
    title: 'Лицензия на медицинскую деятельность',
    description: 'Разрешение на осуществление медицинской деятельности',
    fileUrl: '/images/docs/lic.pdf',
    downloadName: 'Лицензия_клиники_Медведевой.pdf',
  },
  {
    title: 'Свидетельство о регистрации',
    description: 'Документ о государственной регистрации юридического лица',
    fileUrl: '/images/docs/reg.webp',
    downloadName: 'Свидетельство_о_регистрации.webp',
  },
  {
    title: 'Прайс-лист',
    description: 'Актуальный перечень услуг и цен',
    fileUrl: '/images/docs/price.pdf',
    downloadName: 'Прайс-лист_клиники_Медведевой.pdf',
  },
  {
    title: 'Доверенность',
    fileUrl: '/images/docs/dover.pdf',
    downloadName: 'Доверенность.pdf',
  },
];

export const docsNote = {
  title: 'Нужна справка для налогового вычета?',
  text: 'Информацию о получении справки об оплате медицинских услуг смотрите на странице «Услуги и цены».',
};
