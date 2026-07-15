import type { BoardPosition } from '../../../types/board';
import {
  COMBAT_AI_LANE_ALIGNMENT_WEIGHT,
  COMBAT_AI_MOVING_AWAY_PENALTY,
  COMBAT_AI_POSITION_DISTANCE_WEIGHT,
  COMBAT_AI_TARGET_DISTANCE_WEIGHT,
  MOVE_COOLDOWN_MS,
  type CombatUnit,
  type MoveEvent,
} from '../../../types/combat';
import { getBoardPositionKey, isBoardPosition } from '../board/boardSystem';
import {
  getAdjacentPositions,
  getAttackPositionsForTarget,
  getBoardDistance,
  isBlockedPosition,
  isInAttackRange,
} from './targetSystem';

export type MovementPlan = {
  moveEvent?: MoveEvent;
  desiredPosition?: BoardPosition;
  reservedPosition?: BoardPosition;
  wasBlocked: boolean;
};

export function tryMoveTowardTarget(
  unit: CombatUnit,
  target: CombatUnit,
  units: CombatUnit[],
  elapsedMs: number,
  reservedPositions: Set<string>,
): MovementPlan {
  if (elapsedMs < unit.nextMoveAtMs || isInAttackRange(unit, target)) {
    return { wasBlocked: false };
  }

  const desiredPosition = getDesiredAttackPosition(unit, target, units, reservedPositions);
  const nextPosition = desiredPosition
    ? getBestMovementCandidate(unit, target, desiredPosition, units, reservedPositions)
    : undefined;

  if (!nextPosition) {
    unit.nextMoveAtMs = elapsedMs + MOVE_COOLDOWN_MS;
    return { desiredPosition, wasBlocked: true };
  }

  const from = unit.position;
  unit.position = nextPosition;
  unit.nextMoveAtMs = elapsedMs + MOVE_COOLDOWN_MS;
  reservedPositions.add(getBoardPositionKey(nextPosition));

  return {
    desiredPosition,
    reservedPosition: nextPosition,
    wasBlocked: false,
    moveEvent: {
      type: 'move',
      unitInstanceId: unit.instanceId,
      from,
      to: nextPosition,
    },
  };
}

export function getBestMovementCandidate(
  unit: CombatUnit,
  target: CombatUnit,
  desiredPosition: BoardPosition,
  units: CombatUnit[],
  reservedPositions: ReadonlySet<string>,
): BoardPosition | undefined {
  let bestPosition: BoardPosition | undefined;
  let bestScore = Infinity;

  for (const position of getAdjacentPositions(unit.position)) {
    if (!isBoardPosition(position) || isBlockedPosition(position, units, unit.instanceId, reservedPositions)) {
      continue;
    }

    const score = scoreMovementCandidate(unit, target, position, desiredPosition);

    if (score < bestScore) {
      bestPosition = position;
      bestScore = score;
    }
  }

  return bestPosition;
}

export function scoreMovementCandidate(
  unit: CombatUnit,
  target: CombatUnit,
  candidate: BoardPosition,
  desiredPosition: BoardPosition,
): number {
  const currentTargetDistance = getBoardDistance(unit.position, target.position);
  const candidateTargetDistance = getBoardDistance(candidate, target.position);
  const movingAwayPenalty =
    candidateTargetDistance > currentTargetDistance ? COMBAT_AI_MOVING_AWAY_PENALTY : 0;
  const laneAlignment =
    Math.abs(candidate.row - desiredPosition.row) + Math.abs(candidate.col - desiredPosition.col);

  return (
    getBoardDistance(candidate, desiredPosition) * COMBAT_AI_POSITION_DISTANCE_WEIGHT +
    candidateTargetDistance * COMBAT_AI_TARGET_DISTANCE_WEIGHT +
    laneAlignment * COMBAT_AI_LANE_ALIGNMENT_WEIGHT +
    movingAwayPenalty
  );
}

function getDesiredAttackPosition(
  unit: CombatUnit,
  target: CombatUnit,
  units: CombatUnit[],
  reservedPositions: ReadonlySet<string>,
): BoardPosition | undefined {
  if (unit.attackRange > 1) {
    return target.position;
  }

  return getAttackPositionsForTarget(unit, target, units, reservedPositions)[0];
}
