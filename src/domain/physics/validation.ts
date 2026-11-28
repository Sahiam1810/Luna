import { SYNODIC_DAYS, moonAgeDays, phaseAt } from "@/lib/moon";
import {
  EARTH_MOON_DISTANCE,
  EARTH_SIDEREAL_PERIOD,
  EARTH_SUN_DISTANCE,
  LUNAR_SIDEREAL_PERIOD,
  LUNAR_SYNODIC_PERIOD,
  M_MOON,
} from "./constants";
import {
  calculateIlluminatedFractionFromGeometry,
  calculateRelativeAngle,
  calculateSunMoonDistance,
  calculateSynodicPeriod,
} from "./lunarPosition";
import { calculatePhaseModelReadout } from "./phaseModelReadout";
import type { PhysicsReadout } from "./physicsReadout";

/** NASA Moon Fact Sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html */
const REFERENCE_ORBITAL_SPEED = 1_022;
/** NASA Moon Fact Sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html */
const REFERENCE_SYNODIC_PERIOD_DAYS = 29.53;
/** USNO, Explanatory Supplement to the Astronomical Almanac, Eq. 15.2. */
const REFERENCE_SYNODIC_PERIOD_USNO_DAYS = 29.5305888531;

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
  fraccionIluminadaGeometrica: number;
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
  const derivedSynodicPeriodSeconds =
    calculateSynodicPeriod(LUNAR_SIDEREAL_PERIOD, EARTH_SIDEREAL_PERIOD);
  const derivedSynodicPeriodDays = derivedSynodicPeriodSeconds / 86400;
  const newMoonDistance = calculateSunMoonDistance(0);
  const fullMoonDistance = calculateSunMoonDistance(derivedSynodicPeriodSeconds / 2);
  let maximumIlluminationDifference = 0;

  for (let index = 0; index <= 120; index += 1) {
    const time = (LUNAR_SYNODIC_PERIOD * index) / 120;
    maximumIlluminationDifference = Math.max(
      maximumIlluminationDifference,
      Math.abs(
        calculateIlluminatedFractionFromGeometry(time) -
          (1 + Math.cos(calculateRelativeAngle(time))) / 2,
      ),
    );
  }

  return [
    {
      magnitud: "Velocidad orbital",
      valorModelo: readout.speed,
      valorReferencia: REFERENCE_ORBITAL_SPEED,
      unidad: "m/s",
      errorPorcentual: calculatePercentError(readout.speed, REFERENCE_ORBITAL_SPEED),
      fuente: "Referencia independiente: NASA Moon Fact Sheet",
    },
    {
      magnitud: "Periodo sinódico",
      valorModelo: derivedSynodicPeriodDays,
      valorReferencia: REFERENCE_SYNODIC_PERIOD_DAYS,
      unidad: "días",
      errorPorcentual: calculatePercentError(derivedSynodicPeriodDays, REFERENCE_SYNODIC_PERIOD_DAYS),
      fuente: "Referencia independiente: NASA Moon Fact Sheet",
    },
    {
      magnitud: "Periodo sinódico derivado frente a USNO",
      valorModelo: derivedSynodicPeriodDays,
      valorReferencia: REFERENCE_SYNODIC_PERIOD_USNO_DAYS,
      unidad: "días",
      errorPorcentual: calculatePercentError(derivedSynodicPeriodDays, REFERENCE_SYNODIC_PERIOD_USNO_DAYS),
      fuente: "Referencia independiente: USNO, Explanatory Supplement Eq. 15.2",
    },
    {
      magnitud: "Velocidad orbital cinemática",
      valorModelo: readout.kinematicSpeed,
      valorReferencia: REFERENCE_ORBITAL_SPEED,
      unidad: "m/s",
      errorPorcentual: calculatePercentError(readout.kinematicSpeed, REFERENCE_ORBITAL_SPEED),
      fuente: "Referencia independiente: NASA Moon Fact Sheet",
    },
    {
      magnitud: "Periodo de Kepler frente al sideral observado",
      valorModelo: readout.keplerPeriodDays,
      valorReferencia: LUNAR_SIDEREAL_PERIOD / 86400,
      unidad: "días",
      errorPorcentual: readout.keplerPeriodDifferencePercent,
      fuente: "Referencia independiente: periodo sideral lunar del modelo",
    },
    {
      magnitud: "Distancia Sol-Luna en luna nueva",
      valorModelo: newMoonDistance,
      valorReferencia: EARTH_SUN_DISTANCE - EARTH_MOON_DISTANCE,
      unidad: "m",
      errorPorcentual: calculatePercentError(newMoonDistance, EARTH_SUN_DISTANCE - EARTH_MOON_DISTANCE),
      fuente: "Verificación de consistencia geométrica interna: R - r",
    },
    {
      magnitud: "Distancia Sol-Luna en luna llena",
      valorModelo: fullMoonDistance,
      valorReferencia: EARTH_SUN_DISTANCE + EARTH_MOON_DISTANCE,
      unidad: "m",
      errorPorcentual: calculatePercentError(fullMoonDistance, EARTH_SUN_DISTANCE + EARTH_MOON_DISTANCE),
      fuente: "Verificación de consistencia geométrica interna: R + r",
    },
    {
      magnitud: "Diferencia máxima de iluminación",
      valorModelo: maximumIlluminationDifference * 100,
      valorReferencia: (EARTH_MOON_DISTANCE / (2 * EARTH_SUN_DISTANCE)) * 100,
      unidad: "puntos porcentuales",
      errorPorcentual: calculatePercentError(
        maximumIlluminationDifference,
        EARTH_MOON_DISTANCE / (2 * EARTH_SUN_DISTANCE),
      ),
      fuente: "Verificación de consistencia geométrica interna; escala teórica r/(2ρ)",
    },
    {
      magnitud: "F/m Luna frente a a_c (identidad del modelo)",
      valorModelo: readout.gravitationalForce / M_MOON,
      valorReferencia: readout.centripetalAcceleration,
      unidad: "m/s²",
      errorPorcentual: readout.gravitationalAccelerationDifferencePercent,
      fuente: "Identidad del modelo, no validación independiente",
    },
    {
      magnitud: "Ec frente a -Ep/2 (identidad del modelo)",
      valorModelo: readout.kineticEnergy,
      valorReferencia: -readout.potentialEnergy / 2,
      unidad: "J",
      errorPorcentual: readout.kineticPotentialDifferencePercent,
      fuente: "Identidad del modelo, no validación independiente",
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
    const phaseModel = calculatePhaseModelReadout(age);
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
      fraccionIluminadaGeometrica: phaseModel.illuminatedFractionGeometric,
      fuente: event.fuente,
    };
  });
}
