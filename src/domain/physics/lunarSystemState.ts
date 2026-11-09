import { LUNAR_SYNODIC_PERIOD } from "./constants";
import { calculateLunarOrbitState } from "./orbitalModel";
import { SYNODIC_DAYS } from "@/lib/moon";

/**
 * Shared mathematical state for the lunar phase and circular orbit model.
 *
 * The origin is at Earth, +x points in the direction of the parallel sunlight,
 * and the Sun is therefore at -x. Angles are measured counterclockwise from
 * +x as viewed from the celestial north pole. The orbital model uses this
 * mathematical y-axis; screen coordinates are converted only by the UI.
 *
 * The phase angle advances with the synodic period while the orbit magnitude
 * comes from the sidereal period. This is an educational simplification: the
 * Sun-fixed frame rotates with Earth, while the Moon's orbital speed uses the
 * sidereal period from the circular model.
 */
export function calculateLunarSystemState(ageDays: number) {
  if (!Number.isFinite(ageDays)) {
    throw new Error("ageDays must be a finite number.");
  }

  const normalizedAgeDays = ((ageDays % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS;
  const ageSeconds = (normalizedAgeDays / SYNODIC_DAYS) * LUNAR_SYNODIC_PERIOD;
  const angle = Math.PI + (2 * Math.PI * ageSeconds) / LUNAR_SYNODIC_PERIOD;
  const illuminatedFraction = (1 + Math.cos(angle)) / 2;

  return {
    ageDays: normalizedAgeDays,
    angle,
    illuminatedFraction,
    orbit: calculateLunarOrbitState(angle),
  };
}
