import { describe, expect, it } from "vitest";

import {
  EARTH_MOON_DISTANCE,
  LUNAR_SIDEREAL_PERIOD,
  M_EARTH,
  M_MOON,
} from "@/domain/physics/constants";
import { calculateGravitationalForce } from "@/domain/physics/gravity";
import { calculateOrbitalSpeed } from "@/domain/physics/orbital";
import {
  calculateAngularVelocity,
  calculateCentripetalAcceleration,
} from "@/domain/physics/orbital";
import {
  calculateCentripetalAccelerationVector,
  calculateLunarOrbitState,
  calculateOrbitalAngle,
  calculatePositionVector,
  calculateVelocityVector,
} from "@/domain/physics/orbitalModel";

const EPSILON = 1e-10;

function magnitude(vector: { x: number; y: number }): number {
  return Math.hypot(vector.x, vector.y);
}

function dotProduct(first: { x: number; y: number }, second: { x: number; y: number }): number {
  return first.x * second.x + first.y * second.y;
}

describe("simplified circular orbital model", () => {
  const radius = EARTH_MOON_DISTANCE;
  const period = LUNAR_SIDEREAL_PERIOD;
  const speed = calculateOrbitalSpeed(radius, period);
  const centripetalAcceleration = calculateCentripetalAcceleration(speed, radius);

  it("calculates the expected vectors at angle zero", () => {
    const position = calculatePositionVector(radius, 0);
    const velocity = calculateVelocityVector(radius, period, 0);
    const acceleration = calculateCentripetalAccelerationVector(radius, period, 0);

    expect(position.x).toBeCloseTo(radius);
    expect(position.y).toBeCloseTo(0);
    expect(velocity.x).toBeCloseTo(0);
    expect(velocity.y).toBeCloseTo(speed);
    expect(acceleration.x).toBeCloseTo(-centripetalAcceleration);
    expect(acceleration.y).toBeCloseTo(0);
  });

  it("calculates the expected vectors at a quarter turn", () => {
    const position = calculatePositionVector(radius, Math.PI / 2);
    const velocity = calculateVelocityVector(radius, period, Math.PI / 2);
    const acceleration = calculateCentripetalAccelerationVector(radius, period, Math.PI / 2);

    expect(position.x).toBeCloseTo(0);
    expect(position.y).toBeCloseTo(radius);
    expect(velocity.x).toBeCloseTo(-speed);
    expect(velocity.y).toBeCloseTo(0);
    expect(acceleration.x).toBeCloseTo(0);
    expect(acceleration.y).toBeCloseTo(-centripetalAcceleration);
  });

  it("calculates the expected vectors at π and 3π/2", () => {
    const atPi = calculateLunarOrbitState(Math.PI);
    const atThreeHalfPi = calculateLunarOrbitState((3 * Math.PI) / 2);

    expect(atPi.position.x).toBeCloseTo(-radius);
    expect(atPi.position.y).toBeCloseTo(0);
    expect(atPi.velocity.x).toBeCloseTo(0);
    expect(atPi.velocity.y).toBeCloseTo(-speed);
    expect(atPi.acceleration.x).toBeCloseTo(centripetalAcceleration);
    expect(atPi.acceleration.y).toBeCloseTo(0);

    expect(atThreeHalfPi.position.x).toBeCloseTo(0);
    expect(atThreeHalfPi.position.y).toBeCloseTo(-radius);
    expect(atThreeHalfPi.velocity.x).toBeCloseTo(speed);
    expect(atThreeHalfPi.velocity.y).toBeCloseTo(0);
    expect(atThreeHalfPi.acceleration.x).toBeCloseTo(0);
    expect(atThreeHalfPi.acceleration.y).toBeCloseTo(centripetalAcceleration);
  });

  it("keeps position and velocity perpendicular for multiple angles", () => {
    for (const angle of [0, Math.PI / 4, Math.PI / 2, Math.PI, 2.3]) {
      const position = calculatePositionVector(radius, angle);
      const velocity = calculateVelocityVector(radius, period, angle);

      expect(dotProduct(position, velocity)).toBeCloseTo(0, 2);
    }
  });

  it("preserves the expected vector magnitudes", () => {
    for (const angle of [0, Math.PI / 4, Math.PI / 2, Math.PI, 2.3]) {
      const state = calculateLunarOrbitState(angle);

      expect(magnitude(state.position)).toBeCloseTo(radius, 5);
      expect(magnitude(state.velocity)).toBeCloseTo(speed, 5);
      expect(magnitude(state.acceleration)).toBeCloseTo(centripetalAcceleration, 8);
    }
  });

  it("makes acceleration antiparallel to position", () => {
    for (const angle of [0.2, Math.PI / 3, Math.PI, 5]) {
      const state = calculateLunarOrbitState(angle);

      expect(state.acceleration.x).toBeCloseTo(
        -(centripetalAcceleration / radius) * state.position.x,
        8,
      );
      expect(state.acceleration.y).toBeCloseTo(
        -(centripetalAcceleration / radius) * state.position.y,
        8,
      );
    }
  });

  it("satisfies ac = ω²r = v²/r", () => {
    const angularVelocity = calculateAngularVelocity(period);
    const accelerationFromAngularVelocity = angularVelocity ** 2 * radius;
    const accelerationFromSpeed = speed ** 2 / radius;

    expect(accelerationFromAngularVelocity / centripetalAcceleration).toBeCloseTo(1, 10);
    expect(accelerationFromSpeed / centripetalAcceleration).toBeCloseTo(1, 10);
  });

  it("advances one full period and half period without normalizing the angle", () => {
    expect(calculateOrbitalAngle(period, period)).toBeCloseTo(2 * Math.PI, 12);
    expect(calculateOrbitalAngle(period / 2, period)).toBeCloseTo(Math.PI, 12);

    const initialPosition = calculatePositionVector(radius, 0);
    const fullPeriodPosition = calculatePositionVector(
      radius,
      calculateOrbitalAngle(period, period),
    );
    expect(fullPeriodPosition.x).toBeCloseTo(initialPosition.x, 5);
    expect(fullPeriodPosition.y).toBeCloseTo(initialPosition.y, 5);
  });

  it("supports a non-zero initial angle and negative elapsed time", () => {
    const initialAngle = Math.PI / 3;
    const angle = calculateOrbitalAngle(-period / 2, period, initialAngle);

    expect(angle).toBeCloseTo(initialAngle - Math.PI, 12);
  });

  it("agrees with gravitational acceleration within the simplified model", () => {
    const force = calculateGravitationalForce(M_EARTH, M_MOON, radius);
    const gravitationalAcceleration = force / M_MOON;
    const relativeDifference = Math.abs(
      (centripetalAcceleration - gravitationalAcceleration) / gravitationalAcceleration,
    );

    // They are not identical because this model uses mean radius and sidereal
    // period, treats the Moon as orbiting a fixed Earth, and ignores the real
    // elliptical orbit and the Earth-Moon barycenter.
    expect(relativeDifference).toBeLessThan(0.02);
  });

  it("returns a coherent mean Earth-Moon orbit state", () => {
    const state = calculateLunarOrbitState(0);

    expect(state.angle).toBe(0);
    expect(state.radius).toBe(radius);
    expect(state.speed).toBeCloseTo(1023, 0);
    expect(state.angularVelocity).toBeCloseTo(2.66e-6, 8);
    expect(state.centripetalAcceleration).toBeCloseTo(0.00272, 5);
  });

  it("rejects invalid orbital model inputs", () => {
    expect(() => calculateOrbitalAngle(0, 0)).toThrow();
    expect(() => calculateOrbitalAngle(Number.NaN, period)).toThrow();
    expect(() => calculateOrbitalAngle(0, period, Number.POSITIVE_INFINITY)).toThrow();
    expect(() => calculatePositionVector(0, 0)).toThrow();
    expect(() => calculatePositionVector(radius, Number.NaN)).toThrow();
    expect(() => calculateVelocityVector(-1, period, 0)).toThrow();
    expect(() => calculateVelocityVector(radius, Number.POSITIVE_INFINITY, 0)).toThrow();
    expect(() => calculateVelocityVector(radius, period, Number.NaN)).toThrow();
    expect(() => calculateCentripetalAccelerationVector(0, period, 0)).toThrow();
    expect(() => calculateCentripetalAccelerationVector(radius, 0, 0)).toThrow();
    expect(() => calculateCentripetalAccelerationVector(radius, period, Number.NaN)).toThrow();
    expect(() => calculateLunarOrbitState(Number.POSITIVE_INFINITY)).toThrow();
  });

  it("keeps numerical components finite for valid angles", () => {
    const state = calculateLunarOrbitState(Math.PI + EPSILON);

    expect(Number.isFinite(state.position.x)).toBe(true);
    expect(Number.isFinite(state.velocity.y)).toBe(true);
    expect(Number.isFinite(state.acceleration.x)).toBe(true);
  });
});
