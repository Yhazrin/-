export enum GeometryType {
  PYRAMID = 'pyramid',
  CUBE = 'cube',
  SPHERE = 'sphere',
  CYLINDER = 'cylinder',
  PRISM = 'prism',
  TORUS = 'torus',
}

export const MONUMENT_VALLEY_PALETTE = {
  primary: { sand: '#E8D5B7', stone: '#B8A99A', shadow: '#8B7355' },
  nature: { sage: '#A8B5A2', moss: '#7D8B6A', earth: '#9C8B7A' },
  accent: { coral: '#D4A5A5', sky: '#A5B5C4', gold: '#C9B896' },
  background: { light: '#F5F0E8', medium: '#E8E0D5', dark: '#D5CFC5' },
} as const;

export type BehaviorProfile = {
  behavior: 'predator' | 'neutral' | 'plant';
  speed: number;
  aggression: number;
  color: string;
};

export const GEOMETRY_BEHAVIOR_MAP: Record<GeometryType, BehaviorProfile> = {
  [GeometryType.PYRAMID]: { behavior: 'predator', speed: 1.2, aggression: 0.8, color: '#E8D5B7' },
  [GeometryType.CUBE]: { behavior: 'neutral', speed: 0.8, aggression: 0.3, color: '#B8A99A' },
  [GeometryType.SPHERE]: { behavior: 'plant', speed: 0.1, aggression: 0, color: '#A8B5A2' },
  [GeometryType.CYLINDER]: { behavior: 'neutral', speed: 0.9, aggression: 0.2, color: '#9C8B7A' },
  [GeometryType.PRISM]: { behavior: 'predator', speed: 1.1, aggression: 0.7, color: '#D4A5A5' },
  [GeometryType.TORUS]: { behavior: 'neutral', speed: 1.0, aggression: 0.4, color: '#C9B896' },
};
