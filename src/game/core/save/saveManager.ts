import type { AudioSettings } from '../../../types/audio';
import type { BenchUnitSlot, BoardUnit, GamePhase, ShopUnitOffer, ActiveSynergy } from '../../../types/game';
import type { Item } from '../../../types/item';
import type { PlayerUnit } from '../../../types/unit';

export const SAVE_DATA_VERSION = 1;
export const SAVE_STORAGE_KEY = 'auto-battler-save-v1';

export type SaveableGameState = {
  playerHp: number;
  gold: number;
  level: number;
  xp: number;
  currentRound: number;
  phase: GamePhase;
  shopUnits: ShopUnitOffer[];
  benchUnits: BenchUnitSlot[];
  boardUnits: BoardUnit[];
  inventoryItems: Item['id'][];
  activeSynergies: ActiveSynergy[];
  winStreak: number;
  loseStreak: number;
  shopLocked: boolean;
  audioSettings: AudioSettings;
};

export type GameSaveData = {
  version: number;
  savedAt: string;
  state: SaveableGameState;
};

export type SaveLoadResult =
  | {
      success: true;
      data: GameSaveData;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

export function saveGameState(state: SaveableGameState): SaveLoadResult {
  if (!canUseLocalStorage()) {
    return { success: false, message: '이 브라우저에서는 저장소를 사용할 수 없습니다.' };
  }

  const data: GameSaveData = {
    version: SAVE_DATA_VERSION,
    savedAt: new Date().toISOString(),
    state,
  };

  try {
    window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(data));
    return { success: true, data, message: '게임을 저장했습니다.' };
  } catch {
    return { success: false, message: '저장 중 문제가 발생했습니다.' };
  }
}

export function loadGameState(): SaveLoadResult {
  if (!canUseLocalStorage()) {
    return { success: false, message: '이 브라우저에서는 저장소를 사용할 수 없습니다.' };
  }

  try {
    const rawData = window.localStorage.getItem(SAVE_STORAGE_KEY);

    if (!rawData) {
      return { success: false, message: '저장된 게임이 없습니다.' };
    }

    const parsedData = JSON.parse(rawData) as unknown;
    const migratedData = migrateSaveData(parsedData);

    if (!migratedData) {
      return { success: false, message: '저장 데이터가 손상되어 불러올 수 없습니다.' };
    }

    return { success: true, data: migratedData, message: '저장된 게임을 불러왔습니다.' };
  } catch {
    return { success: false, message: '저장 데이터를 읽는 중 문제가 발생했습니다.' };
  }
}

export function resetSavedGame(): boolean {
  if (!canUseLocalStorage()) {
    return false;
  }

  try {
    window.localStorage.removeItem(SAVE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function hasSavedGame(): boolean {
  if (!canUseLocalStorage()) {
    return false;
  }

  try {
    return Boolean(window.localStorage.getItem(SAVE_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function normalizeLoadedPhase(phase: GamePhase): GamePhase {
  return phase === 'prepare' ? phase : 'prepare';
}

function migrateSaveData(data: unknown): GameSaveData | undefined {
  if (!isSaveDataLike(data)) {
    return undefined;
  }

  if (data.version !== SAVE_DATA_VERSION) {
    return undefined;
  }

  return {
    ...data,
    state: {
      ...data.state,
      // JSON serializes empty bench slots as null; restore the runtime representation.
      benchUnits: data.state.benchUnits.map((unit) => unit ?? undefined),
    },
  };
}

function isSaveDataLike(data: unknown): data is GameSaveData {
  if (!isRecord(data) || data.version !== SAVE_DATA_VERSION || typeof data.savedAt !== 'string') {
    return false;
  }

  if (!isRecord(data.state)) {
    return false;
  }

  const state = data.state;

  return (
    typeof state.playerHp === 'number' &&
    typeof state.gold === 'number' &&
    typeof state.level === 'number' &&
    typeof state.xp === 'number' &&
    typeof state.currentRound === 'number' &&
    isGamePhase(state.phase) &&
    Array.isArray(state.shopUnits) && state.shopUnits.every(isShopUnitOfferLike) &&
    Array.isArray(state.benchUnits) && state.benchUnits.every((unit) => unit === null || isPlayerUnitLike(unit)) &&
    Array.isArray(state.boardUnits) && state.boardUnits.every(isBoardUnitLike) &&
    Array.isArray(state.inventoryItems) && state.inventoryItems.every((itemId) => typeof itemId === 'string') &&
    Array.isArray(state.activeSynergies) &&
    typeof state.winStreak === 'number' &&
    typeof state.loseStreak === 'number' &&
    typeof state.shopLocked === 'boolean' &&
    isAudioSettingsLike(state.audioSettings)
  );
}

function isShopUnitOfferLike(value: unknown): value is ShopUnitOffer {
  return (
    isRecord(value) &&
    typeof value.offerId === 'string' &&
    typeof value.unitId === 'string' &&
    typeof value.cost === 'number' &&
    typeof value.isPurchased === 'boolean'
  );
}

function isBoardUnitLike(value: unknown): value is BoardUnit {
  return (
    isPlayerUnitLike(value) &&
    isRecord(value.position) &&
    typeof value.position.row === 'number' &&
    typeof value.position.col === 'number'
  );
}

function isPlayerUnitLike(value: unknown): value is PlayerUnit {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.unitId === 'string' &&
    typeof value.instanceId === 'string' &&
    typeof value.name === 'string' &&
    typeof value.cost === 'number' &&
    typeof value.maxHp === 'number' &&
    typeof value.currentHp === 'number' &&
    typeof value.attackDamage === 'number' &&
    typeof value.attackSpeed === 'number' &&
    typeof value.attackRange === 'number' &&
    typeof value.armor === 'number' &&
    typeof value.currentMana === 'number' &&
    typeof value.maxMana === 'number' &&
    (value.starLevel === 1 || value.starLevel === 2 || value.starLevel === 3) &&
    Array.isArray(value.items) && value.items.every(isItemLike)
  );
}

function isItemLike(value: unknown): value is Item {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    isRecord(value.statBonus) &&
    Array.isArray(value.effects)
  );
}

function isAudioSettingsLike(value: unknown): value is AudioSettings {
  return (
    isRecord(value) &&
    typeof value.masterVolume === 'number' &&
    typeof value.bgmVolume === 'number' &&
    typeof value.sfxVolume === 'number' &&
    typeof value.muted === 'boolean'
  );
}

function isGamePhase(value: unknown): value is GamePhase {
  return value === 'prepare' || value === 'combat' || value === 'result' || value === 'reward';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function canUseLocalStorage(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return Boolean(window.localStorage);
  } catch {
    return false;
  }
}
