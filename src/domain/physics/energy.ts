import { G } from "./constants";

/**
 * Calculates kinetic energy.
 *
 * Ec = (1 / 2) * m * v²
 *
 * Mass is expressed in kilograms (kg), speed in meters per second (m/s), and
 * the returned energy is expressed in joules (J).
 */
export function calculateKineticEnergy(mass: number, speed: number): number {
  if (!Number.isFinite(mass) || mass <= 0) {
    throw new Error("mass must be a finite number greater than zero.");
  }
  if (!Number.isFinite(speed) || speed < 0) {
    throw new Error("speed must be a finite number greater than or equal to zero.");
  }

  return 0.5 * mass * speed ** 2;
}

/**
 * Calculates gravitational potential energy using infinity as the zero
 * reference.
 *
 * Ep = -(G * m1 * m2) / r
 *
 * Masses are expressed in kilograms (kg), distance in meters (m), and the
 * returned energy is expressed in joules (J).
 */
export function calculateGravitationalPotentialEnergy(
  mass1: number,
  mass2: number,
  distance: number,
): number {
  if (!Number.isFinite(mass1) || mass1 <= 0) {
    throw new Error("mass1 must be a finite number greater than zero.");
  }
  if (!Number.isFinite(mass2) || mass2 <= 0) {
    throw new Error("mass2 must be a finite number greater than zero.");
  }
  if (!Number.isFinite(distance) || distance <= 0) {
    throw new Error("distance must be a finite number greater than zero.");
  }

  return -(G * mass1 * mass2) / distance;
}
