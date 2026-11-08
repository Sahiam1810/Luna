import { describe, expect, it } from "vitest";
import {
  angleFromAge,
  illumination,
  moonAgeDays,
  phaseAt,
  phaseIndex,
  PHASES,
  SYNODIC_DAYS,
} from "@/lib/moon";

const REFERENCE_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14));
const MS_PER_DAY = 86400000;

describe("moon model", () => {
  it("reference date is a new moon", () => {
    const age = moonAgeDays(REFERENCE_NEW_MOON);

    expect(age).toBeCloseTo(0);
    expect(phaseIndex(age)).toBe(0);
    expect(phaseAt(age)).toBe(PHASES[0]);
  });

  it("keeps dates before the reference inside one synodic cycle", () => {
    const oneDayBefore = moonAgeDays(new Date(REFERENCE_NEW_MOON.getTime() - MS_PER_DAY));
    const oneCycleBefore = moonAgeDays(
      new Date(REFERENCE_NEW_MOON.getTime() - SYNODIC_DAYS * MS_PER_DAY),
    );

    expect(oneDayBefore).toBeCloseTo(SYNODIC_DAYS - 1);
    // Date has millisecond precision, so a cycle boundary can land just
    // before 0 and be represented as SYNODIC_DAYS - epsilon.
    expect(Math.min(oneCycleBefore, SYNODIC_DAYS - oneCycleBefore)).toBeCloseTo(0, 6);
    expect(oneDayBefore).toBeGreaterThanOrEqual(0);
    expect(oneDayBefore).toBeLessThan(SYNODIC_DAYS);
    expect(oneCycleBefore).toBeGreaterThanOrEqual(0);
    expect(oneCycleBefore).toBeLessThan(SYNODIC_DAYS);
  });

  it("repeats the same age after complete synodic cycles", () => {
    const age = moonAgeDays(new Date(REFERENCE_NEW_MOON.getTime() + 7 * MS_PER_DAY));
    const ageAfterOneCycle = moonAgeDays(
      new Date(REFERENCE_NEW_MOON.getTime() + (7 + SYNODIC_DAYS) * MS_PER_DAY),
    );

    expect(ageAfterOneCycle).toBeCloseTo(age);
  });

  it("maps the important angular limits to the expected illumination", () => {
    expect(angleFromAge(0)).toBe(0);
    expect(angleFromAge(SYNODIC_DAYS / 2)).toBeCloseTo(Math.PI);
    expect(angleFromAge(SYNODIC_DAYS)).toBeCloseTo(2 * Math.PI);

    expect(illumination(0)).toBeCloseTo(0);
    expect(illumination(Math.PI / 2)).toBeCloseTo(0.5);
    expect(illumination(Math.PI)).toBeCloseTo(1);
    expect(illumination(3 * Math.PI / 2)).toBeCloseTo(0.5);
    expect(illumination(2 * Math.PI)).toBeCloseTo(0);
  });
  it("half a synodic month later is full moon", () => {
    expect(phaseIndex(SYNODIC_DAYS / 2)).toBe(4);
    expect(illumination(angleFromAge(SYNODIC_DAYS / 2))).toBeCloseTo(1);
  });
  it("known full moon 2024-04-23 is detected", () => {
    expect(phaseIndex(moonAgeDays(new Date(Date.UTC(2024, 3, 23, 23, 49))))).toBe(4);
  });

  it("classifies each phase at the center of its sector", () => {
    for (let index = 0; index < PHASES.length; index += 1) {
      const age = (index * SYNODIC_DAYS) / PHASES.length;

      expect(phaseIndex(age)).toBe(index);
      expect(phaseAt(age)).toBe(PHASES[index]);
    }
  });

  it("advances to the next phase at each sector boundary", () => {
    for (let index = 0; index < PHASES.length; index += 1) {
      const boundary = ((index + 0.5) * SYNODIC_DAYS) / PHASES.length;
      const expectedIndex = (index + 1) % PHASES.length;

      expect(phaseIndex(boundary)).toBe(expectedIndex);
    }
  });
});
