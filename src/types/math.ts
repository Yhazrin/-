export interface Vector3 { x: number; y: number; z: number }

export const vec3 = (x = 0, y = 0, z = 0): Vector3 => ({ x, y, z });
export const add = (a: Vector3, b: Vector3): Vector3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
export const sub = (a: Vector3, b: Vector3): Vector3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
export const scale = (v: Vector3, s: number): Vector3 => ({ x: v.x * s, y: v.y * s, z: v.z * s });
export const length = (v: Vector3): number => Math.hypot(v.x, v.y, v.z);
export const normalize = (v: Vector3): Vector3 => {
  const len = length(v);
  return len === 0 ? vec3() : scale(v, 1 / len);
};
export const distance = (a: Vector3, b: Vector3): number => length(sub(a, b));
export const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
