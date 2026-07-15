export const BOARD_ROW_COUNT = 4;
export const BOARD_COLUMN_COUNT = 7;
export const BENCH_SLOT_COUNT = 8;
export const PLAYER_BOARD_ROWS = [2, 3] as const;
export const ENEMY_BOARD_ROWS = [0, 1] as const;
export const BOARD_TILE_GAP = 8;
export const BOARD_HORIZONTAL_PADDING = 56;
export const BOARD_VERTICAL_PADDING = 48;

export type BoardSide = 'player' | 'enemy';

export type BoardPosition = {
  row: number;
  col: number;
};

export type BoardSlot = BoardPosition & {
  side: BoardSide;
  isDeployable: boolean;
};

export type BoardPixelPosition = {
  x: number;
  y: number;
};

export type BoardLayout = {
  originX: number;
  originY: number;
  tileSize: number;
  gap: number;
  width: number;
  height: number;
};

export type BoardLayoutInput = {
  sceneWidth: number;
  sceneHeight: number;
  horizontalPadding?: number;
  verticalPadding?: number;
  gap?: number;
};

export type BoardTileVisualState = {
  slot: BoardSlot;
  center: BoardPixelPosition;
  isHovered: boolean;
  isSelected: boolean;
};

export type BoardSelectionChange = {
  position: BoardPosition;
  slot: BoardSlot;
};

export type BenchPosition = {
  slotIndex: number;
};

export type UnitPlacement =
  | {
      kind: 'board';
      position: BoardPosition;
    }
  | {
      kind: 'bench';
      position: BenchPosition;
    };
