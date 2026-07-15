import type { Item, ItemDataSet } from '../types/item';

const BASIC_ATTACK_DAMAGE_BONUS = 10;
const BASIC_MAX_HP_BONUS = 150;
const BASIC_ATTACK_SPEED_BONUS = 0.1;
const BASIC_SKILL_POWER_BONUS = 15;
const BASIC_ARMOR_BONUS = 12;
const BASIC_MAX_MANA_REDUCTION = 10;
const BASIC_STARTING_MANA_BONUS = 15;

export const items: Item[] = [
  {
    id: 'iron-blade',
    name: '강철 검',
    description: '공격력이 증가합니다.',
    statBonus: {
      attackDamage: BASIC_ATTACK_DAMAGE_BONUS,
    },
    effects: [{ type: 'attackDamageFlat', value: BASIC_ATTACK_DAMAGE_BONUS }],
  },
  {
    id: 'giant-belt',
    name: '거인의 허리띠',
    description: '최대 체력이 증가합니다.',
    statBonus: {
      maxHp: BASIC_MAX_HP_BONUS,
    },
    effects: [{ type: 'maxHpFlat', value: BASIC_MAX_HP_BONUS }],
  },
  {
    id: 'swift-bow',
    name: '신속의 활',
    description: '공격 속도가 증가합니다.',
    statBonus: {
      attackSpeed: BASIC_ATTACK_SPEED_BONUS,
    },
    effects: [{ type: 'attackSpeedFlat', value: BASIC_ATTACK_SPEED_BONUS }],
  },
  {
    id: 'mystic-staff',
    name: '신비한 지팡이',
    description: '스킬 피해가 증가합니다.',
    statBonus: {
      skillPower: BASIC_SKILL_POWER_BONUS,
    },
    effects: [{ type: 'skillPowerPercent', value: BASIC_SKILL_POWER_BONUS }],
  },
  {
    id: 'guardian-armor',
    name: '수호자의 갑옷',
    description: '방어력이 증가합니다.',
    statBonus: {
      armor: BASIC_ARMOR_BONUS,
    },
    effects: [{ type: 'armorFlat', value: BASIC_ARMOR_BONUS }],
  },
  {
    id: 'focus-charm',
    name: '집중 부적',
    description: '최대 마나가 감소합니다.',
    statBonus: {
      maxManaReduction: BASIC_MAX_MANA_REDUCTION,
    },
    effects: [{ type: 'maxManaReduction', value: BASIC_MAX_MANA_REDUCTION }],
  },
  {
    id: 'mana-crystal',
    name: '마나 수정',
    description: '전투 시작 마나가 증가합니다.',
    statBonus: {
      startingMana: BASIC_STARTING_MANA_BONUS,
    },
    effects: [{ type: 'startingManaFlat', value: BASIC_STARTING_MANA_BONUS }],
  },
];

export const starterItemIds: Item['id'][] = ['iron-blade', 'giant-belt', 'swift-bow'];

export function getItemById(itemId: Item['id']): Item | undefined {
  return items.find((item) => item.id === itemId);
}

export const itemDataSet: ItemDataSet = {
  version: 'phase-19-balance',
  items,
};
