import { itemIconUrls } from '../../assets/itemIcons';
import { getItemById } from '../../data/items';
import { useGameStore } from '../../store/useGameStore';
import styles from './ItemChoiceOverlay.module.css';

export function ItemChoiceOverlay() {
  const pendingItemChoice = useGameStore((state) => state.pendingItemChoice);
  const selectItemChoice = useGameStore((state) => state.selectItemChoice);

  if (!pendingItemChoice) {
    return null;
  }

  return (
    <div className={styles.backdrop} role="presentation">
      <section className={styles.overlay} aria-label="아이템 선택">
        <header className={styles.header}>
          <span>{pendingItemChoice.reason === 'starter' ? '시작 보상' : '라운드 보상'}</span>
          <strong>아이템을 선택하세요</strong>
        </header>
        <div className={styles.cardGrid}>
          {pendingItemChoice.itemIds.map((itemId, index) => {
            const item = getItemById(itemId);

            if (!item) {
              return null;
            }

            return (
              <button
                className={styles.itemCard}
                type="button"
                key={`${itemId}-${index}`}
                onClick={() => selectItemChoice(itemId)}
              >
                <span className={styles.icon}>
                  <img src={itemIconUrls[item.id]} alt="" />
                </span>
                <strong>{item.name}</strong>
                <p>{item.description}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
