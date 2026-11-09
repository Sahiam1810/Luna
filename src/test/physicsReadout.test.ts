import { describe, expect, it } from "vitest";

import { EARTH_MOON_DISTANCE, M_MOON } from "@/domain/physics/constants";
import { calculateLunarSystemState } from "@/domain/physics/lunarSystemState";
import { calculatePhysicsReadout } from "@/domain/physics/physicsReadout";

function magnitude(vector: { x: number; y: number }): number {
  return Math.hypot(vector.x, vector.y);
}

function dotProduct(first: { x: number; y: number }, second: { x: number; y: number }): number {
  return first.x * second.x + first.y * second.y;
}

describe("calculatePhysicsReadout", () => {
  it("calculates the expected Earth-Moon values at age zero", () => {
    const readout = calculatePhysicsReadout(calculateLunarSystemState(0));

    expect(readout.distance).toBeCloseTo(EARTH_MOON_DISTANCE, 5);
    expect(readout.speed).toBeCloseTo(1023, 0);
    expect(readout.gravitationalForce / 1.98e20).toBeCloseTo(1, 2);
    expect(readout.totalEnergy).toBeLessThan(0);
  });

  it("builds a force vector antiparallel to position", () => {
    for (const age of [0, 7.4, 14.8, 22]) {
      const state = calculateLunarSystemState(age);
      const readout = calculatePhysicsReadout(state);

      expect(dotProduct(state.orbit.position, readout.gravitationalForceVector)).toBeLessThan(0);
      expect(magnitude(readout.gravitationalForceVector)).toBeCloseTo(readout.gravitationalForce, 5);
    }
  });

  it("calculates total energy as kinetic plus potential energy", () => {
    const readout = calculatePhysicsReadout(calculateLunarSystemState(0));

    expect(readout.totalEnergy).toBe(readout.kineticEnergy + readout.potentialEnergy);
    expect(readout.kineticEnergy).toBeGreaterThan(0);
    expect(readout.potentialEnergy).toBeLessThan(0);
  });

  it("reports the two physical consistency checks within two percent", () => {
    const readout = calculatePhysicsReadout(calculateLunarSystemState(0));

    expect(readout.gravitationalAccelerationDifferencePercent).toBeLessThan(2);
    expect(readout.kineticPotentialDifferencePercent).toBeLessThan(2);
  });

  it("keeps circular-orbit magnitudes constant as the angle changes", () => {
    const readouts = [0, 3.7, 7.4, 14.8, 22].map((age) =>
      calculatePhysicsReadout(calculateLunarSystemState(age)),
    );
    const first = readouts[0]!;

    for (const readout of readouts.slice(1)) {
      expect(readout.distance).toBeCloseTo(first.distance, 5);
      expect(readout.speed).toBeCloseTo(first.speed, 5);
      expect(readout.gravitationalForce / first.gravitationalForce).toBeCloseTo(1, 12);
      expect(readout.kineticEnergy / first.kineticEnergy).toBeCloseTo(1, 12);
      expect(readout.potentialEnergy / first.potentialEnergy).toBeCloseTo(1, 12);
    }
  });

  it("rejects invalid orbital states", () => {
    const invalidState = calculateLunarSystemState(0) as ReturnType<typeof calculateLunarSystemState>;
    invalidState.orbit.position.x = Number.NaN;
    expect(() => calculatePhysicsReadout(invalidState)).toThrow();
  });
});
