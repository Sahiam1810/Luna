import {
  EARTH_MOON_DISTANCE,
  EARTH_SIDEREAL_PERIOD,
  EARTH_SUN_DISTANCE,
  LUNAR_SIDEREAL_PERIOD,
} from "./constants";
import { calculateAngularVelocity } from "./orbital";
import { calculatePositionVector, type Vector2 } from "./orbitalModel";

const NEW_MOON_ANGLE = Math.PI;

function validateTime(time: number): void {
  if (!Number.isFinite(time)) {
    throw new Error("time must be a finite number.");
  }
}

function validatePositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a finite number greater than zero.`);
  }
}

function normalizeAngle(angle: number): number {
  return ((angle + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
}

function vectorAngle(vector: Vector2): number {
  return Math.atan2(vector.y, vector.x);
}

/** Derives the synodic period from the lunar and terrestrial sidereal periods. */
export function calculateSynodicPeriod(siderealPeriod: number, planetPeriod: number): number {
  validatePositive(siderealPeriod, "siderealPeriod");
  validatePositive(planetPeriod, "planetPeriod");

  const relativeFrequency = 1 / siderealPeriod - 1 / planetPeriod;
  if (relativeFrequency <= 0) {
    throw new Error("siderealPeriod must be shorter than planetPeriod.");
  }

  // 1 / Psyn = 1 / PL - 1 / PT.
  return 1 / relativeFrequency;
}

/** Earth position relative to the Sun: R_T = R(cos θT, sin θT), in m. */
export function calculateEarthPosition(time: number): Vector2 {
  validateTime(time);
  const earthAngle = calculateAngularVelocity(EARTH_SIDEREAL_PERIOD) * time;
  return calculatePositionVector(EARTH_SUN_DISTANCE, earthAngle);
}

/** Moon position relative to the Sun: R_M = R_T + r, in m. */
export function calculateMoonPositionRelativeToSun(time: number): Vector2 {
  validateTime(time);
  const lunarAngle =
    NEW_MOON_ANGLE + calculateAngularVelocity(LUNAR_SIDEREAL_PERIOD) * time;
  const earthPosition = calculateEarthPosition(time);
  const moonRelativePosition = calculatePositionVector(EARTH_MOON_DISTANCE, lunarAngle);

  return {
    x: earthPosition.x + moonRelativePosition.x,
    y: earthPosition.y + moonRelativePosition.y,
  };
}

/** Relative heliocentric angle ψ = θL - θT, with ψ = π at new moon. */
export function calculateRelativeAngle(time: number): number {
  validateTime(time);
  const lunarAngularVelocity = calculateAngularVelocity(LUNAR_SIDEREAL_PERIOD);
  const earthAngularVelocity = calculateAngularVelocity(EARTH_SIDEREAL_PERIOD);

  return NEW_MOON_ANGLE + (lunarAngularVelocity - earthAngularVelocity) * time;
}

/**
 * Sun-Moon distance from ρ² = R² + r² + 2Rr cos(θL - θT), in m.
 */
export function calculateSunMoonDistance(time: number): number {
  validateTime(time);
  const relativeAngle = calculateRelativeAngle(time);
  const squaredDistance =
    EARTH_SUN_DISTANCE ** 2 +
    EARTH_MOON_DISTANCE ** 2 +
    2 * EARTH_SUN_DISTANCE * EARTH_MOON_DISTANCE * Math.cos(relativeAngle);

  return Math.sqrt(squaredDistance);
}

/**
 * Exact geometric illuminated fraction k = (1 + cos i) / 2, where i is the
 * angle at the Moon between the Moon-to-Sun and Moon-to-Earth vectors.
 */
export function calculateIlluminatedFractionFromGeometry(time: number): number {
  validateTime(time);
  const earthPosition = calculateEarthPosition(time);
  const moonPosition = calculateMoonPositionRelativeToSun(time);
  const moonToSun = { x: -moonPosition.x, y: -moonPosition.y };
  const moonToEarth = {
    x: earthPosition.x - moonPosition.x,
    y: earthPosition.y - moonPosition.y,
  };
  const dot = moonToSun.x * moonToEarth.x + moonToSun.y * moonToEarth.y;
  const denominator = Math.hypot(moonToSun.x, moonToSun.y) * Math.hypot(moonToEarth.x, moonToEarth.y);
  const cosine = Math.max(-1, Math.min(1, dot / denominator));

  return (1 + cosine) / 2;
}

/**
 * Lunar rotation angle φ = π + ωL t. The initial π makes the rotation marker
 * point from Earth toward the Moon; the near-side axis is its opposite, so it
 * points from the Moon toward Earth at t = 0. This models synchronous rotation.
 */
export function calculateMoonRotationAngle(time: number): number {
  validateTime(time);
  return NEW_MOON_ANGLE + calculateAngularVelocity(LUNAR_SIDEREAL_PERIOD) * time;
}

/**
 * Difference between the near-side axis and the Moon-to-Earth direction.
 * The near-side axis is φ + π, and remains aligned with Moon-to-Earth.
 */
export function calculateNearSideOffsetToEarth(time: number): number {
  validateTime(time);
  const earthPosition = calculateEarthPosition(time);
  const moonPosition = calculateMoonPositionRelativeToSun(time);
  const moonToEarth = {
    x: earthPosition.x - moonPosition.x,
    y: earthPosition.y - moonPosition.y,
  };
  const nearSideAxisAngle = calculateMoonRotationAngle(time) + Math.PI;

  return normalizeAngle(nearSideAxisAngle - vectorAngle(moonToEarth));
}
