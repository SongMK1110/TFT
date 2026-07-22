import { useGameStore } from '../../store/useGameStore';
import styles from './SaveControls.module.css';

const developerComponentBundle = [
  'iron-blade',
  'iron-blade',
  'giant-belt',
  'giant-belt',
  'swift-bow',
  'swift-bow',
  'mystic-staff',
  'mystic-staff',
  'guardian-armor',
  'guardian-armor',
  'focus-charm',
  'focus-charm',
  'mana-crystal',
  'mana-crystal',
] as const;

const volumeControls = [
  { key: 'masterVolume', label: '전체' },
  { key: 'bgmVolume', label: 'BGM' },
  { key: 'sfxVolume', label: '효과음' },
] as const;

export function SaveControls() {
  const audioSettings = useGameStore((state) => state.audioSettings);
  const hasSavedGame = useGameStore((state) => state.hasSavedGame);
  const message = useGameStore((state) => state.message);
  const saveGame = useGameStore((state) => state.saveGame);
  const loadGame = useGameStore((state) => state.loadGame);
  const newGame = useGameStore((state) => state.newGame);
  const resetSave = useGameStore((state) => state.resetSave);
  const setAudioMuted = useGameStore((state) => state.setAudioMuted);
  const setAudioVolume = useGameStore((state) => state.setAudioVolume);
  const grantDeveloperItems = useGameStore((state) => state.grantDeveloperItems);
  const isDeveloperToolsEnabled = import.meta.env.DEV;

  return (
    <section className={styles.savePanel} aria-label="저장 및 설정">
      <div className={styles.actionGroup}>
        <button type="button" onClick={saveGame}>
          저장
        </button>
        <button type="button" onClick={loadGame} disabled={!hasSavedGame}>
          이어하기
        </button>
        <button type="button" onClick={newGame}>
          새 게임
        </button>
        <button type="button" onClick={resetSave} disabled={!hasSavedGame}>
          저장 삭제
        </button>
      </div>

      {isDeveloperToolsEnabled ? (
        <div className={styles.developerGroup} aria-label="개발자 아이템 도구">
          <button type="button" onClick={() => grantDeveloperItems([...developerComponentBundle])}>
            재료 2세트 지급
          </button>
          <button type="button" onClick={() => grantDeveloperItems(['frozen-heart'])}>
            얼어붙은 심장 지급
          </button>
        </div>
      ) : null}

      <div className={styles.audioGroup}>
        <label className={styles.muteToggle}>
          <input
            type="checkbox"
            checked={audioSettings.muted}
            onChange={(event) => setAudioMuted(event.currentTarget.checked)}
          />
          음소거
        </label>

        {volumeControls.map((control) => (
          <label className={styles.volumeControl} key={control.key}>
            <span>{control.label}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioSettings[control.key]}
              disabled={audioSettings.muted}
              onChange={(event) => setAudioVolume(control.key, Number(event.currentTarget.value))}
            />
          </label>
        ))}
      </div>

      <div className={styles.saveStatus}>{hasSavedGame ? '저장 있음' : '저장 없음'}</div>
      {message ? <div className={styles.message}>{message}</div> : null}
    </section>
  );
}
