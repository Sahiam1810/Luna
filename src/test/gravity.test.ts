import { describe, expect, it } from "vitest";

import {
  EARTH_MOON_DISTANCE,
  G,
  M_EARTH,
  M_MOON,
} from "@/domain/physics/constants";
import { calculateGravitationalForce } from "@/domain/physics/gravity";

describe("calculateGravitationalForce", () => {
  const earthMoonForce = calculateGravitationalForce(
    M_EARTH,
    M_MOON,
    EARTH_MOON_DISTANCE,
  );

  it("calculates the gravitational force between Earth and the Moon", () => {
    const expected = (G * M_EARTH * M_MOON) / EARTH_MOON_DISTANCE ** 2;

    expect(earthMoonForce).toBe(expected);
    expect(earthMoonForce / 1.98e20).toBeCloseTo(1, 2);
  });

  it("decreases to one quarter when the distance is doubled", () => {
    const doubledDistanceForce = calculateGravitationalForce(
      M_EARTH,
      M_MOON,
      EARTH_MOON_DISTANCE * 2,
    );

    expect(doubledDistanceForce / earthMoonForce).toBeCloseTo(0.25, 12);
  });

  it("doubles when one mass is doubled", () => {
    const doubledMassForce = calculateGravitationalForce(
      M_EARTH * 2,
      M_MOON,
      EARTH_MOON_DISTANCE,
    );

    expect(doubledMassForce / earthMoonForce).toBeCloseTo(2, 12);
  });

  it("rejects non-positive masses", () => {
    expect(() => calculateGravitationalForce(0, M_MOON, EARTH_MOON_DISTANCE)).toThrow(
      /mass1 must be a finite number greater than zero/i,
    );
    expect(() => calculateGravitationalForce(-1, M_MOON, EARTH_MOON_DISTANCE)).toThrow(
      /mass1 must be a finite number greater than zero/i,
    );
    expect(() => calculateGravitationalForce(M_EARTH, 0, EARTH_MOON_DISTANCE)).toThrow(
      /mass2 must be a finite number greater than zero/i,
    );
    expect(() => calculateGravitationalForce(M_EARTH, -1, EARTH_MOON_DISTANCE)).toThrow(
      /mass2 must be a finite number greater than zero/i,
    );
  });

  it("rejects non-positive distances", () => {
    expect(() => calculateGravitationalForce(M_EARTH, M_MOON, 0)).toThrow(
      /distance must be a finite number greater than zero/i,
    );
    expect(() => calculateGravitationalForce(M_EARTH, M_MOON, -1)).toThrow(
      /distance must be a finite number greater than zero/i,
    );
  });

  it("rejects NaN and infinite values", () => {
    expect(() => calculateGravitationalForce(Number.NaN, M_MOON, EARTH_MOON_DISTANCE)).toThrow();
    expect(() => calculateGravitationalForce(M_EARTH, Number.POSITIVE_INFINITY, EARTH_MOON_DISTANCE)).toThrow();
    expect(() => calculateGravitationalForce(M_EARTH, M_MOON, Number.NaN)).toThrow();
    expect(() => calculateGravitationalForce(M_EARTH, M_MOON, Number.POSITIVE_INFINITY)).toThrow();
  });
});
