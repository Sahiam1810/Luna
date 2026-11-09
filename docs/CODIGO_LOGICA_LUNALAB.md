# LunaLab: código y lógica matemática

Documento técnico para la presentación del proyecto universitario.

## Arquitectura

LunaLab separa el dominio matemático de la interfaz:

```text
src/lib/moon.ts                         Modelo simplificado de fases
src/domain/physics/constants.ts         Constantes SI
src/domain/physics/gravity.ts           Gravitación universal
src/domain/physics/orbital.ts            Magnitudes orbitales
src/domain/physics/energy.ts             Energías
src/domain/physics/orbitalModel.ts       Vectores orbitales
src/domain/physics/lunarSystemState.ts  Estado matemático único de fase y órbita
src/domain/physics/physicsReadout.ts     Valores derivados para la interfaz
src/components/OrbitSimulation.tsx       SVG, controles y resultados
src/components/MoonDisc.tsx              Disco lunar SVG
```

Las funciones del dominio son puras: reciben números o estados y devuelven
resultados sin modificar React ni el DOM. `OrbitSimulation` consume un único
estado generado por `calculateLunarSystemState(ageDays)`.

## Lógica de fases

Origen: `src/lib/moon.ts:2-16`.

```ts
export const SYNODIC_DAYS = 29.530588853;
export const SIDEREAL_DAYS = 27.321661;
const REF_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

export function moonAgeDays(date: Date): number {
  const days = (date.getTime() - REF_NEW_MOON) / 86400000;
  return ((days % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS;
}

export const angleFromAge = (age: number) =>
  (age / SYNODIC_DAYS) * Math.PI * 2;

export const illumination = (angle: number) => (1 - Math.cos(angle)) / 2;
```

Ecuaciones y unidades:

- Edad lunar: días transcurridos desde `2000-01-06 18:14 UTC`, reducidos al intervalo del mes sinódico; unidad: días.
- Ángulo de fase: `φ = 2π · edad / periodo`; unidad: radianes.
- Fracción iluminada: `I = (1 − cos φ) / 2`; valor adimensional entre 0 y 1.
- `phaseIndex` y `phaseAt` clasifican el ciclo en ocho sectores (`moon.ts:29-34`).

No hay términos de corrección, tablas de efemérides, excentricidad ni fecha
juliana. Es un modelo educativo de periodo medio.

## Gravitación universal

Origen: `src/domain/physics/gravity.ts:11-20`.

```ts
export function calculateGravitationalForce(
  mass1: number,
  mass2: number,
  distance: number,
): number {
  validatePositiveFinite("mass1", mass1);
  validatePositiveFinite("mass2", mass2);
  validatePositiveFinite("distance", distance);

  return (G * mass1 * mass2) / distance ** 2;
}
```

Ecuación: `F = G · m1 · m2 / r²`.

- `G`: N·m²/kg².
- `m1`, `m2`: kg.
- `r`: m.
- Resultado: N.

## Movimiento orbital

Orígenes: `src/domain/physics/orbital.ts:9-52`.

```ts
export function calculateOrbitalSpeed(distance: number, period: number): number {
  if (!Number.isFinite(distance) || distance <= 0) {
    throw new Error("distance must be a finite number greater than zero.");
  }
  if (!Number.isFinite(period) || period <= 0) {
    throw new Error("period must be a finite number greater than zero.");
  }

  return (2 * Math.PI * distance) / period;
}

export function calculateAngularVelocity(period: number): number {
  if (!Number.isFinite(period) || period <= 0) {
    throw new Error("period must be a finite number greater than zero.");
  }

  return (2 * Math.PI) / period;
}

export function calculateCentripetalAcceleration(speed: number, distance: number): number {
  if (!Number.isFinite(speed) || speed < 0) {
    throw new Error("speed must be a finite number greater than or equal to zero.");
  }
  if (!Number.isFinite(distance) || distance <= 0) {
    throw new Error("distance must be a finite number greater than zero.");
  }

  return speed ** 2 / distance;
}
```

Ecuaciones:

- Velocidad circular: `v = 2πr / T`; resultado en m/s.
- Velocidad angular: `ω = 2π / T`; resultado en rad/s.
- Aceleración centrípeta: `a_c = v² / r`; resultado en m/s².

## Energía

Origen: `src/domain/physics/energy.ts:11-19,31-46`.

```ts
export function calculateKineticEnergy(mass: number, speed: number): number {
  if (!Number.isFinite(mass) || mass <= 0) {
    throw new Error("mass must be a finite number greater than zero.");
  }
  if (!Number.isFinite(speed) || speed < 0) {
    throw new Error("speed must be a finite number greater than or equal to zero.");
  }

  return 0.5 * mass * speed ** 2;
}

export function calculateGravitationalPotentialEnergy(
  mass1: number,
  mass2: number,
  distance: number,
): number {
  if (!Number.isFinite(mass1) || mass1 <= 0) {
    throw new Error("mass1 must be a finite number greater than zero.");
  }
  if (!Number.isFinite(mass2) || mass2 <= 0) {
    throw new Error("mass2 must be a finite number greater than zero.");
  }
  if (!Number.isFinite(distance) || distance <= 0) {
    throw new Error("distance must be a finite number greater than zero.");
  }

  return -(G * mass1 * mass2) / distance;
}
```

Ecuaciones:

- Energía cinética: `Ec = ½mv²`; resultado en J.
- Energía potencial: `Ep = −GMm/r`, tomando cero en separación infinita; resultado en J.

## Modelo orbital vectorial

Origen: `src/domain/physics/orbitalModel.ts:49-117`.

```ts
export function calculatePositionVector(radius: number, angle: number): Vector2 {
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}

export function calculateVelocityVector(radius: number, period: number, angle: number): Vector2 {
  const speed = calculateOrbitalSpeed(radius, period);
  return {
    x: -speed * Math.sin(angle),
    y: speed * Math.cos(angle),
  };
}

export function calculateCentripetalAccelerationVector(
  radius: number,
  period: number,
  angle: number,
): Vector2 {
  const speed = calculateOrbitalSpeed(radius, period);
  const centripetalAcceleration = calculateCentripetalAcceleration(speed, radius);
  return {
    x: -centripetalAcceleration * Math.cos(angle),
    y: -centripetalAcceleration * Math.sin(angle),
  };
}
```

El sistema de coordenadas tiene origen en la Tierra, el eje `+x` en el plano
orbital y ángulo antihorario visto desde el polo norte celeste. El vector de
velocidad es tangente y la aceleración apunta hacia el origen.

## Estado matemático único

Origen: `src/domain/physics/lunarSystemState.ts:18-33`.

```ts
const normalizedAgeDays = ((ageDays % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS;
const ageSeconds = (normalizedAgeDays / SYNODIC_DAYS) * LUNAR_SYNODIC_PERIOD;
const angle = Math.PI + (2 * Math.PI * ageSeconds) / LUNAR_SYNODIC_PERIOD;
const illuminatedFraction = (1 + Math.cos(angle)) / 2;

return {
  ageDays: normalizedAgeDays,
  angle,
  illuminatedFraction,
  orbit: calculateLunarOrbitState(angle),
};
```

El desfase `π` coloca la luna nueva en el lado del Sol. La fracción iluminada
es matemáticamente equivalente a la de `moon.ts`:

```text
(1 + cos(π + φ)) / 2 = (1 − cos φ) / 2
```

`physicsReadout.ts` recibe ese estado y compone las magnitudes para la UI sin
duplicar las fórmulas. La interfaz convierte únicamente las coordenadas físicas
a coordenadas SVG y mantiene el eje vertical de pantalla invertido.

## Aproximaciones y limitaciones

- La Luna sigue una órbita circular con distancia media.
- El periodo sideral calcula la rapidez, velocidad angular y aceleración.
- El periodo sinódico calcula la progresión de las fases.
- La mezcla de ambos periodos es una simplificación educativa del marco Sol-fijo.
- No se modelan excentricidad, perigeo, apogeo, perturbaciones solares, baricentro, inclinación, libración ni eclipses.
- El modelo de fases no es una efeméride astronómica de alta precisión.
