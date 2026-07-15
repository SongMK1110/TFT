export const MASTER_VOLUME = 0.65;
export const BGM_VOLUME = 0.16;
export const SFX_VOLUME = 0.42;
export const DEFAULT_MUTE = false;

export type BgmKey = 'prepare' | 'combat' | 'result';

export type SfxKey =
  | 'attack'
  | 'hit'
  | 'skill'
  | 'victory'
  | 'defeat'
  | 'shopRefresh'
  | 'unitBuy'
  | 'unitUpgrade'
  | 'itemEquip'
  | 'coin'
  | 'error';

export type SynthSoundDefinition = {
  frequency: number;
  durationMs: number;
  type: OscillatorType;
  gain: number;
  detune?: number;
  cooldownMs?: number;
};

export const sfxDefinitions: Record<SfxKey, SynthSoundDefinition> = {
  attack: { frequency: 240, durationMs: 70, type: 'square', gain: 0.45, cooldownMs: 90 },
  hit: { frequency: 120, durationMs: 90, type: 'sawtooth', gain: 0.5, detune: -80, cooldownMs: 90 },
  skill: { frequency: 640, durationMs: 180, type: 'triangle', gain: 0.55, cooldownMs: 120 },
  victory: { frequency: 740, durationMs: 260, type: 'sine', gain: 0.5 },
  defeat: { frequency: 150, durationMs: 320, type: 'sawtooth', gain: 0.4 },
  shopRefresh: { frequency: 420, durationMs: 80, type: 'triangle', gain: 0.35, cooldownMs: 80 },
  unitBuy: { frequency: 520, durationMs: 110, type: 'sine', gain: 0.4, cooldownMs: 80 },
  unitUpgrade: { frequency: 880, durationMs: 240, type: 'triangle', gain: 0.5 },
  itemEquip: { frequency: 680, durationMs: 120, type: 'sine', gain: 0.35, cooldownMs: 80 },
  coin: { frequency: 960, durationMs: 80, type: 'triangle', gain: 0.35, cooldownMs: 70 },
  error: { frequency: 90, durationMs: 130, type: 'square', gain: 0.25, cooldownMs: 120 },
};

export const bgmDefinitions: Record<BgmKey, SynthSoundDefinition> = {
  prepare: { frequency: 146.83, durationMs: 1_200, type: 'sine', gain: 0.12 },
  combat: { frequency: 196, durationMs: 900, type: 'triangle', gain: 0.16 },
  result: { frequency: 261.63, durationMs: 1_100, type: 'sine', gain: 0.12 },
};
