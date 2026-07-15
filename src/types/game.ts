import type { BoardPosition } from './board';
import type { Item, PendingItemChoice } from './item';
import type { PlayerUnit, Unit, UnitClass, UnitOrigin } from './unit';

export const STARTING_PLAYER_HP = 100;
export const STARTING_GOLD = 10;
export const STARTING_LEVEL = 1;
export const STARTING_XP = 0;
export const SHOP_SLOT_COUNT = 5;
export const SHOP_REFRESH_COST = 2;
export const BUY_XP_COST = 4;
export const XP_PER_PURCHASE = 4;
export const MAX_PLAYER_LEVEL = 9;
export const BASE_XP_TO_LEVEL = 6;
export const XP_TO_LEVEL_GROWTH = 2;
export const STARTING_ROUND = 1;
export const STARTING_WIN_STREAK = 0;
export const STARTING_LOSE_STREAK = 0;
export const BASE_ROUND_GOLD = 4;
export const WIN_GOLD_BONUS = 1;
export const LOSS_GOLD_BONUS = 0;
export const DRAW_GOLD_BONUS = 0;
export const ROUND_XP_GAIN = 2;
export const INTEREST_GOLD_INTERVAL = 10;
export const MAX_INTEREST_GOLD = 5;
export const STREAK_BONUS_START = 3;
export const STREAK_BONUS_STEP = 2;
export const STREAK_BONUS_GOLD_PER_STEP = 1;
export const MAX_STREAK_BONUS_GOLD = 3;
export const EASTER_EGG_GOLD_REWARD = 10;
export const EASTER_EGG_REQUIRED_CLICKS = 5;

export type GamePhase = 'prepare' | 'combat' | 'result' | 'reward';

export type RoundType = 'normal' | 'elite' | 'boss';

export type EnemyDifficultyBand = 'early' | 'mid' | 'late';

export type ShopUnitOffer = {
  offerId: string;
  unitId: Unit['id'];
  cost: number;
  isPurchased: boolean;
};

export type ShopActionResult = {
  success: boolean;
  message: string;
};

export type BenchUnitSlot = PlayerUnit | undefined;

export type BoardUnit = PlayerUnit & {
  position: BoardPosition;
};

export type DragSource =
  | {
      kind: 'bench';
      benchIndex: number;
      instanceId: PlayerUnit['instanceId'];
    }
  | {
      kind: 'board';
      position: BoardPosition;
      instanceId: PlayerUnit['instanceId'];
    };

export type UnitDragState = {
  source: DragSource;
  unit: PlayerUnit;
};

export type ItemDragState = {
  source: {
    kind: 'item';
    itemId: Item['id'];
  };
  item: Item;
};

export type DragState = UnitDragState | ItemDragState;

export type PlacementActionResult = {
  success: boolean;
  message: string;
};

export type ActiveSynergy = {
  id: string;
  name: string;
  source: UnitOrigin | UnitClass;
  sourceType: 'origin' | 'class';
  activeTier: SynergyTier;
  unitCount: number;
};

export type SynergyTargetScope = 'allAllies' | 'matchingAllies' | 'enemies';

export type SynergyEffectType =
  | 'attackDamagePercent'
  | 'attackSpeedPercent'
  | 'armorFlat'
  | 'shieldFlat'
  | 'skillPowerPercent'
  | 'enemyAttackSpeedReduction'
  | 'critChancePercent';

export type SynergyTier = {
  requiredUnitCount: number;
  effectType: SynergyEffectType;
  targetScope: SynergyTargetScope;
  value: number;
  description: string;
};

export type SynergyDefinition = {
  id: string;
  name: string;
  source: UnitOrigin | UnitClass;
  sourceType: 'origin' | 'class';
  tiers: SynergyTier[];
};

export type SynergyState = SynergyDefinition & {
  unitCount: number;
  activeTier?: SynergyTier;
  isActive: boolean;
};

export type SynergyDataSet = {
  version: string;
  synergies: SynergyDefinition[];
};

export type BattleResult = {
  result: 'win' | 'loss' | 'draw';
  round: number;
  goldReward: number;
  baseGold: number;
  resultGold: number;
  encounterGold: number;
  streakGold: number;
  interestGold: number;
  xpReward: number;
  nextRound: number;
  winStreak: number;
  loseStreak: number;
};

export type GameStateSnapshot = {
  playerHp: number;
  gold: number;
  level: number;
  xp: number;
  currentRound: number;
  phase: GamePhase;
  winStreak: number;
  loseStreak: number;
  playerItems: Item['id'][];
  pendingItemChoice?: PendingItemChoice;
  shopUnits: ShopUnitOffer[];
  benchUnits: BenchUnitSlot[];
  boardUnits: BoardUnit[];
  activeSynergies: ActiveSynergy[];
  selectedUnitInstanceId?: string;
  items: Item[];
  battleResult?: BattleResult;
};

export type EnemyEncounter = {
  id: string;
  round: number;
  roundType: RoundType;
  difficultyBand: EnemyDifficultyBand;
  name: string;
  units: EnemyUnitDefinition[];
  statMultiplier: number;
  goldReward: number;
  itemRewardIds: Item['id'][];
};

export type EnemyUnitDefinition = {
  unitId: Unit['id'];
  starLevel: PlayerUnit['starLevel'];
  position: BoardPosition;
  itemIds?: Item['id'][];
};

export type EnemyDataSet = {
  version: string;
  encounters: EnemyEncounter[];
};
