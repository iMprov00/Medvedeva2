export interface FeatureCardItem {
  title: string;
  text: string;
  bullets?: string[];
  iconUrl?: string;
}

export type Masonry4Layout = 'tallCenter' | 'compact';

export interface Masonry4Slots {
  topLeft: FeatureCardItem;
  bottomLeft: FeatureCardItem;
  center: FeatureCardItem;
  topRight: FeatureCardItem;
  layout: Masonry4Layout;
}

type MasonrySlotName = 'topLeft' | 'bottomLeft' | 'center' | 'topRight';

function cardContentWeight(card: FeatureCardItem): number {
  const bulletsText = card.bullets?.reduce((sum, item) => sum + item.length, 0) ?? 0;
  const bulletsBonus = (card.bullets?.length ?? 0) * 80;
  return card.text.length + bulletsText + bulletsBonus;
}

export function buildMasonry4Slots(cards: FeatureCardItem[]): Masonry4Slots {
  const slotByIndex: MasonrySlotName[] = ['topLeft', 'bottomLeft', 'center', 'topRight'];
  const tallestIndex = cards.reduce(
    (bestIndex, card, index, list) =>
      cardContentWeight(card) > cardContentWeight(list[bestIndex]) ? index : bestIndex,
    0,
  );

  if (tallestIndex !== 2) {
    const centerSlot = slotByIndex[2];
    slotByIndex[2] = slotByIndex[tallestIndex];
    slotByIndex[tallestIndex] = centerSlot;
  }

  const slots = {} as Record<MasonrySlotName, FeatureCardItem>;
  cards.forEach((card, index) => {
    slots[slotByIndex[index]] = card;
  });

  const center = slots.center;
  const otherWeights = cards
    .filter((_, index) => slotByIndex[index] !== 'center')
    .map(cardContentWeight);
  const avgOther = otherWeights.reduce((sum, weight) => sum + weight, 0) / otherWeights.length;
  const layout: Masonry4Layout =
    (center.bullets?.length ?? 0) > 0 || cardContentWeight(center) > avgOther * 1.2
      ? 'tallCenter'
      : 'compact';

  return {
    topLeft: slots.topLeft,
    bottomLeft: slots.bottomLeft,
    center,
    topRight: slots.topRight,
    layout,
  };
}

export { DEFAULT_FEATURE_DECOR, DEFAULT_FEATURE_ICON, iconForCardTitle, withCardIcons } from '../../content/tildaIcons';
