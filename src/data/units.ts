import type { Skill, Unit, UnitDataSet, UnitStats } from '../types/unit';

const COST_COMMON = 1;
const COST_RARE = 2;
const COST_EPIC = 3;
const COST_LEGENDARY = 5;

const MELEE_RANGE = 1;
const SHORT_RANGE = 2;
const LONG_RANGE = 4;

const LOW_MANA = 55;
const MEDIUM_MANA = 70;
const HIGH_MANA = 90;

const meleeTankStats: UnitStats = {
  maxHp: 700,
  attackDamage: 44,
  attackSpeed: 0.62,
  attackRange: MELEE_RANGE,
  armor: 32,
  mana: 0,
  maxMana: MEDIUM_MANA,
};

const meleeDamageStats: UnitStats = {
  maxHp: 570,
  attackDamage: 58,
  attackSpeed: 0.78,
  attackRange: MELEE_RANGE,
  armor: 24,
  mana: 0,
  maxMana: LOW_MANA,
};

const rangedDamageStats: UnitStats = {
  maxHp: 440,
  attackDamage: 50,
  attackSpeed: 0.78,
  attackRange: LONG_RANGE,
  armor: 18,
  mana: 0,
  maxMana: MEDIUM_MANA,
};

const casterStats: UnitStats = {
  maxHp: 500,
  attackDamage: 38,
  attackSpeed: 0.68,
  attackRange: SHORT_RANGE,
  armor: 16,
  mana: 0,
  maxMana: HIGH_MANA,
};

type UnitDefinition = Omit<Unit, 'skillId'> & {
  skill: Skill;
};

const unitDefinitions: UnitDefinition[] = [
  {
    id: 'ember-guard',
    name: '불씨 수호병',
    cost: COST_COMMON,
    tier: 'common',
    origin: 'flame',
    class: 'guardian',
    ...meleeTankStats,
    skill: {
      id: 'ember-shield',
      name: '불씨 방패',
      description: '자신에게 일시적인 보호막을 부여합니다.',
      targetType: 'self',
      manaCost: MEDIUM_MANA,
      effects: [{ type: 'shield', value: 120, durationMs: 4_000 }],
    },
  },
  {
    id: 'cinder-duelist',
    name: '잿불 결투가',
    cost: COST_COMMON,
    tier: 'common',
    origin: 'flame',
    class: 'duelist',
    ...meleeDamageStats,
    skill: {
      id: 'cinder-strike',
      name: '잿불 일격',
      description: '단일 적에게 추가 물리 피해를 줍니다.',
      targetType: 'singleEnemy',
      manaCost: LOW_MANA,
      effects: [{ type: 'damage', value: 105 }],
    },
  },
  {
    id: 'frost-archer',
    name: '서리 궁수',
    cost: COST_COMMON,
    tier: 'common',
    origin: 'frost',
    class: 'ranger',
    ...rangedDamageStats,
    skill: {
      id: 'chilling-shot',
      name: '냉기 사격',
      description: '적 하나에게 피해를 주고 짧게 기절시킵니다.',
      targetType: 'singleEnemy',
      manaCost: MEDIUM_MANA,
      effects: [
        { type: 'damage', value: 85 },
        { type: 'stun', value: 1, durationMs: 1_000 },
      ],
    },
  },
  {
    id: 'glacier-mage',
    name: '빙하 마법사',
    cost: COST_RARE,
    tier: 'rare',
    origin: 'frost',
    class: 'mage',
    ...casterStats,
    skill: {
      id: 'ice-bloom',
      name: '얼음 개화',
      description: '범위 마법 피해를 줍니다.',
      targetType: 'areaEnemy',
      manaCost: HIGH_MANA,
      effects: [{ type: 'areaDamage', value: 135, radius: 2 }],
    },
  },
  {
    id: 'shade-stalker',
    name: '그늘 추적자',
    cost: COST_RARE,
    tier: 'rare',
    origin: 'shadow',
    class: 'duelist',
    ...meleeDamageStats,
    attackSpeed: 0.86,
    maxMana: 60,
    skill: {
      id: 'shadow-lunge',
      name: '그림자 돌진',
      description: '취약한 적을 가격해 큰 피해를 줍니다.',
      targetType: 'singleEnemy',
      manaCost: LOW_MANA,
      effects: [{ type: 'damage', value: 130 }],
    },
  },
  {
    id: 'night-oracle',
    name: '밤의 예언자',
    cost: COST_RARE,
    tier: 'rare',
    origin: 'shadow',
    class: 'mystic',
    ...casterStats,
    skill: {
      id: 'twilight-mend',
      name: '황혼 치유',
      description: '체력이 가장 낮은 아군을 회복시킵니다.',
      targetType: 'lowestHpAlly',
      manaCost: MEDIUM_MANA,
      effects: [{ type: 'heal', value: 140 }],
    },
  },
  {
    id: 'ironwood-bulwark',
    name: '강철숲 방벽병',
    cost: COST_EPIC,
    tier: 'epic',
    origin: 'ironwood',
    class: 'bruiser',
    ...meleeTankStats,
    maxHp: 860,
    attackDamage: 50,
    armor: 36,
    maxMana: 95,
    skill: {
      id: 'rooted-roar',
      name: '뿌리의 포효',
      description: '자신과 주변 아군에게 보호막을 부여합니다.',
      targetType: 'allAllies',
      manaCost: HIGH_MANA,
      effects: [{ type: 'shield', value: 90, durationMs: 5_000, radius: 2 }],
    },
  },
  {
    id: 'grove-mystic',
    name: '숲의 신비술사',
    cost: COST_EPIC,
    tier: 'epic',
    origin: 'ironwood',
    class: 'mystic',
    ...casterStats,
    maxHp: 540,
    attackDamage: 40,
    skill: {
      id: 'verdant-pulse',
      name: '초록 파동',
      description: '모든 아군을 회복시킵니다.',
      targetType: 'allAllies',
      manaCost: HIGH_MANA,
      effects: [{ type: 'heal', value: 80 }],
    },
  },
  {
    id: 'storm-ranger',
    name: '폭풍 사수',
    cost: COST_EPIC,
    tier: 'epic',
    origin: 'storm',
    class: 'ranger',
    ...rangedDamageStats,
    maxHp: 520,
    attackDamage: 60,
    attackSpeed: 0.9,
    maxMana: 70,
    skill: {
      id: 'rapid-gale',
      name: '질풍',
      description: '일시적으로 공격 속도를 증가시킵니다.',
      targetType: 'self',
      manaCost: MEDIUM_MANA,
      effects: [{ type: 'attackSpeedBuff', value: 35, durationMs: 4_000 }],
    },
  },
  {
    id: 'thunder-bruiser',
    name: '천둥 난투가',
    cost: COST_EPIC,
    tier: 'epic',
    origin: 'storm',
    class: 'bruiser',
    ...meleeTankStats,
    maxHp: 850,
    attackDamage: 55,
    armor: 36,
    maxMana: 70,
    skill: {
      id: 'thunder-clap',
      name: '천둥 박수',
      description: '대상 주변에 범위 피해를 줍니다.',
      targetType: 'areaEnemy',
      manaCost: MEDIUM_MANA,
      effects: [{ type: 'areaDamage', value: 110, radius: 1 }],
    },
  },
  {
    id: 'celestial-sage',
    name: '천상 현자',
    cost: COST_LEGENDARY,
    tier: 'legendary',
    origin: 'celestial',
    class: 'mage',
    ...casterStats,
    maxHp: 620,
    attackDamage: 52,
    maxMana: HIGH_MANA,
    skill: {
      id: 'starfall',
      name: '별똥별',
      description: '강력한 범위 마법 피해를 내립니다.',
      targetType: 'areaEnemy',
      manaCost: HIGH_MANA,
      effects: [{ type: 'areaDamage', value: 210, radius: 2 }],
    },
  },
  {
    id: 'dawn-warden',
    name: '새벽 파수꾼',
    cost: COST_LEGENDARY,
    tier: 'legendary',
    origin: 'celestial',
    class: 'guardian',
    ...meleeTankStats,
    maxHp: 1_020,
    attackDamage: 54,
    armor: 42,
    maxMana: HIGH_MANA,
    skill: {
      id: 'radiant-aegis',
      name: '찬란한 방벽',
      description: '모든 아군에게 강력한 보호막을 부여합니다.',
      targetType: 'allAllies',
      manaCost: HIGH_MANA,
      effects: [{ type: 'shield', value: 180, durationMs: 5_000 }],
    },
  },
];

export const units: Unit[] = unitDefinitions.map((unit) => ({
  ...unit,
  skillId: unit.skill.id,
}));

export const unitDataSet: UnitDataSet = {
  version: 'phase-19-balance',
  units,
};

export function getUnitById(unitId: Unit['id']): Unit | undefined {
  return units.find((unit) => unit.id === unitId);
}
