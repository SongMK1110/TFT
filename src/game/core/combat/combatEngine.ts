import type { BoardPosition } from '../../../types/board';
import {
  BASIC_ATTACK_MANA_GAIN,
  DAMAGE_TAKEN_MANA_GAIN,
  MIN_ATTACK_COOLDOWN_MS,
  type AiDecisionEvent,
  type CombatEvent,
  type CombatState,
  type CombatStepResult,
  type CombatTeam,
  type CombatUnit,
} from '../../../types/combat';
import type { BoardUnit } from '../../../types/game';
import { applyDamage, calculateBasicAttackDamage } from './damageSystem';
import { tryMoveTowardTarget } from './movementSystem';
import { getCombatResult } from './resultSystem';
import { canCastSkill, castSkill, gainMana } from './skillSystem';
import { findBestTarget, isInAttackRange } from './targetSystem';

type CreateCombatStateInput = {
  playerUnits: BoardUnit[];
  enemyUnits: BoardUnit[];
};

export function createCombatState(input: CreateCombatStateInput): CombatState {
  return {
    isRunning: true,
    elapsedMs: 0,
    units: [...createPlayerCombatUnits(input.playerUnits), ...createEnemyCombatUnits(input.enemyUnits)],
    events: [],
  };
}

export function stepCombat(state: CombatState, deltaMs: number): CombatStepResult {
  if (!state.isRunning || state.result) {
    return { state, events: [] };
  }

  const nextState: CombatState = {
    ...state,
    elapsedMs: state.elapsedMs + deltaMs,
    units: state.units.map((unit) => refreshTimedCombatState(unit, state.elapsedMs + deltaMs)),
    events: [],
  };
  const events: CombatEvent[] = [];
  const reservedMovementPositions = new Set<string>();

  for (const unit of nextState.units) {
    if (!unit.isAlive) {
      continue;
    }

    if (canCastSkill(unit)) {
      events.push(...castSkill(unit, nextState.units, nextState.elapsedMs));
    }

    let targetSelection = findBestTarget(unit, nextState.units, reservedMovementPositions);

    if (!targetSelection) {
      events.push(createAiDecisionEvent(unit, undefined, 'noTarget'));
      continue;
    }

    if (!targetSelection.isInRange) {
      const movementPlan = tryMoveTowardTarget(
        unit,
        targetSelection.target,
        nextState.units,
        nextState.elapsedMs,
        reservedMovementPositions,
      );

      events.push(
        createAiDecisionEvent(
          unit,
          targetSelection.target,
          movementPlan.moveEvent ? 'moveReserved' : movementPlan.wasBlocked ? 'blocked' : 'targetInRange',
          movementPlan.desiredPosition,
          movementPlan.reservedPosition,
        ),
      );

      if (movementPlan.moveEvent) {
        events.push(movementPlan.moveEvent);
      }

      targetSelection = findBestTarget(unit, nextState.units, reservedMovementPositions);

      if (!targetSelection || !isInAttackRange(unit, targetSelection.target)) {
        continue;
      }
    } else {
      events.push(createAiDecisionEvent(unit, targetSelection.target, 'targetInRange'));
    }

    if (nextState.elapsedMs >= unit.nextAttackAtMs) {
      const currentTargetSelection = findBestTarget(unit, nextState.units, reservedMovementPositions);
      const currentTarget = currentTargetSelection?.target;

      if (!currentTarget || !isInAttackRange(unit, currentTarget)) {
        continue;
      }

      const damage = calculateBasicAttackDamage(unit, currentTarget);
      const damageEvent = applyDamage(unit, currentTarget, damage);
      unit.nextAttackAtMs = nextState.elapsedMs + getAttackCooldownMs(unit);
      events.push(damageEvent);
      pushOptionalEvent(events, gainMana(unit, BASIC_ATTACK_MANA_GAIN, 'basicAttack'));

      if (currentTarget.isAlive) {
        pushOptionalEvent(events, gainMana(currentTarget, DAMAGE_TAKEN_MANA_GAIN, 'damageTaken'));
      }

      if (!currentTarget.isAlive) {
        events.push({
          type: 'death',
          unitInstanceId: currentTarget.instanceId,
        });
      }

      if (canCastSkill(unit)) {
        events.push(...castSkill(unit, nextState.units, nextState.elapsedMs));
      }
    }
  }

  const result = getCombatResult(nextState);

  if (result) {
    nextState.isRunning = false;
    nextState.result = result;
    events.push({ type: 'combatEnd', result });
  }

  nextState.events = events;

  return {
    state: nextState,
    events,
  };
}

export function resetCombatHp(boardUnits: BoardUnit[]): BoardUnit[] {
  return boardUnits.map((unit) => ({
    ...unit,
    currentHp: unit.maxHp,
    currentMana: unit.mana,
  }));
}

function createPlayerCombatUnits(playerUnits: BoardUnit[]): CombatUnit[] {
  return playerUnits.map((unit) => createCombatUnit(unit, 'player', unit.instanceId, unit.position));
}

function createEnemyCombatUnits(enemyUnits: BoardUnit[]): CombatUnit[] {
  return enemyUnits.map((unit) => createCombatUnit(unit, 'enemy', unit.instanceId, unit.position));
}

function createCombatUnit(unit: BoardUnit, team: CombatTeam, instanceId: string, position: BoardPosition): CombatUnit {
  return {
    instanceId,
    unitId: unit.unitId,
    name: unit.name,
    team,
    origin: unit.origin,
    class: unit.class,
    position: { ...position },
    maxHp: unit.maxHp,
    currentHp: unit.maxHp,
    attackDamage: unit.attackDamage,
    attackSpeed: unit.attackSpeed,
    attackRange: unit.attackRange,
    armor: unit.armor,
    critChance: 0,
    skillPowerMultiplier: 1,
    currentMana: unit.currentMana,
    maxMana: unit.maxMana,
    shield: 0,
    shields: [],
    skillId: unit.skillId,
    skill: unit.skill,
    items: unit.items.map((item) => ({
      ...item,
      statBonus: { ...item.statBonus },
      effects: item.effects.map((effect) => ({ ...effect })),
    })),
    statusEffects: [],
    isAlive: true,
    nextAttackAtMs: 0,
    nextMoveAtMs: 0,
  };
}

function refreshTimedCombatState(unit: CombatUnit, elapsedMs: number): CombatUnit {
  const shields = unit.shields.filter((shield) => shield.expiresAtMs > elapsedMs);

  return {
    ...unit,
    position: { ...unit.position },
    shields,
    shield: shields.reduce((total, shield) => total + shield.value, 0),
    statusEffects: unit.statusEffects.filter((effect) => effect.expiresAtMs > elapsedMs),
  };
}

function pushOptionalEvent(events: CombatEvent[], event: CombatEvent | undefined): void {
  if (event) {
    events.push(event);
  }
}

function createAiDecisionEvent(
  unit: CombatUnit,
  target: CombatUnit | undefined,
  reason: AiDecisionEvent['reason'],
  desiredPosition?: BoardPosition,
  reservedPosition?: BoardPosition,
): AiDecisionEvent {
  return {
    type: 'aiDecision',
    unitInstanceId: unit.instanceId,
    targetInstanceId: target?.instanceId,
    desiredPosition,
    reservedPosition,
    reason,
  };
}

function getAttackCooldownMs(unit: CombatUnit): number {
  return Math.max(MIN_ATTACK_COOLDOWN_MS, Math.round(1000 / unit.attackSpeed));
}
