import {
  BOARD_COLUMN_COUNT,
  BOARD_HORIZONTAL_PADDING,
  BOARD_ROW_COUNT,
  BOARD_TILE_GAP,
  BOARD_VERTICAL_PADDING,
  ENEMY_BOARD_ROWS,
  PLAYER_BOARD_ROWS,
  type BoardLayout,
  type BoardLayoutInput,
  type BoardPixelPosition,
  type BoardPosition,
  type BoardSide,
  type BoardSlot,
} from '../../../types/board';
import type { BoardUnit } from '../../../types/game';

const MIN_TILE_SIZE = 42;

export function getBoardSide(row: number): BoardSide {
  if (PLAYER_BOARD_ROWS.includes(row as (typeof PLAYER_BOARD_ROWS)[number])) {
    return 'player';
  }

  if (ENEMY_BOARD_ROWS.includes(row as (typeof ENEMY_BOARD_ROWS)[number])) {
    return 'enemy';
  }

  return 'enemy';
}

export function isBoardPosition(position: BoardPosition): boolean {
  return (
    Number.isInteger(position.row) &&
    Number.isInteger(position.col) &&
    position.row >= 0 &&
    position.row < BOARD_ROW_COUNT &&
    position.col >= 0 &&
    position.col < BOARD_COLUMN_COUNT
  );
}

export function isDeployablePosition(position: BoardPosition): boolean {
  return isBoardPosition(position) && PLAYER_BOARD_ROWS.includes(position.row as (typeof PLAYER_BOARD_ROWS)[number]);
}

export function isOccupiedBoardPosition(position: BoardPosition, boardUnits: BoardUnit[]): boolean {
  return boardUnits.some((unit) => areSameBoardPosition(unit.position, position));
}

export function getBoardUnitAt(position: BoardPosition, boardUnits: BoardUnit[]): BoardUnit | undefined {
  return boardUnits.find((unit) => areSameBoardPosition(unit.position, position));
}

export function canPlaceUnitOnBoard(position: BoardPosition, boardUnits: BoardUnit[], level: number): boolean {
  return isDeployablePosition(position) && !isOccupiedBoardPosition(position, boardUnits) && boardUnits.length < level;
}

export function canMoveUnitToBoardPosition(
  instanceId: string,
  targetPosition: BoardPosition,
  boardUnits: BoardUnit[],
): boolean {
  if (!isDeployablePosition(targetPosition)) {
    return false;
  }

  const targetUnit = getBoardUnitAt(targetPosition, boardUnits);

  return !targetUnit || targetUnit.instanceId === instanceId;
}

export function createBoardSlots(): BoardSlot[] {
  return Array.from({ length: BOARD_ROW_COUNT * BOARD_COLUMN_COUNT }, (_, index) => {
    const row = Math.floor(index / BOARD_COLUMN_COUNT);
    const col = index % BOARD_COLUMN_COUNT;
    const position = { row, col };

    return {
      ...position,
      side: getBoardSide(row),
      isDeployable: isDeployablePosition(position),
    };
  });
}

export function createBoardLayout(input: BoardLayoutInput): BoardLayout {
  const gap = input.gap ?? BOARD_TILE_GAP;
  const horizontalPadding = input.horizontalPadding ?? BOARD_HORIZONTAL_PADDING;
  const verticalPadding = input.verticalPadding ?? BOARD_VERTICAL_PADDING;
  const availableWidth = Math.max(input.sceneWidth - horizontalPadding * 2, MIN_TILE_SIZE * BOARD_COLUMN_COUNT);
  const availableHeight = Math.max(input.sceneHeight - verticalPadding * 2, MIN_TILE_SIZE * BOARD_ROW_COUNT);
  const tileSize = Math.floor(
    Math.max(
      MIN_TILE_SIZE,
      Math.min(
        (availableWidth - gap * (BOARD_COLUMN_COUNT - 1)) / BOARD_COLUMN_COUNT,
        (availableHeight - gap * (BOARD_ROW_COUNT - 1)) / BOARD_ROW_COUNT,
      ),
    ),
  );
  const width = tileSize * BOARD_COLUMN_COUNT + gap * (BOARD_COLUMN_COUNT - 1);
  const height = tileSize * BOARD_ROW_COUNT + gap * (BOARD_ROW_COUNT - 1);

  return {
    originX: Math.round((input.sceneWidth - width) / 2),
    originY: Math.round((input.sceneHeight - height) / 2),
    tileSize,
    gap,
    width,
    height,
  };
}

export function boardToPhaserPosition(position: BoardPosition, layout: BoardLayout): BoardPixelPosition {
  return {
    x: layout.originX + position.col * (layout.tileSize + layout.gap) + layout.tileSize / 2,
    y: layout.originY + position.row * (layout.tileSize + layout.gap) + layout.tileSize / 2,
  };
}

export function phaserToBoardPosition(point: BoardPixelPosition, layout: BoardLayout): BoardPosition | undefined {
  const localX = point.x - layout.originX;
  const localY = point.y - layout.originY;
  const stride = layout.tileSize + layout.gap;
  const col = Math.floor(localX / stride);
  const row = Math.floor(localY / stride);
  const position = { row, col };

  if (!isBoardPosition(position)) {
    return undefined;
  }

  const insideTileX = localX - col * stride <= layout.tileSize;
  const insideTileY = localY - row * stride <= layout.tileSize;

  return insideTileX && insideTileY ? position : undefined;
}

export function areSameBoardPosition(first?: BoardPosition, second?: BoardPosition): boolean {
  return first?.row === second?.row && first?.col === second?.col;
}

export function getBoardPositionKey(position: BoardPosition): string {
  return `${position.row}:${position.col}`;
}
