// Simplified lunar model (educational, not high-precision).
export const SYNODIC_DAYS = 29.530588853;
export const SIDEREAL_DAYS = 27.321661;
// Reference new moon: 2000-01-06 18:14 UTC
const REF_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

export function moonAgeDays(date: Date): number {
  const days = (date.getTime() - REF_NEW_MOON) / 86400000;
  return ((days % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS;
}

/** Phase angle in radians (0 = new, π = full). */
export const angleFromAge = (age: number) => (age / SYNODIC_DAYS) * Math.PI * 2;

/** Illuminated fraction 0..1 */
export const illumination = (angle: number) => (1 - Math.cos(angle)) / 2;

export const PHASES = [
  { name: "Luna nueva", desc: "La cara iluminada mira al Sol; desde la Tierra no la vemos.", trend: null },
  { name: "Luna creciente", desc: "Aparece un fino arco iluminado tras el atardecer.", trend: "creciente" },
  { name: "Cuarto creciente", desc: "Vemos la mitad del disco iluminado; la Luna recorrió ¼ de su ciclo.", trend: "creciente" },
  { name: "Gibosa creciente", desc: "Más de la mitad iluminada; se acerca la luna llena.", trend: "creciente" },
  { name: "Luna llena", desc: "La Tierra está entre el Sol y la Luna: vemos toda la cara iluminada.", trend: null },
  { name: "Gibosa menguante", desc: "La parte iluminada empieza a reducirse.", trend: "menguante" },
  { name: "Cuarto menguante", desc: "De nuevo la mitad iluminada, ahora del lado opuesto.", trend: "menguante" },
  { name: "Luna menguante", desc: "Un fino arco visible antes del amanecer.", trend: "menguante" },
] as const;

/** Index 0..7 of the named phase for a given age. */
export function phaseIndex(age: number): number {
  return Math.floor(((age / SYNODIC_DAYS) * 8 + 0.5)) % 8;
}

export const phaseAt = (age: number) => PHASES[phaseIndex(age)] ?? PHASES[0];
