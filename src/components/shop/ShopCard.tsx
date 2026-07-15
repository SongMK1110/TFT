import { memo, useCallback } from 'react';
import celestialSagePortraitUrl from '../../../assets/generated/celestial-sage/idle/frames/celestial_sage_idle_01.png';
import dawnWardenPortraitUrl from '../../../assets/generated/dawn-warden/idle/frames/dawn_warden_idle_01.png';
import cinderDuelistPortraitUrl from '../../../assets/generated/cinder-duelist/idle/frames/cinder_duelist_idle_01.png';
import emberGuardPortraitUrl from '../../../assets/generated/ember-guardian/idle/frames/ember_guardian_idle_01.png';
import frostArcherPortraitUrl from '../../../assets/generated/frost-archer/idle/frames/frost_archer_idle_01.png';
import glacierMagePortraitUrl from '../../../assets/generated/glacier-mage/idle/frames/glacier_mage_idle_01.png';
import groveMysticPortraitUrl from '../../../assets/generated/grove-mystic/idle/frames/grove_mystic_idle_01.png';
import ironwoodBulwarkPortraitUrl from '../../../assets/generated/ironwood-bulwark/idle/frames/ironwood_bulwark_idle_01.png';
import nightOraclePortraitUrl from '../../../assets/generated/night-oracle/idle/frames/night_oracle_idle_01.png';
import shadeStalkerPortraitUrl from '../../../assets/generated/shade-stalker/idle/frames/shade_stalker_idle_01.png';
import stormRangerPortraitUrl from '../../../assets/generated/storm-ranger/idle/frames/storm_ranger_idle_01.png';
import thunderBruiserPortraitUrl from '../../../assets/generated/thunder-bruiser/idle/frames/thunder_bruiser_idle_01.png';
import type { ShopUnitOffer } from '../../types/game';
import type { Unit } from '../../types/unit';
import { classLabels, originLabels } from '../../utils/displayLabels';
import styles from './Shop.module.css';

type ShopCardProps = {
  slotNumber: number;
  offer?: ShopUnitOffer;
  unit?: Unit;
  disabled: boolean;
  disabledReason?: string;
  onBuy: (offerId: string) => void;
};

const unitPortraits: Record<string, string> = {
  'celestial-sage': celestialSagePortraitUrl,
  'dawn-warden': dawnWardenPortraitUrl,
  'cinder-duelist': cinderDuelistPortraitUrl,
  'ember-guard': emberGuardPortraitUrl,
  'frost-archer': frostArcherPortraitUrl,
  'glacier-mage': glacierMagePortraitUrl,
  'grove-mystic': groveMysticPortraitUrl,
  'ironwood-bulwark': ironwoodBulwarkPortraitUrl,
  'night-oracle': nightOraclePortraitUrl,
  'shade-stalker': shadeStalkerPortraitUrl,
  'storm-ranger': stormRangerPortraitUrl,
  'thunder-bruiser': thunderBruiserPortraitUrl,
};

export const ShopCard = memo(function ShopCard({ slotNumber, offer, unit, disabled, disabledReason, onBuy }: ShopCardProps) {
  const handleBuy = useCallback(() => {
    if (offer) {
      onBuy(offer.offerId);
    }
  }, [offer, onBuy]);

  const portraitUrl = unit ? unitPortraits[unit.id] : undefined;
  const costClass = unit ? styles[`cost${unit.cost}`] : '';

  return (
    <article className={`${styles.shopCard} ${costClass} ${offer?.isPurchased ? styles.purchased : ''}`}>
      <div className={styles.cardTopline}>
        <div className={styles.portraitFrame}>
          {portraitUrl ? <img className={styles.portrait} src={portraitUrl} alt="" /> : <span>{unit ? unit.name.slice(0, 2) : slotNumber}</span>}
        </div>
        <span className={styles.costBadge}>{offer ? `${offer.cost}골드` : '-'}</span>
      </div>
      <strong>{unit?.name ?? '빈 슬롯'}</strong>
      <small>{unit ? `${originLabels[unit.origin]} / ${classLabels[unit.class]}` : '유닛 대기 중'}</small>
      <button
        className={styles.buyButton}
        type="button"
        disabled={disabled || !offer}
        onClick={handleBuy}
      >
        {offer?.isPurchased ? '구매 완료' : disabledReason ?? '구매'}
      </button>
    </article>
  );
});
