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

  it("compares model values with finite errors", () => {
    const comparison = calculateValidationComparison(calculatePhysicsReadout(calculateLunarSystemState(0)));

    expect(comparison).toHaveLength(4);
    expect(comparison.every((item) => Number.isFinite(item.errorPorcentual))).toBe(true);
    expect(comparison.find((item) => item.magnitud === "Velocidad orbital")?.errorPorcentual).toBeLessThan(1);
    expect(comparison.find((item) => item.magnitud === "Periodo sinódico")?.valorReferencia).toBe(29.53);
  });

  it("validates the selected astronomical phase events within one day", () => {
    const events = calculatePhaseEventValidation();

    expect(events).toHaveLength(3);
    expect(events[0]?.faseModelo).toBe("Luna nueva");
    expect(events[1]?.faseModelo).toBe("Luna llena");
    expect(events[2]?.faseModelo).toBe("Luna nueva");
    expect(events.every((event) => event.diferenciaDias <= 1)).toBe(true);
    expect(events[0]?.edadLunar).toBeCloseTo(0);
    expect(events[1]?.diferenciaDias).toBeLessThan(1);
    expect(events[2]?.diferenciaDias).toBeLessThan(1);
  });

  it("keeps event calculations based on the existing synodic model", () => {
    const events = calculatePhaseEventValidation();

    expect(events.every((event) => event.edadLunar >= 0 && event.edadLunar < SYNODIC_DAYS)).toBe(true);
  });
});
