import type { SynergyDataSet, SynergyDefinition } from '../types/game';

const LOW_TIER_REQUIRED_UNITS = 2;
const HIGH_TIER_REQUIRED_UNITS = 4;

export const synergies: SynergyDefinition[] = [
  {
    id: 'flame',
    name: '화염',
    source: 'flame',
    sourceType: 'origin',
    tiers: [
      {
        requiredUnitCount: LOW_TIER_REQUIRED_UNITS,
        effectType: 'attackDamagePercent',
        targetScope: 'allAllies',
        value: 8,
        description: '모든 아군의 공격력이 증가합니다.',
      },
      {
        requiredUnitCount: HIGH_TIER_REQUIRED_UNITS,
        effectType: 'attackDamagePercent',
        targetScope: 'allAllies',
        value: 18,
        description: '모든 아군의 공격력이 크게 증가합니다.',
      },
    ],
  },
  {
    id: 'frost',
    name: '서리',
    source: 'frost',
    sourceType: 'origin',
    tiers: [
      {
        requiredUnitCount: LOW_TIER_REQUIRED_UNITS,
        effectType: 'enemyAttackSpeedReduction',
        targetScope: 'enemies',
        value: 8,
        description: '적의 공격 속도가 감소합니다.',
      },
      {
        requiredUnitCount: HIGH_TIER_REQUIRED_UNITS,
        effectType: 'enemyAttackSpeedReduction',
        targetScope: 'enemies',
        value: 18,
        description: '적의 공격 속도가 크게 감소합니다.',
      },
    ],
  },
  {
    id: 'shadow',
    name: '그림자',
    source: 'shadow',
    sourceType: 'origin',
    tiers: [
      {
        requiredUnitCount: LOW_TIER_REQUIRED_UNITS,
        effectType: 'critChancePercent',
        targetScope: 'allAllies',
        value: 8,
        description: '아군의 치명타 확률이 증가합니다.',
      },
      {
        requiredUnitCount: HIGH_TIER_REQUIRED_UNITS,
        effectType: 'critChancePercent',
        targetScope: 'allAllies',
        value: 20,
        description: '아군의 치명타 확률이 크게 증가합니다.',
      },
    ],
  },
  {
    id: 'guardian',
    name: '수호자',
    source: 'guardian',
    sourceType: 'class',
    tiers: [
      {
        requiredUnitCount: LOW_TIER_REQUIRED_UNITS,
        effectType: 'armorFlat',
        targetScope: 'allAllies',
        value: 12,
        description: '모든 아군의 방어력이 증가합니다.',
      },
      {
        requiredUnitCount: HIGH_TIER_REQUIRED_UNITS,
        effectType: 'shieldFlat',
        targetScope: 'allAllies',
        value: 120,
        description: '모든 아군이 보호막을 가진 채 전투를 시작합니다.',
      },
    ],
  },
  {
    id: 'ironwood',
    name: '강철숲',
    source: 'ironwood',
    sourceType: 'origin',
    tiers: [
      {
        requiredUnitCount: LOW_TIER_REQUIRED_UNITS,
        effectType: 'armorFlat',
        targetScope: 'allAllies',
        value: 10,
        description: '모든 아군의 방어력이 증가합니다.',
      },
      {
        requiredUnitCount: HIGH_TIER_REQUIRED_UNITS,
        effectType: 'armorFlat',
        targetScope: 'allAllies',
        value: 22,
        description: '모든 아군의 방어력이 크게 증가합니다.',
      },
    ],
  },
  {
    id: 'storm',
    name: '폭풍',
    source: 'storm',
    sourceType: 'origin',
    tiers: [
      {
        requiredUnitCount: LOW_TIER_REQUIRED_UNITS,
        effectType: 'attackSpeedPercent',
        targetScope: 'allAllies',
        value: 8,
        description: '모든 아군의 공격 속도가 증가합니다.',
      },
      {
        requiredUnitCount: HIGH_TIER_REQUIRED_UNITS,
        effectType: 'attackSpeedPercent',
        targetScope: 'allAllies',
        value: 18,
        description: '모든 아군의 공격 속도가 크게 증가합니다.',
      },
    ],
  },
  {
    id: 'celestial',
    name: '천상',
    source: 'celestial',
    sourceType: 'origin',
    tiers: [
      {
        requiredUnitCount: LOW_TIER_REQUIRED_UNITS,
        effectType: 'shieldFlat',
        targetScope: 'allAllies',
        value: 70,
        description: '모든 아군이 작은 보호막을 가진 채 전투를 시작합니다.',
      },
      {
        requiredUnitCount: HIGH_TIER_REQUIRED_UNITS,
        effectType: 'shieldFlat',
        targetScope: 'allAllies',
        value: 160,
        description: '모든 아군이 강력한 보호막을 가진 채 전투를 시작합니다.',
      },
    ],
  },
  {
    id: 'duelist',
    name: '결투가',
    source: 'duelist',
    sourceType: 'class',
    tiers: [
      {
        requiredUnitCount: LOW_TIER_REQUIRED_UNITS,
        effectType: 'attackDamagePercent',
        targetScope: 'matchingAllies',
        value: 12,
        description: '결투가의 공격력이 증가합니다.',
      },
      {
        requiredUnitCount: HIGH_TIER_REQUIRED_UNITS,
        effectType: 'attackDamagePercent',
        targetScope: 'matchingAllies',
        value: 24,
        description: '결투가의 공격력이 크게 증가합니다.',
      },
    ],
  },
  {
    id: 'mystic',
    name: '신비술사',
    source: 'mystic',
    sourceType: 'class',
    tiers: [
      {
        requiredUnitCount: LOW_TIER_REQUIRED_UNITS,
        effectType: 'skillPowerPercent',
        targetScope: 'matchingAllies',
        value: 10,
        description: '신비술사의 스킬 위력이 증가합니다.',
      },
      {
        requiredUnitCount: HIGH_TIER_REQUIRED_UNITS,
        effectType: 'skillPowerPercent',
        targetScope: 'matchingAllies',
        value: 22,
        description: '신비술사의 스킬 위력이 크게 증가합니다.',
      },
    ],
  },
  {
    id: 'bruiser',
    name: '난투가',
    source: 'bruiser',
    sourceType: 'class',
    tiers: [
      {
        requiredUnitCount: LOW_TIER_REQUIRED_UNITS,
        effectType: 'armorFlat',
        targetScope: 'matchingAllies',
        value: 10,
        description: '난투가의 방어력이 증가합니다.',
      },
      {
        requiredUnitCount: HIGH_TIER_REQUIRED_UNITS,
        effectType: 'armorFlat',
        targetScope: 'matchingAllies',
        value: 22,
        description: '난투가의 방어력이 크게 증가합니다.',
      },
    ],
  },
  {
    id: 'ranger',
    name: '사수',
    source: 'ranger',
    sourceType: 'class',
    tiers: [
      {
        requiredUnitCount: LOW_TIER_REQUIRED_UNITS,
        effectType: 'attackSpeedPercent',
        targetScope: 'matchingAllies',
        value: 10,
        description: '사수의 공격 속도가 증가합니다.',
      },
      {
        requiredUnitCount: HIGH_TIER_REQUIRED_UNITS,
        effectType: 'attackSpeedPercent',
        targetScope: 'matchingAllies',
        value: 22,
        description: '사수의 공격 속도가 크게 증가합니다.',
      },
    ],
  },
  {
    id: 'mage',
    name: '마법사',
    source: 'mage',
    sourceType: 'class',
    tiers: [
      {
        requiredUnitCount: LOW_TIER_REQUIRED_UNITS,
        effectType: 'skillPowerPercent',
        targetScope: 'matchingAllies',
        value: 12,
        description: '마법사의 스킬 위력이 증가합니다.',
      },
      {
        requiredUnitCount: HIGH_TIER_REQUIRED_UNITS,
        effectType: 'skillPowerPercent',
        targetScope: 'matchingAllies',
        value: 25,
        description: '마법사의 스킬 위력이 크게 증가합니다.',
      },
    ],
  },
];

export const synergyDataSet: SynergyDataSet = {
  version: 'phase-19-balance',
  synergies,
};
