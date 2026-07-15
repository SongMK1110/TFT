import type { EnemyDataSet, EnemyEncounter } from '../types/game';

const EARLY_ROUND_REWARD_GOLD = 1;
const MID_ROUND_REWARD_GOLD = 2;
const LATE_ROUND_REWARD_GOLD = 3;
const BOSS_ROUND_REWARD_GOLD = 4;

const EARLY_STAT_MULTIPLIER = 1;
const EARLY_ELITE_STAT_MULTIPLIER = 1.03;
const MID_STAT_MULTIPLIER = 1.1;
const MID_ELITE_STAT_MULTIPLIER = 1.2;
const LATE_STAT_MULTIPLIER = 1.3;
const LATE_ELITE_STAT_MULTIPLIER = 1.4;
const BOSS_STAT_MULTIPLIER = 1.5;

export const enemies: EnemyEncounter[] = [
  {
    id: 'round-1-sparks',
    round: 1,
    roundType: 'normal',
    difficultyBand: 'early',
    name: '훈련용 불씨',
    statMultiplier: EARLY_STAT_MULTIPLIER,
    units: [
      { unitId: 'ember-guard', starLevel: 1, position: { row: 1, col: 3 } },
    ],
    goldReward: EARLY_ROUND_REWARD_GOLD,
    itemRewardIds: [],
  },
  {
    id: 'round-2-frostline',
    round: 2,
    roundType: 'normal',
    difficultyBand: 'early',
    name: '서리 정찰대',
    statMultiplier: EARLY_STAT_MULTIPLIER,
    units: [
      { unitId: 'frost-archer', starLevel: 1, position: { row: 0, col: 4 } },
      { unitId: 'glacier-mage', starLevel: 1, position: { row: 0, col: 2 } },
    ],
    goldReward: EARLY_ROUND_REWARD_GOLD,
    itemRewardIds: ['swift-bow', 'giant-belt', 'iron-blade'],
  },
  {
    id: 'round-3-shade-pack',
    round: 3,
    roundType: 'normal',
    difficultyBand: 'early',
    name: '그늘 무리',
    statMultiplier: EARLY_ELITE_STAT_MULTIPLIER,
    units: [
      { unitId: 'shade-stalker', starLevel: 1, position: { row: 1, col: 2 } },
      { unitId: 'frost-archer', starLevel: 1, position: { row: 0, col: 5 } },
    ],
    goldReward: MID_ROUND_REWARD_GOLD,
    itemRewardIds: [],
  },
  {
    id: 'round-4-ironwood-line',
    round: 4,
    roundType: 'elite',
    difficultyBand: 'mid',
    name: '강철숲 전열',
    statMultiplier: MID_STAT_MULTIPLIER,
    units: [
      { unitId: 'ironwood-bulwark', starLevel: 1, position: { row: 1, col: 3 } },
      { unitId: 'grove-mystic', starLevel: 1, position: { row: 0, col: 3 } },
      { unitId: 'ember-guard', starLevel: 1, position: { row: 1, col: 2 } },
    ],
    goldReward: MID_ROUND_REWARD_GOLD,
    itemRewardIds: ['guardian-armor', 'giant-belt', 'focus-charm'],
  },
  {
    id: 'round-5-stormfront',
    round: 5,
    roundType: 'boss',
    difficultyBand: 'mid',
    name: '폭풍 전선 대장',
    statMultiplier: MID_ELITE_STAT_MULTIPLIER,
    units: [
      { unitId: 'thunder-bruiser', starLevel: 1, position: { row: 1, col: 3 } },
      { unitId: 'storm-ranger', starLevel: 1, position: { row: 0, col: 2 } },
      { unitId: 'glacier-mage', starLevel: 1, position: { row: 0, col: 4 } },
    ],
    goldReward: BOSS_ROUND_REWARD_GOLD,
    itemRewardIds: ['mystic-staff', 'mana-crystal', 'swift-bow'],
  },
  {
    id: 'round-6-flame-vanguard',
    round: 6,
    roundType: 'normal',
    difficultyBand: 'mid',
    name: '화염 선봉대',
    statMultiplier: MID_STAT_MULTIPLIER,
    units: [
      { unitId: 'ember-guard', starLevel: 2, position: { row: 1, col: 2 } },
      { unitId: 'storm-ranger', starLevel: 1, position: { row: 0, col: 5 } },
      { unitId: 'night-oracle', starLevel: 1, position: { row: 0, col: 1 } },
    ],
    goldReward: MID_ROUND_REWARD_GOLD,
    itemRewardIds: [],
  },
  {
    id: 'round-7-frozen-court',
    round: 7,
    roundType: 'elite',
    difficultyBand: 'mid',
    name: '얼어붙은 궁정',
    statMultiplier: MID_ELITE_STAT_MULTIPLIER,
    units: [
      { unitId: 'glacier-mage', starLevel: 2, position: { row: 0, col: 3 }, itemIds: ['mana-crystal'] },
      { unitId: 'frost-archer', starLevel: 1, position: { row: 0, col: 1 } },
      { unitId: 'ironwood-bulwark', starLevel: 1, position: { row: 1, col: 3 } },
      { unitId: 'grove-mystic', starLevel: 1, position: { row: 0, col: 5 } },
    ],
    goldReward: LATE_ROUND_REWARD_GOLD,
    itemRewardIds: ['focus-charm', 'guardian-armor', 'mystic-staff'],
  },
  {
    id: 'round-8-shadow-pincer',
    round: 8,
    roundType: 'normal',
    difficultyBand: 'late',
    name: '그림자 협공',
    statMultiplier: LATE_STAT_MULTIPLIER,
    units: [
      { unitId: 'shade-stalker', starLevel: 1, position: { row: 1, col: 1 }, itemIds: ['iron-blade'] },
      { unitId: 'shade-stalker', starLevel: 1, position: { row: 1, col: 5 } },
      { unitId: 'night-oracle', starLevel: 1, position: { row: 0, col: 3 } },
      { unitId: 'cinder-duelist', starLevel: 1, position: { row: 1, col: 3 } },
      { unitId: 'frost-archer', starLevel: 1, position: { row: 0, col: 6 } },
    ],
    goldReward: LATE_ROUND_REWARD_GOLD,
    itemRewardIds: [],
  },
  {
    id: 'round-9-celestial-gate',
    round: 9,
    roundType: 'elite',
    difficultyBand: 'late',
    name: '천상의 관문',
    statMultiplier: LATE_ELITE_STAT_MULTIPLIER,
    units: [
      { unitId: 'dawn-warden', starLevel: 1, position: { row: 1, col: 3 }, itemIds: ['guardian-armor'] },
      { unitId: 'celestial-sage', starLevel: 1, position: { row: 0, col: 3 }, itemIds: ['mystic-staff'] },
      { unitId: 'grove-mystic', starLevel: 1, position: { row: 0, col: 1 } },
      { unitId: 'storm-ranger', starLevel: 1, position: { row: 0, col: 5 } },
      { unitId: 'ember-guard', starLevel: 1, position: { row: 1, col: 1 } },
    ],
    goldReward: LATE_ROUND_REWARD_GOLD,
    itemRewardIds: ['mana-crystal', 'mystic-staff', 'swift-bow'],
  },
  {
    id: 'round-10-tempest-boss',
    round: 10,
    roundType: 'boss',
    difficultyBand: 'late',
    name: '폭풍의 심장',
    statMultiplier: BOSS_STAT_MULTIPLIER,
    units: [
      { unitId: 'thunder-bruiser', starLevel: 2, position: { row: 1, col: 3 }, itemIds: ['giant-belt'] },
      { unitId: 'storm-ranger', starLevel: 1, position: { row: 0, col: 2 }, itemIds: ['swift-bow'] },
      { unitId: 'storm-ranger', starLevel: 1, position: { row: 0, col: 4 } },
      { unitId: 'dawn-warden', starLevel: 1, position: { row: 1, col: 4 } },
      { unitId: 'glacier-mage', starLevel: 1, position: { row: 0, col: 6 } },
    ],
    goldReward: BOSS_ROUND_REWARD_GOLD,
    itemRewardIds: ['mystic-staff', 'guardian-armor', 'mana-crystal'],
  },
  {
    id: 'round-11-ancient-grove',
    round: 11,
    roundType: 'elite',
    difficultyBand: 'late',
    name: '고대 숲의 방벽',
    statMultiplier: LATE_ELITE_STAT_MULTIPLIER,
    units: [
      { unitId: 'ironwood-bulwark', starLevel: 2, position: { row: 1, col: 2 }, itemIds: ['giant-belt'] },
      { unitId: 'ironwood-bulwark', starLevel: 1, position: { row: 1, col: 4 } },
      { unitId: 'grove-mystic', starLevel: 1, position: { row: 0, col: 2 }, itemIds: ['focus-charm'] },
      { unitId: 'dawn-warden', starLevel: 1, position: { row: 1, col: 3 } },
      { unitId: 'celestial-sage', starLevel: 1, position: { row: 0, col: 4 } },
    ],
    goldReward: LATE_ROUND_REWARD_GOLD,
    itemRewardIds: [],
  },
  {
    id: 'round-12-final-test',
    round: 12,
    roundType: 'boss',
    difficultyBand: 'late',
    name: '최종 모의전',
    statMultiplier: BOSS_STAT_MULTIPLIER,
    units: [
      { unitId: 'dawn-warden', starLevel: 2, position: { row: 1, col: 3 }, itemIds: ['guardian-armor'] },
      { unitId: 'celestial-sage', starLevel: 1, position: { row: 0, col: 3 }, itemIds: ['mystic-staff', 'mana-crystal'] },
      { unitId: 'thunder-bruiser', starLevel: 2, position: { row: 1, col: 1 }, itemIds: ['giant-belt'] },
      { unitId: 'storm-ranger', starLevel: 2, position: { row: 0, col: 1 }, itemIds: ['swift-bow'] },
      { unitId: 'shade-stalker', starLevel: 2, position: { row: 1, col: 5 }, itemIds: ['iron-blade'] },
      { unitId: 'glacier-mage', starLevel: 1, position: { row: 0, col: 5 }, itemIds: ['focus-charm'] },
    ],
    goldReward: BOSS_ROUND_REWARD_GOLD,
    itemRewardIds: ['mystic-staff', 'guardian-armor', 'mana-crystal'],
  },
];

export const enemyDataSet: EnemyDataSet = {
  version: 'phase-19-balance',
  encounters: enemies,
};
