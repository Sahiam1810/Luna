/**
 * Calculates the orbital speed for a circular orbit.
 *
 * v = (2 * π * r) / T
 *
 * Distance is expressed in meters (m), period in seconds (s), and the
 * returned speed is expressed in meters per second (m/s).
 */
export function calculateOrbitalSpeed(distance: number, period: number): number {
  if (!Number.isFinite(distance) || distance <= 0) {
    throw new Error("distance must be a finite number greater than zero.");
  }
  if (!Number.isFinite(period) || period <= 0) {
    throw new Error("period must be a finite number greater than zero.");
  }

  return (2 * Math.PI * distance) / period;
}

/**
 * Calculates angular velocity for a circular orbit.
 *
 * ω = (2 * π) / T
 *
 * Period is expressed in seconds (s), and the returned angular velocity is
 * expressed in radians per second (rad/s).
 */
export function calculateAngularVelocity(period: number): number {
  if (!Number.isFinite(period) || period <= 0) {
    throw new Error("period must be a finite number greater than zero.");
  }

  return (2 * Math.PI) / period;
}

/**
 * Calculates centripetal acceleration for circular motion.
 *
 * ac = v² / r
 *
 * Speed is expressed in meters per second (m/s), distance in meters (m), and
 * the returned acceleration is expressed in meters per second squared (m/s²).
 */
export function calculateCentripetalAcceleration(speed: number, distance: number): number {
  if (!Number.isFinite(speed) || speed < 0) {
    throw new Error("speed must be a finite number greater than or equal to zero.");
  }
  if (!Number.isFinite(distance) || distance <= 0) {
    throw new Error("distance must be a finite number greater than zero.");
  }

  return speed ** 2 / distance;
}
