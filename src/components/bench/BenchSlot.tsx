import type { PointerEvent } from 'react';
import cinderDuelistPortraitUrl from '../../../assets/generated/cinder-duelist/idle/frames/cinder_duelist_idle_01.png';
import celestialSagePortraitUrl from '../../../assets/generated/celestial-sage/idle/frames/celestial_sage_idle_01.png';
import dawnWardenPortraitUrl from '../../../assets/generated/dawn-warden/idle/frames/dawn_warden_idle_01.png';
import emberGuardPortraitUrl from '../../../assets/generated/ember-guardian/idle/frames/ember_guardian_idle_01.png';
import frostArcherPortraitUrl from '../../../assets/generated/frost-archer/idle/frames/frost_archer_idle_01.png';
import glacierMagePortraitUrl from '../../../assets/generated/glacier-mage/idle/frames/glacier_mage_idle_01.png';
import groveMysticPortraitUrl from '../../../assets/generated/grove-mystic/idle/frames/grove_mystic_idle_01.png';
import ironwoodBulwarkPortraitUrl from '../../../assets/generated/ironwood-bulwark/idle/frames/ironwood_bulwark_idle_01.png';
import nightOraclePortraitUrl from '../../../assets/generated/night-oracle/idle/frames/night_oracle_idle_01.png';
import shadeStalkerPortraitUrl from '../../../assets/generated/shade-stalker/idle/frames/shade_stalker_idle_01.png';
import stormRangerPortraitUrl from '../../../assets/generated/storm-ranger/idle/frames/storm_ranger_idle_01.png';
import thunderBruiserPortraitUrl from '../../../assets/generated/thunder-bruiser/idle/frames/thunder_bruiser_idle_01.png';
import { useGameStore } from '../../store/useGameStore';
import type { PlayerUnit } from '../../types/unit';
import { classLabels, originLabels } from '../../utils/displayLabels';
import styles from './Bench.module.css';

type BenchSlotProps = {
  slotIndex: number;
  slotNumber: number;
  unit?: PlayerUnit;
};

const unitPortraits: Record<string, string> = {
  'celestial-sage': celestialSagePortraitUrl,
  'dawn-warden': dawnWardenPortraitUrl,
  'ember-guard': emberGuardPortraitUrl,
  'cinder-duelist': cinderDuelistPortraitUrl,
  'frost-archer': frostArcherPortraitUrl,
  'glacier-mage': glacierMagePortraitUrl,
  'grove-mystic': groveMysticPortraitUrl,
  'ironwood-bulwark': ironwoodBulwarkPortraitUrl,
  'night-oracle': nightOraclePortraitUrl,
  'shade-stalker': shadeStalkerPortraitUrl,
  'storm-ranger': stormRangerPortraitUrl,
  'thunder-bruiser': thunderBruiserPortraitUrl,
};

export function BenchSlot({ slotIndex, slotNumber, unit }: BenchSlotProps) {
  const phase = useGameStore((state) => state.phase);
  const startBenchDrag = useGameStore((state) => state.startBenchDrag);
  const selectUnit = useGameStore((state) => state.selectUnit);
  const canDrag = Boolean(unit) && phase !== 'combat' && phase !== 'reward';
  const portraitUrl = unit ? unitPortraits[unit.unitId] : undefined;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!unit || event.button !== 0) {
      return;
    }

    selectUnit(unit.instanceId);

    if (!canDrag) {
      return;
    }

    startBenchDrag(slotIndex);
  };

  return (
    <div
      className={styles.benchSlot}
      aria-label={`bench slot ${slotNumber}`}
      draggable={false}
      data-draggable={canDrag}
      data-filled={unit ? 'true' : 'false'}
      onPointerDown={handlePointerDown}
    >
      {unit ? (
        <article className={styles.unitCard}>
          <div className={styles.cardArt}>
            {portraitUrl ? <img src={portraitUrl} alt="" draggable={false} /> : <strong>{unit.name.slice(0, 2)}</strong>}
            <span className={styles.starBadge}>Lv {unit.starLevel}</span>
          </div>
          <div className={styles.cardBody}>
            <strong>{unit.name}</strong>
            <span>{`${originLabels[unit.origin]} / ${classLabels[unit.class]}`}</span>
          </div>
          <div className={styles.costBadge}>{unit.cost}</div>
        </article>
      ) : null}
    </div>
  );
}
