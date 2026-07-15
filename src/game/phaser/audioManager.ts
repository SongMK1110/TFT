import {
  BGM_VOLUME,
  DEFAULT_MUTE,
  MASTER_VOLUME,
  SFX_VOLUME,
  bgmDefinitions,
  sfxDefinitions,
  type BgmKey,
  type SfxKey,
  type SynthSoundDefinition,
} from './audioConstants';
import type { AudioSettings } from '../../types/audio';

class AudioManager {
  private context?: AudioContext;
  private settings: AudioSettings = {
    masterVolume: MASTER_VOLUME,
    bgmVolume: BGM_VOLUME,
    sfxVolume: SFX_VOLUME,
    muted: DEFAULT_MUTE,
  };
  private currentBgm?: {
    key: BgmKey;
    intervalId: number;
  };
  private requestedBgmKey?: BgmKey;
  private lastSfxPlayedAt = new Map<SfxKey, number>();

  playSfx(key: SfxKey) {
    const definition = sfxDefinitions[key];

    if (!definition || this.settings.muted) {
      return;
    }

    const now = performance.now();
    const lastPlayedAt = this.lastSfxPlayedAt.get(key) ?? -Infinity;

    if (definition.cooldownMs && now - lastPlayedAt < definition.cooldownMs) {
      return;
    }

    this.lastSfxPlayedAt.set(key, now);
    this.playTone(definition, this.settings.sfxVolume);
  }

  playBgm(key: BgmKey) {
    if (this.currentBgm?.key === key) {
      return;
    }

    this.requestedBgmKey = key;
    this.stopBgm(false);

    if (this.settings.muted) {
      return;
    }

    const definition = bgmDefinitions[key];

    if (!definition) {
      return;
    }

    this.playTone(definition, this.settings.bgmVolume);
    const intervalId = window.setInterval(() => {
      this.playTone(definition, this.settings.bgmVolume);
    }, definition.durationMs + 160);

    this.currentBgm = { key, intervalId };
  }

  stopBgm(clearRequestedKey = true) {
    if (!this.currentBgm) {
      return;
    }

    window.clearInterval(this.currentBgm.intervalId);
    this.currentBgm = undefined;

    if (clearRequestedKey) {
      this.requestedBgmKey = undefined;
    }
  }

  setMuted(muted: boolean) {
    this.settings.muted = muted;

    if (muted) {
      this.stopBgm(false);
      return;
    }

    if (this.requestedBgmKey) {
      this.playBgm(this.requestedBgmKey);
    }
  }

  setVolumes(settings: Partial<Pick<AudioSettings, 'masterVolume' | 'bgmVolume' | 'sfxVolume'>>) {
    this.settings = {
      ...this.settings,
      ...settings,
    };
  }

  applySettings(settings: Partial<AudioSettings>) {
    const shouldStopBgm = settings.muted === true;

    this.settings = {
      ...this.settings,
      ...settings,
    };

    if (shouldStopBgm) {
      this.stopBgm(false);
    } else if (settings.muted === false && this.requestedBgmKey) {
      this.playBgm(this.requestedBgmKey);
    }
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  private getContext(): AudioContext | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (!this.context) {
      const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext;

      if (!AudioContextConstructor) {
        return undefined;
      }

      this.context = new AudioContextConstructor();
    }

    if (this.context.state === 'suspended') {
      void this.context.resume().catch(() => undefined);
    }

    return this.context;
  }

  private playTone(definition: SynthSoundDefinition, volume: number) {
    const context = this.getContext();

    if (!context || this.settings.muted) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const durationSeconds = definition.durationMs / 1000;

    oscillator.type = definition.type;
    oscillator.frequency.setValueAtTime(definition.frequency, now);

    if (definition.detune) {
      oscillator.detune.setValueAtTime(definition.detune, now);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, definition.gain * volume * this.settings.masterVolume),
      now + 0.015,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + durationSeconds + 0.025);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
}

export const audioManager = new AudioManager();

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
