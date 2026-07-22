import type {
  CombatEvent,
  CombatUnit,
  HealEvent,
  ManaGainEvent,
  ShieldEvent,
  SkillCastEvent,
  StatusEffectEvent,
} from '../../../types/combat';
import type { SkillEffect } from '../../../types/unit';
import { applyDamage, applyOnKillItemEffects, tryRevive } from './damageSystem';
import { getBoardDistance } from './targetSystem';

type ManaGainSource = ManaGainEvent['source'];

export function gainMana(unit: CombatUnit, amount: number, source: ManaGainSource): ManaGainEvent | undefined {
  if (amount <= 0 || unit.maxMana <= 0 || unit.currentMana >= unit.maxMana || !unit.isAlive) {
    return undefined;
  }

  const previousMana = unit.currentMana;
  unit.currentMana = Math.min(unit.maxMana, unit.currentMana + amount);

  return {
    type: 'manaGain',
    unitInstanceId: unit.instanceId,
    amount: unit.currentMana - previousMana,
    currentMana: unit.currentMana,
    maxMana: unit.maxMana,
    source,
  };
}

export function canCastSkill(unit: CombatUnit): boolean {
  return unit.isAlive && unit.maxMana > 0 && unit.currentMana >= unit.skill.manaCost;
}

export function castSkill(caster: CombatUnit, units: CombatUnit[], elapsedMs: number): CombatEvent[] {
  const targets = getSkillTargets(caster, units);

  if (targets.length === 0) {
    return [];
  }

  caster.currentMana = 0;

  const events: CombatEvent[] = [
    createSkillCastEvent(caster, targets),
    ...caster.skill.effects.flatMap((effect) => applySkillEffect(caster, targets, units, effect, elapsedMs)),
  ];

  return events;
}

function getSkillTargets(caster: CombatUnit, units: CombatUnit[]): CombatUnit[] {
  const livingUnits = units.filter((unit) => unit.isAlive);
  const enemies = livingUnits.filter((unit) => unit.team !== caster.team);
  const allies = livingUnits.filter((unit) => unit.team === caster.team);

  switch (caster.skill.targetType) {
    case 'self':
      return [caster];
    case 'singleEnemy': {
      const target = getNearestLowHpUnit(caster, enemies);

      return target ? [target] : [];
    }
    case 'areaEnemy': {
      const center = getNearestLowHpUnit(caster, enemies);

      return center ? [center] : [];
    }
    case 'allAllies':
      return allies;
    case 'lowestHpAlly': {
      const target = allies.sort((first, second) => first.currentHp / first.maxHp - second.currentHp / second.maxHp)[0];

      return target ? [target] : [];
    }
    default:
      return [];
  }
}

function getNearestLowHpUnit(caster: CombatUnit, candidates: CombatUnit[]): CombatUnit | undefined {
  return candidates.sort(
    (first, second) =>
      getBoardDistance(caster.position, first.position) - getBoardDistance(caster.position, second.position) ||
      first.currentHp - second.currentHp,
  )[0];
}

function applySkillEffect(
  caster: CombatUnit,
  targets: CombatUnit[],
  units: CombatUnit[],
  effect: SkillEffect,
  elapsedMs: number,
): CombatEvent[] {
  if (effect.type === 'damage') {
    return targets.flatMap((target) => applySkillDamage(caster, target, scaleSkillValue(caster, effect.value)));
  }

  if (effect.type === 'areaDamage') {
    const radius = effect.radius ?? 1;
    const center = targets[0];
    const affectedTargets = center
      ? units.filter(
          (unit) =>
            unit.isAlive &&
            unit.team !== caster.team &&
            getBoardDistance(unit.position, center.position) <= radius,
        )
      : [];

    return affectedTargets.flatMap((target) => applySkillDamage(caster, target, scaleSkillValue(caster, effect.value)));
  }

  if (effect.type === 'heal') {
    return targets.map((target) => applyHeal(caster, target, scaleSkillValue(caster, effect.value)));
  }

  if (effect.type === 'shield') {
    return targets.map((target) => applyShield(caster, target, effect, elapsedMs));
  }

  return targets.map((target) => applyStatusEffect(caster, target, effect, elapsedMs));
}

function scaleSkillValue(caster: CombatUnit, value: number): number {
  return Math.round(value * caster.skillPowerMultiplier);
}

function applySkillDamage(caster: CombatUnit, target: CombatUnit, amount: number): CombatEvent[] {
  const damageEvent = {
    ...applyDamage(caster, target, amount, 'skill'),
    damageType: 'magic' as const,
  };

  const reviveEvent = tryRevive(target);

  if (reviveEvent) {
    return [damageEvent, reviveEvent];
  }

  if (!target.isAlive) {
    const onKillEvent = applyOnKillItemEffects(caster);

    return onKillEvent ? [damageEvent, onKillEvent, { type: 'death', unitInstanceId: target.instanceId }] : [damageEvent, { type: 'death', unitInstanceId: target.instanceId }];
  }

  return [damageEvent];
}

function applyHeal(caster: CombatUnit, target: CombatUnit, amount: number): HealEvent {
  target.currentHp = Math.min(target.maxHp, target.currentHp + amount);

  return {
    type: 'heal',
    sourceInstanceId: caster.instanceId,
    targetInstanceId: target.instanceId,
    amount,
    remainingHp: target.currentHp,
  };
}

function applyShield(caster: CombatUnit, target: CombatUnit, effect: SkillEffect, elapsedMs: number): ShieldEvent {
  const amount = scaleSkillValue(caster, effect.value);
  const durationMs = effect.durationMs ?? 0;
  const shield = {
    id: `${caster.instanceId}-shield-${elapsedMs}`,
    sourceInstanceId: caster.instanceId,
    value: amount,
    expiresAtMs: durationMs > 0 ? elapsedMs + durationMs : Number.POSITIVE_INFINITY,
  };

  target.shields.push(shield);
  target.shield = target.shields.reduce((total, activeShield) => total + activeShield.value, 0);

  return {
    type: 'shield',
    sourceInstanceId: caster.instanceId,
    targetInstanceId: target.instanceId,
    amount,
    shield: target.shield,
  };
}

function applyStatusEffect(
  caster: CombatUnit,
  target: CombatUnit,
  effect: SkillEffect,
  elapsedMs: number,
): StatusEffectEvent {
  const durationMs = effect.durationMs ?? 0;

  target.statusEffects.push({
    id: `${caster.instanceId}-${effect.type}-${elapsedMs}`,
    sourceInstanceId: caster.instanceId,
    effectType: effect.type,
    value: effect.value,
    expiresAtMs: elapsedMs + durationMs,
  });

  return {
    type: 'statusEffect',
    sourceInstanceId: caster.instanceId,
    targetInstanceId: target.instanceId,
    effectType: effect.type,
    value: effect.value,
    durationMs,
  };
}

function createSkillCastEvent(caster: CombatUnit, targets: CombatUnit[]): SkillCastEvent {
  return {
    type: 'skillCast',
    sourceInstanceId: caster.instanceId,
    skillId: caster.skillId,
    skillName: caster.skill.name,
    targetInstanceIds: targets.map((target) => target.instanceId),
  };
}
