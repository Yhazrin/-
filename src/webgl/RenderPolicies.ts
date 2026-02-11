import type { RenderEntitySnapshot } from '../core/renderTypes.js';
import { MONUMENT_VALLEY_PALETTE } from '../visual/designSystem.js';

export type RGB = { r: number; g: number; b: number };

const hexToRgb = (hex: string): RGB => {
  const v = hex.replace('#', '');
  const n = parseInt(v, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
};

export const colorPolicy = (entity: RenderEntitySnapshot): RGB => {
  const base = entity.type === 'predator'
    ? MONUMENT_VALLEY_PALETTE.accent.coral
    : entity.type === 'plant'
      ? MONUMENT_VALLEY_PALETTE.nature.sage
      : MONUMENT_VALLEY_PALETTE.primary.stone;

  const c = hexToRgb(base);
  const energyBoost = Math.min(1.15, 0.8 + entity.energy / 300);
  const healthBoost = Math.min(1.1, 0.85 + entity.health / 500);
  return {
    r: Math.min(1, c.r * energyBoost),
    g: Math.min(1, c.g * healthBoost),
    b: Math.min(1, c.b * (energyBoost + healthBoost) * 0.5),
  };
};

export const matrixPolicy = (entity: RenderEntitySnapshot): readonly number[] => {
  const scale = 0.7 + Math.max(0.2, entity.health / 100) * 0.6;
  const x = entity.position.x;
  const y = entity.position.y;
  const z = entity.position.z;

  return [
    scale, 0, 0, 0,
    0, scale, 0, 0,
    0, 0, scale, 0,
    x, y, z, 1,
  ];
};

export interface EnvironmentUniforms {
  uSeason: number;
  uLightIntensity: number;
  uPlantGrowthMultiplier: number;
  uPredatorDrainMultiplier: number;
}

export const mapEnvironmentToUniforms = (input: {
  season: string;
  lightIntensity: number;
  plantGrowthMultiplier: number;
  predatorDrainMultiplier: number;
}): EnvironmentUniforms => {
  const seasonMap: Record<string, number> = {
    spring: 0,
    summer: 1,
    autumn: 2,
    winter: 3,
  };

  return {
    uSeason: seasonMap[input.season] ?? 0,
    uLightIntensity: input.lightIntensity,
    uPlantGrowthMultiplier: input.plantGrowthMultiplier,
    uPredatorDrainMultiplier: input.predatorDrainMultiplier,
  };
};
