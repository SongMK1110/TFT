import { useMemo } from 'react';
import { itemIconUrls } from '../../assets/itemIcons';
import { getItemById } from '../../data/items';
import { featuredUnit } from '../../data/uiFixtures';
import { calculateUnitSellGold } from '../../game/core/economy/unitSellSystem';
import { getItemAdjustedUnitStats } from '../../game/core/item/itemSystem';
import { useGameStore } from '../../store/useGameStore';
import type { BenchUnitSlot, BoardUnit } from '../../types/game';
import { MAX_ITEMS_PER_UNIT, type PlayerUnit } from '../../types/unit';
import { classLabels, originLabels } from '../../utils/displayLabels';
import { PanelHeader } from './PanelHeader';
import styles from './UnitInfoPanel.module.css';

export function UnitInfoPanel() {
  const boardUnits = useGameStore((state) => state.boardUnits);
  const benchUnits = useGameStore((state) => state.benchUnits);
  const selectedUnitInstanceId = useGameStore((state) => state.selectedUnitInstanceId);
  const playerItems = useGameStore((state) => state.playerItems);
  const sellUnit = useGameStore((state) => state.sellUnit);
  const equipItemToUnit = useGameStore((state) => state.equipItemToUnit);
  const unequipItemFromUnit = useGameStore((state) => state.unequipItemFromUnit);
  const startItemDrag = useGameStore((state) => state.startItemDrag);
  const phase = useGameStore((state) => state.phase);
  const displayedUnit = useMemo(
    () => getDisplayedUnit(selectedUnitInstanceId, boardUnits, benchUnits),
    [selectedUnitInstanceId, boardUnits, benchUnits],
  );
  const displayedStats = useMemo(() => getItemAdjustedUnitStats(displayedUnit), [displayedUnit]);
  const isFallbackUnit = displayedUnit.instanceId === 'featured-unit';
  const canEquipItem = !isFallbackUnit && displayedUnit.items.length < MAX_ITEMS_PER_UNIT;
  const canDragItem = phase !== 'combat';
  const sellGold = useMemo(() => calculateUnitSellGold(displayedUnit), [displayedUnit]);

  return (
    <aside className={styles.panel} aria-label="유닛 정보">
      <PanelHeader title="유닛 정보" meta={isFallbackUnit ? '대기' : '선택됨'} />
      <div className={styles.content}>
        <article className={styles.unitCard}>
          <div className={styles.portrait}>{displayedUnit.name.slice(0, 2)}</div>
          <div>
            <strong>{displayedUnit.name}</strong>
            <span>
              {displayedUnit.starLevel}성 · {originLabels[displayedUnit.origin]} / {classLabels[displayedUnit.class]}
            </span>
          </div>
        </article>
        <button
          className={styles.sellButton}
          type="button"
          onClick={() => sellUnit(displayedUnit.instanceId)}
          disabled={isFallbackUnit}
        >
          판매 · {sellGold}골드
        </button>
        <dl className={styles.statGrid}>
          <div>
            <dt>비용</dt>
            <dd>{displayedUnit.cost}</dd>
          </div>
          <div>
            <dt>체력</dt>
            <dd>{displayedStats.maxHp}</dd>
          </div>
          <div>
            <dt>공격</dt>
            <dd>{displayedStats.attackDamage}</dd>
          </div>
          <div>
            <dt>방어</dt>
            <dd>{displayedStats.armor}</dd>
          </div>
          <div>
            <dt>사거리</dt>
            <dd>{displayedStats.attackRange}</dd>
          </div>
          <div>
            <dt>마나</dt>
            <dd>
              {displayedStats.currentMana}/{displayedStats.maxMana}
            </dd>
          </div>
          <div>
            <dt>공속</dt>
            <dd>{displayedStats.attackSpeed.toFixed(2)}</dd>
          </div>
          <div>
            <dt>스킬 위력</dt>
            <dd>{Math.round(displayedStats.skillPowerMultiplier * 100)}%</dd>
          </div>
        </dl>
        <section className={styles.itemSection} aria-label="장착 아이템">
          <div className={styles.sectionHeader}>
            <strong>아이템</strong>
            <span>
              {displayedUnit.items.length}/{MAX_ITEMS_PER_UNIT}
            </span>
          </div>
          <div className={styles.itemList}>
            {displayedUnit.items.length > 0 ? (
              displayedUnit.items.map((item, index) => (
                <button
                  className={styles.itemButton}
                  type="button"
                  key={`${item.id}-${index}`}
                  onClick={() => unequipItemFromUnit(displayedUnit.instanceId, index)}
                  disabled={isFallbackUnit}
                >
                  <img className={styles.itemIcon} src={itemIconUrls[item.id]} alt="" />
                  <span className={styles.itemCopy}>
                    <strong>{item.name}</strong>
                    <span>{item.description}</span>
                  </span>
                </button>
              ))
            ) : (
              <span className={styles.emptyText}>장착한 아이템이 없습니다.</span>
            )}
          </div>
        </section>
        <section className={styles.itemSection} aria-label="보유 아이템">
          <div className={styles.sectionHeader}>
            <strong>보유</strong>
            <span>{playerItems.length}개</span>
          </div>
          <div className={styles.itemList}>
            {playerItems.length > 0 ? (
              playerItems.map((itemId, index) => {
                const item = getItemById(itemId);

                if (!item) {
                  return null;
                }

                return (
                  <button
                    className={styles.itemButton}
                    type="button"
                    key={`${itemId}-${index}`}
                    onPointerDown={() => startItemDrag(itemId)}
                    onClick={() => {
                      if (canEquipItem) {
                        equipItemToUnit(itemId, displayedUnit.instanceId);
                      }
                    }}
                    disabled={!canDragItem}
                  >
                    <img className={styles.itemIcon} src={itemIconUrls[item.id]} alt="" />
                    <span className={styles.itemCopy}>
                      <strong>{item.name}</strong>
                      <span>{item.description}</span>
                    </span>
                  </button>
                );
              })
            ) : (
              <span className={styles.emptyText}>보유한 아이템이 없습니다.</span>
            )}
          </div>
        </section>
        <div className={styles.skillBox}>
          <span>스킬</span>
          <strong>{displayedUnit.skill.name}</strong>
          <p>{displayedUnit.skill.description}</p>
        </div>
      </div>
    </aside>
  );
}

function getDisplayedUnit(
  selectedUnitInstanceId: string | undefined,
  boardUnits: BoardUnit[],
  benchUnits: BenchUnitSlot[],
): PlayerUnit {
  return (
    boardUnits.find((unit) => unit.instanceId === selectedUnitInstanceId) ??
    benchUnits.find((unit): unit is PlayerUnit => unit?.instanceId === selectedUnitInstanceId) ??
    boardUnits[0] ??
    benchUnits.find((unit): unit is PlayerUnit => Boolean(unit)) ??
    createFallbackUnit()
  );
}

function createFallbackUnit(): PlayerUnit {
  return {
    ...featuredUnit,
    unitId: featuredUnit.id,
    instanceId: 'featured-unit',
    currentHp: featuredUnit.maxHp,
    currentMana: featuredUnit.mana,
    starLevel: 1,
    items: [],
  };
}
