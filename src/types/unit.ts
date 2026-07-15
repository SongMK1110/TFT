import type { BoardPosition } from './board';
import type { Item } from './item';

export const MAX_UNIT_STAR_LEVEL = 3;
export const MAX_ITEMS_PER_UNIT = 3;
export const UNITS_REQUIRED_FOR_STAR_UPGRADE = 3;
export const UNIT_SELL_STAR_MULTIPLIERS = {
  1: 1,
  2: 3,
  3: 9,
} as const satisfies Record<UnitStarLevel, number>;
export const STAR_LEVEL_STAT_MULTIPLIERS = {
  1: {
    maxHp: 1,
    attackDamage: 1,
  },
  2: {
    maxHp: 1.75,
    attackDamage: 1.75,
  },
  3: {
    maxHp: 3,
    attackDamage: 3,
  },
} as const satisfies Record<UnitStarLevel, Pick<UnitStats, 'maxHp' | 'attackDamage'>>;

export type UnitTier = 'common' | 'rare' | 'epic' | 'legendary';

export type UnitOrigin = 'flame' | 'frost' | 'shadow' | 'ironwood' | 'storm' | 'celestial';

export type UnitClass = 'guardian' | 'ranger' | 'mage' | 'duelist' | 'mystic' | 'bruiser';

export type SkillTargetType = 'self' | 'singleEnemy' | 'areaEnemy' | 'allAllies' | 'lowestHpAlly';

export type SkillEffectType =
  | 'damage'
  | 'areaDamage'
  | 'shield'
  | 'heal'
  | 'attackDamageBuff'
  | 'attackSpeedBuff'
  | 'stun';

export type SkillEffect = {
  type: SkillEffectType;
  value: number;
  durationMs?: number;
  radius?: number;
};

export type Skill = {
  id: string;
  name: string;
  description: string;
  targetType: SkillTargetType;
  manaCost: number;
  effects: SkillEffect[];
};

export type UnitStats = {
  maxHp: number;
  attackDamage: number;
  attackSpeed: number;
  attackRange: number;
  armor: number;
  mana: number;
  maxMana: number;
};

export type Unit = UnitStats & {
  id: string;
  name: string;
  cost: number;
  tier: UnitTier;
  origin: UnitOrigin;
  class: UnitClass;
  skillId: Skill['id'];
  skill: Skill;
};

export type UnitStarLevel = 1 | 2 | 3;

export type PlayerUnit = Unit & {
  instanceId: string;
  unitId: Unit['id'];
  currentHp: number;
  currentMana: number;
  starLevel: UnitStarLevel;
  items: Item[];
  position?: BoardPosition;
};

export type UnitDataSet = {
  version: string;
  units: Unit[];
};
