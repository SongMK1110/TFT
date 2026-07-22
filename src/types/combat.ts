import type { BoardPosition } from './board';
import type { Item } from './item';
import type { Skill, SkillEffectType, Unit, UnitClass, UnitOrigin } from './unit';

export const DEFAULT_COMBAT_DURATION_MS = 45_000;
export const COMBAT_TICK_MS = 250;
export const MOVE_COOLDOWN_MS = 450;
export const MIN_ATTACK_COOLDOWN_MS = 350;
export const ARMOR_DAMAGE_REDUCTION_RATIO = 0.35;
export const MIN_BASIC_ATTACK_DAMAGE = 1;
export const BASIC_ATTACK_MANA_GAIN = 10;
export const DAMAGE_TAKEN_MANA_GAIN = 5;
export const CRITICAL_DAMAGE_MULTIPLIER = 1.5;
export const COMBAT_AI_IN_RANGE_SCORE_BONUS = -1_000;
export const COMBAT_AI_APPROACHABLE_SCORE_BONUS = -250;
export const COMBAT_AI_DISTANCE_SCORE_WEIGHT = 20;
export const COMBAT_AI_HP_SCORE_WEIGHT = 0.02;
export const COMBAT_AI_POSITION_DISTANCE_WEIGHT = 30;
export const COMBAT_AI_TARGET_DISTANCE_WEIGHT = 10;
export const COMBAT_AI_LANE_ALIGNMENT_WEIGHT = 3;
export const COMBAT_AI_MOVING_AWAY_PENALTY = 18;

export type CombatTeam = 'player' | 'enemy';

export type DamageType = 'physical' | 'magic' | 'true';

export type CombatResult = 'playerWin' | 'enemyWin' | 'draw';

export type CombatUnit = {
  instanceId: string;
  unitId: Unit['id'];
  name: string;
  team: CombatTeam;
  origin: UnitOrigin;
  class: UnitClass;
  position: BoardPosition;
  maxHp: number;
  currentHp: number;
  attackDamage: number;
  attackSpeed: number;
  attackRange: number;
  armor: number;
  critChance: number;
  skillPowerMultiplier: number;
  currentMana: number;
  maxMana: number;
  shield: number;
  shields: CombatShield[];
  skillId: Skill['id'];
  skill: Skill;
  items: Item[];
  usedItemEffectIds: string[];
  statusEffects: CombatStatusEffect[];
  isAlive: boolean;
  nextAttackAtMs: number;
  nextMoveAtMs: number;
};

export type CombatStatusEffect = {
  id: string;
  sourceInstanceId: string;
  effectType: SkillEffectType;
  value: number;
  expiresAtMs: number;
};

export type CombatShield = {
  id: string;
  sourceInstanceId: string;
  value: number;
  expiresAtMs: number;
};

export type DamageEvent = {
  type: 'damage';
  sourceInstanceId: string;
  targetInstanceId: string;
  source: 'basicAttack' | 'skill' | 'item';
  damageType: DamageType;
  amount: number;
  absorbedShield: number;
  remainingHp: number;
};

export type MoveEvent = {
  type: 'move';
  unitInstanceId: string;
  from: BoardPosition;
  to: BoardPosition;
};

export type DeathEvent = {
  type: 'death';
  unitInstanceId: string;
};

export type ReviveEvent = {
  type: 'revive';
  unitInstanceId: string;
  amount: number;
  remainingHp: number;
};

export type ChainLightningEvent = {
  type: 'chainLightning';
  sourceInstanceId: string;
  initialTargetInstanceId: string;
  targetInstanceIds: string[];
};

export type ItemStackEvent = {
  type: 'itemStack';
  sourceInstanceId: string;
  itemId: Item['id'];
  amount: number;
};

export type ManaGainEvent = {
  type: 'manaGain';
  unitInstanceId: string;
  amount: number;
  currentMana: number;
  maxMana: number;
  source: 'basicAttack' | 'damageTaken';
};

export type HealEvent = {
  type: 'heal';
  sourceInstanceId: string;
  targetInstanceId: string;
  amount: number;
  remainingHp: number;
};

export type ShieldEvent = {
  type: 'shield';
  sourceInstanceId: string;
  targetInstanceId: string;
  amount: number;
  shield: number;
};

export type SkillCastEvent = {
  type: 'skillCast';
  sourceInstanceId: string;
  skillId: Skill['id'];
  skillName: Skill['name'];
  targetInstanceIds: string[];
};

export type StatusEffectEvent = {
  type: 'statusEffect';
  sourceInstanceId: string;
  targetInstanceId: string;
  effectType: SkillEffectType;
  value: number;
  durationMs: number;
};

export type CombatEndEvent = {
  type: 'combatEnd';
  result: CombatResult;
};

export type AiDecisionEvent = {
  type: 'aiDecision';
  unitInstanceId: string;
  targetInstanceId?: string;
  desiredPosition?: BoardPosition;
  reservedPosition?: BoardPosition;
  reason: 'targetInRange' | 'moveReserved' | 'blocked' | 'noTarget';
};

export type CombatEvent =
  | DamageEvent
  | MoveEvent
  | DeathEvent
  | ReviveEvent
  | ChainLightningEvent
  | ItemStackEvent
  | ManaGainEvent
  | HealEvent
  | ShieldEvent
  | SkillCastEvent
  | StatusEffectEvent
  | CombatEndEvent
  | AiDecisionEvent;

export type CombatState = {
  isRunning: boolean;
  elapsedMs: number;
  units: CombatUnit[];
  events: CombatEvent[];
  result?: CombatResult;
};

export type CombatStepResult = {
  state: CombatState;
  events: CombatEvent[];
};
