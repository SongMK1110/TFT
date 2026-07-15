import { applyRoundXp, getXpToNextLevel } from '../economy/economySystem';
import {
  BUY_XP_COST,
  MAX_PLAYER_LEVEL,
  SHOP_REFRESH_COST,
  SHOP_SLOT_COUNT,
  XP_PER_PURCHASE,
  type BenchUnitSlot,
  type ShopActionResult,
  type ShopUnitOffer,
} from '../../../types/game';
import type { PlayerUnit, Unit, UnitTier } from '../../../types/unit';

export type TierProbability = {
  tier: UnitTier;
  weight: number;
};

export type BuyUnitInput = {
  offerId: string;
  gold: number;
  benchUnits: BenchUnitSlot[];
  shopUnits: ShopUnitOffer[];
  unitPool: Unit[];
};

export type BuyUnitOutput = ShopActionResult & {
  gold: number;
  benchUnits: BenchUnitSlot[];
  shopUnits: ShopUnitOffer[];
};

export type RefreshShopInput = {
  gold: number;
  level: number;
  isShopLocked: boolean;
  unitPool: Unit[];
};

export type RefreshShopOutput = ShopActionResult & {
  gold: number;
  shopUnits: ShopUnitOffer[];
};

export type BuyXpInput = {
  gold: number;
  level: number;
  xp: number;
};

export type BuyXpOutput = ShopActionResult & {
  gold: number;
  level: number;
  xp: number;
};

const tierOddsByLevel: Record<number, TierProbability[]> = {
  1: [
    { tier: 'common', weight: 100 },
    { tier: 'rare', weight: 0 },
    { tier: 'epic', weight: 0 },
    { tier: 'legendary', weight: 0 },
  ],
  2: [
    { tier: 'common', weight: 75 },
    { tier: 'rare', weight: 25 },
    { tier: 'epic', weight: 0 },
    { tier: 'legendary', weight: 0 },
  ],
  3: [
    { tier: 'common', weight: 55 },
    { tier: 'rare', weight: 35 },
    { tier: 'epic', weight: 10 },
    { tier: 'legendary', weight: 0 },
  ],
  4: [
    { tier: 'common', weight: 40 },
    { tier: 'rare', weight: 40 },
    { tier: 'epic', weight: 19 },
    { tier: 'legendary', weight: 1 },
  ],
  5: [
    { tier: 'common', weight: 30 },
    { tier: 'rare', weight: 40 },
    { tier: 'epic', weight: 27 },
    { tier: 'legendary', weight: 3 },
  ],
  6: [
    { tier: 'common', weight: 20 },
    { tier: 'rare', weight: 35 },
    { tier: 'epic', weight: 35 },
    { tier: 'legendary', weight: 10 },
  ],
  7: [
    { tier: 'common', weight: 14 },
    { tier: 'rare', weight: 28 },
    { tier: 'epic', weight: 40 },
    { tier: 'legendary', weight: 18 },
  ],
  8: [
    { tier: 'common', weight: 10 },
    { tier: 'rare', weight: 20 },
    { tier: 'epic', weight: 42 },
    { tier: 'legendary', weight: 28 },
  ],
  9: [
    { tier: 'common', weight: 5 },
    { tier: 'rare', weight: 15 },
    { tier: 'epic', weight: 40 },
    { tier: 'legendary', weight: 40 },
  ],
};

export function getShopTierOdds(level: number): readonly TierProbability[] {
  const clampedLevel = Math.min(Math.max(level, 1), MAX_PLAYER_LEVEL);

  return tierOddsByLevel[clampedLevel];
}

export function createShopOffers(unitPool: Unit[], level: number): ShopUnitOffer[] {
  return Array.from({ length: SHOP_SLOT_COUNT }, (_, index) => {
    const unit = pickShopUnit(unitPool, level);

    return {
      offerId: `offer-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      unitId: unit.id,
      cost: unit.cost,
      isPurchased: false,
    };
  });
}

export function buyUnit(input: BuyUnitInput): BuyUnitOutput {
  const offer = input.shopUnits.find((shopOffer) => shopOffer.offerId === input.offerId);

  if (!offer || offer.isPurchased) {
    return { success: false, message: '이미 구매했거나 사라진 유닛입니다.', ...input };
  }

  const unit = input.unitPool.find((candidate) => candidate.id === offer.unitId);

  if (!unit) {
    return { success: false, message: '유닛 데이터를 찾을 수 없습니다.', ...input };
  }

  if (input.gold < offer.cost) {
    return { success: false, message: '골드가 부족합니다.', ...input };
  }

  const emptyBenchIndex = input.benchUnits.findIndex((benchUnit) => benchUnit == null);

  if (emptyBenchIndex < 0) {
    return { success: false, message: '벤치가 가득 찼습니다.', ...input };
  }

  const playerUnit = createPlayerUnit(unit);
  const benchUnits = [...input.benchUnits];
  benchUnits[emptyBenchIndex] = playerUnit;

  return {
    success: true,
    message: `${unit.name}을(를) 벤치에 추가했습니다.`,
    gold: input.gold - offer.cost,
    benchUnits,
    shopUnits: input.shopUnits.map((shopOffer) =>
      shopOffer.offerId === input.offerId ? { ...shopOffer, isPurchased: true } : shopOffer,
    ),
  };
}

export function refreshShop(input: RefreshShopInput): RefreshShopOutput {
  if (input.isShopLocked) {
    return {
      success: false,
      message: '상점이 잠겨 있습니다.',
      gold: input.gold,
      shopUnits: [],
    };
  }

  if (input.gold < SHOP_REFRESH_COST) {
    return {
      success: false,
      message: '새로고침할 골드가 부족합니다.',
      gold: input.gold,
      shopUnits: [],
    };
  }

  return {
    success: true,
    message: '상점을 새로고침했습니다.',
    gold: input.gold - SHOP_REFRESH_COST,
    shopUnits: createShopOffers(input.unitPool, input.level),
  };
}

export function buyXp(input: BuyXpInput): BuyXpOutput {
  if (input.level >= MAX_PLAYER_LEVEL) {
    return { success: false, message: '이미 최대 레벨입니다.', ...input };
  }

  if (input.gold < BUY_XP_COST) {
    return { success: false, message: 'XP를 구매할 골드가 부족합니다.', ...input };
  }

  return {
    success: true,
    message: 'XP를 구매했습니다.',
    gold: input.gold - BUY_XP_COST,
    ...applyRoundXp({ level: input.level, xp: input.xp, xpGain: XP_PER_PURCHASE }),
  };
}

export { getXpToNextLevel };

export function canBuyUnit(offer: ShopUnitOffer, gold: number, benchUnits: BenchUnitSlot[]): boolean {
  return !offer.isPurchased && gold >= offer.cost && benchUnits.some((benchUnit) => benchUnit == null);
}

function pickShopUnit(unitPool: Unit[], level: number): Unit {
  const tier = pickTier(level);
  const tierUnits = unitPool.filter((unit) => unit.tier === tier);
  const candidates = tierUnits.length > 0 ? tierUnits : unitPool;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pickTier(level: number): UnitTier {
  const odds = getShopTierOdds(level);
  const totalWeight = odds.reduce((sum, probability) => sum + probability.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const probability of odds) {
    roll -= probability.weight;

    if (roll <= 0) {
      return probability.tier;
    }
  }

  return odds[0].tier;
}

function createPlayerUnit(unit: Unit): PlayerUnit {
  return {
    ...unit,
    unitId: unit.id,
    instanceId: `unit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    currentHp: unit.maxHp,
    currentMana: unit.mana,
    starLevel: 1,
    items: [],
  };
}
