import Phaser from 'phaser';
import twilightSanctumBoardUrl from '../../../../assets/generated/maps/twilight-sanctum/twilight-sanctum-board.png';
import { BoardGrid, type BoardGridRenderState } from '../objects/BoardGrid';
import { preloadItemIcons } from '../objects/ItemSprite';
import { createUnitSpriteAnimations, preloadUnitSprites } from '../objects/UnitSprite';
import { useGameStore } from '../../../store/useGameStore';
import type { CombatEvent } from '../../../types/combat';
import type { BoardPixelPosition, BoardPosition } from '../../../types/board';
import type { GamePhase } from '../../../types/game';
import { audioManager } from '../audioManager';

export class BattleScene extends Phaser.Scene {
  private boardGrid?: BoardGrid;
  private unsubscribeStore?: () => void;
  private lastAudioElapsedMs = -1;
  private lastBgmPhase?: GamePhase;

  constructor() {
    super('BattleScene');
  }

  preload() {
    this.load.image('map-twilight-sanctum', twilightSanctumBoardUrl);
    preloadItemIcons(this);
    preloadUnitSprites(this);
  }

  create() {
    createUnitSpriteAnimations(this);
    this.boardGrid = new BoardGrid(this, {
      onBoardDragStart: (instanceId) => {
        useGameStore.getState().startBoardDrag(instanceId);
      },
      onUnitSelect: (instanceId) => {
        useGameStore.getState().selectUnit(instanceId);
      },
      onBoardMove: (instanceId, position) => {
        useGameStore.getState().moveBoardUnit(instanceId, position);
        this.renderBoard();
      },
      onBoardReturnToBench: (instanceId) => {
        useGameStore.getState().returnBoardUnitToBench(instanceId);
        this.renderBoard();
      },
    });
    this.renderBoard();
    this.syncBgm(useGameStore.getState().phase);
    this.unsubscribeStore = useGameStore.subscribe((state, previousState) => {
      const shouldRefreshDragHighlight =
        state.dragState?.source.kind === 'bench' || previousState.dragState?.source.kind === 'bench';

      if (state.phase !== previousState.phase) {
        this.syncBgm(state.phase);
      }

      if (state.combatState && state.combatState !== previousState.combatState) {
        this.playCombatAudio(state.combatState.elapsedMs, state.combatState.events);
      }

      if (
        state.boardUnits !== previousState.boardUnits ||
        state.combatState !== previousState.combatState ||
        (state.dragState !== previousState.dragState && shouldRefreshDragHighlight) ||
        state.phase !== previousState.phase ||
        state.level !== previousState.level
      ) {
        this.renderBoard();
      }
    });
    this.scale.on('resize', this.renderBoard, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
  }

  refreshBoard() {
    this.boardGrid?.render(this.getRenderState());
  }

  getBoardPositionAt(point: BoardPixelPosition): BoardPosition | undefined {
    return this.boardGrid?.getBoardPositionAt(point);
  }

  private renderBoard() {
    this.refreshBoard();
  }

  private getRenderState(): BoardGridRenderState {
    const state = useGameStore.getState();

    return {
      boardUnits: state.boardUnits,
      combatUnits: state.combatState?.units,
      combatEvents: state.combatState?.events,
      dragState: state.dragState,
      level: state.level,
      phase: state.phase,
    };
  }

  private handleShutdown() {
    this.scale.off('resize', this.renderBoard, this);
    this.unsubscribeStore?.();
    this.unsubscribeStore = undefined;
    audioManager.stopBgm();
    this.boardGrid?.destroy();
    this.boardGrid = undefined;
  }

  private syncBgm(phase: GamePhase) {
    if (this.lastBgmPhase === phase) {
      return;
    }

    this.lastBgmPhase = phase;

    if (phase === 'combat') {
      audioManager.playBgm('combat');
      return;
    }

    if (phase === 'result' || phase === 'reward') {
      audioManager.playBgm('result');
      return;
    }

    audioManager.playBgm('prepare');
  }

  private playCombatAudio(elapsedMs: number, events: CombatEvent[]) {
    if (elapsedMs === this.lastAudioElapsedMs) {
      return;
    }

    this.lastAudioElapsedMs = elapsedMs;

    // Victory and defeat sounds are played after round resolution in the store,
    // so rewards and result state stay the single source of truth.
    for (const event of events) {
      if (event.type === 'damage') {
        audioManager.playSfx('attack');
        audioManager.playSfx('hit');
      }

      if (event.type === 'skillCast') {
        audioManager.playSfx('skill');
      }
    }
  }
}
