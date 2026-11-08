import { describe, expect, it } from "vitest";

import {
  EARTH_MOON_DISTANCE,
  G,
  LUNAR_SIDEREAL_PERIOD,
  M_EARTH,
  M_MOON,
} from "@/domain/physics/constants";

describe("Earth-Moon physical constants", () => {
  it("exports positive values in SI reference magnitudes", () => {
    expect(G).toBeGreaterThan(0);
    expect(M_EARTH).toBeGreaterThan(0);
    expect(M_MOON).toBeGreaterThan(0);
    expect(EARTH_MOON_DISTANCE).toBeGreaterThan(0);
    expect(LUNAR_SIDEREAL_PERIOD).toBeGreaterThan(0);
  });

  it("uses the selected reference values", () => {
    expect(G).toBe(6.6743e-11);
    expect(M_EARTH).toBe(5.9722e24);
    expect(M_MOON).toBe(7.342e22);
    expect(EARTH_MOON_DISTANCE).toBe(3.844e8);
    expect(LUNAR_SIDEREAL_PERIOD).toBeCloseTo(27.321661 * 86400);
  });
});
