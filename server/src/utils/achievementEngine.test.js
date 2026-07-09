import test from 'node:test';
import assert from 'node:assert';
import { achievementEngine, normalizeProgress } from './achievementEngine.js';

test('Achievement Engine Logic', async (t) => {
  await t.test('normalizeProgress caps at 100% and avoids NaN/Infinity', () => {
    assert.deepStrictEqual(normalizeProgress(0, 0), { current: 0, target: 1, percentage: 0 }); // safeTarget
    assert.deepStrictEqual(normalizeProgress(5, 0), { current: 5, target: 1, percentage: 100 });
    assert.deepStrictEqual(normalizeProgress(5, 5), { current: 5, target: 5, percentage: 100 });
    assert.deepStrictEqual(normalizeProgress(10, 5), { current: 10, target: 5, percentage: 100 });
    assert.deepStrictEqual(normalizeProgress(3, 10), { current: 3, target: 10, percentage: 30 });
    assert.deepStrictEqual(normalizeProgress(-1, 10), { current: 0, target: 10, percentage: 0 });
  });

  await t.test('evaluateHabitCount', () => {
    const habits = [{}, {}];
    const res = achievementEngine.evaluateHabitCount(habits, 5);
    assert.strictEqual(res.current, 2);
    assert.strictEqual(res.percentage, 40);

    const res2 = achievementEngine.evaluateHabitCount(habits, 1);
    assert.strictEqual(res2.percentage, 100);
  });

  await t.test('evaluateTotalCheckIns', () => {
    const res = achievementEngine.evaluateTotalCheckIns(42, 50);
    assert.strictEqual(res.current, 42);
    assert.strictEqual(res.percentage, 84);

    const res2 = achievementEngine.evaluateTotalCheckIns(100, 50);
    assert.strictEqual(res2.current, 100);
    assert.strictEqual(res2.percentage, 100);
  });

  await t.test('evaluateHabitBestStreak', () => {
    const performances = [
      { bestStreak: 2 },
      { bestStreak: 7 },
      { bestStreak: 4 }
    ];
    const res = achievementEngine.evaluateHabitBestStreak(performances, 30);
    assert.strictEqual(res.current, 7);
    assert.strictEqual(res.percentage, 23.3);

    const res2 = achievementEngine.evaluateHabitBestStreak(performances, 7);
    assert.strictEqual(res2.current, 7);
    assert.strictEqual(res2.percentage, 100);
  });

  await t.test('evaluateOverallBestStreak', () => {
    const res = achievementEngine.evaluateOverallBestStreak(5, 7);
    assert.strictEqual(res.current, 5);
    assert.strictEqual(res.percentage, 71.4);

    const res2 = achievementEngine.evaluateOverallBestStreak(10, 7);
    assert.strictEqual(res2.percentage, 100);
  });
});
