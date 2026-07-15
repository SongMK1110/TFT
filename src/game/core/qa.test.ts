import { beforeEach, describe, expect, it } from 'vitest';
import { items } from '../../data/items';
import { synergies } from '../../data/synergies';
import { units } from '../../data/units';
import { calculateRoundReward, applyRoundXp } from './economy/economySystem';
import { getItemAdjustedUnitStats } from './item/itemSystem';
import { getBestMovementCandidate } from './combat/movementSystem';
import { getCombatResult } from './combat/resultSystem';
import { findBestTarget } from './combat/targetSystem';
import { getShopTierOdds } from './shop/shopSystem';
import { calculateSynergyStates, getActiveSynergies, applySynergyEffects } from './synergy/synergySystem';
import { resolveUnitUpgrades } from './upgrade/unitUpgradeSystem';
import { loadGameState, SAVE_DATA_VERSION, SAVE_STORAGE_KEY, saveGameState, type SaveableGameState } from './save/saveManager';
import type { BoardUnit } from '../../types/game';
import type { CombatState, CombatTeam, CombatUnit } from '../../types/combat';
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
