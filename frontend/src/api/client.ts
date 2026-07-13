import type { SiteSettings } from '../types/site-settings';
import { defaultSiteSettings } from '../types/site-settings';

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const response = await fetch('/api/site-settings');
    if (!response.ok) {
      return defaultSiteSettings;
    }
    return (await response.json()) as SiteSettings;
  } catch {
    return defaultSiteSettings;
  }
}

export function phoneToTel(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
