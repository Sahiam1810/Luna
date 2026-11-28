import { describe, expect, it } from "vitest";

import {
  EARTH_MOON_DISTANCE,
  LUNAR_SYNODIC_PERIOD,
} from "@/domain/physics/constants";
import { calculateLunarSystemState } from "@/domain/physics/lunarSystemState";
import {
  SYNODIC_DAYS,
  angleFromAge,
  illumination,
} from "@/lib/moon";

function magnitude(vector: { x: number; y: number }): number {
  return Math.hypot(vector.x, vector.y);
}

function dotProduct(first: { x: number; y: number }, second: { x: number; y: number }): number {
  return first.x * second.x + first.y * second.y;
}

describe("lunar system state", () => {
  it("represents new moon at the side facing the Sun", () => {
    const state = calculateLunarSystemState(0);

    expect(state.angle).toBeCloseTo(Math.PI);
    expect(state.illuminatedFraction).toBeCloseTo(0);
    expect(state.orbit.position.x).toBeCloseTo(-EARTH_MOON_DISTANCE);
    expect(state.orbit.position.y).toBeCloseTo(0);
  });

  it("represents first quarter at a quarter of the synodic cycle", () => {
    const state = calculateLunarSystemState(SYNODIC_DAYS / 4);

    expect(state.angle).toBeCloseTo((3 * Math.PI) / 2);
    expect(state.illuminatedFraction).toBeCloseTo(0.5);
    expect(state.orbit.position.x).toBeCloseTo(0);
    expect(state.orbit.position.y).toBeCloseTo(-EARTH_MOON_DISTANCE);
  });

  it("represents full moon at half of the synodic cycle", () => {
    const state = calculateLunarSystemState(SYNODIC_DAYS / 2);

    expect(state.angle).toBeCloseTo(2 * Math.PI);
    expect(state.illuminatedFraction).toBeCloseTo(1);
    expect(state.orbit.position.x).toBeCloseTo(EARTH_MOON_DISTANCE);
    expect(state.orbit.position.y).toBeCloseTo(0);
  });

  it("represents last quarter at three quarters of the synodic cycle", () => {
    const state = calculateLunarSystemState((3 * SYNODIC_DAYS) / 4);

    expect(state.illuminatedFraction).toBeCloseTo(0.5);
    expect(state.orbit.position.x).toBeCloseTo(0);
    expect(state.orbit.position.y).toBeCloseTo(EARTH_MOON_DISTANCE);
  });

  it("matches moon.ts illumination under the documented angle offset", () => {
    for (const age of [0, 3.7, 7.4, 14.8, 22, 29]) {
      const state = calculateLunarSystemState(age);
      const phaseAngle = angleFromAge(age);

      expect(state.illuminatedFraction).toBeCloseTo(illumination(phaseAngle), 10);
      expect(state.angle - Math.PI).toBeCloseTo(phaseAngle, 10);
    }
  });

  it("increases illumination toward full moon and decreases afterward", () => {
    const waxing = [0, 3, 6, 9, 12, SYNODIC_DAYS / 2].map(
      (age) => calculateLunarSystemState(age).illuminatedFraction,
    );
    const waning = [SYNODIC_DAYS / 2, 18, 21, 24, 27, SYNODIC_DAYS - 0.01].map(
      (age) => calculateLunarSystemState(age).illuminatedFraction,
    );

    expect(waxing.every((value, index) => index === 0 || value >= waxing[index - 1]!)).toBe(true);
    expect(waning.every((value, index) => index === 0 || value <= waning[index - 1]!)).toBe(true);
  });

  it("is periodic after one synodic cycle", () => {
    const first = calculateLunarSystemState(7.4);
    const repeated = calculateLunarSystemState(7.4 + SYNODIC_DAYS);

    expect(repeated.ageDays).toBeCloseTo(first.ageDays, 10);
    expect(repeated.angle).toBeCloseTo(first.angle, 10);
    expect(repeated.illuminatedFraction).toBeCloseTo(first.illuminatedFraction, 10);
    expect(repeated.orbit.position.x).toBeCloseTo(first.orbit.position.x, 5);
    expect(repeated.orbit.position.y).toBeCloseTo(first.orbit.position.y, 5);
  });

  it("keeps the position magnitude and position-velocity orthogonality", () => {
    const speed = Math.sqrt((6.6743e-11 * 5.9722e24) / EARTH_MOON_DISTANCE);

    for (const age of [0, 3.7, 7.4, 14.8, 22]) {
      const state = calculateLunarSystemState(age);

      expect(magnitude(state.orbit.position)).toBeCloseTo(EARTH_MOON_DISTANCE, 5);
      expect(magnitude(state.orbit.velocity)).toBeCloseTo(speed, 5);
      expect(dotProduct(state.orbit.position, state.orbit.velocity)).toBeCloseTo(0, 2);
    }
  });

  it("normalizes ages outside the synodic interval", () => {
    const negative = calculateLunarSystemState(-1);
    const repeated = calculateLunarSystemState(SYNODIC_DAYS + 1);

    expect(negative.ageDays).toBeGreaterThanOrEqual(0);
    expect(negative.ageDays).toBeLessThan(SYNODIC_DAYS);
    expect(repeated.ageDays).toBeCloseTo(1);
    expect(repeated.illuminatedFraction).toBeCloseTo(
      calculateLunarSystemState(1).illuminatedFraction,
      10,
    );
  });

  it("uses the synodic period in seconds for the phase progression", () => {
    const state = calculateLunarSystemState(SYNODIC_DAYS / 4);

    expect(LUNAR_SYNODIC_PERIOD).toBeCloseTo(SYNODIC_DAYS * 86400);
    expect(state.orbit.radius).toBe(EARTH_MOON_DISTANCE);
  });

  it("rejects non-finite ages", () => {
    expect(() => calculateLunarSystemState(Number.NaN)).toThrow();
    expect(() => calculateLunarSystemState(Number.POSITIVE_INFINITY)).toThrow();
    expect(() => calculateLunarSystemState(Number.NEGATIVE_INFINITY)).toThrow();
  });
});
