import { Bench } from '../components/bench/Bench';
import { CombatControls } from '../components/combat/CombatControls';
import { CombatLoop } from '../components/combat/CombatLoop';
import { PlayerStatusPanel } from '../components/panels/PlayerStatusPanel';
import { SaveControls } from '../components/panels/SaveControls';
import { SynergyPanel } from '../components/panels/SynergyPanel';
import { UnitInfoPanel } from '../components/panels/UnitInfoPanel';
import { ItemChoiceOverlay } from '../components/reward/ItemChoiceOverlay';
import { Shop } from '../components/shop/Shop';
import { PhaserGame } from '../game/phaser/PhaserGame';
import styles from './App.module.css';

export function App() {
  return (
    <main className={styles.appShell}>
      <CombatLoop />
      <ItemChoiceOverlay />
      <div className={styles.topStack}>
        <SaveControls />
        <PlayerStatusPanel />
      </div>

      <section className={styles.gameLayout} aria-label="Game layout">
        <SynergyPanel />

        <div className={styles.centerStack}>
          <div className={styles.battleStage}>
            <PhaserGame />
          </div>
          <CombatControls />
          <Bench />
        </div>

        <div className={styles.rightStack}>
          <UnitInfoPanel />
          <Shop />
        </div>
      </section>
    </main>
  );
}
