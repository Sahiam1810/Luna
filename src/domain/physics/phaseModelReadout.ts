import {
  EARTH_SIDEREAL_PERIOD,
  LUNAR_SIDEREAL_PERIOD,
} from "./constants";
import {
  calculateEarthPosition,
  calculateIlluminatedFractionFromGeometry,
  calculateMoonPositionRelativeToSun,
  calculateMoonRotationAngle,
  calculateNearSideOffsetToEarth,
  calculateRelativeAngle,
  calculateSunMoonDistance,
  calculateSynodicPeriod,
} from "./lunarPosition";
import { calculateLunarSystemState } from "./lunarSystemState";
import { SYNODIC_DAYS } from "@/lib/moon";

const DAY_SECONDS = 86400;

function validateAge(ageDays: number): void {
  if (!Number.isFinite(ageDays)) {
    throw new Error("ageDays must be a finite number.");
  }
}

function degrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function angleBetween(first: { x: number; y: number }, second: { x: number; y: number }): number {
  const dot = first.x * second.x + first.y * second.y;
  const denominator = Math.hypot(first.x, first.y) * Math.hypot(second.x, second.y);
  return Math.acos(Math.max(-1, Math.min(1, dot / denominator)));
}

/**
 * Builds the educational position-and-phase readout for a selected lunar age.
 * All physical values are calculated in SI units; the UI only formats them.
 */
export function calculatePhaseModelReadout(ageDays: number) {
  validateAge(ageDays);

  const state = calculateLunarSystemState(ageDays);
  const timeDays = state.ageDays;
  const time = timeDays * DAY_SECONDS;
  const earthPosition = calculateEarthPosition(time);
  const moonPositionRelativeToSun = calculateMoonPositionRelativeToSun(time);
  const moonToSun = {
    x: -moonPositionRelativeToSun.x,
    y: -moonPositionRelativeToSun.y,
  };
  const moonToEarth = {
    x: earthPosition.x - moonPositionRelativeToSun.x,
    y: earthPosition.y - moonPositionRelativeToSun.y,
  };
  const relativeAngleRadians = calculateRelativeAngle(time);
  const phaseAngleRadians = angleBetween(moonToSun, moonToEarth);
  const illuminatedFractionGeometric = calculateIlluminatedFractionFromGeometry(time);
  const illuminatedFractionApproximate = (1 + Math.cos(relativeAngleRadians)) / 2;
  const derivedSynodicPeriodDays =
    calculateSynodicPeriod(LUNAR_SIDEREAL_PERIOD, EARTH_SIDEREAL_PERIOD) / DAY_SECONDS;
  const nearSideAxisAngle = calculateMoonRotationAngle(time) + Math.PI;
  const nearSideAxis = { x: Math.cos(nearSideAxisAngle), y: Math.sin(nearSideAxisAngle) };
  const nearSideAngleToSunRadians = angleBetween(nearSideAxis, moonToSun);

  return {
    timeDays,
    timeSeconds: time,
    relativeAngleRadians,
    relativeAngleDegrees: degrees(relativeAngleRadians),
    earthPosition,
    moonPositionRelativeToSun,
    sunMoonDistance: calculateSunMoonDistance(time),
    phaseAngleRadians,
    phaseAngleDegrees: degrees(phaseAngleRadians),
    illuminatedFractionGeometric,
    illuminatedFractionApproximate,
    illuminatedFractionApproximationDifference: Math.abs(
      illuminatedFractionGeometric - illuminatedFractionApproximate,
    ),
    illuminatedFractionState: state.illuminatedFraction,
    illuminatedFractionStateDifference: Math.abs(
      illuminatedFractionGeometric - state.illuminatedFraction,
    ),
    derivedSynodicPeriodDays,
    derivedSynodicPeriodDifferencePercent:
      (Math.abs(derivedSynodicPeriodDays - SYNODIC_DAYS) / SYNODIC_DAYS) * 100,
    nearSideOffsetToEarthDegrees: degrees(calculateNearSideOffsetToEarth(time)),
    nearSideAngleToSunDegrees: degrees(nearSideAngleToSunRadians),
  };
}
