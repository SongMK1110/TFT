import { useMemo } from 'react';
import { ShopCard } from './ShopCard';
import { getUnitById } from '../../data/units';
import { getShopTierOdds } from '../../game/core/shop/shopSystem';
import { SHOP_SLOT_COUNT } from '../../types/game';
import { shopCosts, useGameStore } from '../../store/useGameStore';
import { PanelHeader } from '../panels/PanelHeader';
import styles from './Shop.module.css';

export function Shop() {
  const gold = useGameStore((state) => state.gold);
  const level = useGameStore((state) => state.level);
  const phase = useGameStore((state) => state.phase);
  const shopUnits = useGameStore((state) => state.shopUnits);
  const benchUnits = useGameStore((state) => state.benchUnits);
  const xpToNextLevel = useGameStore((state) => state.xpToNextLevel);
  const isShopLocked = useGameStore((state) => state.isShopLocked);
  const message = useGameStore((state) => state.message);
  const buyUnit = useGameStore((state) => state.buyUnit);
  const refreshShop = useGameStore((state) => state.refreshShop);
  const buyXp = useGameStore((state) => state.buyXp);
  const toggleShopLock = useGameStore((state) => state.toggleShopLock);
  const canBuyOffer = useGameStore((state) => state.canBuyOffer);
  const occupiedBenchSlotCount = useMemo(() => benchUnits.filter(Boolean).length, [benchUnits]);
  const isBenchFull = occupiedBenchSlotCount >= shopCosts.benchSlots;
  const isActionLocked = phase === 'combat' || phase === 'reward';
  const canRefresh = gold >= shopCosts.refresh && !isShopLocked && !isActionLocked;
  const canBuyXp = gold >= shopCosts.buyXp && xpToNextLevel > 0 && !isActionLocked;
  const tierOdds = getShopTierOdds(level);

  return (
    <section className={styles.shopBar} aria-label="상점">
      <div className={styles.shopHeader}>
        <PanelHeader title="상점" meta={isActionLocked ? '전투 중' : isShopLocked ? '잠금' : '열림'} />
        <div className={styles.tierOdds} aria-label={`레벨 ${level} 상점 등장 확률`}>
          {tierOdds.map((odds, index) => (
            <span key={odds.tier} className={`${styles.tierOdd} ${styles[`tier${index + 1}`]}`}>
              {[1, 2, 3, 5][index]}코 {odds.weight}%
            </span>
          ))}
        </div>
        <div className={styles.shopActions}>
          <button className={styles.actionButton} type="button" onClick={refreshShop} disabled={!canRefresh}>
            새로고침 {shopCosts.refresh}골드
          </button>
          <button className={styles.actionButton} type="button" onClick={buyXp} disabled={!canBuyXp}>
            경험치 구매 {shopCosts.buyXp}골드
          </button>
          <button className={styles.actionButton} type="button" onClick={toggleShopLock} disabled={isActionLocked}>
            {isShopLocked ? '잠금 해제' : '잠금'}
          </button>
        </div>
      </div>
      <div className={styles.shopGrid}>
        {Array.from({ length: SHOP_SLOT_COUNT }, (_, index) => {
          const offer = shopUnits[index];
          const unit = offer ? getUnitById(offer.unitId) : undefined;

          return (
            <ShopCard
              key={offer?.offerId ?? index}
              offer={offer}
              slotNumber={index + 1}
              unit={unit}
              disabled={!offer || isActionLocked || !canBuyOffer(offer.offerId)}
              disabledReason={
                isActionLocked
                  ? '전투 중'
                  : isBenchFull
                    ? '벤치 가득 참'
                    : gold < (offer?.cost ?? 0)
                      ? '골드 부족'
                      : undefined
              }
              onBuy={buyUnit}
            />
          );
        })}
      </div>
      {message ? <p className={styles.message}>{message}</p> : null}
    </section>
  );
}
