/**
 * Reference constants for the Earth-Moon system.
 *
 * All quantities in this module use SI units so they can be used directly by
 * the future mechanics calculations. Values are rounded reference values from
 * NIST CODATA and NASA planetary/lunar fact sheets:
 * - https://physics.nist.gov/cuu/Constants/index.html
 * - https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
 */

/** Universal gravitational constant, in N·m²/kg². */
export const G = 6.6743e-11;

/** Mean mass of the Earth, in kg. */
export const M_EARTH = 5.9722e24;

/** Mean mass of the Moon, in kg. */
export const M_MOON = 7.342e22;

/** Mean distance between the centers of the Earth and the Moon, in m. */
export const EARTH_MOON_DISTANCE = 3.844e8;

/** Sidereal orbital period of the Moon, in s. */
export const LUNAR_SIDEREAL_PERIOD = 2_360_591.5104;
