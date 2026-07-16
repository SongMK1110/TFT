import { MAX_ITEMS_PER_UNIT, type PlayerUnit } from '../../../types/unit';
import type { BenchUnitSlot, BoardUnit, ShopActionResult } from '../../../types/game';
import type { CombatUnit } from '../../../types/combat';
import type { Item } from '../../../types/item';

export type EquipItemInput = {
  itemId: Item['id'];
  unitInstanceId: PlayerUnit['instanceId'];
  playerItems: Item['id'][];
  benchUnits: BenchUnitSlot[];
  boardUnits: BoardUnit[];
  itemPool: Item[];
};

export type UnequipItemInput = {
  unitInstanceId: PlayerUnit['instanceId'];
  itemIndex: number;
  playerItems: Item['id'][];
  benchUnits: BenchUnitSlot[];
  boardUnits: BoardUnit[];
};

export type ItemActionOutput = ShopActionResult & {
  playerItems: Item['id'][];
  benchUnits: BenchUnitSlot[];
  boardUnits: BoardUnit[];
};

export type ItemAdjustedUnitStats = Pick<
  PlayerUnit,
  'maxHp' | 'attackDamage' | 'attackSpeed' | 'armor' | 'attackRange' | 'maxMana' | 'currentMana'
> & {
  skillPowerMultiplier: number;
};

export function equipItem(input: EquipItemInput): ItemActionOutput {
  const inventoryIndex = input.playerItems.findIndex((itemId) => itemId === input.itemId);
  const item = input.itemPool.find((candidate) => candidate.id === input.itemId);
  const unit = findPlayerUnit(input.unitInstanceId, input.benchUnits, input.boardUnits);

  if (inventoryIndex < 0 || !item) {
    return unchangedResult('보유한 아이템을 찾을 수 없습니다.', input);
  }

  if (!unit) {
    return unchangedResult('아이템을 장착할 유닛을 찾을 수 없습니다.', input);
  }

  const recipeMatch = findItemRecipe(input.itemPool, unit.items, item.id);

  if (unit.items.length >= MAX_ITEMS_PER_UNIT && !recipeMatch) {
    return unchangedResult('유닛은 아이템을 최대 3개까지 장착할 수 있습니다.', input);
  }

  const playerItems = input.playerItems.filter((_, index) => index !== inventoryIndex);
  const nextItems = recipeMatch
    ? unit.items.map((equippedItem, index) => (index === recipeMatch.equippedItemIndex ? cloneItem(recipeMatch.completedItem) : equippedItem))
    : [...unit.items, cloneItem(item)];
  const nextBenchUnits = updateBenchUnit(input.benchUnits, input.unitInstanceId, (target) => ({
    ...target,
    items: nextItems,
  }));
  const nextBoardUnits = updateBoardUnit(input.boardUnits, input.unitInstanceId, (target) => ({
    ...target,
    items: nextItems,
  }));

  return {
    success: true,
    message: recipeMatch ? `${recipeMatch.completedItem.name} 조합 완료` : `${item.name} 장착 완료`,
    playerItems,
    benchUnits: nextBenchUnits,
    boardUnits: nextBoardUnits,
  };
}

export function findItemRecipe(
  itemPool: Item[],
  equippedItems: Item[],
  incomingItemId: Item['id'],
): { completedItem: Item; equippedItemIndex: number } | undefined {
  for (let equippedItemIndex = 0; equippedItemIndex < equippedItems.length; equippedItemIndex += 1) {
    const equippedItem = equippedItems[equippedItemIndex];
    const completedItem = itemPool.find((candidate) => {
      if (!candidate.recipe) {
        return false;
      }

      const [firstComponentId, secondComponentId] = candidate.recipe;

      return (
        (firstComponentId === incomingItemId && secondComponentId === equippedItem.id) ||
        (secondComponentId === incomingItemId && firstComponentId === equippedItem.id)
      );
    });

    if (completedItem) {
      return { completedItem, equippedItemIndex };
    }
  }

  return undefined;
}

export function unequipItem(input: UnequipItemInput): ItemActionOutput {
  const unit = findPlayerUnit(input.unitInstanceId, input.benchUnits, input.boardUnits);
  const item = unit?.items[input.itemIndex];

  if (!unit || !item) {
    return unchangedResult('해제할 아이템을 찾을 수 없습니다.', input);
  }

  const nextBenchUnits = updateBenchUnit(input.benchUnits, input.unitInstanceId, (target) => ({
    ...target,
    items: target.items.filter((_, index) => index !== input.itemIndex),
  }));
  const nextBoardUnits = updateBoardUnit(input.boardUnits, input.unitInstanceId, (target) => ({
    ...target,
    items: target.items.filter((_, index) => index !== input.itemIndex),
  }));

  return {
    success: true,
    message: `${item.name} 해제 완료`,
    playerItems: [...input.playerItems, item.id],
    benchUnits: nextBenchUnits,
    boardUnits: nextBoardUnits,
  };
}

export function applyItemEffects(combatUnits: CombatUnit[]): CombatUnit[] {
  return combatUnits.map((unit) => {
    if (unit.items.length === 0) {
      return cloneCombatUnit(unit);
    }

    return unit.items.reduce(applyItemToCombatUnit, cloneCombatUnit(unit));
  });
}

export function getItemAdjustedUnitStats(unit: PlayerUnit): ItemAdjustedUnitStats {
  const baseStats: ItemAdjustedUnitStats = {
    maxHp: unit.maxHp,
    attackDamage: unit.attackDamage,
    attackSpeed: unit.attackSpeed,
    armor: unit.armor,
    attackRange: unit.attackRange,
    maxMana: unit.maxMana,
    currentMana: unit.currentMana,
    skillPowerMultiplier: 1,
  };

  return unit.items.reduce(applyItemToDisplayStats, baseStats);
}

function applyItemToCombatUnit(unit: CombatUnit, item: Item): CombatUnit {
  return item.effects.reduce((nextUnit, effect) => {
    switch (effect.type) {
      case 'attackDamageFlat':
        return { ...nextUnit, attackDamage: nextUnit.attackDamage + effect.value };
      case 'maxHpFlat': {
        const maxHp = nextUnit.maxHp + effect.value;

        return { ...nextUnit, maxHp, currentHp: nextUnit.currentHp + effect.value };
      }
      case 'attackSpeedFlat':
        return { ...nextUnit, attackSpeed: roundStat(nextUnit.attackSpeed + effect.value) };
      case 'armorFlat':
        return { ...nextUnit, armor: nextUnit.armor + effect.value };
      case 'skillPowerPercent':
        return { ...nextUnit, skillPowerMultiplier: roundStat(nextUnit.skillPowerMultiplier + effect.value / 100) };
      case 'maxManaReduction': {
        const maxMana = Math.max(0, nextUnit.maxMana - effect.value);

        return {
          ...nextUnit,
          maxMana,
          currentMana: Math.min(nextUnit.currentMana, maxMana),
          skill: {
            ...nextUnit.skill,
            manaCost: Math.max(0, nextUnit.skill.manaCost - effect.value),
          },
        };
      }
      case 'startingManaFlat':
        return {
          ...nextUnit,
          currentMana: Math.min(nextUnit.maxMana, nextUnit.currentMana + effect.value),
        };
      default:
        return nextUnit;
    }
  }, unit);
}

function applyItemToDisplayStats(stats: ItemAdjustedUnitStats, item: Item): ItemAdjustedUnitStats {
  return item.effects.reduce((nextStats, effect) => {
    switch (effect.type) {
      case 'attackDamageFlat':
        return { ...nextStats, attackDamage: nextStats.attackDamage + effect.value };
      case 'maxHpFlat':
        return { ...nextStats, maxHp: nextStats.maxHp + effect.value };
      case 'attackSpeedFlat':
        return { ...nextStats, attackSpeed: roundStat(nextStats.attackSpeed + effect.value) };
      case 'armorFlat':
        return { ...nextStats, armor: nextStats.armor + effect.value };
      case 'skillPowerPercent':
        return { ...nextStats, skillPowerMultiplier: roundStat(nextStats.skillPowerMultiplier + effect.value / 100) };
      case 'maxManaReduction': {
        const maxMana = Math.max(0, nextStats.maxMana - effect.value);

        return {
          ...nextStats,
          maxMana,
          currentMana: Math.min(nextStats.currentMana, maxMana),
        };
      }
      case 'startingManaFlat':
        return {
          ...nextStats,
          currentMana: Math.min(nextStats.maxMana, nextStats.currentMana + effect.value),
        };
      default:
        return nextStats;
    }
  }, stats);
}

function findPlayerUnit(
  unitInstanceId: PlayerUnit['instanceId'],
  benchUnits: BenchUnitSlot[],
  boardUnits: BoardUnit[],
): PlayerUnit | undefined {
  return boardUnits.find((unit) => unit.instanceId === unitInstanceId) ??
    benchUnits.find((unit) => unit?.instanceId === unitInstanceId);
}

function updateBenchUnit(
  benchUnits: BenchUnitSlot[],
  unitInstanceId: PlayerUnit['instanceId'],
  updateUnit: (unit: PlayerUnit) => PlayerUnit,
): BenchUnitSlot[] {
  return benchUnits.map((unit) => (unit?.instanceId === unitInstanceId ? updateUnit(unit) : unit));
}

function updateBoardUnit(
  boardUnits: BoardUnit[],
  unitInstanceId: PlayerUnit['instanceId'],
  updateUnit: (unit: BoardUnit) => BoardUnit,
): BoardUnit[] {
  return boardUnits.map((unit) => (unit.instanceId === unitInstanceId ? updateUnit(unit) : unit));
}

function unchangedResult(
  message: string,
  input: Pick<ItemActionOutput, 'playerItems' | 'benchUnits' | 'boardUnits'>,
): ItemActionOutput {
  return {
    success: false,
    message,
    playerItems: input.playerItems,
    benchUnits: input.benchUnits,
    boardUnits: input.boardUnits,
  };
}

function cloneItem(item: Item): Item {
  return {
    ...item,
    statBonus: { ...item.statBonus },
    effects: item.effects.map((effect) => ({ ...effect })),
  };
}

function cloneCombatUnit(unit: CombatUnit): CombatUnit {
  return {
    ...unit,
    position: { ...unit.position },
    items: unit.items.map(cloneItem),
    shields: unit.shields.map((shield) => ({ ...shield })),
    statusEffects: unit.statusEffects.map((effect) => ({ ...effect })),
  };
}

function roundStat(value: number): number {
  return Math.round(value * 100) / 100;
}
