const MED = '/images/Tilda_Icons_20_Medicine';
const KED = '/images/Tilda_Icons_17_Kids_Education';

export const tildaIcons = {
  diagnostics: `${MED}/Tilda_Icons_20med_diagnostics.svg`,
  consultation: `${MED}/Tilda_Icons_20med_consultation.svg`,
  doctor: `${MED}/Tilda_Icons_20med_doctor.svg`,
  documents: `${MED}/Tilda_Icons_20med_documents.svg`,
  house: `${MED}/Tilda_Icons_20med_house.svg`,
  ambulance: `${MED}/Tilda_Icons_20med_ambulance.svg`,
  hospital: `${MED}/Tilda_Icons_20med_hospital.svg`,
  kids: `${MED}/Tilda_Icons_20med_kids.svg`,
  equipment: `${MED}/Tilda_Icons_20med_equipment.svg`,
  lab: `${MED}/Tilda_Icons_20med_lab.svg`,
  vaccination: `${MED}/Tilda_Icons_20med_vaccination.svg`,
  pregnancy: `${MED}/Tilda_Icons_20med_pregnancy.svg`,
  heart: `${MED}/free-icon-heart-3269472.png`,
  healthCheck: `${MED}/free-icon-health-check-4773146.png`,
  diagnosis: `${MED}/free-icon-diagnosis-4320476.png`,

  kid: `${KED}/Tilda_Icons_17ked_kid.svg`,
  medicine: `${KED}/Tilda_Icons_17ked_medicine.svg`,
  care: `${KED}/Tilda_Icons_17ked_care.svg`,
  psychology: `${KED}/Tilda_Icons_17ked_psychology.svg`,
  speech: `${KED}/Tilda_Icons_17ked_speech.svg`,
  food: `${KED}/Tilda_Icons_17ked_food.svg`,
  test: `${KED}/Tilda_Icons_17ked_test.svg`,
  diploma: `${KED}/Tilda_Icons_17ked_diplona.svg`,
  pool: `${KED}/Tilda_Icons_17ked_pool.svg`,
  tent: `${KED}/Tilda_Icons_17ked_tent.svg`,
  calendar: `${KED}/Tilda_Icons_17ked_calendar.svg`,
  bulb: `${KED}/Tilda_Icons_17ked_bulb.svg`,
  puzzle: `${KED}/Tilda_Icons_17ked_puzzle.svg`,
  bubbles: `${KED}/Tilda_Icons_17ked_bubbles.svg`,
  openDoors: `${KED}/Tilda_Icons_17ked_opendoors.svg`,
  computer: `${KED}/Tilda_Icons_17ked_computer.svg`,
  purse: `${KED}/Tilda_Icons_17ked_purse.svg`,
  hat: `${KED}/Tilda_Icons_17ked_hat.svg`,
} as const;

export const DEFAULT_FEATURE_ICON = tildaIcons.consultation;
export const DEFAULT_FEATURE_DECOR = '/images/plus.jpg';

export function iconForCardTitle(title: string): string {
  const t = title.toLowerCase();

  if (/необходим|назначен/.test(t)) return tildaIcons.diagnostics;
  if (/понятно|говорим/.test(t)) return tildaIcons.bulb;
  if (/международн|стандарт|доказанн/.test(t)) return tildaIcons.healthCheck;
  if (/честн/.test(t)) return tildaIcons.heart;
  if (/безопасн.*пространств/.test(t)) return tildaIcons.psychology;
  if (/навязыван/.test(t)) return tildaIcons.openDoors;
  if (/индивидуальн|узк/.test(t)) return tildaIcons.puzzle;
  if (/спирометр/.test(t)) return tildaIcons.equipment;
  if (/детьми и взрослыми|работаем с детьми/.test(t)) return tildaIcons.kids;
  if (/лагерь|079/.test(t)) return tildaIcons.tent;
  if (/школ|сад|026/.test(t)) return tildaIcons.hat;
  if (/бассейн/.test(t)) return tildaIcons.pool;
  if (/санатор|076/.test(t)) return tildaIcons.hospital;
  if (/095|состояни/.test(t)) return tildaIcons.documents;
  if (/прививочн/.test(t)) return tildaIcons.vaccination;
  if (/справк|документ|готовый/.test(t)) return tildaIcons.documents;
  if (/онлайн|записываетесь/.test(t)) return tildaIcons.computer;
  if (/осмотр по|полноценный осмотр/.test(t)) return tildaIcons.healthCheck;
  if (/патронаж|новорожд|спокойств|консультация для родителей/.test(t)) return tildaIcons.care;
  if (/когда приходить|приедет/.test(t)) return tildaIcons.calendar;
  if (/вызов|на дом|домой/.test(t)) return tildaIcons.house;
  if (/питан|нутриц|прикорм/.test(t)) return tildaIcons.food;
  if (/психол|психотерап/.test(t)) return tildaIcons.psychology;
  if (/доказательн/.test(t)) return tildaIcons.healthCheck;
  if (/врач|опытн/.test(t)) return tildaIcons.doctor;
  if (/лекарств|медикамент/.test(t)) return tildaIcons.medicine;
  if (/страх|стресс|без страха/.test(t)) return tildaIcons.bubbles;
  if (/цен|оплат|честные цены/.test(t)) return tildaIcons.purse;
  if (/время для вас|честность и время/.test(t)) return tildaIcons.calendar;
  if (/качеств|услуг/.test(t)) return tildaIcons.healthCheck;
  if (/командн|родител/.test(t)) return tildaIcons.care;
  if (/педиатр/.test(t)) return tildaIcons.kid;
  if (/назначения строго/.test(t)) return tildaIcons.diagnostics;
  if (/амбулатор|скорую/.test(t)) return tildaIcons.ambulance;

  return DEFAULT_FEATURE_ICON;
}

export function withCardIcons<T extends { title: string; iconUrl?: string }>(cards: T[]): T[] {
  return cards.map((card) => ({
    ...card,
    iconUrl: card.iconUrl ?? iconForCardTitle(card.title),
  }));
}
