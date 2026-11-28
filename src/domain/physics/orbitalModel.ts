import {
  EARTH_MOON_DISTANCE,
  LUNAR_SIDEREAL_PERIOD,
  M_EARTH,
} from "./constants";
import { calculateGravitationalForce } from "./gravity";
import {
  calculateAngularVelocity,
  calculateCentripetalAcceleration,
  calculateCircularOrbitSpeed,
  calculateOrbitalSpeed,
} from "./orbital";

/** Two-dimensional vector in the orbital plane, using SI units where applicable. */
export type Vector2 = { x: number; y: number };

/**
 * Calculates the angular position after a given elapsed time.
 *
 * θ = θ₀ + ωt
 *
 * Elapsed time and period are expressed in seconds (s), while angles are
 * expressed in radians. The returned angle is intentionally not normalized.
 */
export function calculateOrbitalAngle(
  elapsedTime: number,
  period: number,
  initialAngle = 0,
): number {
  if (!Number.isFinite(elapsedTime)) {
    throw new Error("elapsedTime must be a finite number.");
  }
  if (!Number.isFinite(period) || period <= 0) {
    throw new Error("period must be a finite number greater than zero.");
  }
  if (!Number.isFinite(initialAngle)) {
    throw new Error("initialAngle must be a finite number.");
  }

  return initialAngle + calculateAngularVelocity(period) * elapsedTime;
}

/**
 * Calculates the position vector in a circular orbit.
 *
 * Position vector r = (r cos θ, r sin θ)
 *
 * Radius is expressed in meters (m) and angle in radians. The returned vector
 * is expressed in meters (m), with counterclockwise positive angular direction.
 */
export function calculatePositionVector(radius: number, angle: number): Vector2 {
  if (!Number.isFinite(radius) || radius <= 0) {
    throw new Error("radius must be a finite number greater than zero.");
  }
  if (!Number.isFinite(angle)) {
    throw new Error("angle must be a finite number.");
  }

  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}

/**
 * Calculates the tangential velocity vector for uniform circular motion.
 *
 * Velocity vector v = v(-sin θ, cos θ), where v = 2πr/T
 *
 * Radius is expressed in meters (m), period in seconds (s), and the returned
 * vector is expressed in meters per second (m/s).
 */
export function calculateVelocityVector(radius: number, period: number, angle: number): Vector2 {
  if (!Number.isFinite(radius) || radius <= 0) {
    throw new Error("radius must be a finite number greater than zero.");
  }
  if (!Number.isFinite(period) || period <= 0) {
    throw new Error("period must be a finite number greater than zero.");
  }
  if (!Number.isFinite(angle)) {
    throw new Error("angle must be a finite number.");
  }

  const speed = calculateOrbitalSpeed(radius, period);
  return {
    x: -speed * Math.sin(angle),
    y: speed * Math.cos(angle),
  };
}

function calculateDynamicVelocityVector(radius: number, centralMass: number, angle: number): Vector2 {
  if (!Number.isFinite(radius) || radius <= 0) {
    throw new Error("radius must be a finite number greater than zero.");
  }
  if (!Number.isFinite(centralMass) || centralMass <= 0) {
    throw new Error("centralMass must be a finite number greater than zero.");
  }
  if (!Number.isFinite(angle)) {
    throw new Error("angle must be a finite number.");
  }

  const speed = calculateCircularOrbitSpeed(centralMass, radius);
  return { x: -speed * Math.sin(angle), y: speed * Math.cos(angle) };
}

/**
 * Calculates the centripetal acceleration vector toward the Earth's center.
 *
 * Acceleration vector a = -ac(cos θ, sin θ), where ac = v²/r
 *
 * Radius is expressed in meters (m), period in seconds (s), and the returned
 * vector is expressed in meters per second squared (m/s²).
 */
export function calculateCentripetalAccelerationVector(
  radius: number,
  period: number,
  angle: number,
): Vector2 {
  if (!Number.isFinite(radius) || radius <= 0) {
    throw new Error("radius must be a finite number greater than zero.");
  }
  if (!Number.isFinite(period) || period <= 0) {
    throw new Error("period must be a finite number greater than zero.");
  }
  if (!Number.isFinite(angle)) {
    throw new Error("angle must be a finite number.");
  }

  const speed = calculateOrbitalSpeed(radius, period);
  const centripetalAcceleration = calculateCentripetalAcceleration(speed, radius);
  return {
    x: -centripetalAcceleration * Math.cos(angle),
    y: -centripetalAcceleration * Math.sin(angle),
  };
}

function calculateDynamicCentripetalAccelerationVector(
  radius: number,
  centralMass: number,
  angle: number,
): Vector2 {
  if (!Number.isFinite(angle)) {
    throw new Error("angle must be a finite number.");
  }
  const speed = calculateCircularOrbitSpeed(centralMass, radius);
  const centripetalAcceleration = calculateCentripetalAcceleration(speed, radius);
  return {
    x: -centripetalAcceleration * Math.cos(angle),
    y: -centripetalAcceleration * Math.sin(angle),
  };
}

/**
 * Builds the complete circular-orbit state for the mean Earth-Moon system.
 *
 * The model uses the Moon's sidereal period and mean Earth-Moon distance. It
 * describes uniform circular motion, not a high-precision lunar ephemeris.
 */
export function calculateLunarOrbitState(angle: number) {
  if (!Number.isFinite(angle)) {
    throw new Error("angle must be a finite number.");
  }

  const radius = EARTH_MOON_DISTANCE;
  const period = LUNAR_SIDEREAL_PERIOD;
  // The observed sidereal period drives angular position; dynamics use v=sqrt(GM/r).
  const speed = calculateCircularOrbitSpeed(M_EARTH, radius);
  const angularVelocity = calculateAngularVelocity(period);
  const centripetalAcceleration = calculateCentripetalAcceleration(speed, radius);

  return {
    angle,
    position: calculatePositionVector(radius, angle),
    velocity: calculateDynamicVelocityVector(radius, M_EARTH, angle),
    acceleration: calculateDynamicCentripetalAccelerationVector(radius, M_EARTH, angle),
    speed,
    centripetalAcceleration,
    angularVelocity,
    radius,
  };
}
