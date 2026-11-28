import { describe, expect, it } from "vitest";

import {
  EARTH_MOON_DISTANCE,
  LUNAR_SIDEREAL_PERIOD,
  M_EARTH,
} from "@/domain/physics/constants";
import {
  calculateAngularVelocity,
  calculateCentripetalAcceleration,
  calculateCircularOrbitSpeed,
  calculateOrbitalSpeed,
} from "@/domain/physics/orbital";

describe("orbital mechanics", () => {
  const speed = calculateOrbitalSpeed(EARTH_MOON_DISTANCE, LUNAR_SIDEREAL_PERIOD);

  it("calculates the approximate Earth-Moon orbital speed", () => {
    expect(speed).toBeCloseTo(1023, 0);
    expect(speed / 1000).toBeCloseTo(1.02, 2);
  });

  it("calculates the dynamic circular-orbit speed from gravity", () => {
    const dynamicSpeed = calculateCircularOrbitSpeed(M_EARTH, EARTH_MOON_DISTANCE);

    expect(dynamicSpeed).toBeCloseTo(1018.3060966387332, 10);
    expect(dynamicSpeed).toBeCloseTo(Math.sqrt((6.6743e-11 * M_EARTH) / EARTH_MOON_DISTANCE), 10);
  });

  it("calculates positive angular velocity", () => {
    const angularVelocity = calculateAngularVelocity(LUNAR_SIDEREAL_PERIOD);
    const expected = (2 * Math.PI) / LUNAR_SIDEREAL_PERIOD;

    expect(angularVelocity).toBeGreaterThan(0);
    expect(angularVelocity).toBe(expected);
    expect(angularVelocity).toBeCloseTo(2.662e-6, 9);
  });

  it("calculates positive centripetal acceleration", () => {
    const acceleration = calculateCentripetalAcceleration(speed, EARTH_MOON_DISTANCE);
    const expected = speed ** 2 / EARTH_MOON_DISTANCE;

    expect(acceleration).toBeGreaterThan(0);
    expect(acceleration).toBe(expected);
    expect(acceleration).toBeCloseTo(0.00272, 5);
  });

  it("rejects invalid orbital speed inputs", () => {
    expect(() => calculateOrbitalSpeed(0, LUNAR_SIDEREAL_PERIOD)).toThrow();
    expect(() => calculateOrbitalSpeed(-1, LUNAR_SIDEREAL_PERIOD)).toThrow();
    expect(() => calculateOrbitalSpeed(EARTH_MOON_DISTANCE, 0)).toThrow();
    expect(() => calculateOrbitalSpeed(EARTH_MOON_DISTANCE, -1)).toThrow();
    expect(() => calculateOrbitalSpeed(Number.NaN, LUNAR_SIDEREAL_PERIOD)).toThrow();
    expect(() => calculateOrbitalSpeed(EARTH_MOON_DISTANCE, Number.POSITIVE_INFINITY)).toThrow();
  });

  it("rejects invalid dynamic orbital speed inputs", () => {
    expect(() => calculateCircularOrbitSpeed(0, EARTH_MOON_DISTANCE)).toThrow();
    expect(() => calculateCircularOrbitSpeed(-1, EARTH_MOON_DISTANCE)).toThrow();
    expect(() => calculateCircularOrbitSpeed(Number.NaN, EARTH_MOON_DISTANCE)).toThrow();
    expect(() => calculateCircularOrbitSpeed(M_EARTH, 0)).toThrow();
    expect(() => calculateCircularOrbitSpeed(M_EARTH, Number.POSITIVE_INFINITY)).toThrow();
  });

  it("rejects invalid angular velocity periods", () => {
    expect(() => calculateAngularVelocity(0)).toThrow();
    expect(() => calculateAngularVelocity(-1)).toThrow();
    expect(() => calculateAngularVelocity(Number.NaN)).toThrow();
    expect(() => calculateAngularVelocity(Number.POSITIVE_INFINITY)).toThrow();
  });

  it("allows zero speed but rejects invalid centripetal acceleration inputs", () => {
    expect(calculateCentripetalAcceleration(0, EARTH_MOON_DISTANCE)).toBe(0);
    expect(() => calculateCentripetalAcceleration(-1, EARTH_MOON_DISTANCE)).toThrow();
    expect(() => calculateCentripetalAcceleration(Number.NaN, EARTH_MOON_DISTANCE)).toThrow();
    expect(() => calculateCentripetalAcceleration(speed, 0)).toThrow();
    expect(() => calculateCentripetalAcceleration(speed, -1)).toThrow();
    expect(() => calculateCentripetalAcceleration(speed, Number.POSITIVE_INFINITY)).toThrow();
  });
});
