export type ItemStatBonus = {
  attackDamage?: number;
  maxHp?: number;
  attackSpeed?: number;
  armor?: number;
  skillPower?: number;
  maxManaReduction?: number;
  startingMana?: number;
};

export type ItemEffectType =
  | 'attackDamageFlat'
  | 'maxHpFlat'
  | 'attackSpeedFlat'
  | 'armorFlat'
  | 'skillPowerPercent'
  | 'maxManaReduction'
  | 'startingManaFlat'
  | 'nearbyEnemyAttackSpeedReduction'
  | 'bonusDamageAgainstHighHp';

export type ItemEffect = {
  type: ItemEffectType;
  value: number;
  radius?: number;
  targetMaxHpThreshold?: number;
};

export type Item = {
  id: string;
  name: string;
  description: string;
  statBonus: ItemStatBonus;
  effects: ItemEffect[];
  recipe?: [Item['id'], Item['id']];
};

export type ItemChoiceReason = 'starter' | 'roundReward';

export type PendingItemChoice = {
  reason: ItemChoiceReason;
  itemIds: Item['id'][];
};

export type ItemDataSet = {
  version: string;
  items: Item[];
};
