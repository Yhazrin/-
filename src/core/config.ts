export interface RuntimeTuningConfig {
  fixedDelta: number;
  maxStepsPerRun: number;
  maxHistorySize: number;
  maxCatchUpSteps: number;
  strictAdapterIsolation: boolean;
}

export const DEFAULT_RUNTIME_TUNING_CONFIG: RuntimeTuningConfig = {
  fixedDelta: 1 / 30,
  maxStepsPerRun: 10_000,
  maxHistorySize: 20_000,
  maxCatchUpSteps: 8,
  strictAdapterIsolation: true,
};

export const validateRuntimeConfig = (raw?: Partial<RuntimeTuningConfig>): RuntimeTuningConfig => {
  const merged: RuntimeTuningConfig = { ...DEFAULT_RUNTIME_TUNING_CONFIG, ...(raw ?? {}) };

  if (!(merged.fixedDelta > 0 && merged.fixedDelta <= 1)) {
    throw new Error(`Invalid fixedDelta: ${merged.fixedDelta}`);
  }
  if (!(Number.isInteger(merged.maxStepsPerRun) && merged.maxStepsPerRun > 0)) {
    throw new Error(`Invalid maxStepsPerRun: ${merged.maxStepsPerRun}`);
  }
  if (!(Number.isInteger(merged.maxHistorySize) && merged.maxHistorySize >= 100)) {
    throw new Error(`Invalid maxHistorySize: ${merged.maxHistorySize}`);
  }
  if (!(Number.isInteger(merged.maxCatchUpSteps) && merged.maxCatchUpSteps > 0)) {
    throw new Error(`Invalid maxCatchUpSteps: ${merged.maxCatchUpSteps}`);
  }

  return merged;
};
