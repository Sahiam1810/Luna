import { useState } from "react";
import { Info } from "lucide-react";
import { phaseAt, SYNODIC_DAYS } from "@/lib/moon";
import { formatScientific } from "@/lib/format";
import {
  EARTH_MOON_DISTANCE,
  EARTH_SIDEREAL_PERIOD,
  EARTH_SUN_DISTANCE,
  LUNAR_SIDEREAL_PERIOD,
} from "@/domain/physics/constants";
import { POSITION_EQUATION_HELP, type PositionEquationHelp } from "@/content/positionEquationHelp";
import type { Vector2 } from "@/domain/physics/orbitalModel";
import type { calculatePhaseModelReadout } from "@/domain/physics/phaseModelReadout";
import { VectorSymbol } from "./VectorSymbol";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type PhaseModelReadout = ReturnType<typeof calculatePhaseModelReadout>;

type PhaseModelSectionProps = {
  ageDays: number;
  readout: PhaseModelReadout;
};

function formatDecimal(value: number, digits = 3): string {
  return value.toLocaleString("es-CO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatVector(vector: Vector2): string {
  return `(${formatScientific(vector.x)}, ${formatScientific(vector.y)})`;
}

function formatPercent(value: number): string {
  return `${formatDecimal(value * 100, 2)}%`;
}

export function PhaseModelSection({ ageDays, readout }: PhaseModelSectionProps) {
  const phase = phaseAt(ageDays);
  const [selectedHelp, setSelectedHelp] = useState<PositionEquationHelp | null>(null);

  return (
    <section className="panel mt-6 p-4 sm:p-6" aria-labelledby="phase-model-title">
      <div className="mb-5">
        <h2 id="phase-model-title" className="font-display text-2xl sm:text-3xl">
          Modelo matemático: posición de la Luna y fases
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Las ecuaciones se evalúan con la edad seleccionada en el deslizador. El tiempo t se mide desde la luna nueva; los vectores se muestran como <VectorSymbol symbol="r" />.
        </p>
      </div>

      <Dialog open={selectedHelp !== null} onOpenChange={(open) => { if (!open) setSelectedHelp(null); }}>
        <div className="grid gap-3 lg:grid-cols-2">
          <EquationCard help={POSITION_EQUATION_HELP[0]!} title="Posición de la Tierra" equation="R_T(t) = R · (cos θT, sin θT)" substitution={`t = ${formatDecimal(readout.timeDays, 3)} d; R_T = ${formatVector(readout.earthPosition)} m`} onSelect={setSelectedHelp} />
          <EquationCard help={POSITION_EQUATION_HELP[1]!} title="Posición de la Luna respecto al Sol" equation="R_M(t) = R_T(t) + r · (cos θL, sin θL)" substitution={`θT0 = 0; θL0 = π; R_M = ${formatVector(readout.moonPositionRelativeToSun)} m`} onSelect={setSelectedHelp} />
          <EquationCard help={POSITION_EQUATION_HELP[2]!} title="Ángulo relativo" equation="ψ = ψ0 + (ωL − ωT) · t" substitution={`ψ0 = π; ψ = ${formatDecimal(readout.relativeAngleRadians, 4)} rad = ${formatDecimal(readout.relativeAngleDegrees, 2)}°`} onSelect={setSelectedHelp} />
          <EquationCard help={POSITION_EQUATION_HELP[3]!} title="Periodo sinódico" equation="1 / Psyn = 1 / PL − 1 / PT" substitution={`Psyn = ${formatDecimal(readout.derivedSynodicPeriodDays, 6)} d; diferencia = ${formatDecimal(readout.derivedSynodicPeriodDifferencePercent, 6)}%`} onSelect={setSelectedHelp} />
          <EquationCard help={POSITION_EQUATION_HELP[4]!} title="Distancia Sol-Luna" equation="ρ² = R² + r² + 2Rr · cos(θL − θT)" substitution={`ρ = ${formatScientific(readout.sunMoonDistance)} m`} onSelect={setSelectedHelp} />
          <EquationCard help={POSITION_EQUATION_HELP[5]!} title="Fracción iluminada" equation="k = (1 + cos i) / 2" substitution={`i = ${formatDecimal(readout.phaseAngleRadians, 4)} rad = ${formatDecimal(readout.phaseAngleDegrees, 2)}°; k = ${formatPercent(readout.illuminatedFractionGeometric)}`} onSelect={setSelectedHelp} />
        </div>

        {selectedHelp && (
          <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[85vh] overflow-y-auto p-5 sm:p-6 motion-reduce:animate-none">
            <DialogHeader className="pr-8 text-left">
              <DialogTitle className="font-display text-2xl text-primary">{getEquationTitle(selectedHelp.id)}</DialogTitle>
              <p className="mt-2 text-lg font-medium text-foreground">{getEquation(selectedHelp.id)}</p>
              <DialogDescription className="sr-only">Explicación de la ecuación, variables y sustitución numérica.</DialogDescription>
            </DialogHeader>

            <div className="space-y-5 text-sm">
              <section>
                <h3 className="font-display text-lg">En palabras</h3>
                <p className="mt-2 text-muted-foreground">{selectedHelp.meaning}</p>
              </section>

              <section>
                <h3 className="font-display text-lg">Variables</h3>
                <div className="mt-2 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[30rem] text-left text-sm">
                    <thead className="bg-secondary text-xs text-muted-foreground">
                      <tr><th className="w-32 px-3 py-2">Símbolo</th><th className="px-3 py-2">Significado</th><th className="whitespace-nowrap px-3 py-2 text-right">Unidad o valor</th></tr>
                    </thead>
                    <tbody>
                      {selectedHelp.variables.map((variable) => {
                        const value = formatVariableValue(variable.symbol);
                        return <tr key={variable.symbol} className="border-t border-border"><td className="whitespace-nowrap px-3 py-2 font-medium text-primary">{variable.symbol}</td><td className="px-3 py-2 text-muted-foreground">{variable.meaning}</td><td className="whitespace-nowrap px-3 py-2 text-right text-muted-foreground">{value ? `${value} ${variable.unit}` : variable.unit}</td></tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-display text-lg">¿Por qué es así?</h3>
                <p className="mt-2 text-muted-foreground">{selectedHelp.why}</p>
              </section>

              <section className="rounded-lg bg-secondary p-3">
                <h3 className="font-display text-lg">Con la edad seleccionada:</h3>
                <p className="mt-2 text-sm text-muted-foreground">{getSubstitution(selectedHelp.id, readout)}</p>
              </section>
            </div>

          </DialogContent>
        )}
      </Dialog>

      <div className="mt-5 grid gap-3 rounded-lg bg-secondary p-4 sm:grid-cols-5">
        <Metric label="t" value={`${formatDecimal(readout.timeDays, 3)} d`} />
        <Metric label="ψ" value={`${formatDecimal(readout.relativeAngleDegrees, 2)}°`} />
        <Metric label="Fase" value={phase.name} />
        <Metric label="k geométrica" value={formatPercent(readout.illuminatedFractionGeometric)} />
        <Metric label="ρ" value={`${formatScientific(readout.sunMoonDistance)} m`} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-xl">Comparación de iluminación</h3>
          <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs text-muted-foreground"><tr><th className="pb-2">Modelo</th><th className="pb-2">k</th><th className="pb-2">Diferencia</th></tr></thead><tbody><tr className="border-t border-border"><td className="py-2">Geométrica</td><td>{formatPercent(readout.illuminatedFractionGeometric)}</td><td>—</td></tr><tr className="border-t border-border"><td className="py-2">Sol lejano</td><td>{formatPercent(readout.illuminatedFractionApproximate)}</td><td>{formatPercent(readout.illuminatedFractionApproximationDifference)}</td></tr><tr className="border-t border-border"><td className="py-2">Simulador</td><td>{formatPercent(readout.illuminatedFractionState)}</td><td>{formatPercent(readout.illuminatedFractionStateDifference)}</td></tr></tbody></table></div>
        </div>
        <div><h3 className="font-display text-xl">Cara visible</h3><p className="mt-2 text-sm text-muted-foreground">La Luna rota con el mismo periodo con que orbita (rotación sincrónica): siempre muestra la misma cara a la Tierra; el Sol ilumina caras distintas.</p><dl className="mt-3 grid gap-3 sm:grid-cols-2"><Metric label="Desfase respecto a la Tierra" value={`${formatDecimal(readout.nearSideOffsetToEarthDegrees, 4)}°`} /><Metric label="Ángulo de esa cara respecto al Sol" value={`${formatDecimal(readout.nearSideAngleToSunDegrees, 2)}°`} /></dl></div>
      </div>

      <p className="mt-5 text-xs text-muted-foreground">Órbitas circulares coplanarias; sin excentricidad, inclinación ni eclipses. Modelo educativo, no una efeméride.</p>
    </section>
  );
}

function EquationCard({ help, title, equation, substitution, onSelect }: { help: PositionEquationHelp; title: string; equation: string; substitution: string; onSelect: (help: PositionEquationHelp) => void }) {
  return <DialogTrigger asChild><button type="button" className="h-[156px] rounded-lg bg-secondary p-3 text-left outline-none transition-colors hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background" onClick={() => onSelect(help)}><span className="flex h-full items-start justify-between gap-3"><span><span className="block text-sm text-primary">{title}: {equation}</span><span className="mt-2 block text-xs text-muted-foreground">{substitution}</span><span className="mt-3 block text-[11px] text-muted-foreground">Toca para ver qué significa</span></span><Info size={18} aria-hidden className="mt-0.5 shrink-0 text-primary" /></span></button></DialogTrigger>;
}

function getEquationTitle(id: string): string {
  const titles: Record<string, string> = { "earth-position": "Posición de la Tierra", "moon-position": "Posición de la Luna respecto al Sol", "relative-angle": "Ángulo relativo", "synodic-period": "Periodo sinódico", "sun-moon-distance": "Distancia Sol-Luna", "illuminated-fraction": "Fracción iluminada" };
  return titles[id] ?? "Explicación de la ecuación";
}

function getEquation(id: string): string {
  const equations: Record<string, string> = { "earth-position": "R_T(t) = R · (cos θT, sin θT)", "moon-position": "R_M(t) = R_T(t) + r · (cos θL, sin θL)", "relative-angle": "ψ = ψ0 + (ωL − ωT) · t", "synodic-period": "1 / Psyn = 1 / PL − 1 / PT", "sun-moon-distance": "ρ² = R² + r² + 2Rr · cos(θL − θT)", "illuminated-fraction": "k = (1 + cos i) / 2" };
  return equations[id] ?? "";
}

function getSubstitution(id: string, readout: PhaseModelReadout): string {
  const substitutions: Record<string, string> = {
    "earth-position": `t = ${formatDecimal(readout.timeDays, 3)} d; R_T = ${formatVector(readout.earthPosition)} m`,
    "moon-position": `θT0 = 0; θL0 = π; R_M = ${formatVector(readout.moonPositionRelativeToSun)} m`,
    "relative-angle": `ψ0 = π; ψ = ${formatDecimal(readout.relativeAngleRadians, 4)} rad = ${formatDecimal(readout.relativeAngleDegrees, 2)}°`,
    "synodic-period": `Psyn = ${formatDecimal(readout.derivedSynodicPeriodDays, 6)} d; diferencia frente a ${formatDecimal(SYNODIC_DAYS, 6)} d = ${formatDecimal(readout.derivedSynodicPeriodDifferencePercent, 6)}%`,
    "sun-moon-distance": `ρ = ${formatScientific(readout.sunMoonDistance)} m`,
    "illuminated-fraction": `i = ${formatDecimal(readout.phaseAngleRadians, 4)} rad = ${formatDecimal(readout.phaseAngleDegrees, 2)}°; k = ${formatPercent(readout.illuminatedFractionGeometric)}`,
  };
  return substitutions[id] ?? "";
}

function formatVariableValue(symbol: string): string {
  switch (symbol) {
    case "R": return formatScientific(EARTH_SUN_DISTANCE);
    case "r": return formatScientific(EARTH_MOON_DISTANCE);
    case "PL": return formatScientific(LUNAR_SIDEREAL_PERIOD / 86400);
    case "PT": return formatScientific(EARTH_SIDEREAL_PERIOD / 86400);
    default: return "";
  }
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-display text-lg">{value}</p></div>;
}
