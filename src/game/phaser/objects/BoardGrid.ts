import Phaser from 'phaser';
import {
  areSameBoardPosition,
  boardToPhaserPosition,
  canMoveUnitToBoardPosition,
  canPlaceUnitOnBoard,
  createBoardLayout,
  createBoardSlots,
  getBoardPositionKey,
  phaserToBoardPosition,
} from '../../core/board/boardSystem';
import type {
  BoardLayout,
  BoardPixelPosition,
  BoardPosition,
  BoardSelectionChange,
  BoardSlot,
} from '../../../types/board';
import type { CombatEvent, CombatResult, CombatUnit } from '../../../types/combat';
import type { BoardUnit, GamePhase, UnitDragState } from '../../../types/game';
import {
  BASIC_ATTACK_TWEEN_MS,
  DEATH_FADE_TWEEN_MS,
  FLOATING_TEXT_TWEEN_MS,
  HIT_FLASH_TWEEN_MS,
  IMPACT_SPARK_COUNT,
  PROJECTILE_TWEEN_MS,
  PROJECTILE_TRAIL_COUNT,
  RESULT_BANNER_TWEEN_MS,
  ROUND_BANNER_TWEEN_MS,
  SCREEN_SHAKE_INTENSITY,
  SCREEN_SHAKE_MS,
  SHOCKWAVE_TWEEN_MS,
  SKILL_EFFECT_TWEEN_MS,
  SKILL_SPARK_COUNT,
  SLASH_TWEEN_MS,
  STRONG_HIT_DAMAGE_THRESHOLD_RATIO,
  UNIT_MOVE_TWEEN_MS,
} from '../animationConstants';
import {
  CELESTIAL_SAGE_STAR_BOLT_ANIMATION_KEY,
  CELESTIAL_SAGE_STAR_BOLT_KEY,
  CELESTIAL_SAGE_STARFALL_ANIMATION_KEY,
  CELESTIAL_SAGE_STARFALL_KEY,
  DAWN_WARDEN_RADIANT_AEGIS_ANIMATION_KEY,
  DAWN_WARDEN_RADIANT_AEGIS_KEY,
  DAWN_WARDEN_RADIANT_BASH_ANIMATION_KEY,
  DAWN_WARDEN_RADIANT_BASH_KEY,
  CINDER_DUELIST_CINDER_STRIKE_ANIMATION_KEY,
  CINDER_DUELIST_CINDER_STRIKE_KEY,
  CINDER_DUELIST_FLAME_CLEAVE_ANIMATION_KEY,
  CINDER_DUELIST_FLAME_CLEAVE_KEY,
  EMBER_GUARD_EMBER_BASH_ANIMATION_KEY,
  EMBER_GUARD_EMBER_BASH_KEY,
  EMBER_GUARD_EMBER_SHIELD_ANIMATION_KEY,
  EMBER_GUARD_EMBER_SHIELD_KEY,
  FROST_ARCHER_CHILLING_SHOT_ANIMATION_KEY,
  FROST_ARCHER_CHILLING_SHOT_KEY,
  GLACIER_FROST_BOLT_ANIMATION_KEY,
  GLACIER_FROST_BOLT_KEY,
  GLACIER_ICE_BLOOM_ANIMATION_KEY,
  GROVE_MYSTIC_SEED_BOLT_ANIMATION_KEY,
  GROVE_MYSTIC_SEED_BOLT_KEY,
  GROVE_MYSTIC_VERDANT_PULSE_ANIMATION_KEY,
  GROVE_MYSTIC_VERDANT_PULSE_KEY,
  IRONWOOD_BULWARK_ROOTED_ROAR_ANIMATION_KEY,
  IRONWOOD_BULWARK_ROOTED_ROAR_KEY,
  IRONWOOD_BULWARK_ROOT_SMASH_ANIMATION_KEY,
  IRONWOOD_BULWARK_ROOT_SMASH_KEY,
  NIGHT_ORACLE_TWILIGHT_MEND_ANIMATION_KEY,
  NIGHT_ORACLE_TWILIGHT_MEND_KEY,
  NIGHT_ORACLE_MOON_BOLT_ANIMATION_KEY,
  NIGHT_ORACLE_MOON_BOLT_KEY,
  SHADE_STALKER_SHADOW_LUNGE_ANIMATION_KEY,
  SHADE_STALKER_SHADOW_LUNGE_KEY,
  SHADE_STALKER_SHADE_SLASH_ANIMATION_KEY,
  SHADE_STALKER_SHADE_SLASH_KEY,
  STORM_RANGER_LIGHTNING_BOLT_ANIMATION_KEY,
  STORM_RANGER_LIGHTNING_BOLT_KEY,
  STORM_RANGER_RAPID_GALE_ANIMATION_KEY,
  STORM_RANGER_RAPID_GALE_KEY,
  THUNDER_BRUISER_THUNDER_CLAP_ANIMATION_KEY,
  THUNDER_BRUISER_THUNDER_CLAP_KEY,
  THUNDER_BRUISER_THUNDER_PUNCH_ANIMATION_KEY,
  THUNDER_BRUISER_THUNDER_PUNCH_KEY,
  getUnitSpriteSpec,
  type UnitSpriteSpec,
} from './UnitSprite';

type BoardTileView = {
  slot: BoardSlot;
  tile: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
};

type BoardGridOptions = {
  onSelectionChange?: (change: BoardSelectionChange) => void;
  onUnitSelect?: (instanceId: string) => void;
  onBoardDragStart?: (instanceId: string) => void;
  onBoardMove?: (instanceId: string, position: BoardPosition) => void;
  onBoardReturnToBench?: (instanceId: string) => void;
};

export type BoardGridRenderState = {
  boardUnits: BoardUnit[];
  combatUnits?: CombatUnit[];
  combatEvents?: CombatEvent[];
  dragState?: UnitDragState;
  level: number;
  phase: GamePhase;
};

const BOARD_BACKGROUND_COLOR = 0x0f172a;
const ENEMY_TILE_COLOR = 0x3b1f2f;
const PLAYER_TILE_COLOR = 0x18344a;
const BLOCKED_TILE_COLOR = 0x1e293b;
const DEFAULT_STROKE_COLOR = 0x475569;
const PLACEABLE_STROKE_COLOR = 0x22c55e;
const UNPLACEABLE_STROKE_COLOR = 0xef4444;
const ENEMY_UNIT_FILL_COLOR = 0xf43f5e;
const PLAYER_UNIT_FILL_COLOR = 0xf59e0b;
const UNIT_STROKE_COLOR = 0xfef3c7;
const PROJECTILE_COLOR = 0xfef08a;
const ARROW_SHAFT_COLOR = 0xe2e8f0;
const ARROW_HEAD_COLOR = 0xf8fafc;
const SPARK_COLOR = 0xfbbf24;
const MAGIC_SPARK_COLOR = 0x7dd3fc;
const EMBER_CORE_COLOR = 0xf97316;
const EMBER_GLOW_COLOR = 0xfacc15;
const EMBER_DARK_COLOR = 0x7c2d12;
const CINDER_BLADE_COLOR = 0xfb923c;
const CINDER_FLASH_COLOR = 0xffedd5;
const CINDER_SMOKE_COLOR = 0x450a0a;
const FROST_ARROW_COLOR = 0x7dd3fc;
const FROST_CORE_COLOR = 0xe0f2fe;
const FROST_RING_COLOR = 0x38bdf8;
const GLACIER_CRYSTAL_COLOR = 0xa5f3fc;
const GLACIER_BLOOM_COLOR = 0x67e8f9;
const GLACIER_DEEP_COLOR = 0x0e7490;
const ORACLE_MOON_COLOR = 0xe9d5ff;
const ORACLE_RUNE_COLOR = 0xc084fc;
const IRONWOOD_ROOT_COLOR = 0x65a30d;
const IRONWOOD_CORE_COLOR = 0xa3e635;
const DAMAGE_TEXT_COLOR = '#fecaca';
const CRITICAL_TEXT_COLOR = '#fef08a';
const HEAL_TEXT_COLOR = '#86efac';
const SHIELD_TEXT_COLOR = '#93c5fd';
const STATUS_TEXT_COLOR = '#facc15';
const DEFAULT_RENDER_STATE: BoardGridRenderState = {
  boardUnits: [],
  dragState: undefined,
  level: 1,
  phase: 'prepare',
};

export class BoardGrid {
  private layer?: Phaser.GameObjects.Container;
  private unitViews: Phaser.GameObjects.Container[] = [];
  private unitViewById = new Map<string, Phaser.GameObjects.Container>();
  private effectViews: Phaser.GameObjects.GameObject[] = [];
  private floatingTextPool: Phaser.GameObjects.Text[] = [];
  private activeFloatingTexts = new Set<Phaser.GameObjects.Text>();
  private projectilePool: Phaser.GameObjects.Arc[] = [];
  private activeProjectiles = new Set<Phaser.GameObjects.Arc>();
  private previousUnitCenters = new Map<string, BoardPixelPosition>();
  private lastPhase?: GamePhase;
  private layout?: BoardLayout;
  private tileViews = new Map<string, BoardTileView>();
  private hoveredPosition?: BoardPosition;
  private selectedPosition?: BoardPosition;
  private isDraggingUnit = false;
  private renderState = DEFAULT_RENDER_STATE;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly options: BoardGridOptions = {},
  ) {}

  render(renderState: BoardGridRenderState) {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const layout = createBoardLayout({ sceneWidth: width, sceneHeight: height });
    const slots = createBoardSlots();
    // Placement must always render the persisted board state. Combat units are runtime-only.
    const combatUnits = renderState.phase === 'combat' ? renderState.combatUnits : undefined;
    const displayUnits = combatUnits?.filter((unit) => unit.isAlive) ?? renderState.boardUnits;

    this.renderState = renderState;
    this.destroyUnitViews();
    this.layer?.destroy();
    this.cleanupEffectViews();
    this.layout = layout;
    this.tileViews.clear();

    const children: Phaser.GameObjects.GameObject[] = [];
    const map = this.scene.add
      .image(width / 2, height / 2, 'map-twilight-sanctum')
      .setDisplaySize(width, height)
      .setAlpha(0.96);
    const background = this.scene.add.rectangle(width / 2, height / 2, width, height, BOARD_BACKGROUND_COLOR, 0.16);
    const frame = this.scene.add
      .rectangle(width / 2, height / 2, layout.width + 42, layout.height + 72, 0x0f172a, 0.12)
      .setStrokeStyle(2, 0x7180a8, 0.36);
    const title = this.scene.add
      .text(layout.originX, layout.originY - 34, '전투 보드', {
        color: '#dbeafe',
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);
    const enemyLabel = this.scene.add.text(layout.originX, layout.originY - 12, '적 진영', {
      color: '#fda4af',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
    });
    const playerLabel = this.scene.add.text(layout.originX, layout.originY + layout.height + 12, '플레이어 진영', {
      color: '#7dd3fc',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
    });
    const separatorY = layout.originY + layout.tileSize * 2 + layout.gap * 1.5;
    const separator = this.scene.add.rectangle(width / 2, separatorY, layout.width, 2, 0x64748b, 0.55);
    const subtitle = this.scene.add
      .text(layout.originX + layout.width, layout.originY - 34, `7 x 4 격자 · 배치 ${displayUnits.length}`, {
        color: '#94a3b8',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      })
      .setOrigin(1, 0.5);

    children.push(map, background, frame, title, enemyLabel, playerLabel, separator, subtitle);

    for (const slot of slots) {
      const tileView = this.createTileView(slot, layout.tileSize, boardToPhaserPosition(slot, layout));

      this.tileViews.set(getBoardPositionKey(slot), tileView);
      this.bindTileEvents(tileView);
      this.applyTileState(tileView, renderState);
      children.push(tileView.tile, tileView.label);
    }

    this.layer = this.scene.add.container(0, 0, children);
    this.renderUnits(displayUnits, layout);
    this.renderPolishedCombatEffects(renderState.combatEvents ?? [], combatUnits ?? displayUnits, layout);
    this.renderPhaseTransition(renderState.phase, layout);
  }

  destroy() {
    this.destroyUnitViews();
    this.layer?.destroy();
    this.destroyEffectViews();
    this.destroyPooledEffects();
    this.layer = undefined;
    this.layout = undefined;
    this.tileViews.clear();
  }

  getBoardPositionAt(point: BoardPixelPosition): BoardPosition | undefined {
    return this.layout ? phaserToBoardPosition(point, this.layout) : undefined;
  }

  private createTileView(slot: BoardSlot, tileSize: number, center: BoardPixelPosition): BoardTileView {
    const tile = this.scene.add
      .rectangle(center.x, center.y, tileSize, tileSize, this.getTileFillColor(slot), 0.08)
      .setStrokeStyle(1, DEFAULT_STROKE_COLOR, 0.3)
      .setInteractive();
    const label = this.scene.add
      .text(center.x, center.y, `${slot.row},${slot.col}`, {
        color: slot.isDeployable ? '#dbeafe' : '#94a3b8',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    return { slot, tile, label };
  }

  private createUnitView(unit: BoardUnit | CombatUnit, layout: BoardLayout): Phaser.GameObjects.Container {
    const center = boardToPhaserPosition(unit.position, layout);
    const size = Math.max(34, layout.tileSize * 0.68);
    const radius = size / 2;
    const isCombatUnit = 'team' in unit;
    const fillColor = isCombatUnit && unit.team === 'enemy' ? ENEMY_UNIT_FILL_COLOR : PLAYER_UNIT_FILL_COLOR;
    const previousCenter = isCombatUnit ? this.previousUnitCenters.get(unit.instanceId) : undefined;
    const spriteSpec = getUnitSpriteSpec(unit.unitId);
    const container = this.scene.add
      .container(previousCenter?.x ?? center.x, previousCenter?.y ?? center.y)
      .setDepth(50);
    const token = this.scene.add.circle(0, 0, radius, fillColor, spriteSpec ? 0.001 : 0.95);

    if (!spriteSpec) {
      token.setStrokeStyle(3, UNIT_STROKE_COLOR, 0.95);
    }

    const initials = this.scene.add
      .text(0, -4, unit.name.slice(0, 2), {
        color: '#111827',
        fontFamily: 'Arial, sans-serif',
        fontSize: `${Math.max(12, Math.floor(size * 0.27))}px`,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    const starLabel = this.scene.add
      .text(0, radius * 0.45, isCombatUnit ? (unit.team === 'enemy' ? '적' : '아군') : `${unit.starLevel}성`, {
        color: '#78350f',
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    if (spriteSpec) {
      const shadow = this.scene.add.ellipse(0, radius * 0.58, size * 0.88, size * 0.24, 0x020617, 0.38);
      const sprite = this.scene.add
        .sprite(0, -radius * 0.12, spriteSpec.idleKey, 0)
        .setScale(Math.min(0.82, (layout.tileSize * 1.12) / spriteSpec.frameWidth))
        .setFlipX(isCombatUnit && unit.team === 'player')
        .play(spriteSpec.idleAnimationKey);

      container.setData('unitSprite', sprite);
      container.setData('unitSpriteSpec', spriteSpec);
      container.setData('idleFlipX', isCombatUnit && unit.team === 'player');
      starLabel.setY(radius * 0.8);
      starLabel.setColor('#fef3c7');
      starLabel.setShadow(0, 1, '#111827', 2);
      container.add([shadow, sprite, token, starLabel]);
    } else {
      container.add([token, initials, starLabel]);
    }

    if (isCombatUnit && previousCenter && (previousCenter.x !== center.x || previousCenter.y !== center.y)) {
      this.scene.tweens.add({
        targets: container,
        x: center.x,
        y: center.y,
        duration: UNIT_MOVE_TWEEN_MS,
        ease: 'Sine.easeOut',
      });
    }

    if (isCombatUnit) {
      const hpRatio = unit.currentHp / unit.maxHp;
      const manaRatio = unit.maxMana > 0 ? unit.currentMana / unit.maxMana : 0;
      const shieldRatio = unit.shield > 0 ? Math.min(1, unit.shield / unit.maxHp) : 0;
      const isPlayerUnit = unit.team === 'player';
      const hpColor = isPlayerUnit ? 0x22c55e : 0xef4444;
      const hpLabelColor = isPlayerUnit ? '#d1fae5' : '#fee2e2';
      const shieldBackground = this.scene.add.rectangle(0, -radius - 15, size, 4, 0x0f172a, unit.shield > 0 ? 0.9 : 0);
      const shieldBar = this.scene.add
        .rectangle(-size / 2, -radius - 15, Math.max(0, size * shieldRatio), 4, 0x7dd3fc, unit.shield > 0 ? 0.98 : 0)
        .setOrigin(0, 0.5);
      const hpBackground = this.scene.add.rectangle(0, -radius - 8, size, 5, 0x111827, 0.9);
      const hpBar = this.scene.add
        .rectangle(-size / 2, -radius - 8, Math.max(0, size * hpRatio), 5, hpColor, 0.95)
        .setOrigin(0, 0.5);
      const manaBackground = this.scene.add.rectangle(0, -radius - 1, size, 4, 0x111827, 0.85);
      const manaBar = this.scene.add
        .rectangle(-size / 2, -radius - 1, Math.max(0, size * manaRatio), 4, 0x38bdf8, 0.95)
        .setOrigin(0, 0.5);
      const hpLabel = this.scene.add
        .text(0, radius + 8, `${unit.currentHp}/${unit.maxHp}`, {
          color: hpLabelColor,
          fontFamily: 'Arial, sans-serif',
          fontSize: '10px',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      container.add([shieldBackground, shieldBar, hpBackground, hpBar, manaBackground, manaBar, hpLabel]);
    }
    if (!isCombatUnit && this.renderState.phase !== 'combat') {
      token.setInteractive({ cursor: 'grab' });
      this.scene.input.setDraggable(token);
      token.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
        this.options.onUnitSelect?.(unit.instanceId);
        event.stopPropagation();
      });
      token.on('dragstart', () => {
        this.isDraggingUnit = true;
        this.options.onUnitSelect?.(unit.instanceId);
        this.options.onBoardDragStart?.(unit.instanceId);
        container.setDepth(60);
      });
      token.on('drag', (pointer: Phaser.Input.Pointer) => {
        container.setPosition(pointer.worldX, pointer.worldY);
      });
      token.on('dragend', () => {
        this.isDraggingUnit = false;
        const targetPosition = this.getBoardPositionAt({ x: container.x, y: container.y });

        if (targetPosition) {
          this.options.onBoardMove?.(unit.instanceId, targetPosition);
        } else {
          this.options.onBoardReturnToBench?.(unit.instanceId);
        }
      });
    }

    return container;
  }

  private renderUnits(boardUnits: Array<BoardUnit | CombatUnit>, layout: BoardLayout) {
    for (const unit of boardUnits) {
      const unitView = this.createUnitView(unit, layout);

      this.layer?.add(unitView);
      this.unitViews.push(unitView);
      this.unitViewById.set(unit.instanceId, unitView);
      this.previousUnitCenters.set(unit.instanceId, boardToPhaserPosition(unit.position, layout));
    }

    const combatUnits = boardUnits.filter((unit): unit is CombatUnit => 'team' in unit);

    for (const unit of combatUnits) {
      const target = combatUnits
        .filter((candidate) => candidate.team !== unit.team)
        .sort(
          (first, second) =>
            Math.abs(first.position.row - unit.position.row) + Math.abs(first.position.col - unit.position.col) -
            (Math.abs(second.position.row - unit.position.row) + Math.abs(second.position.col - unit.position.col)),
        )[0];
      const unitView = this.unitViewById.get(unit.instanceId);
      const sprite = unitView?.getData('unitSprite') as Phaser.GameObjects.Sprite | undefined;

      if (target && sprite && target.position.col !== unit.position.col) {
        const shouldFaceLeft = target.position.col < unit.position.col;

        sprite.setFlipX(shouldFaceLeft);
        unitView?.setData('idleFlipX', shouldFaceLeft);
      }
    }
  }

  private destroyUnitViews() {
    for (const unitView of this.unitViews) {
      unitView.destroy();
    }

    this.unitViews = [];
    this.unitViewById.clear();
  }

  private renderCombatEffects(events: CombatEvent[], units: Array<BoardUnit | CombatUnit>, layout: BoardLayout) {
    const combatUnits = units.filter((unit): unit is CombatUnit => 'team' in unit);

    for (const event of events) {
      if (event.type === 'skillCast') {
        const source = combatUnits.find((unit) => unit.instanceId === event.sourceInstanceId);

        if (!source) {
          continue;
        }

        const center = boardToPhaserPosition(source.position, layout);
        const ring = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.38, 0x38bdf8, 0.12).setDepth(80);
        const label = this.scene.add
          .text(center.x, center.y - layout.tileSize * 0.45, event.skillName, {
            color: '#bae6fd',
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            fontStyle: 'bold',
          })
          .setOrigin(0.5)
          .setDepth(81);

        ring.setStrokeStyle(3, 0x7dd3fc, 0.95);
        this.scene.tweens.add({
          targets: ring,
          scale: 1.65,
          alpha: 0,
          duration: 420,
          ease: 'Cubic.easeOut',
        });
        this.scene.tweens.add({
          targets: label,
          y: label.y - 18,
          alpha: 0,
          duration: 620,
          ease: 'Cubic.easeOut',
        });
        this.effectViews.push(ring, label);
      }

      if (event.type === 'heal' || event.type === 'shield' || event.type === 'statusEffect') {
        const target = combatUnits.find((unit) => unit.instanceId === event.targetInstanceId);

        if (!target) {
          continue;
        }

        const center = boardToPhaserPosition(target.position, layout);
        const text =
          event.type === 'heal' ? `+${event.amount}` : event.type === 'shield' ? `보호막 ${event.amount}` : event.effectType;
        const color = event.type === 'heal' ? '#86efac' : event.type === 'shield' ? '#93c5fd' : '#facc15';
        const label = this.scene.add
          .text(center.x, center.y + layout.tileSize * 0.34, text, {
            color,
            fontFamily: 'Arial, sans-serif',
            fontSize: '11px',
            fontStyle: 'bold',
          })
          .setOrigin(0.5)
          .setDepth(82);

        this.scene.tweens.add({
          targets: label,
          y: label.y - 16,
          alpha: 0,
          duration: 560,
          ease: 'Cubic.easeOut',
        });
        this.effectViews.push(label);
      }
    }
  }

  private renderPolishedCombatEffects(events: CombatEvent[], units: Array<BoardUnit | CombatUnit>, layout: BoardLayout) {
    const combatUnits = units.filter((unit): unit is CombatUnit => 'team' in unit);
    const cinderSkillSourceIds = new Set(
      events.flatMap((event) => {
        if (event.type !== 'skillCast') {
          return [];
        }

        const source = combatUnits.find((unit) => unit.instanceId === event.sourceInstanceId);

        return source?.unitId === 'cinder-duelist' ? [event.sourceInstanceId] : [];
      }),
    );
    const frostSkillSourceIds = new Set(
      events.flatMap((event) => {
        if (event.type !== 'skillCast') {
          return [];
        }

        const source = combatUnits.find((unit) => unit.instanceId === event.sourceInstanceId);

        return source?.unitId === 'frost-archer' ? [event.sourceInstanceId] : [];
      }),
    );
    const glacierSkillSourceIds = new Set(
      events.flatMap((event) => {
        if (event.type !== 'skillCast') {
          return [];
        }

        const source = combatUnits.find((unit) => unit.instanceId === event.sourceInstanceId);

        return source?.unitId === 'glacier-mage' ? [event.sourceInstanceId] : [];
      }),
    );
    const shadeSkillSourceIds = new Set(
      events.flatMap((event) => {
        if (event.type !== 'skillCast') {
          return [];
        }

        const source = combatUnits.find((unit) => unit.instanceId === event.sourceInstanceId);

        return source?.unitId === 'shade-stalker' ? [event.sourceInstanceId] : [];
      }),
    );
    const thunderSkillSourceIds = new Set(
      events.flatMap((event) => {
        if (event.type !== 'skillCast') {
          return [];
        }

        const source = combatUnits.find((unit) => unit.instanceId === event.sourceInstanceId);

        return source?.unitId === 'thunder-bruiser' ? [event.sourceInstanceId] : [];
      }),
    );
    const celestialSkillSourceIds = new Set(
      events.flatMap((event) => {
        if (event.type !== 'skillCast') {
          return [];
        }

        const source = combatUnits.find((unit) => unit.instanceId === event.sourceInstanceId);

        return source?.unitId === 'celestial-sage' ? [event.sourceInstanceId] : [];
      }),
    );

    for (const event of events) {
      if (event.type === 'skillCast') {
        const source = combatUnits.find((unit) => unit.instanceId === event.sourceInstanceId);

        if (source) {
          this.playSkillCastEffect(source, event.skillName, layout);

          if (source.unitId === 'glacier-mage') {
            const bloomCenter = combatUnits.find((unit) => unit.instanceId === event.targetInstanceIds[0]);

            if (bloomCenter) {
              this.playGlacierMageIceBloomAreaEffect(bloomCenter, layout);
            }
          }
        }
      }

      if (event.type === 'damage') {
        const source = combatUnits.find((unit) => unit.instanceId === event.sourceInstanceId);
        const target = combatUnits.find((unit) => unit.instanceId === event.targetInstanceId);

        if (source && target) {
          const isStrongHit = event.amount >= target.maxHp * STRONG_HIT_DAMAGE_THRESHOLD_RATIO;
          const isCinderSkillDamage = cinderSkillSourceIds.has(source.instanceId);
          const isFrostSkillDamage = frostSkillSourceIds.has(source.instanceId);
          const isGlacierSkillDamage = glacierSkillSourceIds.has(source.instanceId);
          const isShadeSkillDamage = shadeSkillSourceIds.has(source.instanceId);
          const isThunderSkillDamage = thunderSkillSourceIds.has(source.instanceId);
          const isCelestialSkillDamage = celestialSkillSourceIds.has(source.instanceId);

          if (isCinderSkillDamage) {
            this.playCinderDuelistSkillStrikeEffect(source, target, layout);
            this.playCinderDuelistHitEffect(target, layout);
          } else if (isFrostSkillDamage) {
            this.playFrostArcherSkillShotEffect(source, target, event.amount, layout);
            this.playFrostArcherHitEffect(target, layout);
          } else if (isGlacierSkillDamage) {
            this.playGlacierMageIceBloomHitEffect(target, layout);
          } else if (isShadeSkillDamage) {
            this.playShadeStalkerShadowLungeEffect(source, target, layout);
          } else if (isThunderSkillDamage) {
            this.playThunderBruiserThunderClapEffect(target, layout);
          } else if (isCelestialSkillDamage) {
            this.playCelestialSageStarfallEffect(target, layout);
          } else {
            this.playBasicAttackEffect(source, target, event.amount, layout);
            if (!['thunder-bruiser', 'dawn-warden', 'ember-guard', 'cinder-duelist', 'shade-stalker', 'ironwood-bulwark'].includes(source.unitId)) {
              this.playHitEffect(target, layout);
            }
          }
          this.playFloatingText(
            target.position,
            `-${event.amount}`,
            isStrongHit ? CRITICAL_TEXT_COLOR : DAMAGE_TEXT_COLOR,
            layout,
            isStrongHit ? 1.25 : 1,
          );
        }
      }

      if (event.type === 'heal') {
        const target = combatUnits.find((unit) => unit.instanceId === event.targetInstanceId);

        if (target) {
          const source = combatUnits.find((unit) => unit.instanceId === event.sourceInstanceId);

          if (source?.unitId === 'night-oracle') {
            this.playNightOracleTwilightMendEffect(target, event.amount, layout);
          } else if (source?.unitId === 'grove-mystic') {
            this.playGroveMysticVerdantPulseEffect(target, event.amount, layout);
          } else {
            this.playFloatingText(target.position, `+${event.amount}`, HEAL_TEXT_COLOR, layout);
          }
        }
      }

      if (event.type === 'shield') {
        const target = combatUnits.find((unit) => unit.instanceId === event.targetInstanceId);

        if (target) {
          const source = combatUnits.find((unit) => unit.instanceId === event.sourceInstanceId);

          if (source?.unitId === 'ember-guard') {
            this.playEmberGuardShieldEffect(target, event.amount, layout);
          } else if (source?.unitId === 'ironwood-bulwark') {
            this.playIronwoodBulwarkShieldEffect(target, event.amount, layout);
          } else if (source?.unitId === 'dawn-warden') {
            this.playDawnWardenRadiantAegisEffect(target, event.amount, layout);
          } else {
            this.playShieldEffect(target, event.amount, layout);
          }
        }
      }

      if (event.type === 'statusEffect') {
        const target = combatUnits.find((unit) => unit.instanceId === event.targetInstanceId);

        if (target) {
          this.playFloatingText(target.position, event.effectType, STATUS_TEXT_COLOR, layout);
        }
      }

      if (event.type === 'death') {
        const unit = combatUnits.find((candidate) => candidate.instanceId === event.unitInstanceId);

        if (unit) {
          this.playDeathEffect(unit, layout);
        }
      }

      if (event.type === 'combatEnd') {
        this.playResultBanner(event.result, layout);
      }
    }
  }

  private playBasicAttackEffect(source: CombatUnit, target: CombatUnit, amount: number, layout: BoardLayout) {
    const sourceView = this.unitViewById.get(source.instanceId);
    const sourceCenter = boardToPhaserPosition(source.position, layout);
    const targetCenter = boardToPhaserPosition(target.position, layout);
    const distance = Math.hypot(targetCenter.x - sourceCenter.x, targetCenter.y - sourceCenter.y);

    if (sourceView) {
      this.playUnitAttackAnimation(sourceView, targetCenter.x < sourceCenter.x);
      const directionX = distance > 0 ? (targetCenter.x - sourceCenter.x) / distance : 0;
      const directionY = distance > 0 ? (targetCenter.y - sourceCenter.y) / distance : 0;

      this.scene.tweens.add({
        targets: sourceView,
        x: sourceView.x + directionX * Math.min(14, layout.tileSize * 0.16),
        y: sourceView.y + directionY * Math.min(14, layout.tileSize * 0.16),
        duration: BASIC_ATTACK_TWEEN_MS,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }

    if (source.unitId === 'frost-archer') {
      this.playArrowProjectile(sourceCenter, targetCenter, amount, layout);
    } else if (source.unitId === 'glacier-mage') {
      this.playGlacierMageFrostBolt(sourceCenter, targetCenter, amount, layout);
    } else if (source.unitId === 'night-oracle') {
      this.playNightOracleMoonBolt(sourceCenter, targetCenter, amount, layout);
    } else if (source.unitId === 'grove-mystic') {
      this.playGroveMysticSeedBolt(sourceCenter, targetCenter, amount, layout);
    } else if (source.unitId === 'storm-ranger') {
      this.playStormRangerLightningBolt(sourceCenter, targetCenter, layout);
    } else if (source.unitId === 'thunder-bruiser') {
      this.playThunderBruiserPunchEffect(targetCenter, layout);
    } else if (source.unitId === 'celestial-sage') {
      this.playCelestialSageStarBolt(sourceCenter, targetCenter, layout);
    } else if (source.unitId === 'dawn-warden') {
      this.playDawnWardenRadiantBashEffect(targetCenter, layout);
    } else if (source.unitId === 'ember-guard') {
      this.playGeneratedBasicImpact(targetCenter, layout, EMBER_GUARD_EMBER_BASH_KEY, EMBER_GUARD_EMBER_BASH_ANIMATION_KEY, 0.82);
    } else if (source.unitId === 'cinder-duelist') {
      this.playGeneratedBasicImpact(targetCenter, layout, CINDER_DUELIST_FLAME_CLEAVE_KEY, CINDER_DUELIST_FLAME_CLEAVE_ANIMATION_KEY, 1.06);
    } else if (source.unitId === 'shade-stalker') {
      this.playGeneratedBasicImpact(targetCenter, layout, SHADE_STALKER_SHADE_SLASH_KEY, SHADE_STALKER_SHADE_SLASH_ANIMATION_KEY, 0.9);
    } else if (source.unitId === 'ironwood-bulwark') {
      this.playGeneratedBasicImpact(targetCenter, layout, IRONWOOD_BULWARK_ROOT_SMASH_KEY, IRONWOOD_BULWARK_ROOT_SMASH_ANIMATION_KEY, 0.92);
    } else if (source.attackRange > 1 || distance > layout.tileSize * 1.5) {
      this.playProjectile(sourceCenter, targetCenter, amount, layout);
    } else {
      this.playSlashEffect(sourceCenter, targetCenter, layout);
    }
  }

  private playUnitAttackAnimation(unitView: Phaser.GameObjects.Container, shouldFaceLeft?: boolean) {
    const sprite = unitView.getData('unitSprite') as Phaser.GameObjects.Sprite | undefined;
    const spriteSpec = unitView.getData('unitSpriteSpec') as UnitSpriteSpec | undefined;

    if (!sprite || !spriteSpec) {
      return;
    }

    if (shouldFaceLeft !== undefined) {
      sprite.setFlipX(shouldFaceLeft);
    }
    sprite.play(spriteSpec.attackAnimationKey, true);
    sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (sprite.active) {
        sprite.setFlipX(unitView.getData('idleFlipX') as boolean);
        sprite.play(spriteSpec.idleAnimationKey, true);
      }
    });
  }

  private playProjectile(
    sourceCenter: BoardPixelPosition,
    targetCenter: BoardPixelPosition,
    amount: number,
    layout: BoardLayout,
  ) {
    this.playProjectileTrail(sourceCenter, targetCenter, layout);

    const projectile = this.acquireProjectileCircle(
      sourceCenter.x,
      sourceCenter.y,
      Math.max(4, layout.tileSize * 0.055),
      PROJECTILE_COLOR,
      0.95,
      85,
    );

    this.scene.tweens.add({
      targets: projectile,
      x: targetCenter.x,
      y: targetCenter.y,
      scale: amount >= 120 ? 1.45 : 1,
      duration: PROJECTILE_TWEEN_MS,
      ease: 'Sine.easeIn',
      onComplete: () => this.releaseProjectileCircle(projectile),
    });
  }

  private playArrowProjectile(
    sourceCenter: BoardPixelPosition,
    targetCenter: BoardPixelPosition,
    amount: number,
    layout: BoardLayout,
  ) {
    const angle = Phaser.Math.Angle.Between(sourceCenter.x, sourceCenter.y, targetCenter.x, targetCenter.y);
    const shaft = this.scene.add
      .rectangle(sourceCenter.x, sourceCenter.y, layout.tileSize * 0.34, 3, ARROW_SHAFT_COLOR, 0.95)
      .setRotation(angle)
      .setDepth(88);
    const tip = this.scene.add
      .circle(sourceCenter.x, sourceCenter.y, Math.max(2, layout.tileSize * 0.026), ARROW_HEAD_COLOR, 0.98)
      .setRotation(angle)
      .setDepth(89);
    const featherTop = this.scene.add
      .rectangle(sourceCenter.x, sourceCenter.y, layout.tileSize * 0.1, 2, 0x94a3b8, 0.86)
      .setRotation(angle + 0.42)
      .setDepth(87);
    const featherBottom = this.scene.add
      .rectangle(sourceCenter.x, sourceCenter.y, layout.tileSize * 0.1, 2, 0x94a3b8, 0.86)
      .setRotation(angle - 0.42)
      .setDepth(87);

    this.playArrowTrail(sourceCenter, targetCenter, layout, 0xcbd5e1);
    for (const part of [shaft, tip, featherTop, featherBottom]) {
      this.registerEffect(part, PROJECTILE_TWEEN_MS + 80);
    }
    this.scene.tweens.add({
      targets: [shaft, tip, featherTop, featherBottom],
      x: targetCenter.x,
      y: targetCenter.y,
      scale: amount >= 80 ? 1.12 : 1,
      duration: PROJECTILE_TWEEN_MS,
      ease: 'Sine.easeIn',
      onComplete: () => {
        shaft.destroy();
        tip.destroy();
        featherTop.destroy();
        featherBottom.destroy();
      },
    });
  }

  private playGlacierMageFrostBolt(
    sourceCenter: BoardPixelPosition,
    targetCenter: BoardPixelPosition,
    amount: number,
    layout: BoardLayout,
  ) {
    const angle = Phaser.Math.Angle.Between(sourceCenter.x, sourceCenter.y, targetCenter.x, targetCenter.y);
    const bolt = this.scene.add
      .sprite(sourceCenter.x, sourceCenter.y, GLACIER_FROST_BOLT_KEY, 0)
      .setScale((layout.tileSize * 0.68) / 128)
      .setRotation(angle)
      .setDepth(90)
      .play(GLACIER_FROST_BOLT_ANIMATION_KEY);

    this.playArrowTrail(sourceCenter, targetCenter, layout, GLACIER_BLOOM_COLOR);
    this.registerEffect(bolt, PROJECTILE_TWEEN_MS + 100);
    this.scene.tweens.add({
      targets: bolt,
      x: targetCenter.x,
      y: targetCenter.y,
      scale: amount >= 70 ? bolt.scale * 1.18 : bolt.scale,
      duration: PROJECTILE_TWEEN_MS + 40,
      ease: 'Sine.easeIn',
      onComplete: () => bolt.destroy(),
    });
  }

  private playNightOracleMoonBolt(
    sourceCenter: BoardPixelPosition,
    targetCenter: BoardPixelPosition,
    amount: number,
    layout: BoardLayout,
  ) {
    const angle = Phaser.Math.Angle.Between(sourceCenter.x, sourceCenter.y, targetCenter.x, targetCenter.y);
    const bolt = this.scene.add
      .sprite(sourceCenter.x, sourceCenter.y, NIGHT_ORACLE_MOON_BOLT_KEY, 0)
      .setScale((layout.tileSize * 0.54) / 128)
      .setRotation(angle)
      .setDepth(90)
      .play(NIGHT_ORACLE_MOON_BOLT_ANIMATION_KEY);

    this.playArrowTrail(sourceCenter, targetCenter, layout, ORACLE_RUNE_COLOR);
    this.registerEffect(bolt, PROJECTILE_TWEEN_MS + 100);
    this.scene.tweens.add({
      targets: bolt,
      x: targetCenter.x,
      y: targetCenter.y,
      scale: amount >= 70 ? bolt.scale * 1.16 : bolt.scale,
      duration: PROJECTILE_TWEEN_MS + 30,
      ease: 'Sine.easeIn',
      onComplete: () => bolt.destroy(),
    });
  }

  private playGroveMysticSeedBolt(sourceCenter: BoardPixelPosition, targetCenter: BoardPixelPosition, amount: number, layout: BoardLayout) {
    const bolt = this.scene.add
      .sprite(sourceCenter.x, sourceCenter.y, GROVE_MYSTIC_SEED_BOLT_KEY, 0)
      .setScale((layout.tileSize * 0.34) / 128)
      .setDepth(90)
      .play(GROVE_MYSTIC_SEED_BOLT_ANIMATION_KEY);

    this.playArrowTrail(sourceCenter, targetCenter, layout, 0x84cc16);
    this.registerEffect(bolt, PROJECTILE_TWEEN_MS + 100);
    this.scene.tweens.add({ targets: bolt, x: targetCenter.x, y: targetCenter.y, scale: amount >= 70 ? bolt.scale * 1.15 : bolt.scale, duration: PROJECTILE_TWEEN_MS + 30, ease: 'Sine.easeIn', onComplete: () => bolt.destroy() });
  }

  private playStormRangerLightningBolt(sourceCenter: BoardPixelPosition, targetCenter: BoardPixelPosition, layout: BoardLayout) {
    const bolt = this.scene.add.sprite(sourceCenter.x, sourceCenter.y, STORM_RANGER_LIGHTNING_BOLT_KEY, 0).setScale((layout.tileSize * 0.36) / 128).setDepth(90).play(STORM_RANGER_LIGHTNING_BOLT_ANIMATION_KEY);
    this.registerEffect(bolt, PROJECTILE_TWEEN_MS + 100);
    this.scene.tweens.add({ targets: bolt, x: targetCenter.x, y: targetCenter.y, duration: PROJECTILE_TWEEN_MS, ease: 'Sine.easeIn', onComplete: () => bolt.destroy() });
  }

  private playThunderBruiserPunchEffect(targetCenter: BoardPixelPosition, layout: BoardLayout) {
    const impact = this.scene.add
      .sprite(targetCenter.x, targetCenter.y - layout.tileSize * 0.04, THUNDER_BRUISER_THUNDER_PUNCH_KEY, 0)
      .setScale((layout.tileSize * 0.68) / 128)
      .setDepth(94)
      .play(THUNDER_BRUISER_THUNDER_PUNCH_ANIMATION_KEY);
    this.registerEffect(impact, 420);
  }

  private playThunderBruiserThunderClapEffect(target: CombatUnit, layout: BoardLayout) {
    const center = boardToPhaserPosition(target.position, layout);
    const clap = this.scene.add
      .sprite(center.x, center.y + layout.tileSize * 0.12, THUNDER_BRUISER_THUNDER_CLAP_KEY, 0)
      .setScale((layout.tileSize * 1.75) / 128)
      .setDepth(93)
      .play(THUNDER_BRUISER_THUNDER_CLAP_ANIMATION_KEY);
    this.registerEffect(clap, 620);
  }

  private playCelestialSageStarBolt(sourceCenter: BoardPixelPosition, targetCenter: BoardPixelPosition, layout: BoardLayout) {
    const bolt = this.scene.add
      .sprite(sourceCenter.x, sourceCenter.y, CELESTIAL_SAGE_STAR_BOLT_KEY, 0)
      .setScale((layout.tileSize * 0.34) / 128)
      .setDepth(90)
      .play(CELESTIAL_SAGE_STAR_BOLT_ANIMATION_KEY);
    this.registerEffect(bolt, PROJECTILE_TWEEN_MS + 100);
    this.scene.tweens.add({ targets: bolt, x: targetCenter.x, y: targetCenter.y, duration: PROJECTILE_TWEEN_MS, ease: 'Sine.easeIn', onComplete: () => bolt.destroy() });
  }

  private playCelestialSageStarfallEffect(target: CombatUnit, layout: BoardLayout) {
    const center = boardToPhaserPosition(target.position, layout);
    const meteorOffsets = [-0.38, 0.24, -0.08, 0.43];

    meteorOffsets.forEach((offset, index) => {
      const meteor = this.scene.add
        .sprite(center.x + layout.tileSize * offset, center.y - layout.tileSize * (1.42 + index * 0.08), CELESTIAL_SAGE_STAR_BOLT_KEY, 0)
        .setAngle(90)
        .setScale((layout.tileSize * 0.38) / 128)
        .setDepth(95)
        .play(CELESTIAL_SAGE_STAR_BOLT_ANIMATION_KEY);

      this.registerEffect(meteor, 760);
      this.scene.tweens.add({
        targets: meteor,
        x: center.x + layout.tileSize * offset * 0.32,
        y: center.y + layout.tileSize * 0.06,
        scale: (layout.tileSize * 0.58) / 128,
        delay: index * 85,
        duration: 330,
        ease: 'Quad.easeIn',
        onComplete: () => {
          meteor.destroy();
          if (index === meteorOffsets.length - 1) {
            this.playCelestialSageStarfallImpact(center, layout);
          }
        },
      });
    });
  }

  private playCelestialSageStarfallImpact(center: BoardPixelPosition, layout: BoardLayout) {
    const starfall = this.scene.add
      .sprite(center.x, center.y + layout.tileSize * 0.08, CELESTIAL_SAGE_STARFALL_KEY, 0)
      .setScale((layout.tileSize * 2.05) / 128)
      .setDepth(93)
      .play(CELESTIAL_SAGE_STARFALL_ANIMATION_KEY);
    this.registerEffect(starfall, 650);
  }

  private playDawnWardenRadiantBashEffect(targetCenter: BoardPixelPosition, layout: BoardLayout) {
    const impact = this.scene.add.sprite(targetCenter.x, targetCenter.y - layout.tileSize * 0.04, DAWN_WARDEN_RADIANT_BASH_KEY, 0).setScale((layout.tileSize * 0.76) / 128).setDepth(94).play(DAWN_WARDEN_RADIANT_BASH_ANIMATION_KEY);
    this.registerEffect(impact, 440);
  }

  private playGeneratedBasicImpact(targetCenter: BoardPixelPosition, layout: BoardLayout, textureKey: string, animationKey: string, size: number) {
    const impact = this.scene.add
      .sprite(targetCenter.x, targetCenter.y - layout.tileSize * 0.04, textureKey, 0)
      .setScale((layout.tileSize * size) / 128)
      .setDepth(94)
      .play(animationKey);
    this.registerEffect(impact, 460);
  }

  private playArrowTrail(sourceCenter: BoardPixelPosition, targetCenter: BoardPixelPosition, layout: BoardLayout, color: number) {
    for (let index = 1; index <= 4; index += 1) {
      const ratio = index / 5;
      const trail = this.scene.add
        .circle(
          Phaser.Math.Linear(sourceCenter.x, targetCenter.x, ratio),
          Phaser.Math.Linear(sourceCenter.y, targetCenter.y, ratio),
          Math.max(2, layout.tileSize * 0.024),
          color,
          0.24,
        )
        .setDepth(84);

      this.registerEffect(trail, PROJECTILE_TWEEN_MS + 80);
      this.scene.tweens.add({
        targets: trail,
        alpha: 0,
        scale: 0.2,
        delay: index * 16,
        duration: PROJECTILE_TWEEN_MS + 60,
        ease: 'Cubic.easeOut',
        onComplete: () => trail.destroy(),
      });
    }
  }

  private playProjectileTrail(sourceCenter: BoardPixelPosition, targetCenter: BoardPixelPosition, layout: BoardLayout) {
    for (let index = 1; index <= PROJECTILE_TRAIL_COUNT; index += 1) {
      const ratio = index / (PROJECTILE_TRAIL_COUNT + 1);
      const x = Phaser.Math.Linear(sourceCenter.x, targetCenter.x, ratio);
      const y = Phaser.Math.Linear(sourceCenter.y, targetCenter.y, ratio);
      const trail = this.acquireProjectileCircle(
        x,
        y,
        Math.max(3, layout.tileSize * 0.04),
        PROJECTILE_COLOR,
        0.22,
        83,
      );

      this.scene.tweens.add({
        targets: trail,
        alpha: 0,
        scale: 0.25,
        delay: index * 18,
        duration: PROJECTILE_TWEEN_MS,
        ease: 'Sine.easeOut',
        onComplete: () => this.releaseProjectileCircle(trail),
      });
    }
  }

  private playSlashEffect(sourceCenter: BoardPixelPosition, targetCenter: BoardPixelPosition, layout: BoardLayout) {
    const midpoint = {
      x: (sourceCenter.x + targetCenter.x) / 2,
      y: (sourceCenter.y + targetCenter.y) / 2,
    };
    const angle = Phaser.Math.Angle.Between(sourceCenter.x, sourceCenter.y, targetCenter.x, targetCenter.y);
    const slash = this.scene.add
      .rectangle(midpoint.x, midpoint.y, layout.tileSize * 0.48, 5, 0xfef3c7, 0.82)
      .setRotation(angle)
      .setDepth(87);

    this.registerEffect(slash, SLASH_TWEEN_MS + 80);
    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 1.6,
      scaleY: 0.2,
      duration: SLASH_TWEEN_MS,
      ease: 'Cubic.easeOut',
      onComplete: () => slash.destroy(),
    });
  }

  private playCinderDuelistSkillStrikeEffect(source: CombatUnit, target: CombatUnit, layout: BoardLayout) {
    const sourceView = this.unitViewById.get(source.instanceId);
    const sourceCenter = boardToPhaserPosition(source.position, layout);
    const targetCenter = boardToPhaserPosition(target.position, layout);
    const angle = Phaser.Math.Angle.Between(sourceCenter.x, sourceCenter.y, targetCenter.x, targetCenter.y);
    const midpoint = {
      x: (sourceCenter.x + targetCenter.x) / 2,
      y: (sourceCenter.y + targetCenter.y) / 2,
    };

    if (sourceView) {
      this.playUnitAttackAnimation(sourceView, targetCenter.x < sourceCenter.x);
      this.scene.tweens.add({
        targets: sourceView,
        x: Phaser.Math.Linear(sourceCenter.x, targetCenter.x, 0.24),
        y: Phaser.Math.Linear(sourceCenter.y, targetCenter.y, 0.24),
        duration: BASIC_ATTACK_TWEEN_MS,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }

    const cinderStrike = this.scene.add
      .sprite(targetCenter.x, targetCenter.y, CINDER_DUELIST_CINDER_STRIKE_KEY, 0)
      .setScale((layout.tileSize * 1.45) / 128)
      .setRotation(angle)
      .setDepth(94)
      .play(CINDER_DUELIST_CINDER_STRIKE_ANIMATION_KEY);

    this.registerEffect(cinderStrike, 520);
    this.scene.cameras.main.shake(SCREEN_SHAKE_MS, SCREEN_SHAKE_INTENSITY * 1.2);
    return;

    const firstSlash = this.scene.add
      .rectangle(midpoint.x, midpoint.y, layout.tileSize * 0.68, 6, CINDER_FLASH_COLOR, 0.92)
      .setRotation(angle - 0.48)
      .setDepth(90);
    const secondSlash = this.scene.add
      .rectangle(midpoint.x, midpoint.y, layout.tileSize * 0.6, 5, CINDER_BLADE_COLOR, 0.88)
      .setRotation(angle + 0.48)
      .setDepth(91);
    const emberLine = this.scene.add
      .rectangle(midpoint.x, midpoint.y, layout.tileSize * 0.78, 3, EMBER_CORE_COLOR, 0.72)
      .setRotation(angle)
      .setDepth(89);

    this.registerEffect(firstSlash, SLASH_TWEEN_MS + 120);
    this.registerEffect(secondSlash, SLASH_TWEEN_MS + 120);
    this.registerEffect(emberLine, SLASH_TWEEN_MS + 120);
    this.playCinderAfterimages(sourceCenter, targetCenter, layout);

    for (const slash of [firstSlash, secondSlash, emberLine]) {
      this.scene.tweens.add({
        targets: slash,
        alpha: 0,
        scaleX: 1.75,
        scaleY: 0.25,
        duration: SLASH_TWEEN_MS + 70,
        ease: 'Cubic.easeOut',
        onComplete: () => slash.destroy(),
      });
    }
  }

  private playCinderAfterimages(sourceCenter: BoardPixelPosition, targetCenter: BoardPixelPosition, layout: BoardLayout) {
    for (let index = 1; index <= 3; index += 1) {
      const ratio = index / 4;
      const afterimage = this.scene.add
        .ellipse(
          Phaser.Math.Linear(sourceCenter.x, targetCenter.x, ratio),
          Phaser.Math.Linear(sourceCenter.y, targetCenter.y, ratio),
          layout.tileSize * 0.18,
          layout.tileSize * 0.1,
          CINDER_SMOKE_COLOR,
          0.34,
        )
        .setDepth(84);

      this.registerEffect(afterimage, SLASH_TWEEN_MS + 160);
      this.scene.tweens.add({
        targets: afterimage,
        alpha: 0,
        scaleX: 1.8,
        scaleY: 0.35,
        delay: index * 22,
        duration: SLASH_TWEEN_MS + 80,
        ease: 'Cubic.easeOut',
        onComplete: () => afterimage.destroy(),
      });
    }
  }

  private playCinderDuelistHitEffect(target: CombatUnit, layout: BoardLayout) {
    const targetCenter = boardToPhaserPosition(target.position, layout);
    const flash = this.scene.add.circle(targetCenter.x, targetCenter.y, layout.tileSize * 0.24, CINDER_FLASH_COLOR, 0.48).setDepth(90);

    this.playSparkBurst(targetCenter, IMPACT_SPARK_COUNT + 6, CINDER_BLADE_COLOR, layout, 120);
    this.playSparkBurst(targetCenter, 6, CINDER_FLASH_COLOR, layout, 70);
    this.playShockwave(targetCenter, layout.tileSize * 0.22, layout, CINDER_BLADE_COLOR);
    this.registerEffect(flash, HIT_FLASH_TWEEN_MS + 100);
    this.scene.cameras.main.shake(SCREEN_SHAKE_MS, SCREEN_SHAKE_INTENSITY * 1.2);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.55,
      duration: HIT_FLASH_TWEEN_MS + 40,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });
  }

  private playFrostArcherSkillShotEffect(source: CombatUnit, target: CombatUnit, amount: number, layout: BoardLayout) {
    const sourceView = this.unitViewById.get(source.instanceId);
    const sourceCenter = boardToPhaserPosition(source.position, layout);
    const targetCenter = boardToPhaserPosition(target.position, layout);
    const angle = Phaser.Math.Angle.Between(sourceCenter.x, sourceCenter.y, targetCenter.x, targetCenter.y);

    if (sourceView) {
      this.playUnitAttackAnimation(sourceView);
    }

    const chillingShot = this.scene.add
      .sprite(sourceCenter.x, sourceCenter.y, FROST_ARCHER_CHILLING_SHOT_KEY, 0)
      .setScale((layout.tileSize * 0.9) / 128)
      .setRotation(angle)
      .setDepth(93)
      .play(FROST_ARCHER_CHILLING_SHOT_ANIMATION_KEY);

    this.registerEffect(chillingShot, PROJECTILE_TWEEN_MS + 140);
    this.scene.tweens.add({
      targets: chillingShot,
      x: targetCenter.x,
      y: targetCenter.y,
      scale: amount >= 100 ? chillingShot.scale * 1.15 : chillingShot.scale,
      duration: PROJECTILE_TWEEN_MS + 30,
      ease: 'Sine.easeIn',
      onComplete: () => chillingShot.destroy(),
    });
  }

  private playFrostArcherHitEffect(target: CombatUnit, layout: BoardLayout) {
    const targetCenter = boardToPhaserPosition(target.position, layout);
    const frostBurst = this.scene.add.circle(targetCenter.x, targetCenter.y, layout.tileSize * 0.24, FROST_CORE_COLOR, 0.34).setDepth(90);
    const frostRing = this.scene.add.circle(targetCenter.x, targetCenter.y, layout.tileSize * 0.34, FROST_ARROW_COLOR, 0.08).setDepth(89);

    frostRing.setStrokeStyle(3, FROST_RING_COLOR, 0.86);
    this.playSparkBurst(targetCenter, IMPACT_SPARK_COUNT + 6, FROST_ARROW_COLOR, layout, 110);
    this.playSnowflakeBurst(targetCenter, layout);
    this.registerEffect(frostBurst, HIT_FLASH_TWEEN_MS + 160);
    this.registerEffect(frostRing, HIT_FLASH_TWEEN_MS + 200);
    this.scene.cameras.main.shake(SCREEN_SHAKE_MS, SCREEN_SHAKE_INTENSITY * 0.8);
    this.scene.tweens.add({
      targets: frostBurst,
      alpha: 0,
      scale: 1.55,
      duration: HIT_FLASH_TWEEN_MS + 80,
      ease: 'Quad.easeOut',
      onComplete: () => frostBurst.destroy(),
    });
    this.scene.tweens.add({
      targets: frostRing,
      alpha: 0,
      scale: 1.55,
      duration: HIT_FLASH_TWEEN_MS + 120,
      ease: 'Cubic.easeOut',
      onComplete: () => frostRing.destroy(),
    });
  }

  private playSnowflakeBurst(center: BoardPixelPosition, layout: BoardLayout) {
    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8;
      const shard = this.scene.add
        .rectangle(center.x, center.y, Math.max(2, layout.tileSize * 0.025), Math.max(8, layout.tileSize * 0.09), FROST_CORE_COLOR, 0.82)
        .setRotation(angle)
        .setDepth(91);

      this.registerEffect(shard, SHOCKWAVE_TWEEN_MS + 80);
      this.scene.tweens.add({
        targets: shard,
        x: center.x + Math.cos(angle) * layout.tileSize * 0.34,
        y: center.y + Math.sin(angle) * layout.tileSize * 0.22,
        alpha: 0,
        scale: 0.35,
        duration: SHOCKWAVE_TWEEN_MS,
        ease: 'Cubic.easeOut',
        onComplete: () => shard.destroy(),
      });
    }
  }

  private playHitEffect(target: CombatUnit, layout: BoardLayout) {
    const targetCenter = boardToPhaserPosition(target.position, layout);
    const flash = this.scene.add
      .circle(targetCenter.x, targetCenter.y, layout.tileSize * 0.28, 0xffffff, 0.45)
      .setDepth(86);
    const targetView = this.unitViewById.get(target.instanceId);

    this.playSparkBurst(targetCenter, IMPACT_SPARK_COUNT, SPARK_COLOR, layout, 90);
    this.playShockwave(targetCenter, layout.tileSize * 0.26, layout, 0xffffff);
    this.scene.cameras.main.shake(SCREEN_SHAKE_MS, SCREEN_SHAKE_INTENSITY);

    if (targetView) {
      this.scene.tweens.add({
        targets: targetView,
        scaleX: 1.08,
        scaleY: 0.92,
        duration: HIT_FLASH_TWEEN_MS,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }

    this.registerEffect(flash, HIT_FLASH_TWEEN_MS + 80);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.35,
      duration: HIT_FLASH_TWEEN_MS,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });
  }

  private playSparkBurst(
    center: BoardPixelPosition,
    count: number,
    color: number,
    layout: BoardLayout,
    spread: number,
  ) {
    for (let index = 0; index < count; index += 1) {
      const angle = (Math.PI * 2 * index) / count + Phaser.Math.FloatBetween(-0.18, 0.18);
      const distance = Phaser.Math.FloatBetween(layout.tileSize * 0.18, layout.tileSize * 0.18 + spread * 0.18);
      const spark = this.scene.add
        .rectangle(center.x, center.y, Math.max(3, layout.tileSize * 0.035), Math.max(7, layout.tileSize * 0.08), color, 0.9)
        .setRotation(angle)
        .setDepth(88);

      this.registerEffect(spark, SHOCKWAVE_TWEEN_MS + 120);
      this.scene.tweens.add({
        targets: spark,
        x: center.x + Math.cos(angle) * distance,
        y: center.y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.35,
        duration: SHOCKWAVE_TWEEN_MS,
        ease: 'Cubic.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
  }

  private playShockwave(center: BoardPixelPosition, radius: number, layout: BoardLayout, color: number) {
    const ring = this.scene.add.circle(center.x, center.y, radius, color, 0.08).setDepth(82);

    ring.setStrokeStyle(2, color, 0.62);
    this.registerEffect(ring, SHOCKWAVE_TWEEN_MS + 100);
    this.scene.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 1.9,
      duration: SHOCKWAVE_TWEEN_MS,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  private playFloatingText(
    position: BoardPosition,
    text: string,
    color: string,
    layout: BoardLayout,
    scale = 1,
  ) {
    const center = boardToPhaserPosition(position, layout);
    const label = this.acquireFloatingText()
      .setText(text)
      .setStyle({
        color,
        fontFamily: 'Arial, sans-serif',
        fontSize: `${Math.round(13 * scale)}px`,
        fontStyle: 'bold',
        stroke: '#020617',
        strokeThickness: 3,
      })
      .setPosition(center.x, center.y - layout.tileSize * 0.24)
      .setOrigin(0.5)
      .setDepth(90);

    this.scene.tweens.add({
      targets: label,
      y: label.y - layout.tileSize * 0.32,
      alpha: 0,
      scale,
      duration: FLOATING_TEXT_TWEEN_MS,
      ease: 'Cubic.easeOut',
      onComplete: () => this.releaseFloatingText(label),
    });
  }

  private playShieldEffect(target: CombatUnit, amount: number, layout: BoardLayout) {
    const center = boardToPhaserPosition(target.position, layout);
    const ring = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.32, 0x93c5fd, 0.1).setDepth(84);

    ring.setStrokeStyle(3, 0x93c5fd, 0.88);
    this.registerEffect(ring, SKILL_EFFECT_TWEEN_MS + 100);
    this.playFloatingText(target.position, `보호막 ${amount}`, SHIELD_TEXT_COLOR, layout);
    this.scene.tweens.add({
      targets: ring,
      scale: 1.45,
      alpha: 0,
      duration: SKILL_EFFECT_TWEEN_MS,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  private playSkillCastEffect(source: CombatUnit, skillName: string, layout: BoardLayout) {
    if (source.unitId === 'ember-guard') {
      this.playEmberGuardSkillCastEffect(source, skillName, layout);
      return;
    }

    if (source.unitId === 'cinder-duelist') {
      this.playCinderDuelistSkillCastEffect(source, skillName, layout);
      return;
    }

    if (source.unitId === 'frost-archer') {
      this.playFrostArcherSkillCastEffect(source, skillName, layout);
      return;
    }

    if (source.unitId === 'glacier-mage') {
      this.playGlacierMageIceBloomCastEffect(source, skillName, layout);
      return;
    }

    if (source.unitId === 'shade-stalker') {
      this.playShadeStalkerSkillCastEffect(source, skillName, layout);
      return;
    }

    if (source.unitId === 'night-oracle') {
      this.playNightOracleSkillCastEffect(source, skillName, layout);
      return;
    }

    if (source.unitId === 'ironwood-bulwark') {
      this.playIronwoodBulwarkSkillCastEffect(source, skillName, layout);
      return;
    }

    if (source.unitId === 'grove-mystic') {
      this.playGroveMysticSkillCastEffect(source, skillName, layout);
      return;
    }

    if (source.unitId === 'storm-ranger') {
      const center = boardToPhaserPosition(source.position, layout);
      const gale = this.scene.add.sprite(center.x, center.y, STORM_RANGER_RAPID_GALE_KEY, 0).setScale((layout.tileSize * 1.4) / 128).setDepth(94).play(STORM_RANGER_RAPID_GALE_ANIMATION_KEY);
      this.registerEffect(gale, 620);
      this.playUnitAttackAnimation(this.unitViewById.get(source.instanceId)!);
      return;
    }

    if (source.unitId === 'thunder-bruiser') {
      const center = boardToPhaserPosition(source.position, layout);
      const ring = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.38, 0x22d3ee, 0.1).setDepth(84);
      const label = this.scene.add.text(center.x, center.y - layout.tileSize * 0.48, skillName, { color: '#cffafe', fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', stroke: '#083344', strokeThickness: 3 }).setOrigin(0.5).setDepth(90);
      ring.setStrokeStyle(3, 0x67e8f9, 0.92);
      this.playUnitAttackAnimation(this.unitViewById.get(source.instanceId)!);
      this.registerEffect(ring, 520);
      this.registerEffect(label, 600);
      this.scene.tweens.add({ targets: ring, scale: 1.7, alpha: 0, duration: 480, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
      this.scene.tweens.add({ targets: label, y: label.y - 14, alpha: 0, duration: 580, ease: 'Cubic.easeOut', onComplete: () => label.destroy() });
      return;
    }

    if (source.unitId === 'celestial-sage') {
      const center = boardToPhaserPosition(source.position, layout);
      const ring = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.34, 0xfde68a, 0.1).setDepth(84);
      const label = this.scene.add.text(center.x, center.y - layout.tileSize * 0.48, skillName, { color: '#fef3c7', fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', stroke: '#1e3a8a', strokeThickness: 3 }).setOrigin(0.5).setDepth(90);
      ring.setStrokeStyle(3, 0xfacc15, 0.94);
      this.playUnitAttackAnimation(this.unitViewById.get(source.instanceId)!);
      this.registerEffect(ring, 520);
      this.registerEffect(label, 600);
      this.scene.tweens.add({ targets: ring, scale: 1.7, alpha: 0, duration: 480, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
      this.scene.tweens.add({ targets: label, y: label.y - 14, alpha: 0, duration: 580, ease: 'Cubic.easeOut', onComplete: () => label.destroy() });
      return;
    }

    if (source.unitId === 'dawn-warden') {
      const center = boardToPhaserPosition(source.position, layout);
      const ring = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.36, 0xfacc15, 0.1).setDepth(84);
      const label = this.scene.add.text(center.x, center.y - layout.tileSize * 0.48, skillName, { color: '#fef3c7', fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', stroke: '#713f12', strokeThickness: 3 }).setOrigin(0.5).setDepth(90);
      ring.setStrokeStyle(3, 0xfde68a, 0.94);
      this.playUnitAttackAnimation(this.unitViewById.get(source.instanceId)!);
      this.registerEffect(ring, 520);
      this.registerEffect(label, 600);
      this.scene.tweens.add({ targets: ring, scale: 1.7, alpha: 0, duration: 480, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
      this.scene.tweens.add({ targets: label, y: label.y - 14, alpha: 0, duration: 580, ease: 'Cubic.easeOut', onComplete: () => label.destroy() });
      return;
    }

    const center = boardToPhaserPosition(source.position, layout);
    const ring = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.38, 0x38bdf8, 0.12).setDepth(80);
    const label = this.scene.add
      .text(center.x, center.y - layout.tileSize * 0.45, skillName, {
        color: '#bae6fd',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        stroke: '#020617',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(81);

    ring.setStrokeStyle(3, 0x7dd3fc, 0.95);
    this.playSparkBurst(center, SKILL_SPARK_COUNT, MAGIC_SPARK_COLOR, layout, 150);
    this.playShockwave(center, layout.tileSize * 0.36, layout, 0x38bdf8);
    this.registerEffect(ring, SKILL_EFFECT_TWEEN_MS + 140);
    this.registerEffect(label, SKILL_EFFECT_TWEEN_MS + 180);
    this.scene.tweens.add({
      targets: ring,
      scale: 1.7,
      alpha: 0,
      duration: SKILL_EFFECT_TWEEN_MS,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
    this.scene.tweens.add({
      targets: label,
      y: label.y - 18,
      alpha: 0,
      duration: SKILL_EFFECT_TWEEN_MS + 140,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  private playNightOracleSkillCastEffect(source: CombatUnit, skillName: string, layout: BoardLayout) {
    const sourceView = this.unitViewById.get(source.instanceId);
    const center = boardToPhaserPosition(source.position, layout);
    const ring = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.3, ORACLE_RUNE_COLOR, 0.08).setDepth(84);
    const crescent = this.scene.add.arc(center.x, center.y - layout.tileSize * 0.08, layout.tileSize * 0.18, 210, 30, false, ORACLE_MOON_COLOR, 0.32).setDepth(86);
    const label = this.scene.add
      .text(center.x, center.y - layout.tileSize * 0.48, skillName, {
        color: '#f3e8ff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        stroke: '#3b0764',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(90);

    if (sourceView) {
      this.playUnitAttackAnimation(sourceView);
    }

    ring.setStrokeStyle(2, ORACLE_MOON_COLOR, 0.9);
    this.registerEffect(ring, 520);
    this.registerEffect(crescent, 520);
    this.registerEffect(label, 600);
    this.scene.tweens.add({
      targets: [ring, crescent],
      alpha: 0,
      scale: 1.55,
      duration: 480,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        ring.destroy();
        crescent.destroy();
      },
    });
    this.scene.tweens.add({
      targets: label,
      y: label.y - 14,
      alpha: 0,
      duration: 580,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  private playNightOracleTwilightMendEffect(target: CombatUnit, amount: number, layout: BoardLayout) {
    const center = boardToPhaserPosition(target.position, layout);
    const mend = this.scene.add
      .sprite(center.x, center.y + layout.tileSize * 0.03, NIGHT_ORACLE_TWILIGHT_MEND_KEY, 0)
      .setScale((layout.tileSize * 1.58) / 128)
      .setDepth(94)
      .play(NIGHT_ORACLE_TWILIGHT_MEND_ANIMATION_KEY);

    this.playFloatingText(target.position, `+${amount}`, '#ddd6fe', layout);
    this.registerEffect(mend, 620);
  }

  private playGroveMysticSkillCastEffect(source: CombatUnit, skillName: string, layout: BoardLayout) {
    const sourceView = this.unitViewById.get(source.instanceId);
    const center = boardToPhaserPosition(source.position, layout);
    const ring = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.3, 0x84cc16, 0.1).setDepth(84);
    const label = this.scene.add.text(center.x, center.y - layout.tileSize * 0.48, skillName, { color: '#d9f99d', fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', stroke: '#365314', strokeThickness: 3 }).setOrigin(0.5).setDepth(90);
    if (sourceView) this.playUnitAttackAnimation(sourceView);
    ring.setStrokeStyle(3, 0xd9f99d, 0.9);
    this.registerEffect(ring, 520);
    this.registerEffect(label, 600);
    this.scene.tweens.add({ targets: ring, scale: 1.6, alpha: 0, duration: 480, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    this.scene.tweens.add({ targets: label, y: label.y - 14, alpha: 0, duration: 580, ease: 'Cubic.easeOut', onComplete: () => label.destroy() });
  }

  private playGroveMysticVerdantPulseEffect(target: CombatUnit, amount: number, layout: BoardLayout) {
    const center = boardToPhaserPosition(target.position, layout);
    const pulse = this.scene.add.sprite(center.x, center.y + layout.tileSize * 0.04, GROVE_MYSTIC_VERDANT_PULSE_KEY, 0).setScale((layout.tileSize * 1.6) / 128).setDepth(94).play(GROVE_MYSTIC_VERDANT_PULSE_ANIMATION_KEY);
    this.playFloatingText(target.position, `+${amount}`, '#d9f99d', layout);
    this.registerEffect(pulse, 620);
  }

  private playIronwoodBulwarkSkillCastEffect(source: CombatUnit, skillName: string, layout: BoardLayout) {
    const sourceView = this.unitViewById.get(source.instanceId);
    const center = boardToPhaserPosition(source.position, layout);
    const rootRing = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.3, IRONWOOD_ROOT_COLOR, 0.1).setDepth(84);
    const core = this.scene.add.circle(center.x, center.y - layout.tileSize * 0.1, layout.tileSize * 0.12, IRONWOOD_CORE_COLOR, 0.44).setDepth(86);
    const label = this.scene.add
      .text(center.x, center.y - layout.tileSize * 0.48, skillName, {
        color: '#d9f99d',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        stroke: '#1a2e05',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(90);

    if (sourceView) {
      this.playUnitAttackAnimation(sourceView);
    }

    rootRing.setStrokeStyle(3, IRONWOOD_CORE_COLOR, 0.9);
    this.registerEffect(rootRing, 540);
    this.registerEffect(core, 540);
    this.registerEffect(label, 620);
    this.scene.tweens.add({
      targets: [rootRing, core],
      scale: 1.6,
      alpha: 0,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        rootRing.destroy();
        core.destroy();
      },
    });
    this.scene.tweens.add({
      targets: label,
      y: label.y - 14,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  private playIronwoodBulwarkShieldEffect(target: CombatUnit, amount: number, layout: BoardLayout) {
    const center = boardToPhaserPosition(target.position, layout);
    const shield = this.scene.add
      .sprite(center.x, center.y + layout.tileSize * 0.03, IRONWOOD_BULWARK_ROOTED_ROAR_KEY, 0)
      .setScale((layout.tileSize * 1.62) / 128)
      .setDepth(94)
      .play(IRONWOOD_BULWARK_ROOTED_ROAR_ANIMATION_KEY);

    this.playFloatingText(target.position, `보호막 ${amount}`, '#d9f99d', layout);
    this.registerEffect(shield, 650);
  }

  private playDawnWardenRadiantAegisEffect(target: CombatUnit, amount: number, layout: BoardLayout) {
    const center = boardToPhaserPosition(target.position, layout);
    const aegis = this.scene.add
      .sprite(center.x, center.y + layout.tileSize * 0.02, DAWN_WARDEN_RADIANT_AEGIS_KEY, 0)
      .setScale((layout.tileSize * 1.72) / 128)
      .setDepth(94)
      .play(DAWN_WARDEN_RADIANT_AEGIS_ANIMATION_KEY);

    this.playFloatingText(target.position, `보호막 +${amount}`, '#fef3c7', layout);
    this.registerEffect(aegis, 650);
  }

  private playCinderDuelistSkillCastEffect(source: CombatUnit, skillName: string, layout: BoardLayout) {
    const center = boardToPhaserPosition(source.position, layout);
    const readyRing = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.3, EMBER_CORE_COLOR, 0.08).setDepth(84);
    const bladeLeft = this.scene.add
      .rectangle(center.x - layout.tileSize * 0.08, center.y, layout.tileSize * 0.4, 4, CINDER_FLASH_COLOR, 0.86)
      .setRotation(-0.78)
      .setDepth(88);
    const bladeRight = this.scene.add
      .rectangle(center.x + layout.tileSize * 0.08, center.y, layout.tileSize * 0.4, 4, CINDER_BLADE_COLOR, 0.86)
      .setRotation(0.78)
      .setDepth(88);
    const label = this.scene.add
      .text(center.x, center.y - layout.tileSize * 0.5, skillName, {
        color: '#fed7aa',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        stroke: '#450a0a',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(89);

    readyRing.setStrokeStyle(2, CINDER_BLADE_COLOR, 0.8);
    this.playSparkBurst(center, 10, CINDER_BLADE_COLOR, layout, 85);
    this.registerEffect(readyRing, SKILL_EFFECT_TWEEN_MS);
    this.registerEffect(bladeLeft, SKILL_EFFECT_TWEEN_MS);
    this.registerEffect(bladeRight, SKILL_EFFECT_TWEEN_MS);
    this.registerEffect(label, SKILL_EFFECT_TWEEN_MS + 120);

    this.scene.tweens.add({
      targets: readyRing,
      alpha: 0,
      scale: 1.45,
      duration: SKILL_EFFECT_TWEEN_MS - 80,
      ease: 'Cubic.easeOut',
      onComplete: () => readyRing.destroy(),
    });
    this.scene.tweens.add({
      targets: [bladeLeft, bladeRight],
      alpha: 0,
      scaleX: 1.6,
      scaleY: 0.2,
      duration: SKILL_EFFECT_TWEEN_MS - 90,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        bladeLeft.destroy();
        bladeRight.destroy();
      },
    });
    this.scene.tweens.add({
      targets: label,
      y: label.y - 16,
      alpha: 0,
      duration: SKILL_EFFECT_TWEEN_MS + 100,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  private playFrostArcherSkillCastEffect(source: CombatUnit, skillName: string, layout: BoardLayout) {
    const center = boardToPhaserPosition(source.position, layout);
    const aimRing = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.32, FROST_ARROW_COLOR, 0.08).setDepth(84);
    const bowGlint = this.scene.add
      .rectangle(center.x + layout.tileSize * 0.1, center.y - layout.tileSize * 0.06, layout.tileSize * 0.36, 4, FROST_CORE_COLOR, 0.9)
      .setRotation(-0.2)
      .setDepth(88);
    const label = this.scene.add
      .text(center.x, center.y - layout.tileSize * 0.5, skillName, {
        color: '#e0f2fe',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        stroke: '#082f49',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(89);

    aimRing.setStrokeStyle(2, FROST_CORE_COLOR, 0.82);
    this.playSparkBurst(center, 10, FROST_ARROW_COLOR, layout, 80);
    this.registerEffect(aimRing, SKILL_EFFECT_TWEEN_MS);
    this.registerEffect(bowGlint, SKILL_EFFECT_TWEEN_MS);
    this.registerEffect(label, SKILL_EFFECT_TWEEN_MS + 120);
    this.scene.tweens.add({
      targets: aimRing,
      alpha: 0,
      scale: 1.5,
      duration: SKILL_EFFECT_TWEEN_MS - 80,
      ease: 'Cubic.easeOut',
      onComplete: () => aimRing.destroy(),
    });
    this.scene.tweens.add({
      targets: bowGlint,
      alpha: 0,
      scaleX: 1.8,
      scaleY: 0.25,
      duration: SKILL_EFFECT_TWEEN_MS - 90,
      ease: 'Cubic.easeOut',
      onComplete: () => bowGlint.destroy(),
    });
    this.scene.tweens.add({
      targets: label,
      y: label.y - 16,
      alpha: 0,
      duration: SKILL_EFFECT_TWEEN_MS + 100,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  private playGlacierMageIceBloomCastEffect(source: CombatUnit, skillName: string, layout: BoardLayout) {
    const sourceView = this.unitViewById.get(source.instanceId);
    const center = boardToPhaserPosition(source.position, layout);
    const outerRing = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.34, GLACIER_BLOOM_COLOR, 0.07).setDepth(84);
    const innerRing = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.2, GLACIER_CRYSTAL_COLOR, 0.1).setDepth(85);
    const crystal = this.scene.add
      .rectangle(center.x, center.y - layout.tileSize * 0.28, layout.tileSize * 0.09, layout.tileSize * 0.2, GLACIER_CRYSTAL_COLOR, 0.9)
      .setRotation(Math.PI / 4)
      .setDepth(89);
    const label = this.scene.add
      .text(center.x, center.y - layout.tileSize * 0.52, skillName, {
        color: '#cffafe',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        stroke: '#164e63',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(90);

    if (sourceView) {
      this.playUnitAttackAnimation(sourceView);
    }

    outerRing.setStrokeStyle(3, GLACIER_BLOOM_COLOR, 0.86);
    innerRing.setStrokeStyle(2, GLACIER_CRYSTAL_COLOR, 0.9);
    this.playSparkBurst(center, SKILL_SPARK_COUNT + 6, GLACIER_CRYSTAL_COLOR, layout, 110);
    this.registerEffect(outerRing, SKILL_EFFECT_TWEEN_MS + 140);
    this.registerEffect(innerRing, SKILL_EFFECT_TWEEN_MS + 100);
    this.registerEffect(crystal, SKILL_EFFECT_TWEEN_MS + 120);
    this.registerEffect(label, SKILL_EFFECT_TWEEN_MS + 140);
    this.scene.tweens.add({
      targets: outerRing,
      alpha: 0,
      scale: 1.7,
      duration: SKILL_EFFECT_TWEEN_MS,
      ease: 'Cubic.easeOut',
      onComplete: () => outerRing.destroy(),
    });
    this.scene.tweens.add({
      targets: [innerRing, crystal],
      y: '-=12',
      alpha: 0,
      scale: 1.45,
      duration: SKILL_EFFECT_TWEEN_MS - 40,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        innerRing.destroy();
        crystal.destroy();
      },
    });
    this.scene.tweens.add({
      targets: label,
      y: label.y - 18,
      alpha: 0,
      duration: SKILL_EFFECT_TWEEN_MS + 120,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  private playGlacierMageIceBloomHitEffect(target: CombatUnit, layout: BoardLayout) {
    const center = boardToPhaserPosition(target.position, layout);
    const bloom = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.2, GLACIER_CRYSTAL_COLOR, 0.32).setDepth(90);
    const petalRing = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.3, GLACIER_BLOOM_COLOR, 0.07).setDepth(89);

    petalRing.setStrokeStyle(3, GLACIER_DEEP_COLOR, 0.88);
    this.playSnowflakeBurst(center, layout);
    this.playSparkBurst(center, IMPACT_SPARK_COUNT + 8, GLACIER_BLOOM_COLOR, layout, 135);
    this.registerEffect(bloom, HIT_FLASH_TWEEN_MS + 180);
    this.registerEffect(petalRing, HIT_FLASH_TWEEN_MS + 220);
    this.scene.cameras.main.shake(SCREEN_SHAKE_MS, SCREEN_SHAKE_INTENSITY * 0.7);
    this.scene.tweens.add({
      targets: bloom,
      alpha: 0,
      scale: 2.15,
      duration: HIT_FLASH_TWEEN_MS + 100,
      ease: 'Quad.easeOut',
      onComplete: () => bloom.destroy(),
    });
    this.scene.tweens.add({
      targets: petalRing,
      alpha: 0,
      scale: 1.9,
      duration: HIT_FLASH_TWEEN_MS + 140,
      ease: 'Cubic.easeOut',
      onComplete: () => petalRing.destroy(),
    });
  }

  private playGlacierMageIceBloomAreaEffect(target: CombatUnit, layout: BoardLayout) {
    const center = boardToPhaserPosition(target.position, layout);
    const bloom = this.scene.add
      .sprite(center.x, center.y, 'effect-glacier-ice-bloom', 0)
      .setScale((layout.tileSize * 1.58) / 128)
      .setDepth(94)
      .play(GLACIER_ICE_BLOOM_ANIMATION_KEY);

    this.registerEffect(bloom, 620);
    this.scene.cameras.main.shake(SCREEN_SHAKE_MS, SCREEN_SHAKE_INTENSITY);
  }

  private playShadeStalkerSkillCastEffect(source: CombatUnit, skillName: string, layout: BoardLayout) {
    const sourceView = this.unitViewById.get(source.instanceId);
    const center = boardToPhaserPosition(source.position, layout);
    const ring = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.28, 0xc084fc, 0.08).setDepth(86);
    const label = this.scene.add
      .text(center.x, center.y - layout.tileSize * 0.5, skillName, {
        color: '#e9d5ff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        stroke: '#3b0764',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(90);

    if (sourceView) {
      this.playUnitAttackAnimation(sourceView);
    }

    ring.setStrokeStyle(2, 0xd8b4fe, 0.9);
    this.registerEffect(ring, SKILL_EFFECT_TWEEN_MS + 100);
    this.registerEffect(label, SKILL_EFFECT_TWEEN_MS + 140);
    this.scene.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 1.6,
      duration: SKILL_EFFECT_TWEEN_MS,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
    this.scene.tweens.add({
      targets: label,
      y: label.y - 18,
      alpha: 0,
      duration: SKILL_EFFECT_TWEEN_MS + 110,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  private playShadeStalkerShadowLungeEffect(source: CombatUnit, target: CombatUnit, layout: BoardLayout) {
    const sourceCenter = boardToPhaserPosition(source.position, layout);
    const targetCenter = boardToPhaserPosition(target.position, layout);
    const sourceView = this.unitViewById.get(source.instanceId);
    const angle = Phaser.Math.Angle.Between(sourceCenter.x, sourceCenter.y, targetCenter.x, targetCenter.y);
    const lunge = this.scene.add
      .sprite(targetCenter.x, targetCenter.y, SHADE_STALKER_SHADOW_LUNGE_KEY, 0)
      .setScale((layout.tileSize * 1.45) / 128)
      .setRotation(angle)
      .setDepth(94)
      .play(SHADE_STALKER_SHADOW_LUNGE_ANIMATION_KEY);

    if (sourceView) {
      this.scene.tweens.add({
        targets: sourceView,
        x: targetCenter.x - Math.cos(angle) * layout.tileSize * 0.18,
        y: targetCenter.y - Math.sin(angle) * layout.tileSize * 0.12,
        duration: 130,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }

    this.registerEffect(lunge, 520);
    this.scene.cameras.main.shake(SCREEN_SHAKE_MS, SCREEN_SHAKE_INTENSITY * 1.15);
  }

  private playEmberGuardSkillCastEffect(source: CombatUnit, skillName: string, layout: BoardLayout) {
    const center = boardToPhaserPosition(source.position, layout);
    const corePulse = this.scene.add.circle(center.x, center.y - layout.tileSize * 0.12, layout.tileSize * 0.18, EMBER_CORE_COLOR, 0.24);
    const outerRing = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.34, EMBER_CORE_COLOR, 0.1);
    const innerRing = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.22, EMBER_GLOW_COLOR, 0.08);
    const label = this.scene.add
      .text(center.x, center.y - layout.tileSize * 0.54, skillName, {
        color: '#fed7aa',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        stroke: '#431407',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(89);

    corePulse.setDepth(87);
    outerRing.setDepth(85).setStrokeStyle(3, EMBER_GLOW_COLOR, 0.92);
    innerRing.setDepth(86).setStrokeStyle(2, EMBER_CORE_COLOR, 0.9);

    this.playSparkBurst(center, SKILL_SPARK_COUNT + 8, EMBER_CORE_COLOR, layout, 170);
    this.playSparkBurst({ x: center.x, y: center.y - layout.tileSize * 0.12 }, 8, EMBER_GLOW_COLOR, layout, 90);
    this.playShockwave(center, layout.tileSize * 0.34, layout, EMBER_CORE_COLOR);
    this.registerEffect(corePulse, SKILL_EFFECT_TWEEN_MS + 180);
    this.registerEffect(outerRing, SKILL_EFFECT_TWEEN_MS + 180);
    this.registerEffect(innerRing, SKILL_EFFECT_TWEEN_MS + 120);
    this.registerEffect(label, SKILL_EFFECT_TWEEN_MS + 180);

    this.scene.tweens.add({
      targets: corePulse,
      alpha: 0,
      scale: 2.2,
      duration: SKILL_EFFECT_TWEEN_MS,
      ease: 'Cubic.easeOut',
      onComplete: () => corePulse.destroy(),
    });
    this.scene.tweens.add({
      targets: outerRing,
      alpha: 0,
      scale: 1.85,
      duration: SKILL_EFFECT_TWEEN_MS + 80,
      ease: 'Cubic.easeOut',
      onComplete: () => outerRing.destroy(),
    });
    this.scene.tweens.add({
      targets: innerRing,
      alpha: 0,
      scale: 1.45,
      duration: SKILL_EFFECT_TWEEN_MS - 40,
      ease: 'Cubic.easeOut',
      onComplete: () => innerRing.destroy(),
    });
    this.scene.tweens.add({
      targets: label,
      y: label.y - 18,
      alpha: 0,
      duration: SKILL_EFFECT_TWEEN_MS + 140,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  private playEmberGuardShieldEffect(target: CombatUnit, amount: number, layout: BoardLayout) {
    const center = boardToPhaserPosition(target.position, layout);
    const shieldSprite = this.scene.add
      .sprite(center.x, center.y, EMBER_GUARD_EMBER_SHIELD_KEY, 0)
      .setScale((layout.tileSize * 1.45) / 128)
      .setDepth(93)
      .play(EMBER_GUARD_EMBER_SHIELD_ANIMATION_KEY);
    const barrier = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.34, EMBER_CORE_COLOR, 0.09).setDepth(86);
    const hotEdge = this.scene.add.circle(center.x, center.y, layout.tileSize * 0.42, EMBER_GLOW_COLOR, 0.03).setDepth(87);

    barrier.setStrokeStyle(4, EMBER_CORE_COLOR, 0.92);
    hotEdge.setStrokeStyle(2, EMBER_GLOW_COLOR, 0.78);
    this.playFloatingText(target.position, `보호막 ${amount}`, '#fed7aa', layout);
    this.registerEffect(shieldSprite, 680);
    this.playOrbitingEmbers(center, layout);
    this.registerEffect(barrier, SKILL_EFFECT_TWEEN_MS + 180);
    this.registerEffect(hotEdge, SKILL_EFFECT_TWEEN_MS + 220);

    this.scene.tweens.add({
      targets: barrier,
      scale: 1.36,
      alpha: 0,
      duration: SKILL_EFFECT_TWEEN_MS + 80,
      ease: 'Cubic.easeOut',
      onComplete: () => barrier.destroy(),
    });
    this.scene.tweens.add({
      targets: hotEdge,
      scale: 1.62,
      alpha: 0,
      duration: SKILL_EFFECT_TWEEN_MS + 140,
      ease: 'Cubic.easeOut',
      onComplete: () => hotEdge.destroy(),
    });
  }

  private playOrbitingEmbers(center: BoardPixelPosition, layout: BoardLayout) {
    const emberCount = 10;
    const radius = layout.tileSize * 0.36;

    for (let index = 0; index < emberCount; index += 1) {
      const startAngle = (Math.PI * 2 * index) / emberCount;
      const ember = this.scene.add
        .circle(
          center.x + Math.cos(startAngle) * radius,
          center.y + Math.sin(startAngle) * radius * 0.58,
          Math.max(2, layout.tileSize * 0.03),
          index % 2 === 0 ? EMBER_GLOW_COLOR : EMBER_CORE_COLOR,
          0.92,
        )
        .setDepth(88);

      this.registerEffect(ember, SKILL_EFFECT_TWEEN_MS + 220);
      this.scene.tweens.add({
        targets: ember,
        x: center.x + Math.cos(startAngle + Math.PI * 0.8) * radius * 1.18,
        y: center.y + Math.sin(startAngle + Math.PI * 0.8) * radius * 0.68,
        alpha: 0,
        scale: 0.3,
        duration: SKILL_EFFECT_TWEEN_MS + 120,
        ease: 'Cubic.easeOut',
        onComplete: () => ember.destroy(),
      });
    }
  }

  private playDeathEffect(unit: CombatUnit, layout: BoardLayout) {
    const center = boardToPhaserPosition(unit.position, layout);
    const burstColor = unit.team === 'enemy' ? ENEMY_UNIT_FILL_COLOR : PLAYER_UNIT_FILL_COLOR;
    const ghost = this.scene.add
      .circle(
        center.x,
        center.y,
        Math.max(20, layout.tileSize * 0.32),
        unit.team === 'enemy' ? ENEMY_UNIT_FILL_COLOR : PLAYER_UNIT_FILL_COLOR,
        0.82,
      )
      .setStrokeStyle(2, UNIT_STROKE_COLOR, 0.65)
      .setDepth(78);

    this.playSparkBurst(center, IMPACT_SPARK_COUNT + 4, burstColor, layout, 130);
    this.registerEffect(ghost, DEATH_FADE_TWEEN_MS + 100);
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scale: 0.5,
      duration: DEATH_FADE_TWEEN_MS,
      ease: 'Cubic.easeIn',
      onComplete: () => ghost.destroy(),
    });
  }

  private playResultBanner(result: CombatResult, layout: BoardLayout) {
    const text = result === 'playerWin' ? '승리' : result === 'enemyWin' ? '패배' : '무승부';
    const color = result === 'playerWin' ? '#fef3c7' : result === 'enemyWin' ? '#fecaca' : '#dbeafe';

    this.playBanner(text, color, layout, RESULT_BANNER_TWEEN_MS);
  }

  private renderPhaseTransition(phase: GamePhase, layout: BoardLayout) {
    if (this.lastPhase === phase) {
      return;
    }

    if (phase === 'combat') {
      this.playBanner('전투 시작', '#bae6fd', layout, ROUND_BANNER_TWEEN_MS);
    }

    if (this.lastPhase === 'combat' && phase !== 'combat') {
      this.playBanner('전투 종료', '#fef3c7', layout, ROUND_BANNER_TWEEN_MS);
    }

    this.lastPhase = phase;
  }

  private playBanner(text: string, color: string, layout: BoardLayout, duration: number) {
    const x = layout.originX + layout.width / 2;
    const y = layout.originY + layout.height / 2;
    const sweep = this.scene.add
      .rectangle(x, y, layout.width * 0.88, 4, 0xffffff, 0.0)
      .setDepth(99);
    const label = this.scene.add
      .text(x, y, text, {
        color,
        fontFamily: 'Arial, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        stroke: '#020617',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setAlpha(0);

    this.registerEffect(sweep, duration + 120);
    this.registerEffect(label, duration + 160);
    this.scene.tweens.add({
      targets: sweep,
      alpha: 0.42,
      scaleY: 10,
      duration: Math.round(duration * 0.18),
      yoyo: true,
      ease: 'Cubic.easeOut',
      onComplete: () => sweep.destroy(),
    });
    this.scene.tweens.add({
      targets: label,
      alpha: 1,
      scale: 1.08,
      duration: Math.round(duration * 0.25),
      yoyo: true,
      hold: Math.round(duration * 0.4),
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  private registerEffect(effect: Phaser.GameObjects.GameObject, ttlMs: number) {
    this.effectViews.push(effect);
    this.scene.time.delayedCall(ttlMs, () => {
      effect.destroy();
      this.cleanupEffectViews();
    });
  }

  private cleanupEffectViews() {
    this.effectViews = this.effectViews.filter((effectView) => effectView.active);
  }

  private destroyEffectViews() {
    for (const effectView of this.effectViews) {
      effectView.destroy();
    }

    this.effectViews = [];
  }

  private acquireFloatingText(): Phaser.GameObjects.Text {
    const label = this.floatingTextPool.pop() ?? this.scene.add.text(0, 0, '');

    this.activeFloatingTexts.add(label);

    return label.setActive(true).setVisible(true).setAlpha(1).setScale(1);
  }

  private releaseFloatingText(label: Phaser.GameObjects.Text) {
    if (!this.activeFloatingTexts.has(label)) {
      return;
    }

    this.scene.tweens.killTweensOf(label);
    this.activeFloatingTexts.delete(label);
    label.setActive(false).setVisible(false);
    this.floatingTextPool.push(label);
  }

  private acquireProjectileCircle(
    x: number,
    y: number,
    radius: number,
    color: number,
    alpha: number,
    depth: number,
  ): Phaser.GameObjects.Arc {
    const projectile = this.projectilePool.pop() ?? this.scene.add.circle(0, 0, radius, color, alpha);

    this.activeProjectiles.add(projectile);

    return projectile
      .setActive(true)
      .setVisible(true)
      .setPosition(x, y)
      .setRadius(radius)
      .setFillStyle(color, alpha)
      .setAlpha(alpha)
      .setScale(1)
      .setDepth(depth);
  }

  private releaseProjectileCircle(projectile: Phaser.GameObjects.Arc) {
    if (!this.activeProjectiles.has(projectile)) {
      return;
    }

    this.scene.tweens.killTweensOf(projectile);
    this.activeProjectiles.delete(projectile);
    projectile.setActive(false).setVisible(false);
    this.projectilePool.push(projectile);
  }

  private destroyPooledEffects() {
    for (const label of this.activeFloatingTexts) {
      this.scene.tweens.killTweensOf(label);
      label.destroy();
    }

    for (const label of this.floatingTextPool) {
      this.scene.tweens.killTweensOf(label);
      label.destroy();
    }

    for (const projectile of this.activeProjectiles) {
      this.scene.tweens.killTweensOf(projectile);
      projectile.destroy();
    }

    for (const projectile of this.projectilePool) {
      this.scene.tweens.killTweensOf(projectile);
      projectile.destroy();
    }

    this.activeFloatingTexts.clear();
    this.floatingTextPool = [];
    this.activeProjectiles.clear();
    this.projectilePool = [];
  }

  private bindTileEvents(tileView: BoardTileView) {
    tileView.tile.on('pointerover', () => {
      this.hoveredPosition = tileView.slot;
      this.updateTileStates();
    });
    tileView.tile.on('pointerout', () => {
      this.hoveredPosition = undefined;
      this.updateTileStates();
    });
    tileView.tile.on('pointerdown', () => {
      if (this.isDraggingUnit) {
        return;
      }

      this.selectedPosition = tileView.slot;
      this.options.onSelectionChange?.({
        position: tileView.slot,
        slot: tileView.slot,
      });
      this.updateTileStates();
    });
  }

  private updateTileStates() {
    for (const tileView of this.tileViews.values()) {
      this.applyTileState(tileView, this.renderState);
    }
  }

  private applyTileState(tileView: BoardTileView, renderState: BoardGridRenderState) {
    const { boardUnits, dragState, level, phase } = renderState;
    const placementState = this.getPlacementVisualState(tileView.slot, boardUnits, level, dragState?.source.instanceId);
    const strokeColor = placementState
      ? placementState === 'placeable'
        ? PLACEABLE_STROKE_COLOR
        : UNPLACEABLE_STROKE_COLOR
      : DEFAULT_STROKE_COLOR;
    const showBoardGuides = phase !== 'combat' || Boolean(dragState);
    const strokeWidth = placementState ? 3 : 1;
    const fillAlpha = placementState === 'placeable' ? 0.32 : showBoardGuides ? (tileView.slot.isDeployable ? 0.1 : 0.055) : 0.012;
    const strokeAlpha = placementState ? 1 : showBoardGuides ? 0.32 : 0.1;

    tileView.tile.setFillStyle(this.getTileFillColor(tileView.slot), fillAlpha);
    tileView.tile.setStrokeStyle(strokeWidth, strokeColor, strokeAlpha);
    tileView.label.setVisible(showBoardGuides || Boolean(placementState));
  }

  private getPlacementVisualState(
    slot: BoardSlot,
    boardUnits: BoardUnit[],
    level: number,
    draggingInstanceId?: string,
  ): 'placeable' | 'blocked' | undefined {
    const { dragState } = this.renderState;

    if (!dragState) {
      return undefined;
    }

    if (dragState.source.kind === 'board') {
      return canMoveUnitToBoardPosition(draggingInstanceId ?? dragState.source.instanceId, slot, boardUnits)
        ? 'placeable'
        : 'blocked';
    }

    return canPlaceUnitOnBoard(slot, boardUnits, level) ? 'placeable' : 'blocked';
  }

  private getTileFillColor(slot: BoardSlot) {
    if (!slot.isDeployable) {
      return slot.side === 'enemy' ? ENEMY_TILE_COLOR : BLOCKED_TILE_COLOR;
    }

    return PLAYER_TILE_COLOR;
  }
}
