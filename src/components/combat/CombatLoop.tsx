import { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { COMBAT_TICK_MS } from '../../types/combat';

export function CombatLoop() {
  const phase = useGameStore((state) => state.phase);
  const tickCombat = useGameStore((state) => state.tickCombat);

  useEffect(() => {
    if (phase !== 'combat') {
      return;
    }

    const timerId = window.setInterval(() => {
      tickCombat(COMBAT_TICK_MS);
    }, COMBAT_TICK_MS);

    return () => {
      window.clearInterval(timerId);
    };
  }, [phase, tickCombat]);

  return null;
}
