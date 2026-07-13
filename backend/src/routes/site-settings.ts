import type { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { siteSettings } from '../db/schema.js';

export interface SiteSettingsResponse {
  address: string;
  phones: string[];
  email: string;
  workingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
}

const defaults: SiteSettingsResponse = {
  address: 'г. Барнаул, ул. 280-летия Барнаула, д. 22',
  phones: ['+7 (913) 365-04-64', '+7 (385) 225-65-75'],
  email: 'medvedevaclinic@yandex.ru',
  workingHours: {
    weekdays: 'Пн-Пт: 09:00 - 19:00',
    saturday: 'Сб: 9:00 - 16:00',
    sunday: 'Вс: 9:00 - 16:00',
  },
};

function parseSettings(rows: { key: string; value: string }[]): SiteSettingsResponse {
  const result = { ...defaults };

  for (const row of rows) {
    try {
      const parsed = JSON.parse(row.value);
      if (row.key in result) {
        (result as Record<string, unknown>)[row.key] = parsed;
      }
    } catch {
      // skip invalid JSON
    }
  }

  return result;
}

export async function siteSettingsRoutes(app: FastifyInstance) {
  app.get('/api/site-settings', async () => {
    const rows = db.select().from(siteSettings).all();
    return parseSettings(rows);
  });
}
