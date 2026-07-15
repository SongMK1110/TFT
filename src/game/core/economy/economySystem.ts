import {
  BASE_ROUND_GOLD,
  BASE_XP_TO_LEVEL,
  DRAW_GOLD_BONUS,
  INTEREST_GOLD_INTERVAL,
  LOSS_GOLD_BONUS,
  MAX_INTEREST_GOLD,
  MAX_PLAYER_LEVEL,
  MAX_STREAK_BONUS_GOLD,
  ROUND_XP_GAIN,
  STREAK_BONUS_GOLD_PER_STEP,
  STREAK_BONUS_START,
  STREAK_BONUS_STEP,
  WIN_GOLD_BONUS,
  XP_TO_LEVEL_GROWTH,
} from '../../../types/game';
import type { BattleResult } from '../../../types/game';

export type RoundOutcome = BattleResult['result'];

export type EconomyRewardInput = {
  outcome: RoundOutcome;
  currentGold: number;
  winStreak: number;
  loseStreak: number;
  encounterGold: number;
};

export type EconomyReward = {
  baseGold: number;
  resultGold: number;
  encounterGold: number;
  streakGold: number;
  interestGold: number;
  totalGold: number;
  nextWinStreak: number;
  nextLoseStreak: number;
};

export type XpProgressInput = {
  level: number;
  xp: number;
  xpGain?: number;
};

export type XpProgressResult = {
  level: number;
  xp: number;
  xpToNextLevel: number;
};

export function calculateRoundReward(input: EconomyRewardInput): EconomyReward {
  const streaks = getNextStreaks(input.outcome, input.winStreak, input.loseStreak);
  const resultGold = getResultGold(input.outcome);
  const streakGold = getStreakGold(streaks.nextWinStreak, streaks.nextLoseStreak);
  const interestGold = getInterestGold(input.currentGold);
  const totalGold = BASE_ROUND_GOLD + resultGold + input.encounterGold + streakGold + interestGold;

  return {
    baseGold: BASE_ROUND_GOLD,
    resultGold,
    encounterGold: input.encounterGold,
    streakGold,
    interestGold,
    totalGold,
    ...streaks,
  };
}

export function applyRoundXp(input: XpProgressInput): XpProgressResult {
  return applyXpGain(input.level, input.xp, input.xpGain ?? ROUND_XP_GAIN);
}

export function getXpToNextLevel(level: number): number {
  if (level >= MAX_PLAYER_LEVEL) {
    return 0;
  }

  return BASE_XP_TO_LEVEL + (level - 1) * XP_TO_LEVEL_GROWTH;
}

function getNextStreaks(outcome: RoundOutcome, winStreak: number, loseStreak: number) {
  if (outcome === 'win') {
    return {
      nextWinStreak: winStreak + 1,
      nextLoseStreak: 0,
    };
  }

  if (outcome === 'loss') {
    return {
      nextWinStreak: 0,
      nextLoseStreak: loseStreak + 1,
    };
  }

  return {
    nextWinStreak: 0,
    nextLoseStreak: 0,
  };
}

function getResultGold(outcome: RoundOutcome): number {
  if (outcome === 'win') {
    return WIN_GOLD_BONUS;
  }

  if (outcome === 'loss') {
    return LOSS_GOLD_BONUS;
  }

  return DRAW_GOLD_BONUS;
}

function getInterestGold(currentGold: number): number {
  return Math.min(Math.floor(currentGold / INTEREST_GOLD_INTERVAL), MAX_INTEREST_GOLD);
}

function getStreakGold(winStreak: number, loseStreak: number): number {
  const streak = Math.max(winStreak, loseStreak);

  if (streak < STREAK_BONUS_START) {
    return 0;
  }

  const bonusSteps = Math.floor((streak - STREAK_BONUS_START) / STREAK_BONUS_STEP) + 1;

  return Math.min(bonusSteps * STREAK_BONUS_GOLD_PER_STEP, MAX_STREAK_BONUS_GOLD);
}

function applyXpGain(level: number, xp: number, xpGain: number): XpProgressResult {
  let nextLevel = level;
  let nextXp = xp + xpGain;

  while (nextLevel < MAX_PLAYER_LEVEL) {
    const xpToNext = getXpToNextLevel(nextLevel);

    if (nextXp < xpToNext) {
      break;
    }

    nextXp -= xpToNext;
    nextLevel += 1;
  }

  return {
    level: nextLevel,
    xp: nextLevel >= MAX_PLAYER_LEVEL ? 0 : nextXp,
    xpToNextLevel: getXpToNextLevel(nextLevel),
  };
}
