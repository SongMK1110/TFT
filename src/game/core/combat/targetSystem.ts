import type { BoardPosition } from '../../../types/board';
import {
  COMBAT_AI_APPROACHABLE_SCORE_BONUS,
  COMBAT_AI_DISTANCE_SCORE_WEIGHT,
  COMBAT_AI_HP_SCORE_WEIGHT,
  COMBAT_AI_IN_RANGE_SCORE_BONUS,
  type CombatUnit,
} from '../../../types/combat';
import { getBoardPositionKey, isBoardPosition } from '../board/boardSystem';

export type TargetSelection = {
  target: CombatUnit;
  score: number;
  attackPositions: BoardPosition[];
  isInRange: boolean;
  isApproachable: boolean;
};

export function getBoardDistance(first: BoardPosition, second: BoardPosition): number {
  return Math.abs(first.row - second.row) + Math.abs(first.col - second.col);
}

export function findBestTarget(
  unit: CombatUnit,
  units: CombatUnit[],
  reservedPositions: ReadonlySet<string> = new Set(),
): TargetSelection | undefined {
  let bestSelection: TargetSelection | undefined;

  for (const target of units) {
    if (!target.isAlive || target.team === unit.team) {
      continue;
    }

    const selection = createTargetSelection(unit, target, units, reservedPositions);

    if (!bestSelection || selection.score < bestSelection.score) {
      bestSelection = selection;
    }
  }

  return bestSelection;
}

export function findNearestEnemy(unit: CombatUnit, units: CombatUnit[]): CombatUnit | undefined {
  return findBestTarget(unit, units)?.target;
}

export function isInAttackRange(unit: CombatUnit, target: CombatUnit): boolean {
  return getBoardDistance(unit.position, target.position) <= unit.attackRange;
}

export function getAttackPositionsForTarget(
  unit: CombatUnit,
  target: CombatUnit,
  units: CombatUnit[],
  reservedPositions: ReadonlySet<string> = new Set(),
): BoardPosition[] {
  const blockedPositions = createBlockedPositionSet(units, unit.instanceId, reservedPositions);

  return createAttackPositionCandidates(target.position, unit.attackRange)
    .filter((position) => isBoardPosition(position))
    .filter((position) => !blockedPositions.has(getBoardPositionKey(position)))
    .sort((first, second) => getBoardDistance(unit.position, first) - getBoardDistance(unit.position, second));
}

export function getAdjacentPositions(position: BoardPosition): BoardPosition[] {
  return [
    { row: position.row - 1, col: position.col },
    { row: position.row + 1, col: position.col },
    { row: position.row, col: position.col - 1 },
    { row: position.row, col: position.col + 1 },
  ];
}

export function isBlockedPosition(
  position: BoardPosition,
  units: CombatUnit[],
  movingUnitInstanceId?: string,
  reservedPositions: ReadonlySet<string> = new Set(),
): boolean {
  if (reservedPositions.has(getBoardPositionKey(position))) {
    return true;
  }

  return units.some(
    (unit) =>
      unit.isAlive &&
      unit.instanceId !== movingUnitInstanceId &&
      unit.position.row === position.row &&
      unit.position.col === position.col,
  );
}

function createTargetSelection(
  unit: CombatUnit,
  target: CombatUnit,
  units: CombatUnit[],
  reservedPositions: ReadonlySet<string>,
): TargetSelection {
  const distance = getBoardDistance(unit.position, target.position);
  const isInRange = distance <= unit.attackRange;
  const attackPositions = getAttackPositionsForTarget(unit, target, units, reservedPositions);
  const isApproachable = isInRange || canReachAnyPosition(unit, attackPositions, units, reservedPositions);
  const score =
    distance * COMBAT_AI_DISTANCE_SCORE_WEIGHT +
    target.currentHp * COMBAT_AI_HP_SCORE_WEIGHT +
    (isInRange ? COMBAT_AI_IN_RANGE_SCORE_BONUS : 0) +
    (isApproachable ? COMBAT_AI_APPROACHABLE_SCORE_BONUS : 0);

  return {
    target,
    score,
    attackPositions,
    isInRange,
    isApproachable,
  };
}

function createAttackPositionCandidates(targetPosition: BoardPosition, attackRange: number): BoardPosition[] {
  const candidates: BoardPosition[] = [];

  for (let row = targetPosition.row - attackRange; row <= targetPosition.row + attackRange; row += 1) {
    for (let col = targetPosition.col - attackRange; col <= targetPosition.col + attackRange; col += 1) {
      const position = { row, col };

      if (getBoardDistance(position, targetPosition) <= attackRange) {
        candidates.push(position);
      }
    }
  }

  return candidates;
}

function canReachAnyPosition(
  unit: CombatUnit,
  targetPositions: BoardPosition[],
  units: CombatUnit[],
  reservedPositions: ReadonlySet<string>,
): boolean {
  if (targetPositions.length === 0) {
    return false;
  }

  const targetKeys = new Set(targetPositions.map(getBoardPositionKey));
  const blockedPositions = createBlockedPositionSet(units, unit.instanceId, reservedPositions);
  const visited = new Set<string>([getBoardPositionKey(unit.position)]);
  const queue: BoardPosition[] = [unit.position];
  let queueIndex = 0;

  while (queueIndex < queue.length) {
    const currentPosition = queue[queueIndex];

    queueIndex += 1;

    if (targetKeys.has(getBoardPositionKey(currentPosition))) {
      return true;
    }

    for (const nextPosition of getAdjacentPositions(currentPosition)) {
      const nextKey = getBoardPositionKey(nextPosition);

      if (
        visited.has(nextKey) ||
        !isBoardPosition(nextPosition) ||
        blockedPositions.has(nextKey)
      ) {
        continue;
      }

      visited.add(nextKey);
      queue.push(nextPosition);
    }
  }

  return false;
}

function createBlockedPositionSet(
  units: CombatUnit[],
  movingUnitInstanceId?: string,
  reservedPositions: ReadonlySet<string> = new Set(),
): Set<string> {
  const blockedPositions = new Set(reservedPositions);

  for (const unit of units) {
    if (!unit.isAlive || unit.instanceId === movingUnitInstanceId) {
      continue;
    }

    blockedPositions.add(getBoardPositionKey(unit.position));
  }

  return blockedPositions;
}
