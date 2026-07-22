import type { CombatShield, CombatTeam, CombatUnit } from '../../../types/combat';
import type {
  ActiveSynergy,
  BoardUnit,
  SynergyDefinition,
  SynergyEffectType,
  SynergyState,
  SynergyTier,
} from '../../../types/game';

export function calculateSynergyStates(
  boardUnits: BoardUnit[],
  synergyDefinitions: SynergyDefinition[],
): SynergyState[] {
  return synergyDefinitions.map((definition) => {
    const unitCount = countUniqueUnitsForSynergy(boardUnits, definition);
    const activeTier = getActiveTier(definition.tiers, unitCount);

    return {
      ...definition,
      unitCount,
      activeTier,
      isActive: Boolean(activeTier),
    };
  });
}

export function getActiveSynergies(synergyStates: SynergyState[]): ActiveSynergy[] {
  return synergyStates.flatMap((synergy) =>
    synergy.activeTier
      ? [
          {
            id: synergy.id,
            name: synergy.name,
            source: synergy.source,
            sourceType: synergy.sourceType,
            activeTier: synergy.activeTier,
            unitCount: synergy.unitCount,
          },
        ]
      : [],
  );
}

export function applySynergyEffects(combatUnits: CombatUnit[], activeSynergies: ActiveSynergy[]): CombatUnit[] {
  return applySynergyEffectsForTeam(combatUnits, activeSynergies, 'player');
}

export function applySynergyEffectsForTeam(
  combatUnits: CombatUnit[],
  activeSynergies: ActiveSynergy[],
  alliedTeam: CombatTeam,
): CombatUnit[] {
  return activeSynergies.reduce(
    (units, synergy) => applySynergyEffect(units, synergy, alliedTeam),
    combatUnits.map(cloneCombatUnit),
  );
}

function countUniqueUnitsForSynergy(boardUnits: BoardUnit[], definition: SynergyDefinition): number {
  const matchingUnitIds = new Set(
    boardUnits
      .filter((unit) =>
        definition.sourceType === 'origin' ? unit.origin === definition.source : unit.class === definition.source,
      )
      .map((unit) => unit.unitId),
  );

  return matchingUnitIds.size;
}

function getActiveTier(tiers: SynergyTier[], unitCount: number): SynergyTier | undefined {
  return [...tiers]
    .sort((first, second) => second.requiredUnitCount - first.requiredUnitCount)
    .find((tier) => unitCount >= tier.requiredUnitCount);
}

function applySynergyEffect(combatUnits: CombatUnit[], synergy: ActiveSynergy, alliedTeam: CombatTeam): CombatUnit[] {
  return combatUnits.map((unit) => {
    if (!shouldApplyToUnit(unit, synergy, alliedTeam)) {
      return unit;
    }

    return applyEffectToUnit(unit, synergy.activeTier.effectType, synergy.activeTier.value, synergy.id);
  });
}

function shouldApplyToUnit(unit: CombatUnit, synergy: ActiveSynergy, alliedTeam: CombatTeam): boolean {
  if (synergy.activeTier.targetScope === 'enemies') {
    return unit.team !== alliedTeam;
  }

  if (unit.team !== alliedTeam) {
    return false;
  }

  if (synergy.activeTier.targetScope === 'allAllies') {
    return true;
  }

  return matchesSynergySource(unit, synergy);
}

function matchesSynergySource(unit: CombatUnit, synergy: ActiveSynergy): boolean {
  return synergy.sourceType === 'origin' ? unit.origin === synergy.source : unit.class === synergy.source;
}

function applyEffectToUnit(
  unit: CombatUnit,
  effectType: SynergyEffectType,
  value: number,
  synergyId: string,
): CombatUnit {
  switch (effectType) {
    case 'attackDamagePercent':
      return {
        ...unit,
        attackDamage: Math.round(unit.attackDamage * (1 + value / 100)),
      };
    case 'attackSpeedPercent':
      return {
        ...unit,
        attackSpeed: roundStat(unit.attackSpeed * (1 + value / 100)),
      };
    case 'enemyAttackSpeedReduction':
      return {
        ...unit,
        attackSpeed: roundStat(unit.attackSpeed * Math.max(0.1, 1 - value / 100)),
      };
    case 'armorFlat':
      return {
        ...unit,
        armor: unit.armor + value,
      };
    case 'shieldFlat':
      return applyFlatShield(unit, value, synergyId);
    case 'skillPowerPercent':
      return {
        ...unit,
        skillPowerMultiplier: roundStat(unit.skillPowerMultiplier + value / 100),
      };
    case 'critChancePercent':
      return {
        ...unit,
        critChance: Math.min(100, unit.critChance + value),
      };
    default:
      return unit;
  }
}

function applyFlatShield(unit: CombatUnit, value: number, synergyId: string): CombatUnit {
  const shield: CombatShield = {
    id: `${synergyId}-${unit.instanceId}-shield`,
    sourceInstanceId: synergyId,
    value,
    expiresAtMs: Number.POSITIVE_INFINITY,
  };
  const shields = [...unit.shields, shield];

  return {
    ...unit,
    shields,
    shield: shields.reduce((total, activeShield) => total + activeShield.value, 0),
  };
}

function cloneCombatUnit(unit: CombatUnit): CombatUnit {
  return {
    ...unit,
    position: { ...unit.position },
    items: unit.items.map((item) => ({
      ...item,
      statBonus: { ...item.statBonus },
      effects: item.effects.map((effect) => ({ ...effect })),
    })),
    usedItemEffectIds: [...unit.usedItemEffectIds],
    shields: unit.shields.map((shield) => ({ ...shield })),
    statusEffects: unit.statusEffects.map((effect) => ({ ...effect })),
  };
}

function roundStat(value: number): number {
  return Math.round(value * 100) / 100;
}
