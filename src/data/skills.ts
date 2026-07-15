import { units } from './units';
import type { Skill } from '../types/unit';

export const skills: Skill[] = units.map((unit) => unit.skill);

export const skillDataSet = {
  version: 'phase-19-balance',
  skills,
} as const;

export function getSkillById(skillId: Skill['id']): Skill | undefined {
  return skills.find((skill) => skill.id === skillId);
}
