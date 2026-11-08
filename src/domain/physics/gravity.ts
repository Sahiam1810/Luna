import { G } from "./constants";

/**
 * Calculates the gravitational force between two bodies.
 *
 * F = G * m1 * m2 / r²
 *
 * Masses are expressed in kilograms (kg), distance in meters (m), and the
 * returned force is expressed in newtons (N).
 */
export function calculateGravitationalForce(
  mass1: number,
  mass2: number,
  distance: number,
): number {
  validatePositiveFinite("mass1", mass1);
  validatePositiveFinite("mass2", mass2);
  validatePositiveFinite("distance", distance);

  return (G * mass1 * mass2) / distance ** 2;
}

function validatePositiveFinite(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a finite number greater than zero.`);
  }
}
