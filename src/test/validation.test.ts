import { describe, expect, it } from "vitest";

import { calculateLunarSystemState } from "@/domain/physics/lunarSystemState";
import {
  calculatePercentError,
  calculatePhaseEventValidation,
  calculateValidationComparison,
} from "@/domain/physics/validation";
import { SYNODIC_DAYS } from "@/lib/moon";
import { calculatePhysicsReadout } from "@/domain/physics/physicsReadout";

describe("validation helpers", () => {
  it("calculates percentage error", () => {
    expect(calculatePercentError(10, 8)).toBe(25);
    expect(calculatePercentError(8, 8)).toBe(0);
  });

  it("rejects invalid percentage error inputs", () => {
    expect(() => calculatePercentError(10, 0)).toThrow();
    expect(() => calculatePercentError(Number.NaN, 8)).toThrow();
    expect(() => calculatePercentError(10, Number.POSITIVE_INFINITY)).toThrow();
    expect(() => calculatePercentError(Number.NEGATIVE_INFINITY, 8)).toThrow();
  });

  it("compares independent references and internal consistency values", () => {
    const comparison = calculateValidationComparison(calculatePhysicsReadout(calculateLunarSystemState(0)));

    expect(comparison).toHaveLength(10);
    expect(comparison.every((item) => Number.isFinite(item.errorPorcentual))).toBe(true);
    expect(comparison.every((item) => item.fuente.length > 0)).toBe(true);
    expect(comparison.find((item) => item.magnitud === "Velocidad orbital")?.errorPorcentual).toBeLessThan(1);
    expect(comparison.find((item) => item.magnitud === "Velocidad orbital cinemática")?.errorPorcentual).toBeLessThan(1);
    expect(comparison.find((item) => item.magnitud.includes("Periodo de Kepler"))?.errorPorcentual).toBeCloseTo(0.4763991533, 8);
    expect(comparison.find((item) => item.magnitud === "Periodo sinódico")?.valorReferencia).toBe(29.53);
    expect(comparison.find((item) => item.magnitud.includes("USNO"))?.errorPorcentual).toBeLessThan(0.001);
    expect(comparison.find((item) => item.magnitud.includes("luna nueva"))?.errorPorcentual).toBeCloseTo(0, 10);
    expect(comparison.find((item) => item.magnitud.includes("luna llena"))?.errorPorcentual).toBeCloseTo(0, 10);
    expect(comparison.find((item) => item.magnitud.includes("iluminación"))?.valorModelo).toBeGreaterThan(0);
  });

  it("validates vector illumination differences at representative ages", () => {
    const comparison = calculateValidationComparison(calculatePhysicsReadout(calculateLunarSystemState(0)));
    const illumination = comparison.find((item) => item.magnitud.includes("iluminación"));

    expect(illumination?.valorModelo).toBeLessThan(0.2);
    expect(illumination?.valorReferencia).toBeGreaterThan(0);
  });

  it("validates the selected astronomical phase events within one day", () => {
    const events = calculatePhaseEventValidation();

    expect(events).toHaveLength(3);
    expect(events[0]?.faseModelo).toBe("Luna nueva");
    expect(events[1]?.faseModelo).toBe("Luna llena");
    expect(events[2]?.faseModelo).toBe("Luna nueva");
    expect(events.every((event) => event.diferenciaDias <= 1)).toBe(true);
    expect(events.every((event) => Number.isFinite(event.fraccionIluminadaGeometrica))).toBe(true);
    expect(events[0]?.edadLunar).toBeCloseTo(0);
    expect(events[1]?.diferenciaDias).toBeLessThan(1);
    expect(events[2]?.diferenciaDias).toBeLessThan(1);
  });

  it("keeps event calculations based on the existing synodic model", () => {
    const events = calculatePhaseEventValidation();

    expect(events.every((event) => event.edadLunar >= 0 && event.edadLunar < SYNODIC_DAYS)).toBe(true);
  });
});
