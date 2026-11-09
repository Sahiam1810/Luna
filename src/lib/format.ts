const SUPERSCRIPT_DIGITS: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

function toSuperscript(value: number): string {
  return String(value).replace(/[\-0-9]/g, (character) => SUPERSCRIPT_DIGITS[character] ?? character);
}

/** Formats a finite number with Spanish decimal notation and scientific notation. */
export function formatScientific(value: number, significantDigits = 3): string {
  if (!Number.isFinite(value)) {
    throw new Error("value must be finite.");
  }
  if (value === 0) return "0";

  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const coefficient = value / 10 ** exponent;
  const decimals = Math.max(0, significantDigits - 1);
  const formattedCoefficient = coefficient.toLocaleString("es-CO", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });

  return `${formattedCoefficient} × 10${toSuperscript(exponent)}`;
}
