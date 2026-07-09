import test from 'node:test';
import assert from 'node:assert';
import { calculateStreakBackward, calculateBestStreakForward } from './analyticsEngine.js';

test('analyticsEngine streak logic', async (t) => {
  await t.test('calculates backward streak correctly with neutral days and today leniency', () => {
    // mock stats provider
    const stats = {
      '2026-07-09': { scheduled: 2, completed: 1 }, // today (incomplete)
      '2026-07-08': { scheduled: 2, completed: 2 }, // yesterday
      '2026-07-07': { scheduled: 0, completed: 0 }, // neutral
      '2026-07-06': { scheduled: 1, completed: 1 }, // -3 days
      '2026-07-05': { scheduled: 1, completed: 0 }, // -4 days (break)
    };
    
    const provider = (dateStr) => stats[dateStr] || { scheduled: 0, completed: 0 };
    
    const streak = calculateStreakBackward(provider, '2026-07-09', '2026-07-01');
    
    // Today is incomplete, leniency ignores it.
    // 07-08 is complete (+1)
    // 07-07 is neutral (0)
    // 07-06 is complete (+1)
    // 07-05 is break.
    // Total = 2.
    assert.strictEqual(streak, 2);
  });

  await t.test('calculates backward streak when today is complete (terminates at startDate)', () => {
    const stats = {
      '2026-07-09': { scheduled: 1, completed: 1 }, // today
      '2026-07-08': { scheduled: 1, completed: 1 }, // yesterday
    };
    const provider = (dateStr) => stats[dateStr] || { scheduled: 0, completed: 0 };
    assert.strictEqual(calculateStreakBackward(provider, '2026-07-09', '2026-07-08'), 2);
  });

  await t.test('calculates backward streak when broken yesterday', () => {
    const stats = {
      '2026-07-09': { scheduled: 1, completed: 0 }, // today
      '2026-07-08': { scheduled: 1, completed: 0 }, // yesterday
      '2026-07-07': { scheduled: 1, completed: 1 }, // -2 days
    };
    const provider = (dateStr) => stats[dateStr] || { scheduled: 0, completed: 0 };
    // Today is lenient (ignored), yesterday is broken -> streak is 0.
    assert.strictEqual(calculateStreakBackward(provider, '2026-07-09', '2026-07-01'), 0);
  });

  await t.test('A one-day history with completed today returns streak 1', () => {
    const stats = {
      '2026-07-09': { scheduled: 1, completed: 1 }
    };
    const provider = (dateStr) => stats[dateStr] || { scheduled: 0, completed: 0 };
    assert.strictEqual(calculateStreakBackward(provider, '2026-07-09', '2026-07-09'), 1);
  });

  await t.test('A long fully-completed history returns the correct finite streak', () => {
    const stats = {};
    for (let i = 1; i <= 9; i++) {
      stats[`2026-07-0${i}`] = { scheduled: 1, completed: 1 };
    }
    const provider = (dateStr) => stats[dateStr] || { scheduled: 0, completed: 0 };
    assert.strictEqual(calculateStreakBackward(provider, '2026-07-09', '2026-07-01'), 9);
  });

  await t.test('Neutral days before startDate do not cause iteration beyond startDate', () => {
    const stats = {
      '2026-07-09': { scheduled: 1, completed: 1 }
    };
    const provider = (dateStr) => stats[dateStr] || { scheduled: 0, completed: 0 };
    // Should stop at 2026-07-09 exactly
    assert.strictEqual(calculateStreakBackward(provider, '2026-07-09', '2026-07-09'), 1);
  });

  await t.test('startDate === endDate works', () => {
    const stats = {
      '2026-07-09': { scheduled: 1, completed: 1 }
    };
    const provider = (dateStr) => stats[dateStr] || { scheduled: 0, completed: 0 };
    assert.strictEqual(calculateStreakBackward(provider, '2026-07-09', '2026-07-09'), 1);
  });

  await t.test('startDate after endDate returns 0', () => {
    const stats = {
      '2026-07-09': { scheduled: 1, completed: 1 }
    };
    const provider = (dateStr) => stats[dateStr] || { scheduled: 0, completed: 0 };
    assert.strictEqual(calculateStreakBackward(provider, '2026-07-09', '2026-07-10'), 0);
  });

  await t.test('calculates best streak correctly', () => {
    const stats = {
      '2026-07-01': { scheduled: 1, completed: 1 },
      '2026-07-02': { scheduled: 1, completed: 1 },
      '2026-07-03': { scheduled: 0, completed: 0 },
      '2026-07-04': { scheduled: 1, completed: 1 },
      '2026-07-05': { scheduled: 1, completed: 0 },
      '2026-07-06': { scheduled: 1, completed: 1 },
      '2026-07-07': { scheduled: 1, completed: 1 },
      '2026-07-08': { scheduled: 1, completed: 1 },
      '2026-07-09': { scheduled: 1, completed: 0 }, // today
    };
    const provider = (dateStr) => stats[dateStr] || { scheduled: 0, completed: 0 };
    
    // Sequence 1: 01, 02, 03(skip), 04 => 3 days. Then 05 breaks.
    // Sequence 2: 06, 07, 08 => 3 days. 09 (today) is lenient ignored.
    // Best is 3.
    assert.strictEqual(calculateBestStreakForward(provider, '2026-07-01', '2026-07-09'), 3);
  });
});
