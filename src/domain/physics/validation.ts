import { SYNODIC_DAYS, moonAgeDays, phaseAt } from "@/lib/moon";
import { M_MOON } from "./constants";
import type { PhysicsReadout } from "./physicsReadout";

/** NASA Moon Fact Sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html */
const REFERENCE_ORBITAL_SPEED = 1_022;
/** NASA Moon Fact Sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html */
const REFERENCE_SYNODIC_PERIOD_DAYS = 29.53;

export type ValidationComparison = {
  magnitud: string;
  valorModelo: number;
  valorReferencia: number;
  unidad: string;
  errorPorcentual: number;
  fuente: string;
};

export type PhaseEventValidation = {
  evento: string;
  fecha: string;
  faseEsperada: string;
  edadLunar: number;
  faseModelo: string;
  diferenciaDias: number;
  fuente: string;
};

/** Calculates absolute percentage error against a non-zero theoretical value. */
export function calculatePercentError(measured: number, theoretical: number): number {
  if (!Number.isFinite(measured) || !Number.isFinite(theoretical) || theoretical === 0) {
    throw new Error("measured and theoretical must be finite, and theoretical must not be zero.");
  }

  return (Math.abs(measured - theoretical) / Math.abs(theoretical)) * 100;
}

export function calculateValidationComparison(readout: PhysicsReadout): ValidationComparison[] {
  return [
    {
      magnitud: "Velocidad orbital",
      valorModelo: readout.speed,
      valorReferencia: REFERENCE_ORBITAL_SPEED,
      unidad: "m/s",
      errorPorcentual: calculatePercentError(readout.speed, REFERENCE_ORBITAL_SPEED),
      fuente: "NASA Moon Fact Sheet",
    },
    {
      magnitud: "Periodo sinódico",
      valorModelo: readout.synodicPeriodDays,
      valorReferencia: REFERENCE_SYNODIC_PERIOD_DAYS,
      unidad: "días",
      errorPorcentual: calculatePercentError(readout.synodicPeriodDays, REFERENCE_SYNODIC_PERIOD_DAYS),
      fuente: "NASA Moon Fact Sheet",
    },
    {
      magnitud: "F/m Luna frente a a_c",
      valorModelo: readout.gravitationalForce / M_MOON,
      valorReferencia: readout.centripetalAcceleration,
      unidad: "m/s²",
      errorPorcentual: readout.gravitationalAccelerationDifferencePercent,
      fuente: "Verificación interna del modelo",
    },
    {
      magnitud: "Ec frente a −Ep/2",
      valorModelo: readout.kineticEnergy,
      valorReferencia: -readout.potentialEnergy / 2,
      unidad: "J",
      errorPorcentual: readout.kineticPotentialDifferencePercent,
      fuente: "Verificación interna del modelo",
    },
  ];
}

export function calculatePhaseEventValidation(): PhaseEventValidation[] {
  const events = [
    {
      evento: "Luna nueva de referencia",
      fecha: "2000-01-06T18:14:00Z",
      faseEsperada: "Luna nueva",
      fuente: "Referencia definida en src/lib/moon.ts",
    },
    {
      evento: "Eclipse lunar total",
      fecha: "2026-03-03T11:34:52Z",
      faseEsperada: "Luna llena",
      fuente: "NASA GSFC Lunar Eclipse 2026-03-03",
    },
    {
      evento: "Eclipse solar total",
      fecha: "2026-08-12T17:47:05Z",
      faseEsperada: "Luna nueva",
      fuente: "NASA GSFC Solar Eclipse 2026-08-12",
    },
  ] as const;

  return events.map((event) => {
    const age = moonAgeDays(new Date(event.fecha));
    const expectedAge = event.faseEsperada === "Luna llena" ? SYNODIC_DAYS / 2 : 0;
    const difference =
      event.faseEsperada === "Luna nueva"
        ? Math.min(age, SYNODIC_DAYS - age)
        : Math.abs(age - expectedAge);

    return {
      evento: event.evento,
      fecha: event.fecha,
      faseEsperada: event.faseEsperada,
      edadLunar: age,
      faseModelo: phaseAt(age).name,
      diferenciaDias: difference,
      fuente: event.fuente,
    };
  });
}

