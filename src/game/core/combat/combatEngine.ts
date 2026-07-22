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
import { applyBasicAttackLifesteal, applyDamage, applyOnKillItemEffects, calculateBasicAttackDamage, tryRevive } from './damageSystem';
import { tryMoveTowardTarget } from './movementSystem';
import { getCombatResult } from './resultSystem';
import { canCastSkill, castSkill, gainMana } from './skillSystem';
import { findBestTarget, getBoardDistance, isInAttackRange } from './targetSystem';

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
      const reviveEvent = tryRevive(currentTarget);

      if (reviveEvent) {
        events.push(reviveEvent);
      }
      pushOptionalEvent(events, applyBasicAttackLifesteal(unit, damageEvent.amount - damageEvent.absorbedShield));
      pushOptionalEvent(events, gainMana(unit, BASIC_ATTACK_MANA_GAIN, 'basicAttack'));

      if (currentTarget.isAlive) {
        pushOptionalEvent(events, gainMana(currentTarget, DAMAGE_TAKEN_MANA_GAIN, 'damageTaken'));
      }

      if (!currentTarget.isAlive) {
        pushOptionalEvent(events, applyOnKillItemEffects(unit));
        events.push({
          type: 'death',
          unitInstanceId: currentTarget.instanceId,
        });
      }

      events.push(...resolveChainLightning(unit, currentTarget, nextState.units));

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

function resolveChainLightning(attacker: CombatUnit, initialTarget: CombatUnit, units: CombatUnit[]): CombatEvent[] {
  const effect = attacker.items.flatMap((item) => item.effects).find((candidate) => candidate.type === 'chainLightningOnBasicAttack');

  if (!effect) {
    return [];
  }

  const targets = units
    .filter((unit) => unit.isAlive && unit.team !== attacker.team && unit.instanceId !== initialTarget.instanceId)
    .filter((unit) => getBoardDistance(initialTarget.position, unit.position) <= (effect.radius ?? 1))
    .sort(
      (first, second) =>
        getBoardDistance(initialTarget.position, first.position) - getBoardDistance(initialTarget.position, second.position) ||
        first.currentHp - second.currentHp,
    )
    .slice(0, effect.chainCount ?? 1);

  const events: CombatEvent[] = [
    {
      type: 'chainLightning',
      sourceInstanceId: attacker.instanceId,
      initialTargetInstanceId: initialTarget.instanceId,
      targetInstanceIds: targets.map((target) => target.instanceId),
    },
  ];

  if (targets.length === 0) {
    return events;
  }

  const damage = Math.max(1, Math.round(effect.value * attacker.skillPowerMultiplier));

  for (const target of targets) {
    const damageEvent = {
      ...applyDamage(attacker, target, damage, 'item'),
      damageType: 'magic' as const,
    };
    events.push(damageEvent);

    const reviveEvent = tryRevive(target);
    if (reviveEvent) {
      events.push(reviveEvent);
    }

    pushOptionalEvent(events, gainMana(target, DAMAGE_TAKEN_MANA_GAIN, 'damageTaken'));

    if (!target.isAlive) {
      pushOptionalEvent(events, applyOnKillItemEffects(attacker));
      events.push({ type: 'death', unitInstanceId: target.instanceId });
    }
  }

  return events;
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
    usedItemEffectIds: [],
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
