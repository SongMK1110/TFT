import type { BoardPosition } from '../../../types/board';
import type { BenchUnitSlot, BoardUnit, PlacementActionResult } from '../../../types/game';
import {
  canMoveUnitToBoardPosition,
  canPlaceUnitOnBoard,
  isBoardPosition,
  isDeployablePosition,
} from './boardSystem';

type PlacementStateResult = PlacementActionResult & {
  benchUnits: BenchUnitSlot[];
  boardUnits: BoardUnit[];
};

type PlaceBenchUnitInput = {
  benchIndex: number;
  position: BoardPosition;
  benchUnits: BenchUnitSlot[];
  boardUnits: BoardUnit[];
  level: number;
};

type MoveBoardUnitInput = {
  instanceId: string;
  position: BoardPosition;
  benchUnits: BenchUnitSlot[];
  boardUnits: BoardUnit[];
};

type ReturnBoardUnitInput = {
  instanceId: string;
  benchUnits: BenchUnitSlot[];
  boardUnits: BoardUnit[];
};

function unchangedResult(
  message: string,
  benchUnits: BenchUnitSlot[],
  boardUnits: BoardUnit[],
): PlacementStateResult {
  return {
    success: false,
    message,
    benchUnits,
    boardUnits,
  };
}

export function placeBenchUnitOnBoard(input: PlaceBenchUnitInput): PlacementStateResult {
  const { benchIndex, position, benchUnits, boardUnits, level } = input;
  const unit = benchUnits[benchIndex];

  if (!unit) {
    return unchangedResult('벤치 유닛을 찾을 수 없습니다.', benchUnits, boardUnits);
  }

  if (boardUnits.some((boardUnit) => boardUnit.instanceId === unit.instanceId)) {
    return unchangedResult('이미 보드에 배치된 유닛입니다.', benchUnits, boardUnits);
  }

  if (!isBoardPosition(position)) {
    return unchangedResult('보드 밖에는 배치할 수 없습니다.', benchUnits, boardUnits);
  }

  if (!isDeployablePosition(position)) {
    return unchangedResult('플레이어 진영에만 배치할 수 있습니다.', benchUnits, boardUnits);
  }

  if (!canPlaceUnitOnBoard(position, boardUnits, level)) {
    return unchangedResult(
      boardUnits.length >= level ? '현재 레벨보다 많은 유닛을 보드에 둘 수 없습니다.' : '이미 유닛이 있는 칸입니다.',
      benchUnits,
      boardUnits,
    );
  }

  const nextBenchUnits = [...benchUnits];
  nextBenchUnits[benchIndex] = undefined;

  return {
    success: true,
    message: `${unit.name} 배치 완료`,
    benchUnits: nextBenchUnits,
    boardUnits: [...boardUnits, { ...unit, position }],
  };
}

export function moveBoardUnit(input: MoveBoardUnitInput): PlacementStateResult {
  const { instanceId, position, benchUnits, boardUnits } = input;
  const unit = boardUnits.find((boardUnit) => boardUnit.instanceId === instanceId);

  if (!unit) {
    return unchangedResult('보드 유닛을 찾을 수 없습니다.', benchUnits, boardUnits);
  }

  if (!canMoveUnitToBoardPosition(instanceId, position, boardUnits)) {
    return unchangedResult(
      isDeployablePosition(position) ? '이미 유닛이 있는 칸입니다.' : '플레이어 진영 안에서만 이동할 수 있습니다.',
      benchUnits,
      boardUnits,
    );
  }

  return {
    success: true,
    message: `${unit.name} 위치 변경 완료`,
    benchUnits,
    boardUnits: boardUnits.map((boardUnit) =>
      boardUnit.instanceId === instanceId ? { ...boardUnit, position } : boardUnit,
    ),
  };
}

export function returnBoardUnitToBench(input: ReturnBoardUnitInput): PlacementStateResult {
  const { instanceId, benchUnits, boardUnits } = input;
  const unit = boardUnits.find((boardUnit) => boardUnit.instanceId === instanceId);
  const emptyBenchIndex = benchUnits.findIndex((benchUnit) => benchUnit == null);

  if (!unit) {
    return unchangedResult('보드 유닛을 찾을 수 없습니다.', benchUnits, boardUnits);
  }

  if (emptyBenchIndex < 0) {
    return unchangedResult('벤치가 가득 차서 유닛을 되돌릴 수 없습니다.', benchUnits, boardUnits);
  }

  const nextBenchUnits = [...benchUnits];
  const { position: _removedPosition, ...benchUnit } = unit;
  nextBenchUnits[emptyBenchIndex] = benchUnit;

  return {
    success: true,
    message: `${unit.name} 벤치 이동 완료`,
    benchUnits: nextBenchUnits,
    boardUnits: boardUnits.filter((boardUnit) => boardUnit.instanceId !== instanceId),
  };
}
