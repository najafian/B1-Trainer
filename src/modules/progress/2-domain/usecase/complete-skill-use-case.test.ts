import type { SkillId } from '../models/progress';
import type { ProgressRepo } from '../repository/progress-repo';

import { CompleteSkillUseCaseImpl } from './complete-skill-use-case';

const ALL: SkillId[] = ['sprechen', 'schreiben', 'lesen', 'hoeren', 'wortschatz', 'werte'];

function fakeRepo(initial: SkillId[] = []) {
  const done = new Set<SkillId>(initial);
  const repo: ProgressRepo = {
    completedSkills: async () => [...done],
    markSkillDone: async (_station, skill) => {
      done.add(skill);
    },
    reachedStations: async () => [],
  };
  return repo;
}

describe('CompleteSkillUseCase', () => {
  it('records the skill and reports the station as not yet reached', async () => {
    const result = await new CompleteSkillUseCaseImpl(fakeRepo()).execute(1, 'lesen');
    expect(result.completedSkills).toEqual(['lesen']);
    expect(result.isReached).toBe(false);
  });

  it('reports the station reached only when all six lines are lit', async () => {
    const repo = fakeRepo(ALL.filter((s) => s !== 'werte'));
    const result = await new CompleteSkillUseCaseImpl(repo).execute(1, 'werte');
    expect(result.isReached).toBe(true);
  });

  it('is idempotent - finishing the same line twice does not duplicate it', async () => {
    const repo = fakeRepo(['lesen']);
    const result = await new CompleteSkillUseCaseImpl(repo).execute(1, 'lesen');
    expect(result.completedSkills).toEqual(['lesen']);
  });
});
