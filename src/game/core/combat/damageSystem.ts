import {
  ARMOR_DAMAGE_REDUCTION_RATIO,
  CRITICAL_DAMAGE_MULTIPLIER,
  MIN_BASIC_ATTACK_DAMAGE,
  type CombatUnit,
  type DamageEvent,
  type ReviveEvent,
} from '../../../types/combat';

export function calculateBasicAttackDamage(attacker: CombatUnit, target: CombatUnit): number {
  const baseDamage = Math.max(
    MIN_BASIC_ATTACK_DAMAGE,
    Math.round(attacker.attackDamage - target.armor * ARMOR_DAMAGE_REDUCTION_RATIO),
  );
  const criticalDamage = isCriticalHit(attacker) ? Math.round(baseDamage * CRITICAL_DAMAGE_MULTIPLIER) : baseDamage;
  const bonusDamagePercent = attacker.items.reduce(
    (total, item) =>
      total +
      item.effects.reduce(
        (itemTotal, effect) =>
          effect.type === 'bonusDamageAgainstHighHp' && target.maxHp >= (effect.targetMaxHpThreshold ?? Number.POSITIVE_INFINITY)
            ? itemTotal + effect.value
            : itemTotal,
        0,
      ),
    0,
  );

  return Math.round(criticalDamage * (1 + bonusDamagePercent / 100));
}

export function applyDamage(
  attacker: CombatUnit,
  target: CombatUnit,
  amount: number,
  source: DamageEvent['source'] = 'basicAttack',
): DamageEvent {
  const absorbedShield = Math.min(target.shield, amount);
  const hpDamage = amount - absorbedShield;

  consumeShield(target, absorbedShield);
  target.currentHp = Math.max(0, target.currentHp - hpDamage);

  if (target.currentHp <= 0) {
    target.isAlive = false;
  }

  return {
    type: 'damage',
    sourceInstanceId: attacker.instanceId,
    targetInstanceId: target.instanceId,
    source,
    damageType: 'physical',
    amount,
    absorbedShield,
    remainingHp: target.currentHp,
  };
}

export function tryRevive(target: CombatUnit): ReviveEvent | undefined {
  if (target.isAlive) {
    return undefined;
  }

  for (const item of target.items) {
    const effect = item.effects.find((candidate) => candidate.type === 'reviveOnLethalDamage');
    const effectId = `${item.id}-reviveOnLethalDamage`;

    if (!effect || target.usedItemEffectIds.includes(effectId)) {
      continue;
    }

    const restoredHp = Math.max(1, Math.round(target.maxHp * (effect.value / 100)));
    target.isAlive = true;
    target.currentHp = restoredHp;
    target.currentMana = 0;
    target.shield = 0;
    target.shields = [];
    target.usedItemEffectIds = [...target.usedItemEffectIds, effectId];

    return {
      type: 'revive',
      unitInstanceId: target.instanceId,
      amount: restoredHp,
      remainingHp: restoredHp,
    };
  }

  return undefined;
}

function isCriticalHit(attacker: CombatUnit): boolean {
  return attacker.critChance > 0 && Math.random() * 100 < attacker.critChance;
}

function consumeShield(target: CombatUnit, amount: number): void {
  let remainingAmount = amount;

  target.shields = target.shields.flatMap((shield) => {
    if (remainingAmount <= 0) {
      return [shield];
    }

    const consumedValue = Math.min(shield.value, remainingAmount);
    remainingAmount -= consumedValue;
    const nextValue = shield.value - consumedValue;

    return nextValue > 0 ? [{ ...shield, value: nextValue }] : [];
  });
  target.shield = target.shields.reduce((total, shield) => total + shield.value, 0);
}
