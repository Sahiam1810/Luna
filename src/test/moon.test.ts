import { describe, expect, it } from "vitest";
import { moonAgeDays, phaseIndex, illumination, angleFromAge, SYNODIC_DAYS } from "@/lib/moon";

describe("moon model", () => {
  it("reference date is a new moon", () => {
    expect(phaseIndex(moonAgeDays(new Date(Date.UTC(2000, 0, 6, 18, 14))))).toBe(0);
  });
  it("half a synodic month later is full moon", () => {
    expect(phaseIndex(SYNODIC_DAYS / 2)).toBe(4);
    expect(illumination(angleFromAge(SYNODIC_DAYS / 2))).toBeCloseTo(1);
  });
  it("known full moon 2024-04-23 is detected", () => {
    expect(phaseIndex(moonAgeDays(new Date(Date.UTC(2024, 3, 23, 23, 49))))).toBe(4);
  });
});
