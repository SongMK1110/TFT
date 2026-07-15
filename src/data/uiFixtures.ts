import { BENCH_SLOT_COUNT } from '../types/board';
import { SHOP_SLOT_COUNT } from '../types/game';
import { synergies } from './synergies';
import { units } from './units';

export const featuredUnit = units[0];
export const benchUnits = units.slice(0, BENCH_SLOT_COUNT);
export const shopUnits = units.slice(0, SHOP_SLOT_COUNT);
export const visibleSynergies = synergies;
