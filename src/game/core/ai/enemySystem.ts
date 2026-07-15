import type { Item } from '../../../types/item';
import type { BoardUnit, EnemyEncounter, SynergyDefinition } from '../../../types/game';
import {
  STAR_LEVEL_STAT_MULTIPLIERS,
  type Unit,
  type UnitStarLevel,
} from '../../../types/unit';
import { calculateSynergyStates, getActiveSynergies } from '../synergy/synergySystem';

const REPEATED_FINAL_ROUND_STAT_GROWTH = 0.08;
const MAX_ENEMY_ITEM_COUNT = 3;

export type EnemyArmy = {
  encounter: EnemyEncounter;
  units: BoardUnit[];
  activeSynergies: ReturnType<typeof getActiveSynergies>;
};

export type CreateEnemyArmyInput = {
  currentRound: number;
  encounters: EnemyEncounter[];
  unitPool: Unit[];
  itemPool: Item[];
  synergyDefinitions: SynergyDefinition[];
};

export function createEnemyArmy(input: CreateEnemyArmyInput): EnemyArmy {
  const encounter = getEnemyEncounterForRound(input.currentRound, input.encounters);
  const units = encounter.units.flatMap((enemyUnit, index) => {
    const unit = input.unitPool.find((candidate) => candidate.id === enemyUnit.unitId);

    if (!unit) {
      return [];
    }

    const starAdjustedUnit = applyStarLevel(unit, enemyUnit.starLevel);
    const scaledUnit = applyEncounterStatMultiplier(starAdjustedUnit, encounter.statMultiplier);
    const equippedItems = getEnemyItems(enemyUnit.itemIds ?? [], input.itemPool);

    return {
      ...scaledUnit,
      unitId: unit.id,
      instanceId: `enemy-${encounter.round}-${index}-${unit.id}`,
      currentHp: scaledUnit.maxHp,
      currentMana: scaledUnit.mana,
      starLevel: enemyUnit.starLevel,
      items: equippedItems,
      position: { ...enemyUnit.position },
    };
  });
  const synergyStates = calculateSynergyStates(units, input.synergyDefinitions);

  return {
    encounter,
    units,
    activeSynergies: getActiveSynergies(synergyStates),
  };
}

export function getEnemyEncounterForRound(round: number, encounters: EnemyEncounter[]): EnemyEncounter {
  const exactEncounter = encounters.find((encounter) => encounter.round === round);

  if (exactEncounter) {
    return cloneEncounter(exactEncounter);
  }

  const finalEncounter = encounters[encounters.length - 1];
  const extraRounds = Math.max(0, round - finalEncounter.round);

  return {
    ...cloneEncounter(finalEncounter),
    round,
    statMultiplier: roundStat(finalEncounter.statMultiplier + extraRounds * REPEATED_FINAL_ROUND_STAT_GROWTH),
  };
}

function applyStarLevel(unit: Unit, starLevel: UnitStarLevel): Unit {
  const multiplier = STAR_LEVEL_STAT_MULTIPLIERS[starLevel];
  const maxHp = Math.round(unit.maxHp * multiplier.maxHp);
  const attackDamage = Math.round(unit.attackDamage * multiplier.attackDamage);

  return {
    ...unit,
    maxHp,
    attackDamage,
  };
}

function applyEncounterStatMultiplier(unit: Unit, statMultiplier: number): Unit {
  return {
    ...unit,
    maxHp: Math.round(unit.maxHp * statMultiplier),
    attackDamage: Math.round(unit.attackDamage * statMultiplier),
    armor: Math.round(unit.armor * statMultiplier),
  };
}

function getEnemyItems(itemIds: Item['id'][], itemPool: Item[]): Item[] {
  return itemIds.slice(0, MAX_ENEMY_ITEM_COUNT).flatMap((itemId) => {
    const item = itemPool.find((candidate) => candidate.id === itemId);

    return item ? [cloneItem(item)] : [];
  });
}

function cloneEncounter(encounter: EnemyEncounter): EnemyEncounter {
  return {
    ...encounter,
    units: encounter.units.map((unit) => ({
      ...unit,
      position: { ...unit.position },
      itemIds: unit.itemIds ? [...unit.itemIds] : undefined,
    })),
    itemRewardIds: [...encounter.itemRewardIds],
  };
}

function cloneItem(item: Item): Item {
  return {
    ...item,
    statBonus: { ...item.statBonus },
    effects: item.effects.map((effect) => ({ ...effect })),
  };
}

function roundStat(value: number): number {
  return Math.round(value * 100) / 100;
}
