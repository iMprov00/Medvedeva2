export interface StubRoute {
  path: string;
  title: string;
}

export const stubRoutes: StubRoute[] = [];

export const reservedSlugs = new Set([
  'about',
  'prices',
  'doctors',
  'contacts',
  'docs',
  'privacy',
  'admin',
]);
