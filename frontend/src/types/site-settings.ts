export interface WorkingHours {
  weekdays: string;
  saturday: string;
  sunday: string;
}

export interface SiteSettings {
  address: string;
  phones: string[];
  email: string;
  workingHours: WorkingHours;
}

export const defaultSiteSettings: SiteSettings = {
  address: 'г. Барнаул, ул. 280-летия Барнаула, д. 22',
  phones: ['+7 (913) 365-04-64', '+7 (385) 225-65-75'],
  email: 'medvedevaclinic@yandex.ru',
  workingHours: {
    weekdays: 'Пн-Пт: 09:00 - 19:00',
    saturday: 'Сб: 9:00 - 16:00',
    sunday: 'Вс: 9:00 - 16:00',
  },
};
