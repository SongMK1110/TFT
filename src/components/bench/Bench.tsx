import { useMemo } from 'react';
import { BenchSlot } from './BenchSlot';
import { BENCH_SLOT_COUNT } from '../../types/board';
import { useGameStore } from '../../store/useGameStore';
import { PanelHeader } from '../panels/PanelHeader';
import styles from './Bench.module.css';

export function Bench() {
  const benchUnits = useGameStore((state) => state.benchUnits);
  const occupiedBenchSlotCount = useMemo(() => benchUnits.filter(Boolean).length, [benchUnits]);

  return (
    <section className={styles.benchPanel} aria-label="벤치">
      <PanelHeader title="벤치" meta={`${occupiedBenchSlotCount}/${BENCH_SLOT_COUNT}`} />
      <div className={styles.benchGrid}>
        {Array.from({ length: BENCH_SLOT_COUNT }, (_, index) => (
          <BenchSlot key={index} slotIndex={index} slotNumber={index + 1} unit={benchUnits[index]} />
        ))}
      </div>
    </section>
  );
}
