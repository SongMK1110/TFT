import { DEFAULT_COMBAT_DURATION_MS, type CombatResult, type CombatState, type CombatTeam, type CombatUnit } from '../../../types/combat';

export function getCombatResult(state: CombatState): CombatResult | undefined {
  const playerAlive = hasLivingTeamUnits(state.units, 'player');
  const enemyAlive = hasLivingTeamUnits(state.units, 'enemy');

  if (!playerAlive && !enemyAlive) {
    return 'draw';
  }

  if (!enemyAlive) {
    return 'playerWin';
  }

  if (!playerAlive) {
    return 'enemyWin';
  }

  if (state.elapsedMs >= DEFAULT_COMBAT_DURATION_MS) {
    return 'draw';
  }

  return undefined;
}

function hasLivingTeamUnits(units: CombatUnit[], team: CombatTeam): boolean {
  return units.some((unit) => unit.team === team && unit.isAlive);
}
