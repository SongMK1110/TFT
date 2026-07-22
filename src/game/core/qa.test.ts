import { beforeEach, describe, expect, it } from 'vitest';
import { items } from '../../data/items';
import { synergies } from '../../data/synergies';
import { units } from '../../data/units';
import { calculateRoundReward, applyRoundXp } from './economy/economySystem';
import { applyItemEffects, equipItem, getItemAdjustedUnitStats } from './item/itemSystem';
import { applyBasicAttackLifesteal, applyDamage, calculateBasicAttackDamage, tryRevive } from './combat/damageSystem';
import { stepCombat } from './combat/combatEngine';
import { getBestMovementCandidate } from './combat/movementSystem';
import { getCombatResult } from './combat/resultSystem';
import { findBestTarget } from './combat/targetSystem';
import { getShopTierOdds } from './shop/shopSystem';
import { calculateSynergyStates, getActiveSynergies, applySynergyEffects } from './synergy/synergySystem';
import { resolveUnitUpgrades } from './upgrade/unitUpgradeSystem';
import { loadGameState, SAVE_DATA_VERSION, SAVE_STORAGE_KEY, saveGameState, type SaveableGameState } from './save/saveManager';
import type { BoardUnit } from '../../types/game';
import type { CombatEvent, CombatState, CombatTeam, CombatUnit } from '../../types/combat';
import type { PlayerUnit, Unit } from '../../types/unit';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  clear(): void {
    this.values.clear();
  }
}

const storage = new MemoryStorage();

beforeEach(() => {
  storage.clear();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { localStorage: storage },
  });
});

describe('core regression checks', () => {
  it('combines three matching units while retaining the board position', () => {
    const boardUnit = createBoardUnit('ember-guard', 'board-ember', { row: 3, col: 2 });
    const result = resolveUnitUpgrades({
      boardUnits: [boardUnit],
      benchUnits: [createPlayerUnit('ember-guard', 'bench-ember-a'), createPlayerUnit('ember-guard', 'bench-ember-b')],
      unitPool: units,
    });

    expect(result.boardUnits).toHaveLength(1);
    expect(result.boardUnits[0]).toMatchObject({ instanceId: 'board-ember', starLevel: 2, position: { row: 3, col: 2 } });
    expect(result.benchUnits).toEqual([undefined, undefined]);
  });

  it('activates distinct-unit synergies and applies their combat bonus immutably', () => {
    const boardUnits = [
      createBoardUnit('ember-guard', 'ember', { row: 3, col: 1 }),
      createBoardUnit('cinder-duelist', 'cinder', { row: 3, col: 2 }),
    ];
    const active = getActiveSynergies(calculateSynergyStates(boardUnits, synergies));
    const flame = active.find((synergy) => synergy.id === 'flame');
    const combatUnit = createCombatUnit('ember', 'player', { row: 3, col: 1 }, { attackDamage: 44 });

    expect(flame?.activeTier.value).toBe(8);
    expect(applySynergyEffects([combatUnit], active)[0].attackDamage).toBe(48);
    expect(combatUnit.attackDamage).toBe(44);
  });

  it('applies equipped item stats without changing the source unit', () => {
    const unit = { ...createPlayerUnit('cinder-duelist', 'item-unit'), items: [getItem('iron-blade'), getItem('giant-belt')] };
    const stats = getItemAdjustedUnitStats(unit);

    expect(stats.attackDamage).toBe(unit.attackDamage + 10);
    expect(stats.maxHp).toBe(unit.maxHp + 150);
    expect(unit.attackDamage).toBe(58);
  });

  it('combines matching component items into one completed item without consuming an extra slot', () => {
    const unit = {
      ...createPlayerUnit('cinder-duelist', 'recipe-unit'),
      items: [getItem('iron-blade'), getItem('giant-belt'), getItem('focus-charm')],
    };
    const result = equipItem({
      itemId: 'swift-bow',
      unitInstanceId: unit.instanceId,
      playerItems: ['swift-bow'],
      benchUnits: [unit],
      boardUnits: [],
      itemPool: items,
    });

    expect(result.success).toBe(true);
    expect(result.playerItems).toEqual([]);
    expect(result.benchUnits[0]?.items.map((item) => item.id)).toEqual(['flame-rapidblade', 'giant-belt', 'focus-charm']);
  });

  it('applies frozen heart stats and slows only nearby enemies at combat start', () => {
    const holder = createCombatUnit('holder', 'player', { row: 2, col: 3 }, { items: [getItem('frozen-heart')] });
    const nearbyEnemy = createCombatUnit('nearby-enemy', 'enemy', { row: 0, col: 3 });
    const distantEnemy = createCombatUnit('distant-enemy', 'enemy', { row: 0, col: 6 });
    const applied = applyItemEffects([holder, nearbyEnemy, distantEnemy]);

    expect(applied.find((unit) => unit.instanceId === 'holder')).toMatchObject({ armor: 20, currentMana: 15 });
    expect(applied.find((unit) => unit.instanceId === 'nearby-enemy')?.attackSpeed).toBe(0.8);
    expect(applied.find((unit) => unit.instanceId === 'distant-enemy')?.attackSpeed).toBe(1);
    expect(nearbyEnemy.attackSpeed).toBe(1);
  });

  it('increases giant slayer basic attack damage only against high-health targets', () => {
    const attacker = createCombatUnit('slayer', 'player', { row: 3, col: 3 }, { items: [getItem('giant-slayer')] });
    const highHealthTarget = createCombatUnit('high-health', 'enemy', { row: 0, col: 3 }, { maxHp: 700, currentHp: 700 });
    const standardTarget = createCombatUnit('standard', 'enemy', { row: 0, col: 4 }, { maxHp: 500, currentHp: 500 });
    const [equippedAttacker] = applyItemEffects([attacker]);

    expect(calculateBasicAttackDamage(equippedAttacker, highHealthTarget)).toBe(69);
    expect(calculateBasicAttackDamage(equippedAttacker, standardTarget)).toBe(55);
  });

  it('revives a guardian angel holder once after lethal damage', () => {
    const attacker = createCombatUnit('attacker', 'enemy', { row: 0, col: 3 });
    const target = createCombatUnit('guardian', 'player', { row: 3, col: 3 }, { maxHp: 200, currentHp: 20, items: [getItem('guardian-angel')] });

    applyDamage(attacker, target, 50);
    expect(tryRevive(target)).toMatchObject({ type: 'revive', amount: 70, remainingHp: 70 });
    expect(target.isAlive).toBe(true);

    applyDamage(attacker, target, 100);
    expect(tryRevive(target)).toBeUndefined();
    expect(target.isAlive).toBe(false);
  });

  it('restores health from bloodthirster only after basic attack health damage', () => {
    const attacker = createCombatUnit('vampire', 'player', { row: 3, col: 3 }, { currentHp: 50, items: [getItem('bloodthirster')] });

    expect(applyBasicAttackLifesteal(attacker, 40)).toMatchObject({ type: 'heal', amount: 10, remainingHp: 60 });
    expect(applyBasicAttackLifesteal(attacker, 0)).toBeUndefined();
  });

  it('chains lightning bow damage to two nearby enemies after a basic attack', () => {
    const attacker = createCombatUnit('lightning-archer', 'player', { row: 3, col: 3 }, { attackRange: 4, items: [getItem('lightning-bow')] });
    const primaryTarget = createCombatUnit('primary', 'enemy', { row: 1, col: 3 });
    const firstChainTarget = createCombatUnit('chain-one', 'enemy', { row: 0, col: 3 });
    const secondChainTarget = createCombatUnit('chain-two', 'enemy', { row: 1, col: 4 });
    const distantTarget = createCombatUnit('distant', 'enemy', { row: 0, col: 6 });
    const result = stepCombat({ isRunning: true, elapsedMs: 0, units: [attacker, primaryTarget, firstChainTarget, secondChainTarget, distantTarget], events: [] }, 0);
    const chainEvent = result.events.find((event) => event.type === 'chainLightning');
    const lightningDamageEvents = result.events.filter(
      (event): event is Extract<CombatEvent, { type: 'damage' }> => event.type === 'damage' && event.source === 'item',
    );

    expect(chainEvent).toMatchObject({ type: 'chainLightning', targetInstanceIds: ['chain-one', 'chain-two'] });
    expect(lightningDamageEvents).toHaveLength(2);
    expect(lightningDamageEvents.every((event) => event.damageType === 'magic')).toBe(true);
  });

  it('calculates economy rewards and level progress deterministically', () => {
    const reward = calculateRoundReward({
      outcome: 'win',
      currentGold: 20,
      winStreak: 2,
      loseStreak: 0,
      encounterGold: 1,
    });

    expect(reward).toMatchObject({ baseGold: 4, resultGold: 1, interestGold: 2, streakGold: 1, totalGold: 9 });
    expect(applyRoundXp({ level: 1, xp: 2, xpGain: 4 })).toMatchObject({ level: 2, xp: 0, xpToNextLevel: 8 });
  });

  it('keeps every shop level probability table at 100 percent', () => {
    for (let level = 1; level <= 9; level += 1) {
      const total = getShopTierOdds(level).reduce((sum, odds) => sum + odds.weight, 0);

      expect(total).toBe(100);
    }
  });

  it('rejects corrupt and outdated saves while restoring JSON empty bench slots', () => {
    const saveState = createSaveState();
    const saveResult = saveGameState(saveState);

    expect(saveResult.success).toBe(true);
    const loaded = loadGameState();
    expect(loaded.success && loaded.data.state.benchUnits[0]).toBeUndefined();

    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify({ version: SAVE_DATA_VERSION, savedAt: 'now', state: { ...saveState, boardUnits: [null] } }));
    expect(loadGameState().success).toBe(false);

    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify({ version: SAVE_DATA_VERSION - 1, savedAt: 'now', state: saveState }));
    expect(loadGameState().success).toBe(false);
  });

  it('selects the closest enemy and avoids reserved movement positions', () => {
    const unit = createCombatUnit('player', 'player', { row: 3, col: 3 });
    const nearEnemy = createCombatUnit('near', 'enemy', { row: 1, col: 3 });
    const farEnemy = createCombatUnit('far', 'enemy', { row: 0, col: 6 });
    const selected = findBestTarget(unit, [unit, nearEnemy, farEnemy]);
    const candidate = getBestMovementCandidate(unit, nearEnemy, { row: 2, col: 3 }, [unit, nearEnemy, farEnemy], new Set(['2:3']));

    expect(selected?.target.instanceId).toBe('near');
    expect(candidate).toBeDefined();
    expect(candidate).not.toEqual({ row: 2, col: 3 });
  });

  it('resolves combat results for eliminated teams', () => {
    const player = createCombatUnit('player', 'player', { row: 3, col: 3 });
    const defeatedEnemy = createCombatUnit('enemy', 'enemy', { row: 0, col: 3 }, { currentHp: 0, isAlive: false });
    const state: CombatState = { isRunning: true, elapsedMs: 0, units: [player, defeatedEnemy], events: [] };

    expect(getCombatResult(state)).toBe('playerWin');
  });

  it('marks basic and skill damage with distinct combat event sources', () => {
    const attacker = createCombatUnit('attacker', 'player', { row: 3, col: 3 });
    const target = createCombatUnit('target', 'enemy', { row: 0, col: 3 });

    expect(applyDamage(attacker, target, 10).source).toBe('basicAttack');
    expect(applyDamage(attacker, target, 10, 'skill').source).toBe('skill');
  });
});

function createPlayerUnit(unitId: string, instanceId: string): PlayerUnit {
  const unit = getUnit(unitId);

  return {
    ...unit,
    unitId: unit.id,
    instanceId,
    currentHp: unit.maxHp,
    currentMana: unit.mana,
    starLevel: 1,
    items: [],
  };
}

function createBoardUnit(unitId: string, instanceId: string, position: BoardUnit['position']): BoardUnit {
  return { ...createPlayerUnit(unitId, instanceId), position };
}

function createCombatUnit(
  instanceId: string,
  team: CombatTeam,
  position: CombatUnit['position'],
  overrides: Partial<CombatUnit> = {},
): CombatUnit {
  const unit = getUnit('ember-guard');

  return {
    instanceId,
    unitId: unit.id,
    name: unit.name,
    team,
    origin: unit.origin,
    class: unit.class,
    position,
    maxHp: 100,
    currentHp: 100,
    attackDamage: 40,
    attackSpeed: 1,
    attackRange: 1,
    armor: 0,
    critChance: 0,
    skillPowerMultiplier: 1,
    currentMana: 0,
    maxMana: 70,
    shield: 0,
    shields: [],
    skillId: unit.skillId,
    skill: unit.skill,
    items: [],
    usedItemEffectIds: [],
    statusEffects: [],
    isAlive: true,
    nextAttackAtMs: 0,
    nextMoveAtMs: 0,
    ...overrides,
  };
}

function createSaveState(): SaveableGameState {
  return {
    playerHp: 100,
    gold: 10,
    level: 1,
    xp: 0,
    currentRound: 1,
    phase: 'prepare',
    winStreak: 0,
    loseStreak: 0,
    inventoryItems: [],
    shopUnits: [],
    benchUnits: [undefined],
    boardUnits: [],
    activeSynergies: [],
    shopLocked: false,
    audioSettings: { masterVolume: 1, bgmVolume: 1, sfxVolume: 1, muted: false },
  };
}

function getUnit(unitId: string): Unit {
  const unit = units.find((candidate) => candidate.id === unitId);

  if (!unit) {
    throw new Error(`Unknown unit: ${unitId}`);
  }

  return unit;
}

function getItem(itemId: string) {
  const item = items.find((candidate) => candidate.id === itemId);

  if (!item) {
    throw new Error(`Unknown item: ${itemId}`);
  }

  return item;
}
