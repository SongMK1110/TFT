import type { Item } from '../../../types/item';
import type { BenchUnitSlot, BoardUnit, ShopActionResult } from '../../../types/game';
import { UNIT_SELL_STAR_MULTIPLIERS, type PlayerUnit } from '../../../types/unit';

export type SellUnitInput = {
  unitInstanceId: PlayerUnit['instanceId'];
  gold: number;
  benchUnits: BenchUnitSlot[];
  boardUnits: BoardUnit[];
};

export type SellUnitResult = ShopActionResult & {
  gold: number;
  benchUnits: BenchUnitSlot[];
  boardUnits: BoardUnit[];
  returnedItemIds: Item['id'][];
  sellGold: number;
};

export function sellUnit(input: SellUnitInput): SellUnitResult {
  const unit = findUnit(input.unitInstanceId, input.benchUnits, input.boardUnits);

  if (!unit) {
    return unchangedResult('판매할 유닛을 찾을 수 없습니다.', input);
  }

  const sellGold = calculateUnitSellGold(unit);
  const returnedItemIds = unit.items.map((item) => item.id);

  return {
    success: true,
    message: `${unit.name} 판매 완료 · ${sellGold}골드 획득`,
    gold: input.gold + sellGold,
    benchUnits: removeBenchUnit(input.unitInstanceId, input.benchUnits),
    boardUnits: removeBoardUnit(input.unitInstanceId, input.boardUnits),
    returnedItemIds,
    sellGold,
  };
}

export function calculateUnitSellGold(unit: PlayerUnit): number {
  return unit.cost * UNIT_SELL_STAR_MULTIPLIERS[unit.starLevel];
}

function findUnit(
  unitInstanceId: PlayerUnit['instanceId'],
  benchUnits: BenchUnitSlot[],
  boardUnits: BoardUnit[],
): PlayerUnit | undefined {
  return (
    boardUnits.find((unit) => unit.instanceId === unitInstanceId) ??
    benchUnits.find((unit): unit is PlayerUnit => unit?.instanceId === unitInstanceId)
  );
}

function removeBenchUnit(unitInstanceId: PlayerUnit['instanceId'], benchUnits: BenchUnitSlot[]): BenchUnitSlot[] {
  return benchUnits.map((unit) => (unit?.instanceId === unitInstanceId ? undefined : unit));
}

function removeBoardUnit(unitInstanceId: PlayerUnit['instanceId'], boardUnits: BoardUnit[]): BoardUnit[] {
  return boardUnits.filter((unit) => unit.instanceId !== unitInstanceId);
}

function unchangedResult(message: string, input: SellUnitInput): SellUnitResult {
  return {
    success: false,
    message,
    gold: input.gold,
    benchUnits: input.benchUnits,
    boardUnits: input.boardUnits,
    returnedItemIds: [],
    sellGold: 0,
  };
}
