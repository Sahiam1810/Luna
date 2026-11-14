import { describe, expect, it } from "vitest";

import {
  EARTH_MOON_DISTANCE,
  EARTH_SIDEREAL_PERIOD,
  EARTH_SUN_DISTANCE,
  LUNAR_SIDEREAL_PERIOD,
} from "@/domain/physics/constants";
import {
  calculateEarthPosition,
  calculateIlluminatedFractionFromGeometry,
  calculateMoonPositionRelativeToSun,
  calculateMoonRotationAngle,
  calculateNearSideOffsetToEarth,
  calculateRelativeAngle,
  calculateSunMoonDistance,
  calculateSynodicPeriod,
} from "@/domain/physics/lunarPosition";
import { calculateLunarSystemState } from "@/domain/physics/lunarSystemState";
import { SYNODIC_DAYS } from "@/lib/moon";

const DAY = 86400;
const SYNODIC_PERIOD = calculateSynodicPeriod(LUNAR_SIDEREAL_PERIOD, EARTH_SIDEREAL_PERIOD);

function magnitude(vector: { x: number; y: number }): number {
  return Math.hypot(vector.x, vector.y);
}

function angleBetween(first: { x: number; y: number }, second: { x: number; y: number }): number {
  const dot = first.x * second.x + first.y * second.y;
  return Math.acos(Math.max(-1, Math.min(1, dot / (magnitude(first) * magnitude(second)))));
}

describe("heliocentric lunar position model", () => {
  it("derives the expected synodic period", () => {
    const derivedDays = SYNODIC_PERIOD / DAY;
    const differencePercent = Math.abs((derivedDays - SYNODIC_DAYS) / SYNODIC_DAYS) * 100;

    expect(derivedDays).toBeCloseTo(29.5306, 3);
    expect(differencePercent).toBeLessThan(0.01);
  });

  it("places Earth and Moon at the new moon reference", () => {
    const earth = calculateEarthPosition(0);
    const moon = calculateMoonPositionRelativeToSun(0);

    expect(earth.x).toBeCloseTo(EARTH_SUN_DISTANCE, 3);
    expect(earth.y).toBeCloseTo(0, 3);
    expect(moon.x).toBeCloseTo(EARTH_SUN_DISTANCE - EARTH_MOON_DISTANCE, 3);
    expect(moon.y).toBeCloseTo(0, 3);
    expect(calculateSunMoonDistance(0)).toBeCloseTo(EARTH_SUN_DISTANCE - EARTH_MOON_DISTANCE, 3);
    expect(calculateIlluminatedFractionFromGeometry(0)).toBeCloseTo(0, 12);
  });

  it("matches the expected geometry at quarter, full, and three-quarter phases", () => {
    const cases = [
      { time: SYNODIC_PERIOD / 4, distance: Math.hypot(EARTH_SUN_DISTANCE, EARTH_MOON_DISTANCE), fraction: 0.5 },
      { time: SYNODIC_PERIOD / 2, distance: EARTH_SUN_DISTANCE + EARTH_MOON_DISTANCE, fraction: 1 },
      { time: (3 * SYNODIC_PERIOD) / 4, distance: Math.hypot(EARTH_SUN_DISTANCE, EARTH_MOON_DISTANCE), fraction: 0.5 },
    ];

    for (const testCase of cases) {
      expect(calculateSunMoonDistance(testCase.time)).toBeCloseTo(testCase.distance, -3);
      expect(calculateIlluminatedFractionFromGeometry(testCase.time)).toBeCloseTo(testCase.fraction, 2);
    }
  });

  it("keeps the vector magnitude equal to the Sun-Moon distance", () => {
    for (const time of [0, SYNODIC_PERIOD / 7, SYNODIC_PERIOD / 3, SYNODIC_PERIOD]) {
      expect(magnitude(calculateMoonPositionRelativeToSun(time))).toBeCloseTo(
        calculateSunMoonDistance(time),
        -2,
      );
    }
  });

  it("agrees with the far-Sun approximation within the expected small error", () => {
    let maximumDifference = 0;
    for (let index = 0; index <= 12; index += 1) {
      const time = (SYNODIC_PERIOD * index) / 12;
      const approximation = (1 + Math.cos(calculateRelativeAngle(time))) / 2;
      maximumDifference = Math.max(
        maximumDifference,
        Math.abs(calculateIlluminatedFractionFromGeometry(time) - approximation),
      );
    }

    expect(maximumDifference).toBeLessThan(0.002);
  });

  it("matches lunarSystemState across representative lunar ages", () => {
    let maximumDifference = 0;
    for (const ageDays of [0, 3.7, 7.4, 14.8, 22]) {
      const time = ageDays * DAY;
      const geometric = calculateIlluminatedFractionFromGeometry(time);
      const state = calculateLunarSystemState(ageDays);

      maximumDifference = Math.max(
        maximumDifference,
        Math.abs(geometric - state.illuminatedFraction),
      );
    }

    expect(maximumDifference).toBeLessThan(0.0015);
  });

  it("keeps the near side facing Earth while its angle to the Sun changes", () => {
    const firstTime = 0;
    const secondTime = SYNODIC_PERIOD / 4;
    expect(calculateNearSideOffsetToEarth(firstTime)).toBeCloseTo(0, 12);
    expect(calculateNearSideOffsetToEarth(secondTime)).toBeCloseTo(0, 12);

    const firstEarth = calculateEarthPosition(firstTime);
    const firstMoon = calculateMoonPositionRelativeToSun(firstTime);
    const secondEarth = calculateEarthPosition(secondTime);
    const secondMoon = calculateMoonPositionRelativeToSun(secondTime);
    const firstSunVector = { x: -firstMoon.x, y: -firstMoon.y };
    const secondSunVector = { x: -secondMoon.x, y: -secondMoon.y };
    const firstNearSideAxis = {
      x: Math.cos(calculateMoonRotationAngle(firstTime) + Math.PI),
      y: Math.sin(calculateMoonRotationAngle(firstTime) + Math.PI),
    };
    const secondNearSideAxis = {
      x: Math.cos(calculateMoonRotationAngle(secondTime) + Math.PI),
      y: Math.sin(calculateMoonRotationAngle(secondTime) + Math.PI),
    };
    const firstMoonToEarth = { x: firstEarth.x - firstMoon.x, y: firstEarth.y - firstMoon.y };
    const secondMoonToEarth = { x: secondEarth.x - secondMoon.x, y: secondEarth.y - secondMoon.y };

    expect(angleBetween(firstNearSideAxis, firstMoonToEarth)).toBeCloseTo(0, 12);
    expect(angleBetween(secondNearSideAxis, secondMoonToEarth)).toBeCloseTo(0, 12);
    expect(angleBetween(firstNearSideAxis, firstSunVector)).not.toBeCloseTo(
      angleBetween(secondNearSideAxis, secondSunVector),
      4,
    );
  });

  it("is periodic after one synodic period", () => {
    expect(calculateRelativeAngle(SYNODIC_PERIOD)).toBeCloseTo(
      calculateRelativeAngle(0) + 2 * Math.PI,
      10,
    );
    expect(calculateIlluminatedFractionFromGeometry(SYNODIC_PERIOD)).toBeCloseTo(
      calculateIlluminatedFractionFromGeometry(0),
      10,
    );
  });

  it("rejects invalid times and periods", () => {
    for (const invalidTime of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => calculateEarthPosition(invalidTime)).toThrow();
      expect(() => calculateMoonPositionRelativeToSun(invalidTime)).toThrow();
      expect(() => calculateRelativeAngle(invalidTime)).toThrow();
      expect(() => calculateSunMoonDistance(invalidTime)).toThrow();
      expect(() => calculateIlluminatedFractionFromGeometry(invalidTime)).toThrow();
      expect(() => calculateMoonRotationAngle(invalidTime)).toThrow();
      expect(() => calculateNearSideOffsetToEarth(invalidTime)).toThrow();
    }

    expect(() => calculateSynodicPeriod(0, EARTH_SIDEREAL_PERIOD)).toThrow();
    expect(() => calculateSynodicPeriod(LUNAR_SIDEREAL_PERIOD, 0)).toThrow();
    expect(() => calculateSynodicPeriod(EARTH_SIDEREAL_PERIOD, LUNAR_SIDEREAL_PERIOD)).toThrow();
  });
});
