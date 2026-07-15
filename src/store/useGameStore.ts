import { create } from 'zustand';
import { units } from '../data/units';
import { getItemById, items, starterItemIds } from '../data/items';
import { enemies } from '../data/enemies';
import { synergies } from '../data/synergies';
import { createCombatState, resetCombatHp, stepCombat } from '../game/core/combat/combatEngine';
import {
  buyUnit,
  buyXp,
  canBuyUnit,
  createShopOffers,
  getXpToNextLevel,
  refreshShop,
} from '../game/core/shop/shopSystem';
import {
  moveBoardUnit as moveBoardUnitState,
  placeBenchUnitOnBoard as placeBenchUnitOnBoardState,
  returnBoardUnitToBench as returnBoardUnitToBenchState,
} from '../game/core/board/placementSystem';
import {
  applySynergyEffects,
  applySynergyEffectsForTeam,
  calculateSynergyStates,
  getActiveSynergies,
} from '../game/core/synergy/synergySystem';
import { resolveCombatRound } from '../game/core/round/roundSystem';
import { resolveUnitUpgrades } from '../game/core/upgrade/unitUpgradeSystem';
import { applyItemEffects, equipItem, unequipItem } from '../game/core/item/itemSystem';
import { createEnemyArmy, getEnemyEncounterForRound } from '../game/core/ai/enemySystem';
import { sellUnit as sellUnitState } from '../game/core/economy/unitSellSystem';
import {
  hasSavedGame as getHasSavedGame,
  loadGameState,
  normalizeLoadedPhase,
  resetSavedGame,
  saveGameState,
} from '../game/core/save/saveManager';
import { audioManager } from '../game/phaser/audioManager';
import type { AudioSettings } from '../types/audio';
import { BENCH_SLOT_COUNT, type BoardPosition } from '../types/board';
import {
  BUY_XP_COST,
  EASTER_EGG_GOLD_REWARD,
  SHOP_REFRESH_COST,
  STARTING_GOLD,
  STARTING_LEVEL,
  STARTING_LOSE_STREAK,
  STARTING_PLAYER_HP,
  STARTING_ROUND,
  STARTING_WIN_STREAK,
  STARTING_XP,
  type BenchUnitSlot,
  type BattleResult,
  type BoardUnit,
  type GamePhase,
  type PlacementActionResult,
  type ShopActionResult,
  type ShopUnitOffer,
  type ActiveSynergy,
  type SynergyState,
  type DragState,
} from '../types/game';
import type { CombatState } from '../types/combat';
import type { Item, PendingItemChoice } from '../types/item';

type GameState = {
  playerHp: number;
  gold: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  currentRound: number;
  winStreak: number;
  loseStreak: number;
  phase: GamePhase;
  shopUnits: ShopUnitOffer[];
  playerItems: Item['id'][];
  pendingItemChoice?: PendingItemChoice;
  benchUnits: BenchUnitSlot[];
  boardUnits: BoardUnit[];
  synergyStates: SynergyState[];
  activeSynergies: ActiveSynergy[];
  selectedUnitInstanceId?: string;
  combatState?: CombatState;
  dragState?: DragState;
  isShopLocked: boolean;
  battleResult?: BattleResult;
  message?: string;
  audioSettings: AudioSettings;
  hasSavedGame: boolean;
  buyUnit: (offerId: string) => ShopActionResult;
  refreshShop: () => ShopActionResult;
  buyXp: () => ShopActionResult;
  sellUnit: (unitInstanceId: string) => ShopActionResult;
  activateDeveloperGoldCheat: () => ShopActionResult;
  equipItemToUnit: (itemId: Item['id'], unitInstanceId: string) => ShopActionResult;
  unequipItemFromUnit: (unitInstanceId: string, itemIndex: number) => ShopActionResult;
  selectItemChoice: (itemId: Item['id']) => ShopActionResult;
  selectUnit: (unitInstanceId: string) => void;
  toggleShopLock: () => void;
  canBuyOffer: (offerId: string) => boolean;
  startBenchDrag: (benchIndex: number) => PlacementActionResult;
  startBoardDrag: (instanceId: string) => PlacementActionResult;
  startItemDrag: (itemId: Item['id']) => ShopActionResult;
  clearDragState: () => void;
  placeBenchUnitOnBoard: (benchIndex: number, position: BoardPosition) => PlacementActionResult;
  moveBoardUnit: (instanceId: string, position: BoardPosition) => PlacementActionResult;
  returnBoardUnitToBench: (instanceId: string) => PlacementActionResult;
  startCombat: () => PlacementActionResult;
  tickCombat: (deltaMs: number) => void;
  prepareNextRound: () => void;
  saveGame: () => ShopActionResult;
  loadGame: () => ShopActionResult;
  newGame: () => ShopActionResult;
  resetSave: () => ShopActionResult;
  setAudioMuted: (muted: boolean) => void;
  setAudioVolume: (volumeKey: 'masterVolume' | 'bgmVolume' | 'sfxVolume', value: number) => void;
  clearMessage: () => void;
};

const dragBlockedResult: PlacementActionResult = {
  success: false,
  message: '전투 중에는 유닛을 이동할 수 없습니다.',
};

function isPlacementLocked(phase: GamePhase): boolean {
  return phase === 'combat' || phase === 'reward';
}

function isShopLockedByPhase(phase: GamePhase): boolean {
  return phase === 'combat' || phase === 'reward';
}

export const useGameStore = create<GameState>((set, get) => ({
  playerHp: STARTING_PLAYER_HP,
  gold: STARTING_GOLD,
  level: STARTING_LEVEL,
  xp: STARTING_XP,
  xpToNextLevel: getXpToNextLevel(STARTING_LEVEL),
  currentRound: STARTING_ROUND,
  winStreak: STARTING_WIN_STREAK,
  loseStreak: STARTING_LOSE_STREAK,
  phase: 'prepare',
  shopUnits: createShopOffers(units, STARTING_LEVEL),
  playerItems: [],
  pendingItemChoice: {
    reason: 'starter',
    itemIds: [...starterItemIds],
  },
  benchUnits: Array.from({ length: BENCH_SLOT_COUNT }),
  boardUnits: [],
  synergyStates: calculateSynergyStates([], synergies),
  activeSynergies: [],
  selectedUnitInstanceId: undefined,
  combatState: undefined,
  dragState: undefined,
  isShopLocked: false,
  battleResult: undefined,
  message: undefined,
  audioSettings: audioManager.getSettings(),
  hasSavedGame: getHasSavedGame(),
  buyUnit: (offerId) => {
    const state = get();

    if (isShopLockedByPhase(state.phase)) {
      const result = { success: false, message: '전투 중에는 유닛을 구매할 수 없습니다.' };
      set({ message: result.message });
      return result;
    }

    const result = buyUnit({
      offerId,
      gold: state.gold,
      benchUnits: state.benchUnits,
      shopUnits: state.shopUnits,
      unitPool: units,
    });

    if (result.success) {
      const upgradeSnapshot = getUpgradeSnapshot(result.benchUnits, state.boardUnits);
      const selectedUnitInstanceId = resolveSelectedUnitId(
        state.selectedUnitInstanceId,
        upgradeSnapshot.benchUnits,
        upgradeSnapshot.boardUnits,
      );
      set({
        gold: result.gold,
        benchUnits: upgradeSnapshot.benchUnits,
        boardUnits: upgradeSnapshot.boardUnits,
        synergyStates: upgradeSnapshot.synergyStates,
        activeSynergies: upgradeSnapshot.activeSynergies,
        selectedUnitInstanceId,
        shopUnits: result.shopUnits,
        message: getUpgradeMessage(result.message, upgradeSnapshot.upgradedUnitNames),
      });
      audioManager.playSfx(upgradeSnapshot.upgradedUnitNames.length > 0 ? 'unitUpgrade' : 'unitBuy');
    } else {
      set({ message: result.message });
      audioManager.playSfx('error');
    }

    return result;
  },
  refreshShop: () => {
    const state = get();

    if (isShopLockedByPhase(state.phase)) {
      const result = { success: false, message: '전투 중에는 상점을 새로고침할 수 없습니다.' };
      set({ message: result.message });
      return result;
    }

    const result = refreshShop({
      gold: state.gold,
      level: state.level,
      isShopLocked: state.isShopLocked,
      unitPool: units,
    });

    if (result.success) {
      set({
        gold: result.gold,
        shopUnits: result.shopUnits,
        message: result.message,
      });
      audioManager.playSfx('shopRefresh');
    } else {
      set({ message: result.message });
      audioManager.playSfx('error');
    }

    return result;
  },
  buyXp: () => {
    const state = get();

    if (isShopLockedByPhase(state.phase)) {
      const result = { success: false, message: '전투 중에는 XP를 구매할 수 없습니다.' };
      set({ message: result.message });
      return result;
    }

    const result = buyXp({
      gold: state.gold,
      level: state.level,
      xp: state.xp,
    });

    if (result.success) {
      set({
        gold: result.gold,
        level: result.level,
        xp: result.xp,
        xpToNextLevel: getXpToNextLevel(result.level),
        message: result.message,
      });
      audioManager.playSfx('coin');
    } else {
      set({ message: result.message });
      audioManager.playSfx('error');
    }

    return result;
  },
  sellUnit: (unitInstanceId) => {
    const state = get();

    if (isPlacementLocked(state.phase)) {
      const result = { success: false, message: '전투 중에는 유닛을 판매할 수 없습니다.' };
      set({ message: result.message });
      return result;
    }

    const result = sellUnitState({
      unitInstanceId,
      gold: state.gold,
      benchUnits: state.benchUnits,
      boardUnits: state.boardUnits,
    });

    if (!result.success) {
      set({ message: result.message });
      return result;
    }

    const synergySnapshot = getSynergySnapshot(result.boardUnits);

    set({
      gold: result.gold,
      benchUnits: result.benchUnits,
      boardUnits: result.boardUnits,
      playerItems: [...state.playerItems, ...result.returnedItemIds],
      synergyStates: synergySnapshot.synergyStates,
      activeSynergies: synergySnapshot.activeSynergies,
      selectedUnitInstanceId: resolveSelectedUnitId(state.selectedUnitInstanceId, result.benchUnits, result.boardUnits),
      dragState: undefined,
      message: result.message,
    });
    audioManager.playSfx('coin');

    return result;
  },
  activateDeveloperGoldCheat: () => {
    const state = get();
    const result = {
      success: true,
      message: `개발자 골드 치트 · ${EASTER_EGG_GOLD_REWARD}골드 획득`,
    };

    set({
      gold: state.gold + EASTER_EGG_GOLD_REWARD,
      message: result.message,
    });
    audioManager.playSfx('coin');

    return result;
  },
  equipItemToUnit: (itemId, unitInstanceId) => {
    const state = get();

    if (isPlacementLocked(state.phase)) {
      const result = { success: false, message: '전투 중에는 아이템을 장착할 수 없습니다.' };
      set({ message: result.message });
      return result;
    }

    const result = equipItem({
      itemId,
      unitInstanceId,
      playerItems: state.playerItems,
      benchUnits: state.benchUnits,
      boardUnits: state.boardUnits,
      itemPool: items,
    });

    if (!result.success) {
      set({ message: result.message });
      return result;
    }

    set({
      playerItems: result.playerItems,
      benchUnits: result.benchUnits,
      boardUnits: result.boardUnits,
      selectedUnitInstanceId: resolveSelectedUnitId(state.selectedUnitInstanceId, result.benchUnits, result.boardUnits),
      message: result.message,
    });
    audioManager.playSfx('itemEquip');

    return result;
  },
  unequipItemFromUnit: (unitInstanceId, itemIndex) => {
    const state = get();

    if (isPlacementLocked(state.phase)) {
      const result = { success: false, message: '전투 중에는 아이템을 해제할 수 없습니다.' };
      set({ message: result.message });
      return result;
    }

    const result = unequipItem({
      unitInstanceId,
      itemIndex,
      playerItems: state.playerItems,
      benchUnits: state.benchUnits,
      boardUnits: state.boardUnits,
    });

    if (!result.success) {
      set({ message: result.message });
      return result;
    }

    set({
      playerItems: result.playerItems,
      benchUnits: result.benchUnits,
      boardUnits: result.boardUnits,
      selectedUnitInstanceId: resolveSelectedUnitId(state.selectedUnitInstanceId, result.benchUnits, result.boardUnits),
      message: result.message,
    });
    audioManager.playSfx('itemEquip');

    return result;
  },
  selectItemChoice: (itemId) => {
    const state = get();
    const pendingChoice = state.pendingItemChoice;

    if (!pendingChoice || !pendingChoice.itemIds.includes(itemId)) {
      const result = { success: false, message: '선택할 수 있는 아이템이 아닙니다.' };
      set({ message: result.message });
      return result;
    }

    const item = items.find((candidate) => candidate.id === itemId);
    const result = {
      success: true,
      message: `${item?.name ?? '아이템'} 획득`,
    };

    set({
      playerItems: [...state.playerItems, itemId],
      pendingItemChoice: undefined,
      message: result.message,
    });
    audioManager.playSfx('itemEquip');

    return result;
  },
  selectUnit: (unitInstanceId) => {
    const state = get();
    const hasUnit =
      state.boardUnits.some((unit) => unit.instanceId === unitInstanceId) ||
      state.benchUnits.some((unit) => unit?.instanceId === unitInstanceId);

    if (hasUnit) {
      set({ selectedUnitInstanceId: unitInstanceId });
    }
  },
  toggleShopLock: () => {
    if (isShopLockedByPhase(get().phase)) {
      set({ message: '전투 중에는 상점 잠금을 변경할 수 없습니다.' });
      return;
    }

    const nextLockedState = !get().isShopLocked;
    set({
      isShopLocked: nextLockedState,
      message: nextLockedState ? '상점이 잠겼습니다.' : '상점 잠금을 해제했습니다.',
    });
  },
  canBuyOffer: (offerId) => {
    const state = get();
    const offer = state.shopUnits.find((shopOffer) => shopOffer.offerId === offerId);

    return offer && !isShopLockedByPhase(state.phase) ? canBuyUnit(offer, state.gold, state.benchUnits) : false;
  },
  startBenchDrag: (benchIndex) => {
    const state = get();

    if (isPlacementLocked(state.phase)) {
      set({ message: dragBlockedResult.message });
      return dragBlockedResult;
    }

    const unit = state.benchUnits[benchIndex];

    if (!unit) {
      const result = { success: false, message: '빈 벤치 슬롯입니다.' };
      set({ message: result.message });
      return result;
    }

    set({
      dragState: {
        source: { kind: 'bench', benchIndex, instanceId: unit.instanceId },
        unit,
      },
      message: undefined,
    });

    return { success: true, message: '유닛을 드래그하고 있습니다.' };
  },
  startBoardDrag: (instanceId) => {
    const state = get();

    if (isPlacementLocked(state.phase)) {
      set({ message: dragBlockedResult.message });
      return dragBlockedResult;
    }

    const unit = state.boardUnits.find((boardUnit) => boardUnit.instanceId === instanceId);

    if (!unit) {
      const result = { success: false, message: '보드에서 유닛을 찾을 수 없습니다.' };
      set({ message: result.message });
      return result;
    }

    set({
      dragState: {
        source: { kind: 'board', position: unit.position, instanceId },
        unit,
      },
      message: undefined,
    });

    return { success: true, message: '유닛을 드래그하고 있습니다.' };
  },
  startItemDrag: (itemId) => {
    const state = get();

    if (isPlacementLocked(state.phase)) {
      const result = { success: false, message: '전투 중에는 아이템을 장착할 수 없습니다.' };
      set({ message: result.message });
      return result;
    }

    const item = getItemById(itemId);

    if (!item || !state.playerItems.includes(itemId)) {
      const result = { success: false, message: '보유한 아이템을 찾을 수 없습니다.' };
      set({ message: result.message });
      return result;
    }

    set({ dragState: { source: { kind: 'item', itemId }, item }, message: undefined });

    return { success: true, message: `${item.name}을 드래그하고 있습니다.` };
  },
  clearDragState: () => set({ dragState: undefined }),
  placeBenchUnitOnBoard: (benchIndex, position) => {
    const state = get();

    if (isPlacementLocked(state.phase)) {
      set({ dragState: undefined, message: dragBlockedResult.message });
      return dragBlockedResult;
    }

    const result = placeBenchUnitOnBoardState({
      benchIndex,
      position,
      benchUnits: state.benchUnits,
      boardUnits: state.boardUnits,
      level: state.level,
    });

    if (!result.success) {
      set({ dragState: undefined, message: result.message });
      return result;
    }

    const upgradeSnapshot = getUpgradeSnapshot(result.benchUnits, result.boardUnits);
    const selectedUnitInstanceId = resolveSelectedUnitId(
      state.selectedUnitInstanceId,
      upgradeSnapshot.benchUnits,
      upgradeSnapshot.boardUnits,
    );

    set({
      benchUnits: upgradeSnapshot.benchUnits,
      boardUnits: upgradeSnapshot.boardUnits,
      synergyStates: upgradeSnapshot.synergyStates,
      activeSynergies: upgradeSnapshot.activeSynergies,
      selectedUnitInstanceId,
      dragState: undefined,
      message: getUpgradeMessage(result.message, upgradeSnapshot.upgradedUnitNames),
    });
    if (upgradeSnapshot.upgradedUnitNames.length > 0) {
      audioManager.playSfx('unitUpgrade');
    }

    return result;
  },
  moveBoardUnit: (instanceId, position) => {
    const state = get();

    if (isPlacementLocked(state.phase)) {
      set({ dragState: undefined, message: dragBlockedResult.message });
      return dragBlockedResult;
    }

    const result = moveBoardUnitState({
      instanceId,
      position,
      benchUnits: state.benchUnits,
      boardUnits: state.boardUnits,
    });

    if (!result.success) {
      set({ dragState: undefined, message: result.message });
      return result;
    }

    const upgradeSnapshot = getUpgradeSnapshot(result.benchUnits, result.boardUnits);
    const selectedUnitInstanceId = resolveSelectedUnitId(
      state.selectedUnitInstanceId,
      upgradeSnapshot.benchUnits,
      upgradeSnapshot.boardUnits,
    );

    set({
      benchUnits: upgradeSnapshot.benchUnits,
      boardUnits: upgradeSnapshot.boardUnits,
      synergyStates: upgradeSnapshot.synergyStates,
      activeSynergies: upgradeSnapshot.activeSynergies,
      selectedUnitInstanceId,
      dragState: undefined,
      message: getUpgradeMessage(result.message, upgradeSnapshot.upgradedUnitNames),
    });
    if (upgradeSnapshot.upgradedUnitNames.length > 0) {
      audioManager.playSfx('unitUpgrade');
    }

    return result;
  },
  returnBoardUnitToBench: (instanceId) => {
    const state = get();

    if (isPlacementLocked(state.phase)) {
      set({ dragState: undefined, message: dragBlockedResult.message });
      return dragBlockedResult;
    }

    const result = returnBoardUnitToBenchState({
      instanceId,
      benchUnits: state.benchUnits,
      boardUnits: state.boardUnits,
    });

    if (!result.success) {
      set({ dragState: undefined, message: result.message });
      return result;
    }

    const upgradeSnapshot = getUpgradeSnapshot(result.benchUnits, result.boardUnits);
    const selectedUnitInstanceId = resolveSelectedUnitId(
      state.selectedUnitInstanceId,
      upgradeSnapshot.benchUnits,
      upgradeSnapshot.boardUnits,
    );

    set({
      benchUnits: upgradeSnapshot.benchUnits,
      boardUnits: upgradeSnapshot.boardUnits,
      synergyStates: upgradeSnapshot.synergyStates,
      activeSynergies: upgradeSnapshot.activeSynergies,
      selectedUnitInstanceId,
      dragState: undefined,
      message: getUpgradeMessage(result.message, upgradeSnapshot.upgradedUnitNames),
    });
    if (upgradeSnapshot.upgradedUnitNames.length > 0) {
      audioManager.playSfx('unitUpgrade');
    }

    return result;
  },
  startCombat: () => {
    const state = get();

    if (state.phase === 'combat') {
      return { success: false, message: '이미 전투가 진행 중입니다.' };
    }

    if (state.boardUnits.length === 0) {
      const result = { success: false, message: '보드에 유닛을 1명 이상 배치해야 합니다.' };
      set({ message: result.message });
      return result;
    }

    if (state.pendingItemChoice) {
      const result = { success: false, message: '아이템 보상을 먼저 선택해야 합니다.' };
      set({ message: result.message });
      return result;
    }

    const enemyArmy = createEnemyArmy({
      currentRound: state.currentRound,
      encounters: enemies,
      unitPool: units,
      itemPool: items,
      synergyDefinitions: synergies,
    });
    const baseCombatState = createCombatState({
      playerUnits: resetCombatHp(state.boardUnits),
      enemyUnits: enemyArmy.units,
    });
    const itemAppliedUnits = applyItemEffects(baseCombatState.units);
    const playerSynergyUnits = applySynergyEffects(itemAppliedUnits, state.activeSynergies);
    const combatState = {
      ...baseCombatState,
      units: applySynergyEffectsForTeam(playerSynergyUnits, enemyArmy.activeSynergies, 'enemy'),
    };

    set({
      phase: 'combat',
      combatState,
      battleResult: undefined,
      dragState: undefined,
      boardUnits: resetCombatHp(state.boardUnits),
      message: `${enemyArmy.encounter.name} 전투 시작`,
    });

    return { success: true, message: '전투를 시작했습니다.' };
  },
  tickCombat: (deltaMs) => {
    const state = get();

    if (state.phase !== 'combat' || !state.combatState?.isRunning) {
      return;
    }

    const result = stepCombat(state.combatState, deltaMs);
    const nextCombatState = result.state;

    if (!nextCombatState.result) {
      set({ combatState: nextCombatState });
      return;
    }

    const encounter = getEnemyEncounterForRound(state.currentRound, enemies);
    const roundResolution = resolveCombatRound({
      combatResult: nextCombatState.result,
      currentRound: state.currentRound,
      currentGold: state.gold,
      level: state.level,
      xp: state.xp,
      winStreak: state.winStreak,
      loseStreak: state.loseStreak,
      encounter,
      isShopLocked: state.isShopLocked,
    });
    const itemRewards = roundResolution.battleResult.result === 'win' ? encounter.itemRewardIds : [];
    set({
      phase: roundResolution.phase,
      combatState: undefined,
      battleResult: roundResolution.battleResult,
      gold: roundResolution.gold,
      level: roundResolution.level,
      xp: roundResolution.xp,
      xpToNextLevel: roundResolution.xpToNextLevel,
      currentRound: roundResolution.nextRound,
      winStreak: roundResolution.winStreak,
      loseStreak: roundResolution.loseStreak,
      pendingItemChoice:
        itemRewards.length > 0
          ? {
              reason: 'roundReward',
              itemIds: itemRewards,
            }
          : state.pendingItemChoice,
      shopUnits: roundResolution.shouldRefreshShop ? createShopOffers(units, roundResolution.level) : state.shopUnits,
      boardUnits: resetCombatHp(state.boardUnits),
      selectedUnitInstanceId: resolveSelectedUnitId(state.selectedUnitInstanceId, state.benchUnits, state.boardUnits),
      message: roundResolution.message,
    });
    if (roundResolution.battleResult.result === 'win') {
      audioManager.playSfx('victory');
    } else if (roundResolution.battleResult.result === 'loss') {
      audioManager.playSfx('defeat');
    }
  },
  prepareNextRound: () => {
    const state = get();

    set({
      phase: 'prepare',
      combatState: undefined,
      battleResult: undefined,
      boardUnits: resetCombatHp(state.boardUnits),
      message: '다음 라운드 준비',
    });
  },
  saveGame: () => {
    const state = get();
    const result = saveGameState({
      playerHp: state.playerHp,
      gold: state.gold,
      level: state.level,
      xp: state.xp,
      currentRound: state.currentRound,
      phase: state.phase,
      shopUnits: state.shopUnits,
      benchUnits: state.benchUnits,
      boardUnits: state.boardUnits,
      inventoryItems: state.playerItems,
      activeSynergies: state.activeSynergies,
      winStreak: state.winStreak,
      loseStreak: state.loseStreak,
      shopLocked: state.isShopLocked,
      audioSettings: state.audioSettings,
    });

    set({
      hasSavedGame: result.success ? true : state.hasSavedGame,
      message: result.message,
    });

    return { success: result.success, message: result.message };
  },
  loadGame: () => {
    const result = loadGameState();

    if (!result.success) {
      set({ hasSavedGame: getHasSavedGame(), message: result.message });
      return result;
    }

    const loadedState = result.data.state;
    const boardUnits = resetCombatHp(loadedState.boardUnits);
    const synergySnapshot = getSynergySnapshot(boardUnits);
    const audioSettings = loadedState.audioSettings;

    audioManager.applySettings(audioSettings);
    set({
      playerHp: loadedState.playerHp,
      gold: loadedState.gold,
      level: loadedState.level,
      xp: loadedState.xp,
      xpToNextLevel: getXpToNextLevel(loadedState.level),
      currentRound: loadedState.currentRound,
      winStreak: loadedState.winStreak,
      loseStreak: loadedState.loseStreak,
      phase: normalizeLoadedPhase(loadedState.phase),
      shopUnits: loadedState.shopUnits,
      playerItems: loadedState.inventoryItems,
      pendingItemChoice: undefined,
      benchUnits: loadedState.benchUnits,
      boardUnits,
      synergyStates: synergySnapshot.synergyStates,
      activeSynergies: synergySnapshot.activeSynergies,
      selectedUnitInstanceId: resolveSelectedUnitId(undefined, loadedState.benchUnits, boardUnits),
      combatState: undefined,
      dragState: undefined,
      isShopLocked: loadedState.shopLocked,
      battleResult: undefined,
      audioSettings,
      hasSavedGame: true,
      message: result.message,
    });

    return { success: true, message: result.message };
  },
  newGame: () => {
    const audioSettings = get().audioSettings;

    set({
      ...createInitialGameData(audioSettings),
      hasSavedGame: getHasSavedGame(),
      message: '새 게임을 시작했습니다.',
    });

    return { success: true, message: '새 게임을 시작했습니다.' };
  },
  resetSave: () => {
    const didReset = resetSavedGame();
    const message = didReset ? '저장 데이터를 삭제했습니다.' : '삭제할 저장 데이터가 없습니다.';

    set({
      hasSavedGame: getHasSavedGame(),
      message,
    });

    return { success: didReset, message };
  },
  setAudioMuted: (muted) => {
    audioManager.setMuted(muted);
    set({ audioSettings: audioManager.getSettings() });
  },
  setAudioVolume: (volumeKey, value) => {
    const normalizedValue = Math.min(1, Math.max(0, value));

    audioManager.setVolumes({ [volumeKey]: normalizedValue });
    set({ audioSettings: audioManager.getSettings() });
  },
  clearMessage: () => set({ message: undefined }),
}));

export const shopCosts = {
  refresh: SHOP_REFRESH_COST,
  buyXp: BUY_XP_COST,
  benchSlots: BENCH_SLOT_COUNT,
} as const;

type GameDataFields = Pick<
  GameState,
  | 'playerHp'
  | 'gold'
  | 'level'
  | 'xp'
  | 'xpToNextLevel'
  | 'currentRound'
  | 'winStreak'
  | 'loseStreak'
  | 'phase'
  | 'shopUnits'
  | 'playerItems'
  | 'pendingItemChoice'
  | 'benchUnits'
  | 'boardUnits'
  | 'synergyStates'
  | 'activeSynergies'
  | 'selectedUnitInstanceId'
  | 'combatState'
  | 'dragState'
  | 'isShopLocked'
  | 'battleResult'
  | 'audioSettings'
>;

function createInitialGameData(audioSettings: AudioSettings): GameDataFields {
  return {
    playerHp: STARTING_PLAYER_HP,
    gold: STARTING_GOLD,
    level: STARTING_LEVEL,
    xp: STARTING_XP,
    xpToNextLevel: getXpToNextLevel(STARTING_LEVEL),
    currentRound: STARTING_ROUND,
    winStreak: STARTING_WIN_STREAK,
    loseStreak: STARTING_LOSE_STREAK,
    phase: 'prepare',
    shopUnits: createShopOffers(units, STARTING_LEVEL),
    playerItems: [],
    pendingItemChoice: {
      reason: 'starter',
      itemIds: [...starterItemIds],
    },
    benchUnits: Array.from({ length: BENCH_SLOT_COUNT }),
    boardUnits: [],
    synergyStates: calculateSynergyStates([], synergies),
    activeSynergies: [],
    selectedUnitInstanceId: undefined,
    combatState: undefined,
    dragState: undefined,
    isShopLocked: false,
    battleResult: undefined,
    audioSettings,
  };
}

function getSynergySnapshot(boardUnits: BoardUnit[]) {
  const synergyStates = calculateSynergyStates(boardUnits, synergies);

  return {
    synergyStates,
    activeSynergies: getActiveSynergies(synergyStates),
  };
}

function getUpgradeSnapshot(benchUnits: BenchUnitSlot[], boardUnits: BoardUnit[]) {
  const upgradeResult = resolveUnitUpgrades({
    benchUnits,
    boardUnits,
    unitPool: units,
  });
  const synergySnapshot = getSynergySnapshot(upgradeResult.boardUnits);

  return {
    ...upgradeResult,
    ...synergySnapshot,
    upgradedUnitNames: upgradeResult.upgradedUnits.map(
      (unit) => `${unit.name} ${unit.starLevel}성`,
    ),
  };
}

function resolveSelectedUnitId(
  selectedUnitInstanceId: string | undefined,
  benchUnits: BenchUnitSlot[],
  boardUnits: BoardUnit[],
): string | undefined {
  if (
    selectedUnitInstanceId &&
    (boardUnits.some((unit) => unit.instanceId === selectedUnitInstanceId) ||
      benchUnits.some((unit) => unit?.instanceId === selectedUnitInstanceId))
  ) {
    return selectedUnitInstanceId;
  }

  return boardUnits[0]?.instanceId ?? benchUnits.find((unit) => Boolean(unit))?.instanceId;
}

function getUpgradeMessage(message: string, upgradedUnitNames: string[]): string {
  if (upgradedUnitNames.length === 0) {
    return message;
  }

  return `${message} · ${upgradedUnitNames.join(', ')} 합성`;
}
