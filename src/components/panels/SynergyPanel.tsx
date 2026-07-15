import { useGameStore } from '../../store/useGameStore';
import { sourceTypeLabels } from '../../utils/displayLabels';
import { PanelHeader } from './PanelHeader';
import styles from './SynergyPanel.module.css';

export function SynergyPanel() {
  const synergyStates = useGameStore((state) => state.synergyStates);
  const visibleSynergies = synergyStates.filter((synergy) => synergy.unitCount > 0);
  const activeSynergyCount = visibleSynergies.filter((synergy) => synergy.isActive).length;

  return (
    <aside className={styles.panel} aria-label="시너지">
      <PanelHeader title="시너지" meta={`${activeSynergyCount}/${visibleSynergies.length} 활성`} />
      <div className={styles.list}>
        {visibleSynergies.map((synergy) => (
          <article
            className={`${styles.synergyCard} ${synergy.isActive ? styles.active : styles.inactive}`}
            key={synergy.id}
          >
            <div>
              <strong>{synergy.name}</strong>
              <span>
                {sourceTypeLabels[synergy.sourceType]} · {synergy.unitCount}
              </span>
            </div>
            <ol>
              {synergy.tiers.map((tier) => (
                <li
                  className={synergy.activeTier?.requiredUnitCount === tier.requiredUnitCount ? styles.activeTier : ''}
                  key={`${synergy.id}-${tier.requiredUnitCount}`}
                >
                  <b>{tier.requiredUnitCount}</b>
                  <span>{tier.description}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </aside>
  );
}
