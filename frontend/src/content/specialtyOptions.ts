import { directions } from './directions';

export interface SpecialtyOption {
  slug: string;
  title: string;
}

export const specialtyOptions: SpecialtyOption[] = directions.map((item) => ({
  slug: item.path.replace(/^\//, ''),
  title: item.title,
}));
