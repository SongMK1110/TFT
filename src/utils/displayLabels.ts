import type { GamePhase } from '../types/game';
import type { UnitClass, UnitOrigin, UnitTier } from '../types/unit';

export const phaseLabels: Record<GamePhase, string> = {
  prepare: '준비',
  combat: '전투',
  result: '결과',
  reward: '보상',
};

export const originLabels: Record<UnitOrigin, string> = {
  flame: '화염',
  frost: '서리',
  shadow: '그림자',
  ironwood: '강철숲',
  storm: '폭풍',
  celestial: '천상',
};

export const classLabels: Record<UnitClass, string> = {
  guardian: '수호자',
  ranger: '사수',
  mage: '마법사',
  duelist: '결투가',
  mystic: '신비술사',
  bruiser: '전투가',
};

export const tierLabels: Record<UnitTier, string> = {
  common: '일반',
  rare: '희귀',
  epic: '영웅',
  legendary: '전설',
};

export const sourceTypeLabels = {
  origin: '계열',
  class: '직업',
} as const;
