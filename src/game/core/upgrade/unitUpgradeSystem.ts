import type { BenchUnitSlot, BoardUnit } from '../../../types/game';
import {
  MAX_UNIT_STAR_LEVEL,
  STAR_LEVEL_STAT_MULTIPLIERS,
  UNITS_REQUIRED_FOR_STAR_UPGRADE,
  type PlayerUnit,
  type Unit,
  type UnitStarLevel,
} from '../../../types/unit';

type UnitLocation =
  | {
      kind: 'board';
      boardIndex: number;
      unit: BoardUnit;
    }
  | {
      kind: 'bench';
      benchIndex: number;
      unit: PlayerUnit;
    };

export type UnitUpgradeInput = {
  benchUnits: BenchUnitSlot[];
  boardUnits: BoardUnit[];
  unitPool: Unit[];
};

export type UnitUpgradeOutput = {
  benchUnits: BenchUnitSlot[];
  boardUnits: BoardUnit[];
  upgradedUnits: PlayerUnit[];
};

export function resolveUnitUpgrades(input: UnitUpgradeInput): UnitUpgradeOutput {
  let benchUnits = [...input.benchUnits];
  let boardUnits = [...input.boardUnits];
  const upgradedUnits: PlayerUnit[] = [];

  while (true) {
    const upgradeGroup = findNextUpgradeGroup(benchUnits, boardUnits);

    if (!upgradeGroup) {
      break;
    }

    const [keepLocation, ...consumedLocations] = upgradeGroup;
    const upgradedUnit = createUpgradedUnit(keepLocation.unit, input.unitPool);

    benchUnits = removeConsumedBenchUnits(benchUnits, consumedLocations);
    boardUnits = removeConsumedBoardUnits(boardUnits, consumedLocations);

    if (keepLocation.kind === 'board') {
      boardUnits = boardUnits.map((unit) =>
        unit.instanceId === keepLocation.unit.instanceId ? { ...upgradedUnit, position: keepLocation.unit.position } : unit,
      );
    } else {
      benchUnits = benchUnits.map((unit, index) => (index === keepLocation.benchIndex ? upgradedUnit : unit));
    }

    upgradedUnits.push(upgradedUnit);
  }

  return {
    benchUnits,
    boardUnits,
    upgradedUnits,
  };
}

function findNextUpgradeGroup(
  benchUnits: BenchUnitSlot[],
  boardUnits: BoardUnit[],
): [UnitLocation, UnitLocation, UnitLocation] | undefined {
  const groups = new Map<string, UnitLocation[]>();

  for (const [boardIndex, unit] of boardUnits.entries()) {
    if (unit.starLevel >= MAX_UNIT_STAR_LEVEL) {
      continue;
    }

    addLocation(groups, { kind: 'board', boardIndex, unit });
  }

  for (const [benchIndex, unit] of benchUnits.entries()) {
    if (!unit || unit.starLevel >= MAX_UNIT_STAR_LEVEL) {
      continue;
    }

    addLocation(groups, { kind: 'bench', benchIndex, unit });
  }

  for (const locations of groups.values()) {
    if (locations.length >= UNITS_REQUIRED_FOR_STAR_UPGRADE) {
      return locations.sort(compareUnitLocationPriority).slice(0, UNITS_REQUIRED_FOR_STAR_UPGRADE) as [
        UnitLocation,
        UnitLocation,
        UnitLocation,
      ];
    }
  }

  return undefined;
}

function addLocation(groups: Map<string, UnitLocation[]>, location: UnitLocation): void {
  const key = getUpgradeKey(location.unit);
  const locations = groups.get(key) ?? [];
  locations.push(location);
  groups.set(key, locations);
}

function getUpgradeKey(unit: PlayerUnit): string {
  return `${unit.unitId}:${unit.starLevel}`;
}

function compareUnitLocationPriority(first: UnitLocation, second: UnitLocation): number {
  if (first.kind !== second.kind) {
    return first.kind === 'board' ? -1 : 1;
  }

  if (first.kind === 'board' && second.kind === 'board') {
    const firstOrder = first.unit.position.row * 100 + first.unit.position.col;
    const secondOrder = second.unit.position.row * 100 + second.unit.position.col;

    return firstOrder - secondOrder;
  }

  if (first.kind === 'bench' && second.kind === 'bench') {
    return first.benchIndex - second.benchIndex;
  }

  return 0;
}

function createUpgradedUnit(unit: PlayerUnit, unitPool: Unit[]): PlayerUnit {
  const nextStarLevel = (unit.starLevel + 1) as UnitStarLevel;
  const baseUnit = unitPool.find((candidate) => candidate.id === unit.unitId) ?? unit;
  const multiplier = STAR_LEVEL_STAT_MULTIPLIERS[nextStarLevel];
  const maxHp = Math.round(baseUnit.maxHp * multiplier.maxHp);
  const attackDamage = Math.round(baseUnit.attackDamage * multiplier.attackDamage);

  return {
    ...unit,
    maxHp,
    currentHp: maxHp,
    attackDamage,
    starLevel: nextStarLevel,
  };
}

function removeConsumedBenchUnits(benchUnits: BenchUnitSlot[], consumedLocations: UnitLocation[]): BenchUnitSlot[] {
  const consumedBenchIndexes = new Set(
    consumedLocations
      .filter((location): location is Extract<UnitLocation, { kind: 'bench' }> => location.kind === 'bench')
      .map((location) => location.benchIndex),
  );

  return benchUnits.map((unit, index) => (consumedBenchIndexes.has(index) ? undefined : unit));
}

function removeConsumedBoardUnits(boardUnits: BoardUnit[], consumedLocations: UnitLocation[]): BoardUnit[] {
  const consumedInstanceIds = new Set(
    consumedLocations
      .filter((location): location is Extract<UnitLocation, { kind: 'board' }> => location.kind === 'board')
      .map((location) => location.unit.instanceId),
  );

  return boardUnits.filter((unit) => !consumedInstanceIds.has(unit.instanceId));
}
