import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRuntimeConfig } from '../dist/core/config.js';

test('validateRuntimeConfig merges defaults', () => {
  const cfg = validateRuntimeConfig({ maxStepsPerRun: 42 });
  assert.equal(cfg.maxStepsPerRun, 42);
  assert.ok(cfg.fixedDelta > 0);
});

test('validateRuntimeConfig rejects invalid values', () => {
  assert.throws(() => validateRuntimeConfig({ fixedDelta: 0 }));
  assert.throws(() => validateRuntimeConfig({ maxHistorySize: 5 }));
});
