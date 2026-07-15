import type { CombatState } from '../../../types/combat';
import { ROUND_XP_GAIN } from '../../../types/game';
import type { BattleResult, EnemyEncounter, GamePhase } from '../../../types/game';
import { applyRoundXp, calculateRoundReward } from '../economy/economySystem';

export type RoundResolutionInput = {
  combatResult: NonNullable<CombatState['result']>;
  currentRound: number;
  currentGold: number;
  level: number;
  xp: number;
  winStreak: number;
  loseStreak: number;
  encounter: EnemyEncounter;
  isShopLocked: boolean;
};

export type RoundResolution = {
  phase: GamePhase;
  resolvedPhases: readonly GamePhase[];
  nextRound: number;
  gold: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  winStreak: number;
  loseStreak: number;
  battleResult: BattleResult;
  shouldRefreshShop: boolean;
  message: string;
};

export function resolveCombatRound(input: RoundResolutionInput): RoundResolution {
  const outcome = getRoundOutcome(input.combatResult);
  const reward = calculateRoundReward({
    outcome,
    currentGold: input.currentGold,
    winStreak: input.winStreak,
    loseStreak: input.loseStreak,
    encounterGold: outcome === 'win' ? input.encounter.goldReward : 0,
  });
  const xpProgress = applyRoundXp({
    level: input.level,
    xp: input.xp,
    xpGain: ROUND_XP_GAIN,
  });
  const nextRound = input.currentRound + 1;
  const battleResult: BattleResult = {
    result: outcome,
    round: input.currentRound,
    goldReward: reward.totalGold,
    baseGold: reward.baseGold,
    resultGold: reward.resultGold,
    encounterGold: reward.encounterGold,
    streakGold: reward.streakGold,
    interestGold: reward.interestGold,
    xpReward: ROUND_XP_GAIN,
    nextRound,
    winStreak: reward.nextWinStreak,
    loseStreak: reward.nextLoseStreak,
  };

  return {
    phase: 'prepare',
    resolvedPhases: ['result', 'reward', 'prepare'],
    nextRound,
    gold: input.currentGold + reward.totalGold,
    level: xpProgress.level,
    xp: xpProgress.xp,
    xpToNextLevel: xpProgress.xpToNextLevel,
    winStreak: reward.nextWinStreak,
    loseStreak: reward.nextLoseStreak,
    battleResult,
    shouldRefreshShop: !input.isShopLocked,
    message: createRoundMessage(battleResult),
  };
}

function getRoundOutcome(combatResult: NonNullable<CombatState['result']>): BattleResult['result'] {
  if (combatResult === 'playerWin') {
    return 'win';
  }

  if (combatResult === 'enemyWin') {
    return 'loss';
  }

  return 'draw';
}

function createRoundMessage(result: BattleResult): string {
  const outcomeLabel = result.result === 'win' ? '승리' : result.result === 'loss' ? '패배' : '무승부';

  return `${result.round}라운드 ${outcomeLabel} · 보상 ${result.goldReward}골드 · XP +${result.xpReward}`;
}
