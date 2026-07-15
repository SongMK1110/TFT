import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
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
import { BattleScene } from './scenes/BattleScene';
import styles from './PhaserGame.module.css';

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

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [pointerPosition, setPointerPosition] = useState<{ x: number; y: number }>();
  const dragState = useGameStore((state) => state.dragState);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || gameRef.current) {
      return;
    }

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: container,
      backgroundColor: '#101827',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: container.clientWidth,
        height: container.clientHeight,
      },
      scene: [BattleScene],
    });

    const placeDraggingBenchUnit = (clientX: number, clientY: number) => {
      const state = useGameStore.getState();

      if (state.dragState?.source.kind !== 'bench') {
        return;
      }

      const battleScene = gameRef.current?.scene.getScene('BattleScene');
      const canvas = gameRef.current?.canvas;
      const rect = canvas?.getBoundingClientRect() ?? container.getBoundingClientRect();
      const isInsideBoardArea =
        clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;

      if (!isInsideBoardArea) {
        state.clearDragState();
        return;
      }

      const position =
        battleScene instanceof BattleScene
          ? battleScene.getBoardPositionAt({
              x: (clientX - rect.left) * (battleScene.scale.width / rect.width),
              y: (clientY - rect.top) * (battleScene.scale.height / rect.height),
            })
          : undefined;

      if (!position) {
        state.clearDragState();
        return;
      }

      state.placeBenchUnitOnBoard(state.dragState.source.benchIndex, position);
    };

    const handlePointerUp = (event: PointerEvent) => {
      placeDraggingBenchUnit(event.clientX, event.clientY);
      setPointerPosition(undefined);
    };
    const handlePointerMove = (event: PointerEvent) => {
      setPointerPosition({ x: event.clientX, y: event.clientY });
    };

    document.addEventListener('pointerup', handlePointerUp, true);
    document.addEventListener('pointermove', handlePointerMove, true);

    return () => {
      document.removeEventListener('pointerup', handlePointerUp, true);
      document.removeEventListener('pointermove', handlePointerMove, true);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  const draggedBenchUnit = dragState?.source.kind === 'bench' ? dragState.unit : undefined;
  const dragPreviewImage = draggedBenchUnit ? unitPortraits[draggedBenchUnit.unitId] : undefined;

  return (
    <>
      <div className={styles.phaserRoot} data-dragging={dragState ? 'true' : 'false'} ref={containerRef} />
      {draggedBenchUnit && pointerPosition ? (
        <div
          className={styles.dragPreview}
          style={{
            transform: `translate3d(${pointerPosition.x + 14}px, ${pointerPosition.y + 14}px, 0)`,
          }}
        >
          <div className={styles.dragPreviewArt}>
            {dragPreviewImage ? <img src={dragPreviewImage} alt="" draggable={false} /> : draggedBenchUnit.name.slice(0, 2)}
          </div>
          <div className={styles.dragPreviewText}>
            <strong>{draggedBenchUnit.name}</strong>
            <span>Lv {draggedBenchUnit.starLevel}</span>
          </div>
        </div>
      ) : null}
    </>
  );
}
