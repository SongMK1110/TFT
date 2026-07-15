import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { EASTER_EGG_REQUIRED_CLICKS } from '../../types/game';
import { phaseLabels } from '../../utils/displayLabels';
import styles from './PlayerStatusPanel.module.css';

const resultLabels = {
  win: '승리',
  loss: '패배',
  draw: '무승부',
} as const;

export function PlayerStatusPanel() {
  const playerHp = useGameStore((state) => state.playerHp);
  const gold = useGameStore((state) => state.gold);
  const level = useGameStore((state) => state.level);
  const xp = useGameStore((state) => state.xp);
  const xpToNextLevel = useGameStore((state) => state.xpToNextLevel);
  const currentRound = useGameStore((state) => state.currentRound);
  const winStreak = useGameStore((state) => state.winStreak);
  const loseStreak = useGameStore((state) => state.loseStreak);
  const phase = useGameStore((state) => state.phase);
  const battleResult = useGameStore((state) => state.battleResult);
  const activateDeveloperGoldCheat = useGameStore((state) => state.activateDeveloperGoldCheat);
  const [goldClickCount, setGoldClickCount] = useState(0);
  const isDeveloperCheatEnabled = import.meta.env.DEV;
  const stats = [
    { label: '체력', value: playerHp },
    { label: '골드', value: gold, isGold: true },
    { label: '레벨', value: level },
    { label: '경험치', value: xpToNextLevel > 0 ? `${xp}/${xpToNextLevel}` : '최대' },
    { label: '라운드', value: currentRound },
    { label: '연승', value: winStreak },
    { label: '연패', value: loseStreak },
    {
      label: '단계',
      value: battleResult ? `${phaseLabels[phase]} · ${resultLabels[battleResult.result]}` : phaseLabels[phase],
    },
  ];

  function handleGoldTileClick() {
    if (!isDeveloperCheatEnabled) {
      return;
    }

    const nextClickCount = goldClickCount + 1;

    if (nextClickCount >= EASTER_EGG_REQUIRED_CLICKS) {
      setGoldClickCount(0);
      activateDeveloperGoldCheat();
      return;
    }

    setGoldClickCount(nextClickCount);
  }

  return (
    <header className={styles.statusPanel}>
      {stats.map((stat) =>
        stat.isGold ? (
          <button
            className={`${styles.statusTile} ${styles.goldTile}`}
            key={stat.label}
            type="button"
            onClick={isDeveloperCheatEnabled ? handleGoldTileClick : undefined}
            aria-label="골드"
          >
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </button>
        ) : (
          <div className={styles.statusTile} key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ),
      )}
    </header>
  );
}
