import { describe, expect, it } from "vitest";

import { calculatePhaseModelReadout } from "@/domain/physics/phaseModelReadout";
import { SYNODIC_DAYS } from "@/lib/moon";

describe("phase model readout", () => {
  it("describes the new moon geometry", () => {
    const readout = calculatePhaseModelReadout(0);

    expect(readout.relativeAngleRadians).toBeCloseTo(Math.PI, 10);
    expect(readout.illuminatedFractionGeometric).toBeCloseTo(0, 10);
    expect(readout.sunMoonDistance).toBeCloseTo(1.492134707e11, -3);
  });

  it("describes the full moon geometry", () => {
    const readout = calculatePhaseModelReadout(SYNODIC_DAYS / 2);

    expect(readout.relativeAngleRadians).toBeCloseTo(2 * Math.PI, 6);
    expect(readout.illuminatedFractionGeometric).toBeCloseTo(1, 10);
    expect(readout.sunMoonDistance).toBeCloseTo(1.499822707e11, -3);
  });

  it("keeps geometric and simulator illumination within the observed model difference", () => {
    for (const ageDays of [3.7, 7.4, 14.8, 22]) {
      const readout = calculatePhaseModelReadout(ageDays);
      expect(readout.illuminatedFractionStateDifference).toBeLessThan(0.002);
    }
  });

  it("reports the derived synodic period and synchronized face", () => {
    const first = calculatePhaseModelReadout(0);
    const second = calculatePhaseModelReadout(SYNODIC_DAYS / 4);

    expect(first.derivedSynodicPeriodDifferencePercent).toBeLessThan(0.001);
    expect(first.nearSideOffsetToEarthDegrees).toBeCloseTo(0, 8);
    expect(second.nearSideOffsetToEarthDegrees).toBeCloseTo(0, 8);
    expect(first.nearSideAngleToSunDegrees).not.toBeCloseTo(second.nearSideAngleToSunDegrees, 3);
  });

  it("rejects non-finite ages", () => {
    expect(() => calculatePhaseModelReadout(Number.NaN)).toThrow();
    expect(() => calculatePhaseModelReadout(Number.POSITIVE_INFINITY)).toThrow();
    expect(() => calculatePhaseModelReadout(Number.NEGATIVE_INFINITY)).toThrow();
  });
});
