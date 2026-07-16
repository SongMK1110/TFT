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
  {
    id: 'flame-rapidblade',
    name: '화염 연사검',
    description: '공격력과 공격 속도가 증가합니다.',
    statBonus: { attackDamage: 15, attackSpeed: 0.15 },
    effects: [
      { type: 'attackDamageFlat', value: 15 },
      { type: 'attackSpeedFlat', value: 0.15 },
    ],
    recipe: ['iron-blade', 'swift-bow'],
  },
  {
    id: 'runeblade',
    name: '룬검',
    description: '공격력과 스킬 위력이 증가합니다.',
    statBonus: { attackDamage: 15, skillPower: 20 },
    effects: [
      { type: 'attackDamageFlat', value: 15 },
      { type: 'skillPowerPercent', value: 20 },
    ],
    recipe: ['iron-blade', 'mystic-staff'],
  },
  {
    id: 'mana-blade',
    name: '마력의 검',
    description: '공격력과 시작 마나가 증가합니다.',
    statBonus: { attackDamage: 15, startingMana: 25 },
    effects: [
      { type: 'attackDamageFlat', value: 15 },
      { type: 'startingManaFlat', value: 25 },
    ],
    recipe: ['iron-blade', 'mana-crystal'],
  },
  {
    id: 'warmog-heart',
    name: '워모그의 심장',
    description: '최대 체력이 크게 증가합니다.',
    statBonus: { maxHp: 400 },
    effects: [{ type: 'maxHpFlat', value: 400 }],
    recipe: ['giant-belt', 'giant-belt'],
  },
  {
    id: 'giant-plate',
    name: '거인의 판금갑',
    description: '최대 체력과 방어력이 크게 증가합니다.',
    statBonus: { maxHp: 250, armor: 20 },
    effects: [
      { type: 'maxHpFlat', value: 250 },
      { type: 'armorFlat', value: 20 },
    ],
    recipe: ['giant-belt', 'guardian-armor'],
  },
  {
    id: 'spirit-cape',
    name: '정령의 망토',
    description: '최대 체력이 증가하고 최대 마나가 감소합니다.',
    statBonus: { maxHp: 200, maxManaReduction: 15 },
    effects: [
      { type: 'maxHpFlat', value: 200 },
      { type: 'maxManaReduction', value: 15 },
    ],
    recipe: ['giant-belt', 'focus-charm'],
  },
  {
    id: 'vitality-crystal',
    name: '활력의 수정',
    description: '최대 체력과 시작 마나가 증가합니다.',
    statBonus: { maxHp: 200, startingMana: 25 },
    effects: [
      { type: 'maxHpFlat', value: 200 },
      { type: 'startingManaFlat', value: 25 },
    ],
    recipe: ['giant-belt', 'mana-crystal'],
  },
  {
    id: 'azure-repeater',
    name: '푸른 연사궁',
    description: '공격 속도가 증가하고 최대 마나가 감소합니다.',
    statBonus: { attackSpeed: 0.2, maxManaReduction: 15 },
    effects: [
      { type: 'attackSpeedFlat', value: 0.2 },
      { type: 'maxManaReduction', value: 15 },
    ],
    recipe: ['swift-bow', 'focus-charm'],
  },
  {
    id: 'ranger-bow',
    name: '정찰대의 활',
    description: '공격 속도와 시작 마나가 증가합니다.',
    statBonus: { attackSpeed: 0.15, startingMana: 25 },
    effects: [
      { type: 'attackSpeedFlat', value: 0.15 },
      { type: 'startingManaFlat', value: 25 },
    ],
    recipe: ['swift-bow', 'mana-crystal'],
  },
  {
    id: 'archmage-hat',
    name: '대마도사의 모자',
    description: '스킬 위력이 크게 증가합니다.',
    statBonus: { skillPower: 45 },
    effects: [{ type: 'skillPowerPercent', value: 45 }],
    recipe: ['mystic-staff', 'mystic-staff'],
  },
  {
    id: 'blue-essence',
    name: '푸른 정수',
    description: '스킬 위력이 증가하고 최대 마나가 크게 감소합니다.',
    statBonus: { skillPower: 25, maxManaReduction: 20 },
    effects: [
      { type: 'skillPowerPercent', value: 25 },
      { type: 'maxManaReduction', value: 20 },
    ],
    recipe: ['mystic-staff', 'focus-charm'],
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
