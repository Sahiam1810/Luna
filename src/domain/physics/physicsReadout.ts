import {
  LUNAR_SIDEREAL_PERIOD,
  LUNAR_SYNODIC_PERIOD,
  M_EARTH,
  M_MOON,
} from "./constants";
import { calculateGravitationalForce } from "./gravity";
import {
  calculateGravitationalPotentialEnergy,
  calculateKineticEnergy,
} from "./energy";
import { calculateLunarSystemState } from "./lunarSystemState";

type LunarSystemState = ReturnType<typeof calculateLunarSystemState>;

export type PhysicsReadout = {
  distance: number;
  speed: number;
  angularVelocity: number;
  centripetalAcceleration: number;
  gravitationalForce: number;
  gravitationalForceVector: { x: number; y: number };
  kineticEnergy: number;
  potentialEnergy: number;
  totalEnergy: number;
  orbitalPeriodDays: number;
  synodicPeriodDays: number;
  gravitationalAccelerationDifferencePercent: number;
  kineticPotentialDifferencePercent: number;
};

/**
 * Derives the physical values displayed by the interface from one lunar state.
 * Existing domain functions provide all mechanics formulas; this module only
 * composes them and converts the results into a readout model.
 */
export function calculatePhysicsReadout(state: LunarSystemState): PhysicsReadout {
  if (!state || !state.orbit) {
    throw new Error("state must contain a valid orbital state.");
  }

  const { position, speed, angularVelocity, centripetalAcceleration } = state.orbit;
  const values = [
    position.x,
    position.y,
    speed,
    angularVelocity,
    centripetalAcceleration,
  ];
  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error("state must contain finite orbital values.");
  }

  const distance = Math.hypot(position.x, position.y);
  if (!Number.isFinite(distance) || distance <= 0) {
    throw new Error("state position must have a finite magnitude greater than zero.");
  }

  const gravitationalForce = calculateGravitationalForce(M_EARTH, M_MOON, distance);
  const gravitationalForceVector = {
    x: (-gravitationalForce * position.x) / distance,
    y: (-gravitationalForce * position.y) / distance,
  };
  const kineticEnergy = calculateKineticEnergy(M_MOON, speed);
  const potentialEnergy = calculateGravitationalPotentialEnergy(M_EARTH, M_MOON, distance);
  const totalEnergy = kineticEnergy + potentialEnergy;
  const gravitationalAcceleration = gravitationalForce / M_MOON;
  const gravitationalAccelerationDifferencePercent =
    (Math.abs(gravitationalAcceleration - centripetalAcceleration) / gravitationalAcceleration) * 100;
  const referenceKineticEnergy = -potentialEnergy / 2;
  const kineticPotentialDifferencePercent =
    (Math.abs(kineticEnergy - referenceKineticEnergy) / referenceKineticEnergy) * 100;

  return {
    distance,
    speed,
    angularVelocity,
    centripetalAcceleration,
    gravitationalForce,
    gravitationalForceVector,
    kineticEnergy,
    potentialEnergy,
    totalEnergy,
    orbitalPeriodDays: LUNAR_SIDEREAL_PERIOD / 86400,
    synodicPeriodDays: LUNAR_SYNODIC_PERIOD / 86400,
    gravitationalAccelerationDifferencePercent,
    kineticPotentialDifferencePercent,
  };
}
