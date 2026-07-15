import { useGameStore } from '../../store/useGameStore';
import type { CombatEvent } from '../../types/combat';
import styles from './CombatControls.module.css';

const resultLabels = {
  win: '승리',
  loss: '패배',
  draw: '무승부',
} as const;

export function CombatControls() {
  const phase = useGameStore((state) => state.phase);
  const boardUnitCount = useGameStore((state) => state.boardUnits.length);
  const pendingItemChoice = useGameStore((state) => state.pendingItemChoice);
  const combatState = useGameStore((state) => state.combatState);
  const battleResult = useGameStore((state) => state.battleResult);
  const startCombat = useGameStore((state) => state.startCombat);
  const canStartCombat = phase === 'prepare' && boardUnitCount > 0 && !pendingItemChoice;
  const elapsedSeconds = combatState ? Math.floor(combatState.elapsedMs / 1000) : 0;
  const aliveUnits = combatState?.units.filter((unit) => unit.isAlive).length ?? 0;
  const lastEvent = combatState?.events[combatState.events.length - 1];
  const eventLabel = getEventLabel(lastEvent);

  return (
    <section className={styles.combatControls} aria-label="전투 제어">
      <div className={styles.summary}>
        <strong>{phase === 'combat' ? '전투 진행 중' : '라운드 준비'}</strong>
        <span>
          {phase === 'combat'
            ? `경과 ${elapsedSeconds}초 · 생존 ${aliveUnits}명 · ${eventLabel}`
            : battleResult
              ? `${battleResult.round}라운드 ${resultLabels[battleResult.result]} · 보상 ${battleResult.goldReward}골드 · XP +${battleResult.xpReward}`
              : pendingItemChoice
                ? '아이템 보상을 먼저 선택'
                : `보드 유닛 ${boardUnitCount}명`}
        </span>
      </div>
      <button className={styles.primaryButton} type="button" onClick={startCombat} disabled={!canStartCombat}>
        전투 시작
      </button>
    </section>
  );
}

function getEventLabel(event?: CombatEvent): string {
  if (!event) {
    return '대기';
  }

  switch (event.type) {
    case 'damage':
      return `피해 ${event.amount}`;
    case 'move':
      return '이동';
    case 'death':
      return '사망';
    case 'manaGain':
      return `마나 +${event.amount}`;
    case 'skillCast':
      return `${event.skillName} 시전`;
    case 'heal':
      return `회복 ${event.amount}`;
    case 'shield':
      return `보호막 ${event.amount}`;
    case 'statusEffect':
      return '효과 적용';
    case 'aiDecision':
      return event.reason === 'blocked' ? '경로 재탐색' : 'AI 판단';
    case 'combatEnd':
      return '종료';
    default:
      return '대기';
  }
}
