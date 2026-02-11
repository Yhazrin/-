export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export const vec3 = (x = 0, y = 0, z = 0): Vector3 => ({ x, y, z });

export const add = (a: Vector3, b: Vector3): Vector3 => vec3(a.x + b.x, a.y + b.y, a.z + b.z);
export const sub = (a: Vector3, b: Vector3): Vector3 => vec3(a.x - b.x, a.y - b.y, a.z - b.z);
export const mul = (a: Vector3, scalar: number): Vector3 => vec3(a.x * scalar, a.y * scalar, a.z * scalar);
export const length = (a: Vector3): number => Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
export const normalize = (a: Vector3): Vector3 => {
  const len = length(a);
  return len === 0 ? vec3(0, 0, 0) : mul(a, 1 / len);
};
export const distance = (a: Vector3, b: Vector3): number => length(sub(a, b));
