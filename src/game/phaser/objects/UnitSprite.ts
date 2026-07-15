import Phaser from 'phaser';
import cinderDuelistAttackUrl from '../../../../assets/generated/cinder-duelist/attack/sheet-transparent.png';
import cinderDuelistIdleUrl from '../../../../assets/generated/cinder-duelist/idle/sheet-transparent.png';
import cinderDuelistCinderStrikeUrl from '../../../../assets/generated/cinder-duelist/cinder-strike/sheet-transparent.png';
import cinderDuelistFlameCleaveUrl from '../../../../assets/generated/cinder-duelist/flame-cleave/sheet-transparent.png';
import celestialSageCastUrl from '../../../../assets/generated/celestial-sage/cast/sheet-transparent.png';
import celestialSageIdleUrl from '../../../../assets/generated/celestial-sage/idle/sheet-transparent.png';
import celestialSageStarBoltUrl from '../../../../assets/generated/celestial-sage/star-bolt/sheet-transparent.png';
import celestialSageStarfallUrl from '../../../../assets/generated/celestial-sage/starfall/sheet-transparent.png';
import dawnWardenAttackUrl from '../../../../assets/generated/dawn-warden/attack/sheet-transparent.png';
import dawnWardenIdleUrl from '../../../../assets/generated/dawn-warden/idle/sheet-transparent.png';
import dawnWardenRadiantAegisUrl from '../../../../assets/generated/dawn-warden/radiant-aegis/sheet-transparent.png';
import dawnWardenRadiantBashUrl from '../../../../assets/generated/dawn-warden/radiant-bash/sheet-transparent.png';
import emberGuardAttackUrl from '../../../../assets/generated/ember-guardian/attack/sheet-transparent.png';
import emberGuardIdleUrl from '../../../../assets/generated/ember-guardian/idle/sheet-transparent.png';
import emberGuardEmberShieldUrl from '../../../../assets/generated/ember-guardian/ember-shield/sheet-transparent.png';
import emberGuardEmberBashUrl from '../../../../assets/generated/ember-guardian/ember-bash/sheet-transparent.png';
import frostArcherAttackUrl from '../../../../assets/generated/frost-archer/attack/sheet-transparent.png';
import frostArcherIdleUrl from '../../../../assets/generated/frost-archer/idle/sheet-transparent.png';
import frostArcherChillingShotUrl from '../../../../assets/generated/frost-archer/chilling-shot/sheet-transparent.png';
import glacierMageCastUrl from '../../../../assets/generated/glacier-mage/cast/sheet-transparent.png';
import glacierMageIdleUrl from '../../../../assets/generated/glacier-mage/idle/sheet-transparent.png';
import glacierMageIceBloomUrl from '../../../../assets/generated/glacier-mage/ice-bloom/sheet-transparent.png';
import glacierMageFrostBoltUrl from '../../../../assets/generated/glacier-mage/frost-bolt/sheet-transparent.png';
import groveMysticCastUrl from '../../../../assets/generated/grove-mystic/cast/sheet-transparent.png';
import groveMysticIdleUrl from '../../../../assets/generated/grove-mystic/idle/sheet-transparent.png';
import groveMysticSeedBoltUrl from '../../../../assets/generated/grove-mystic/seed-bolt/sheet-transparent.png';
import groveMysticVerdantPulseUrl from '../../../../assets/generated/grove-mystic/verdant-pulse/sheet-transparent.png';
import ironwoodBulwarkAttackUrl from '../../../../assets/generated/ironwood-bulwark/attack/sheet-transparent.png';
import ironwoodBulwarkIdleUrl from '../../../../assets/generated/ironwood-bulwark/idle/sheet-transparent.png';
import ironwoodBulwarkRootedRoarUrl from '../../../../assets/generated/ironwood-bulwark/rooted-roar/sheet-transparent.png';
import ironwoodBulwarkRootSmashUrl from '../../../../assets/generated/ironwood-bulwark/root-smash/sheet-transparent.png';
import nightOracleCastUrl from '../../../../assets/generated/night-oracle/cast/sheet-transparent.png';
import nightOracleIdleUrl from '../../../../assets/generated/night-oracle/idle/sheet-transparent.png';
import nightOracleMoonBoltUrl from '../../../../assets/generated/night-oracle/moon-bolt/sheet-transparent.png';
import nightOracleTwilightMendUrl from '../../../../assets/generated/night-oracle/twilight-mend/sheet-transparent.png';
import shadeStalkerAttackUrl from '../../../../assets/generated/shade-stalker/attack/sheet-transparent.png';
import shadeStalkerIdleUrl from '../../../../assets/generated/shade-stalker/idle/sheet-transparent.png';
import shadeStalkerShadowLungeUrl from '../../../../assets/generated/shade-stalker/shadow-lunge/sheet-transparent.png';
import shadeStalkerShadeSlashUrl from '../../../../assets/generated/shade-stalker/shade-slash/sheet-transparent.png';
import stormRangerAttackUrl from '../../../../assets/generated/storm-ranger/attack/sheet-transparent.png';
import stormRangerIdleUrl from '../../../../assets/generated/storm-ranger/idle/sheet-transparent.png';
import stormRangerLightningBoltUrl from '../../../../assets/generated/storm-ranger/lightning-bolt/sheet-transparent.png';
import stormRangerRapidGaleUrl from '../../../../assets/generated/storm-ranger/rapid-gale/sheet-transparent.png';
import thunderBruiserAttackUrl from '../../../../assets/generated/thunder-bruiser/attack/sheet-transparent.png';
import thunderBruiserIdleUrl from '../../../../assets/generated/thunder-bruiser/idle/sheet-transparent.png';
import thunderBruiserThunderClapUrl from '../../../../assets/generated/thunder-bruiser/thunder-clap/sheet-transparent.png';
import thunderBruiserThunderPunchUrl from '../../../../assets/generated/thunder-bruiser/thunder-punch/sheet-transparent.png';
import type { Unit } from '../../../types/unit';

export type UnitSpriteSpec = {
  unitId: Unit['id'];
  idleKey: string;
  attackKey: string;
  idleAnimationKey: string;
  attackAnimationKey: string;
  idleUrl: string;
  attackUrl: string;
  frameWidth: number;
  frameHeight: number;
  idleFrameCount: number;
  attackFrameCount: number;
};

export const GLACIER_ICE_BLOOM_KEY = 'effect-glacier-ice-bloom';
export const GLACIER_ICE_BLOOM_ANIMATION_KEY = 'effect-glacier-ice-bloom-anim';
export const GLACIER_FROST_BOLT_KEY = 'effect-glacier-frost-bolt';
export const GLACIER_FROST_BOLT_ANIMATION_KEY = 'effect-glacier-frost-bolt-anim';
export const SHADE_STALKER_SHADOW_LUNGE_KEY = 'effect-shade-stalker-shadow-lunge';
export const SHADE_STALKER_SHADOW_LUNGE_ANIMATION_KEY = 'effect-shade-stalker-shadow-lunge-anim';
export const FROST_ARCHER_CHILLING_SHOT_KEY = 'effect-frost-archer-chilling-shot';
export const FROST_ARCHER_CHILLING_SHOT_ANIMATION_KEY = 'effect-frost-archer-chilling-shot-anim';
export const CINDER_DUELIST_CINDER_STRIKE_KEY = 'effect-cinder-duelist-cinder-strike';
export const CINDER_DUELIST_CINDER_STRIKE_ANIMATION_KEY = 'effect-cinder-duelist-cinder-strike-anim';
export const EMBER_GUARD_EMBER_SHIELD_KEY = 'effect-ember-guard-ember-shield';
export const EMBER_GUARD_EMBER_SHIELD_ANIMATION_KEY = 'effect-ember-guard-ember-shield-anim';
export const NIGHT_ORACLE_TWILIGHT_MEND_KEY = 'effect-night-oracle-twilight-mend';
export const NIGHT_ORACLE_TWILIGHT_MEND_ANIMATION_KEY = 'effect-night-oracle-twilight-mend-anim';
export const NIGHT_ORACLE_MOON_BOLT_KEY = 'effect-night-oracle-moon-bolt';
export const NIGHT_ORACLE_MOON_BOLT_ANIMATION_KEY = 'effect-night-oracle-moon-bolt-anim';
export const IRONWOOD_BULWARK_ROOTED_ROAR_KEY = 'effect-ironwood-bulwark-rooted-roar';
export const IRONWOOD_BULWARK_ROOTED_ROAR_ANIMATION_KEY = 'effect-ironwood-bulwark-rooted-roar-anim';
export const GROVE_MYSTIC_SEED_BOLT_KEY = 'effect-grove-mystic-seed-bolt';
export const GROVE_MYSTIC_SEED_BOLT_ANIMATION_KEY = 'effect-grove-mystic-seed-bolt-anim';
export const GROVE_MYSTIC_VERDANT_PULSE_KEY = 'effect-grove-mystic-verdant-pulse';
export const GROVE_MYSTIC_VERDANT_PULSE_ANIMATION_KEY = 'effect-grove-mystic-verdant-pulse-anim';
export const STORM_RANGER_LIGHTNING_BOLT_KEY = 'effect-storm-ranger-lightning-bolt';
export const STORM_RANGER_LIGHTNING_BOLT_ANIMATION_KEY = 'effect-storm-ranger-lightning-bolt-anim';
export const STORM_RANGER_RAPID_GALE_KEY = 'effect-storm-ranger-rapid-gale';
export const STORM_RANGER_RAPID_GALE_ANIMATION_KEY = 'effect-storm-ranger-rapid-gale-anim';
export const THUNDER_BRUISER_THUNDER_PUNCH_KEY = 'effect-thunder-bruiser-thunder-punch';
export const THUNDER_BRUISER_THUNDER_PUNCH_ANIMATION_KEY = 'effect-thunder-bruiser-thunder-punch-anim';
export const THUNDER_BRUISER_THUNDER_CLAP_KEY = 'effect-thunder-bruiser-thunder-clap';
export const THUNDER_BRUISER_THUNDER_CLAP_ANIMATION_KEY = 'effect-thunder-bruiser-thunder-clap-anim';
export const CELESTIAL_SAGE_STAR_BOLT_KEY = 'effect-celestial-sage-star-bolt';
export const CELESTIAL_SAGE_STAR_BOLT_ANIMATION_KEY = 'effect-celestial-sage-star-bolt-anim';
export const CELESTIAL_SAGE_STARFALL_KEY = 'effect-celestial-sage-starfall';
export const CELESTIAL_SAGE_STARFALL_ANIMATION_KEY = 'effect-celestial-sage-starfall-anim';
export const DAWN_WARDEN_RADIANT_BASH_KEY = 'effect-dawn-warden-radiant-bash';
export const DAWN_WARDEN_RADIANT_BASH_ANIMATION_KEY = 'effect-dawn-warden-radiant-bash-anim';
export const DAWN_WARDEN_RADIANT_AEGIS_KEY = 'effect-dawn-warden-radiant-aegis';
export const DAWN_WARDEN_RADIANT_AEGIS_ANIMATION_KEY = 'effect-dawn-warden-radiant-aegis-anim';
export const EMBER_GUARD_EMBER_BASH_KEY = 'effect-ember-guard-ember-bash';
export const EMBER_GUARD_EMBER_BASH_ANIMATION_KEY = 'effect-ember-guard-ember-bash-anim';
export const CINDER_DUELIST_FLAME_CLEAVE_KEY = 'effect-cinder-duelist-flame-cleave';
export const CINDER_DUELIST_FLAME_CLEAVE_ANIMATION_KEY = 'effect-cinder-duelist-flame-cleave-anim';
export const SHADE_STALKER_SHADE_SLASH_KEY = 'effect-shade-stalker-shade-slash';
export const SHADE_STALKER_SHADE_SLASH_ANIMATION_KEY = 'effect-shade-stalker-shade-slash-anim';
export const IRONWOOD_BULWARK_ROOT_SMASH_KEY = 'effect-ironwood-bulwark-root-smash';
export const IRONWOOD_BULWARK_ROOT_SMASH_ANIMATION_KEY = 'effect-ironwood-bulwark-root-smash-anim';

const UNIT_SPRITE_SPECS: Record<string, UnitSpriteSpec> = {
  'celestial-sage': {
    unitId: 'celestial-sage', idleKey: 'unit-celestial-sage-idle', attackKey: 'unit-celestial-sage-cast',
    idleAnimationKey: 'unit-celestial-sage-idle-anim', attackAnimationKey: 'unit-celestial-sage-cast-anim',
    idleUrl: celestialSageIdleUrl, attackUrl: celestialSageCastUrl, frameWidth: 128, frameHeight: 128, idleFrameCount: 4, attackFrameCount: 6,
  },
  'dawn-warden': {
    unitId: 'dawn-warden', idleKey: 'unit-dawn-warden-idle', attackKey: 'unit-dawn-warden-attack',
    idleAnimationKey: 'unit-dawn-warden-idle-anim', attackAnimationKey: 'unit-dawn-warden-attack-anim',
    idleUrl: dawnWardenIdleUrl, attackUrl: dawnWardenAttackUrl, frameWidth: 128, frameHeight: 128, idleFrameCount: 4, attackFrameCount: 6,
  },
  'ember-guard': {
    unitId: 'ember-guard',
    idleKey: 'unit-ember-guard-idle',
    attackKey: 'unit-ember-guard-attack',
    idleAnimationKey: 'unit-ember-guard-idle-anim',
    attackAnimationKey: 'unit-ember-guard-attack-anim',
    idleUrl: emberGuardIdleUrl,
    attackUrl: emberGuardAttackUrl,
    frameWidth: 128,
    frameHeight: 128,
    idleFrameCount: 4,
    attackFrameCount: 6,
  },
  'cinder-duelist': {
    unitId: 'cinder-duelist',
    idleKey: 'unit-cinder-duelist-idle',
    attackKey: 'unit-cinder-duelist-attack',
    idleAnimationKey: 'unit-cinder-duelist-idle-anim',
    attackAnimationKey: 'unit-cinder-duelist-attack-anim',
    idleUrl: cinderDuelistIdleUrl,
    attackUrl: cinderDuelistAttackUrl,
    frameWidth: 128,
    frameHeight: 128,
    idleFrameCount: 4,
    attackFrameCount: 6,
  },
  'frost-archer': {
    unitId: 'frost-archer',
    idleKey: 'unit-frost-archer-idle',
    attackKey: 'unit-frost-archer-attack',
    idleAnimationKey: 'unit-frost-archer-idle-anim',
    attackAnimationKey: 'unit-frost-archer-attack-anim',
    idleUrl: frostArcherIdleUrl,
    attackUrl: frostArcherAttackUrl,
    frameWidth: 128,
    frameHeight: 128,
    idleFrameCount: 4,
    attackFrameCount: 6,
  },
  'glacier-mage': {
    unitId: 'glacier-mage',
    idleKey: 'unit-glacier-mage-idle',
    attackKey: 'unit-glacier-mage-cast',
    idleAnimationKey: 'unit-glacier-mage-idle-anim',
    attackAnimationKey: 'unit-glacier-mage-cast-anim',
    idleUrl: glacierMageIdleUrl,
    attackUrl: glacierMageCastUrl,
    frameWidth: 128,
    frameHeight: 128,
    idleFrameCount: 4,
    attackFrameCount: 6,
  },
  'shade-stalker': {
    unitId: 'shade-stalker',
    idleKey: 'unit-shade-stalker-idle',
    attackKey: 'unit-shade-stalker-attack',
    idleAnimationKey: 'unit-shade-stalker-idle-anim',
    attackAnimationKey: 'unit-shade-stalker-attack-anim',
    idleUrl: shadeStalkerIdleUrl,
    attackUrl: shadeStalkerAttackUrl,
    frameWidth: 128,
    frameHeight: 128,
    idleFrameCount: 4,
    attackFrameCount: 6,
  },
  'night-oracle': {
    unitId: 'night-oracle',
    idleKey: 'unit-night-oracle-idle',
    attackKey: 'unit-night-oracle-cast',
    idleAnimationKey: 'unit-night-oracle-idle-anim',
    attackAnimationKey: 'unit-night-oracle-cast-anim',
    idleUrl: nightOracleIdleUrl,
    attackUrl: nightOracleCastUrl,
    frameWidth: 128,
    frameHeight: 128,
    idleFrameCount: 4,
    attackFrameCount: 6,
  },
  'ironwood-bulwark': {
    unitId: 'ironwood-bulwark',
    idleKey: 'unit-ironwood-bulwark-idle',
    attackKey: 'unit-ironwood-bulwark-attack',
    idleAnimationKey: 'unit-ironwood-bulwark-idle-anim',
    attackAnimationKey: 'unit-ironwood-bulwark-attack-anim',
    idleUrl: ironwoodBulwarkIdleUrl,
    attackUrl: ironwoodBulwarkAttackUrl,
    frameWidth: 128,
    frameHeight: 128,
    idleFrameCount: 4,
    attackFrameCount: 6,
  },
  'grove-mystic': {
    unitId: 'grove-mystic', idleKey: 'unit-grove-mystic-idle', attackKey: 'unit-grove-mystic-cast',
    idleAnimationKey: 'unit-grove-mystic-idle-anim', attackAnimationKey: 'unit-grove-mystic-cast-anim',
    idleUrl: groveMysticIdleUrl, attackUrl: groveMysticCastUrl, frameWidth: 128, frameHeight: 128, idleFrameCount: 4, attackFrameCount: 6,
  },
  'storm-ranger': {
    unitId: 'storm-ranger', idleKey: 'unit-storm-ranger-idle', attackKey: 'unit-storm-ranger-attack',
    idleAnimationKey: 'unit-storm-ranger-idle-anim', attackAnimationKey: 'unit-storm-ranger-attack-anim',
    idleUrl: stormRangerIdleUrl, attackUrl: stormRangerAttackUrl, frameWidth: 128, frameHeight: 128, idleFrameCount: 4, attackFrameCount: 6,
  },
  'thunder-bruiser': {
    unitId: 'thunder-bruiser', idleKey: 'unit-thunder-bruiser-idle', attackKey: 'unit-thunder-bruiser-attack',
    idleAnimationKey: 'unit-thunder-bruiser-idle-anim', attackAnimationKey: 'unit-thunder-bruiser-attack-anim',
    idleUrl: thunderBruiserIdleUrl, attackUrl: thunderBruiserAttackUrl, frameWidth: 128, frameHeight: 128, idleFrameCount: 4, attackFrameCount: 6,
  },
};

export function getUnitSpriteSpec(unitId: Unit['id']): UnitSpriteSpec | undefined {
  return UNIT_SPRITE_SPECS[unitId];
}

export function preloadUnitSprites(scene: Phaser.Scene) {
  for (const spec of Object.values(UNIT_SPRITE_SPECS)) {
    scene.load.spritesheet(spec.idleKey, spec.idleUrl, {
      frameWidth: spec.frameWidth,
      frameHeight: spec.frameHeight,
    });
    scene.load.spritesheet(spec.attackKey, spec.attackUrl, {
      frameWidth: spec.frameWidth,
      frameHeight: spec.frameHeight,
    });
  }

  scene.load.spritesheet(GLACIER_ICE_BLOOM_KEY, glacierMageIceBloomUrl, {
    frameWidth: 128,
    frameHeight: 128,
  });
  scene.load.spritesheet(GLACIER_FROST_BOLT_KEY, glacierMageFrostBoltUrl, {
    frameWidth: 128,
    frameHeight: 128,
  });
  scene.load.spritesheet(SHADE_STALKER_SHADOW_LUNGE_KEY, shadeStalkerShadowLungeUrl, {
    frameWidth: 128,
    frameHeight: 128,
  });
  scene.load.spritesheet(FROST_ARCHER_CHILLING_SHOT_KEY, frostArcherChillingShotUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(CINDER_DUELIST_CINDER_STRIKE_KEY, cinderDuelistCinderStrikeUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(EMBER_GUARD_EMBER_SHIELD_KEY, emberGuardEmberShieldUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(NIGHT_ORACLE_TWILIGHT_MEND_KEY, nightOracleTwilightMendUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(NIGHT_ORACLE_MOON_BOLT_KEY, nightOracleMoonBoltUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(IRONWOOD_BULWARK_ROOTED_ROAR_KEY, ironwoodBulwarkRootedRoarUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(GROVE_MYSTIC_SEED_BOLT_KEY, groveMysticSeedBoltUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(GROVE_MYSTIC_VERDANT_PULSE_KEY, groveMysticVerdantPulseUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(STORM_RANGER_LIGHTNING_BOLT_KEY, stormRangerLightningBoltUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(STORM_RANGER_RAPID_GALE_KEY, stormRangerRapidGaleUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(THUNDER_BRUISER_THUNDER_PUNCH_KEY, thunderBruiserThunderPunchUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(THUNDER_BRUISER_THUNDER_CLAP_KEY, thunderBruiserThunderClapUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(CELESTIAL_SAGE_STAR_BOLT_KEY, celestialSageStarBoltUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(CELESTIAL_SAGE_STARFALL_KEY, celestialSageStarfallUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(DAWN_WARDEN_RADIANT_BASH_KEY, dawnWardenRadiantBashUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(DAWN_WARDEN_RADIANT_AEGIS_KEY, dawnWardenRadiantAegisUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(EMBER_GUARD_EMBER_BASH_KEY, emberGuardEmberBashUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(CINDER_DUELIST_FLAME_CLEAVE_KEY, cinderDuelistFlameCleaveUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(SHADE_STALKER_SHADE_SLASH_KEY, shadeStalkerShadeSlashUrl, { frameWidth: 128, frameHeight: 128 });
  scene.load.spritesheet(IRONWOOD_BULWARK_ROOT_SMASH_KEY, ironwoodBulwarkRootSmashUrl, { frameWidth: 128, frameHeight: 128 });
}

export function createUnitSpriteAnimations(scene: Phaser.Scene) {
  for (const spec of Object.values(UNIT_SPRITE_SPECS)) {
    if (!scene.anims.exists(spec.idleAnimationKey)) {
      scene.anims.create({
        key: spec.idleAnimationKey,
        frames: scene.anims.generateFrameNumbers(spec.idleKey, {
          start: 0,
          end: spec.idleFrameCount - 1,
        }),
        frameRate: 4,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(spec.attackAnimationKey)) {
      scene.anims.create({
        key: spec.attackAnimationKey,
        frames: scene.anims.generateFrameNumbers(spec.attackKey, {
          start: 0,
          end: spec.attackFrameCount - 1,
        }),
        frameRate: 18,
        repeat: 0,
      });
    }
  }

  if (!scene.anims.exists(GLACIER_ICE_BLOOM_ANIMATION_KEY)) {
    scene.anims.create({
      key: GLACIER_ICE_BLOOM_ANIMATION_KEY,
      frames: scene.anims.generateFrameNumbers(GLACIER_ICE_BLOOM_KEY, { start: 0, end: 3 }),
      frameRate: 9,
      repeat: 0,
    });
  }

  if (!scene.anims.exists(GLACIER_FROST_BOLT_ANIMATION_KEY)) {
    scene.anims.create({
      key: GLACIER_FROST_BOLT_ANIMATION_KEY,
      frames: scene.anims.generateFrameNumbers(GLACIER_FROST_BOLT_KEY, { start: 0, end: 3 }),
      frameRate: 14,
      repeat: -1,
    });
  }

  if (!scene.anims.exists(SHADE_STALKER_SHADOW_LUNGE_ANIMATION_KEY)) {
    scene.anims.create({
      key: SHADE_STALKER_SHADOW_LUNGE_ANIMATION_KEY,
      frames: scene.anims.generateFrameNumbers(SHADE_STALKER_SHADOW_LUNGE_KEY, { start: 0, end: 3 }),
      frameRate: 12,
      repeat: 0,
    });
  }

  if (!scene.anims.exists(FROST_ARCHER_CHILLING_SHOT_ANIMATION_KEY)) {
    scene.anims.create({
      key: FROST_ARCHER_CHILLING_SHOT_ANIMATION_KEY,
      frames: scene.anims.generateFrameNumbers(FROST_ARCHER_CHILLING_SHOT_KEY, { start: 0, end: 3 }),
      frameRate: 14,
      repeat: -1,
    });
  }

  if (!scene.anims.exists(CINDER_DUELIST_CINDER_STRIKE_ANIMATION_KEY)) {
    scene.anims.create({
      key: CINDER_DUELIST_CINDER_STRIKE_ANIMATION_KEY,
      frames: scene.anims.generateFrameNumbers(CINDER_DUELIST_CINDER_STRIKE_KEY, { start: 0, end: 3 }),
      frameRate: 12,
      repeat: 0,
    });
  }

  if (!scene.anims.exists(EMBER_GUARD_EMBER_SHIELD_ANIMATION_KEY)) {
    scene.anims.create({
      key: EMBER_GUARD_EMBER_SHIELD_ANIMATION_KEY,
      frames: scene.anims.generateFrameNumbers(EMBER_GUARD_EMBER_SHIELD_KEY, { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });
  }

  if (!scene.anims.exists(NIGHT_ORACLE_TWILIGHT_MEND_ANIMATION_KEY)) {
    scene.anims.create({
      key: NIGHT_ORACLE_TWILIGHT_MEND_ANIMATION_KEY,
      frames: scene.anims.generateFrameNumbers(NIGHT_ORACLE_TWILIGHT_MEND_KEY, { start: 0, end: 3 }),
      frameRate: 9,
      repeat: 0,
    });
  }

  if (!scene.anims.exists(NIGHT_ORACLE_MOON_BOLT_ANIMATION_KEY)) {
    scene.anims.create({
      key: NIGHT_ORACLE_MOON_BOLT_ANIMATION_KEY,
      frames: scene.anims.generateFrameNumbers(NIGHT_ORACLE_MOON_BOLT_KEY, { start: 0, end: 3 }),
      frameRate: 14,
      repeat: -1,
    });
  }

  if (!scene.anims.exists(IRONWOOD_BULWARK_ROOTED_ROAR_ANIMATION_KEY)) {
    scene.anims.create({
      key: IRONWOOD_BULWARK_ROOTED_ROAR_ANIMATION_KEY,
      frames: scene.anims.generateFrameNumbers(IRONWOOD_BULWARK_ROOTED_ROAR_KEY, { start: 0, end: 3 }),
      frameRate: 9,
      repeat: 0,
    });
  }
  if (!scene.anims.exists(GROVE_MYSTIC_SEED_BOLT_ANIMATION_KEY)) scene.anims.create({ key: GROVE_MYSTIC_SEED_BOLT_ANIMATION_KEY, frames: scene.anims.generateFrameNumbers(GROVE_MYSTIC_SEED_BOLT_KEY, { start: 0, end: 3 }), frameRate: 14, repeat: -1 });
  if (!scene.anims.exists(GROVE_MYSTIC_VERDANT_PULSE_ANIMATION_KEY)) scene.anims.create({ key: GROVE_MYSTIC_VERDANT_PULSE_ANIMATION_KEY, frames: scene.anims.generateFrameNumbers(GROVE_MYSTIC_VERDANT_PULSE_KEY, { start: 0, end: 3 }), frameRate: 9, repeat: 0 });
  if (!scene.anims.exists(STORM_RANGER_LIGHTNING_BOLT_ANIMATION_KEY)) scene.anims.create({ key: STORM_RANGER_LIGHTNING_BOLT_ANIMATION_KEY, frames: scene.anims.generateFrameNumbers(STORM_RANGER_LIGHTNING_BOLT_KEY, { start: 0, end: 3 }), frameRate: 16, repeat: -1 });
  if (!scene.anims.exists(STORM_RANGER_RAPID_GALE_ANIMATION_KEY)) scene.anims.create({ key: STORM_RANGER_RAPID_GALE_ANIMATION_KEY, frames: scene.anims.generateFrameNumbers(STORM_RANGER_RAPID_GALE_KEY, { start: 0, end: 3 }), frameRate: 10, repeat: 0 });
  if (!scene.anims.exists(THUNDER_BRUISER_THUNDER_PUNCH_ANIMATION_KEY)) scene.anims.create({ key: THUNDER_BRUISER_THUNDER_PUNCH_ANIMATION_KEY, frames: scene.anims.generateFrameNumbers(THUNDER_BRUISER_THUNDER_PUNCH_KEY, { start: 0, end: 3 }), frameRate: 15, repeat: 0 });
  if (!scene.anims.exists(THUNDER_BRUISER_THUNDER_CLAP_ANIMATION_KEY)) scene.anims.create({ key: THUNDER_BRUISER_THUNDER_CLAP_ANIMATION_KEY, frames: scene.anims.generateFrameNumbers(THUNDER_BRUISER_THUNDER_CLAP_KEY, { start: 0, end: 3 }), frameRate: 9, repeat: 0 });
  if (!scene.anims.exists(CELESTIAL_SAGE_STAR_BOLT_ANIMATION_KEY)) scene.anims.create({ key: CELESTIAL_SAGE_STAR_BOLT_ANIMATION_KEY, frames: scene.anims.generateFrameNumbers(CELESTIAL_SAGE_STAR_BOLT_KEY, { start: 0, end: 3 }), frameRate: 15, repeat: -1 });
  if (!scene.anims.exists(CELESTIAL_SAGE_STARFALL_ANIMATION_KEY)) scene.anims.create({ key: CELESTIAL_SAGE_STARFALL_ANIMATION_KEY, frames: scene.anims.generateFrameNumbers(CELESTIAL_SAGE_STARFALL_KEY, { start: 0, end: 3 }), frameRate: 9, repeat: 0 });
  if (!scene.anims.exists(DAWN_WARDEN_RADIANT_BASH_ANIMATION_KEY)) scene.anims.create({ key: DAWN_WARDEN_RADIANT_BASH_ANIMATION_KEY, frames: scene.anims.generateFrameNumbers(DAWN_WARDEN_RADIANT_BASH_KEY, { start: 0, end: 3 }), frameRate: 15, repeat: 0 });
  if (!scene.anims.exists(DAWN_WARDEN_RADIANT_AEGIS_ANIMATION_KEY)) scene.anims.create({ key: DAWN_WARDEN_RADIANT_AEGIS_ANIMATION_KEY, frames: scene.anims.generateFrameNumbers(DAWN_WARDEN_RADIANT_AEGIS_KEY, { start: 0, end: 3 }), frameRate: 9, repeat: 0 });
  if (!scene.anims.exists(EMBER_GUARD_EMBER_BASH_ANIMATION_KEY)) scene.anims.create({ key: EMBER_GUARD_EMBER_BASH_ANIMATION_KEY, frames: scene.anims.generateFrameNumbers(EMBER_GUARD_EMBER_BASH_KEY, { start: 0, end: 3 }), frameRate: 15, repeat: 0 });
  if (!scene.anims.exists(CINDER_DUELIST_FLAME_CLEAVE_ANIMATION_KEY)) scene.anims.create({ key: CINDER_DUELIST_FLAME_CLEAVE_ANIMATION_KEY, frames: scene.anims.generateFrameNumbers(CINDER_DUELIST_FLAME_CLEAVE_KEY, { start: 0, end: 3 }), frameRate: 14, repeat: 0 });
  if (!scene.anims.exists(SHADE_STALKER_SHADE_SLASH_ANIMATION_KEY)) scene.anims.create({ key: SHADE_STALKER_SHADE_SLASH_ANIMATION_KEY, frames: scene.anims.generateFrameNumbers(SHADE_STALKER_SHADE_SLASH_KEY, { start: 0, end: 3 }), frameRate: 16, repeat: 0 });
  if (!scene.anims.exists(IRONWOOD_BULWARK_ROOT_SMASH_ANIMATION_KEY)) scene.anims.create({ key: IRONWOOD_BULWARK_ROOT_SMASH_ANIMATION_KEY, frames: scene.anims.generateFrameNumbers(IRONWOOD_BULWARK_ROOT_SMASH_KEY, { start: 0, end: 3 }), frameRate: 14, repeat: 0 });
}
