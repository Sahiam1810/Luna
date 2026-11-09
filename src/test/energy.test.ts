import { describe, expect, it } from "vitest";

import {
  EARTH_MOON_DISTANCE,
  LUNAR_SIDEREAL_PERIOD,
  M_EARTH,
  M_MOON,
} from "@/domain/physics/constants";
import {
  calculateGravitationalPotentialEnergy,
  calculateKineticEnergy,
} from "@/domain/physics/energy";
import { calculateOrbitalSpeed } from "@/domain/physics/orbital";

describe("orbital energy", () => {
  const lunarSpeed = calculateOrbitalSpeed(EARTH_MOON_DISTANCE, LUNAR_SIDEREAL_PERIOD);

  it("calculates positive kinetic energy for the Moon", () => {
    const kineticEnergy = calculateKineticEnergy(M_MOON, lunarSpeed);
    const expected = 0.5 * M_MOON * lunarSpeed ** 2;

    expect(kineticEnergy).toBeGreaterThan(0);
    expect(kineticEnergy).toBe(expected);
    expect(kineticEnergy).toBeCloseTo(3.84e28, -26);
  });

  it("calculates negative gravitational potential energy for Earth and Moon", () => {
    const potentialEnergy = calculateGravitationalPotentialEnergy(
      M_EARTH,
      M_MOON,
      EARTH_MOON_DISTANCE,
    );
    const expected = -(6.6743e-11 * M_EARTH * M_MOON) / EARTH_MOON_DISTANCE;

    expect(potentialEnergy).toBeLessThan(0);
    expect(potentialEnergy).toBe(expected);
    expect(potentialEnergy / -7.62e28).toBeCloseTo(1, 2);
  });

  it("allows zero speed but rejects invalid kinetic energy inputs", () => {
    expect(calculateKineticEnergy(M_MOON, 0)).toBe(0);
    expect(() => calculateKineticEnergy(0, lunarSpeed)).toThrow();
    expect(() => calculateKineticEnergy(-1, lunarSpeed)).toThrow();
    expect(() => calculateKineticEnergy(M_MOON, -1)).toThrow();
    expect(() => calculateKineticEnergy(M_MOON, Number.NaN)).toThrow();
    expect(() => calculateKineticEnergy(Number.POSITIVE_INFINITY, lunarSpeed)).toThrow();
  });

  it("rejects invalid gravitational potential energy inputs", () => {
    expect(() => calculateGravitationalPotentialEnergy(0, M_MOON, EARTH_MOON_DISTANCE)).toThrow();
    expect(() => calculateGravitationalPotentialEnergy(M_EARTH, -1, EARTH_MOON_DISTANCE)).toThrow();
    expect(() => calculateGravitationalPotentialEnergy(M_EARTH, M_MOON, 0)).toThrow();
    expect(() => calculateGravitationalPotentialEnergy(Number.NaN, M_MOON, EARTH_MOON_DISTANCE)).toThrow();
    expect(() => calculateGravitationalPotentialEnergy(M_EARTH, M_MOON, Number.POSITIVE_INFINITY)).toThrow();
  });
});
