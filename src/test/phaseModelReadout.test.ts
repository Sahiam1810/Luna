import { describe, expect, it } from "vitest";

import { calculatePhaseModelReadout } from "@/domain/physics/phaseModelReadout";
import { SYNODIC_DAYS } from "@/lib/moon";

describe("phase model readout", () => {
  it("preserves position geometry after the dynamic speed change", () => {
    const expected = [
      { age: 0, earthX: 1, earthY: 0, moonX: 149213470700 / 1.495978707e11, moonY: 0, psi: Math.PI, rho: 149213470700 / 1.495978707e11, k: 0 },
      { age: 7.4, earthX: 148387447204.62747 / 1.495978707e11, earthY: 18991799021.362194 / 1.495978707e11, moonX: 148437655082.5652 / 1.495978707e11, moonY: 18610692042.951942 / 1.495978707e11, psi: 4.7160810180039086, rho: 149599783772.331 / 1.495978707e11, k: 0.5031307522242451 },
      { age: 14.8, earthX: 144775764230.43494 / 1.495978707e11, earthY: 37676265864.16751 / 1.495978707e11, moonX: 145147048564.42554 / 1.495978707e11, moonY: 37775821393.06052 / 1.495978707e11, psi: 6.290569382418024, rho: 149982260247.2843 / 1.495978707e11, k: 0.9999864387017567 },
      { age: 22, earthX: 139012252840.15366 / 1.495978707e11, earthY: 55273108093.16865 / 1.495978707e11, moonX: 138881537831.45288 / 1.495978707e11, moonY: 55634600757.68669 / 1.495978707e11, psi: 7.82250400725338, rho: 149610462040.24796 / 1.495978707e11, k: 0.5170195595232416 },
    ];

    for (const baseline of expected) {
      const actual = calculatePhaseModelReadout(baseline.age);
      expect(actual.earthPosition.x / 1.495978707e11).toBeCloseTo(baseline.earthX, 12);
      expect(actual.earthPosition.y / 1.495978707e11).toBeCloseTo(baseline.earthY, 12);
      expect(actual.moonPositionRelativeToSun.x / 1.495978707e11).toBeCloseTo(baseline.moonX, 12);
      expect(actual.moonPositionRelativeToSun.y / 1.495978707e11).toBeCloseTo(baseline.moonY, 12);
      expect(actual.relativeAngleRadians).toBeCloseTo(baseline.psi, 12);
      expect(actual.sunMoonDistance / 1.495978707e11).toBeCloseTo(baseline.rho, 12);
      expect(actual.illuminatedFractionGeometric).toBeCloseTo(baseline.k, 12);
    }
  });

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
