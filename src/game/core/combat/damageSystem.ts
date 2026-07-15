import {
  ARMOR_DAMAGE_REDUCTION_RATIO,
  CRITICAL_DAMAGE_MULTIPLIER,
  MIN_BASIC_ATTACK_DAMAGE,
  type CombatUnit,
  type DamageEvent,
} from '../../../types/combat';

export function calculateBasicAttackDamage(attacker: CombatUnit, target: CombatUnit): number {
  const baseDamage = Math.max(
    MIN_BASIC_ATTACK_DAMAGE,
    Math.round(attacker.attackDamage - target.armor * ARMOR_DAMAGE_REDUCTION_RATIO),
  );

  return isCriticalHit(attacker) ? Math.round(baseDamage * CRITICAL_DAMAGE_MULTIPLIER) : baseDamage;
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
