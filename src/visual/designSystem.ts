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

export const GEOMETRY_BEHAVIOR_MAP = {
  [GeometryType.PYRAMID]: { kind: 'predator', speed: 1.2, aggression: 0.8, color: MONUMENT_VALLEY_PALETTE.accent.coral },
  [GeometryType.CUBE]: { kind: 'neutral', speed: 0.8, aggression: 0.25, color: MONUMENT_VALLEY_PALETTE.primary.stone },
  [GeometryType.SPHERE]: { kind: 'plant', speed: 0.05, aggression: 0, color: MONUMENT_VALLEY_PALETTE.nature.sage },
  [GeometryType.CYLINDER]: { kind: 'neutral', speed: 0.9, aggression: 0.2, color: MONUMENT_VALLEY_PALETTE.nature.earth },
  [GeometryType.PRISM]: { kind: 'predator', speed: 1.1, aggression: 0.7, color: MONUMENT_VALLEY_PALETTE.accent.gold },
  [GeometryType.TORUS]: { kind: 'neutral', speed: 1.0, aggression: 0.4, color: MONUMENT_VALLEY_PALETTE.accent.sky },
} as const;
