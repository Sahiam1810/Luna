import { phaseAt } from "@/lib/moon";
import { formatScientific } from "@/lib/format";
import type { Vector2 } from "@/domain/physics/orbitalModel";
import type { calculatePhaseModelReadout } from "@/domain/physics/phaseModelReadout";
import { VectorSymbol } from "./VectorSymbol";

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

      <div className="grid gap-3 lg:grid-cols-2">
        <EquationCard
          title="Posición de la Tierra"
          equation="R_T(t) = R · (cos θT, sin θT)"
          substitution={`t = ${formatDecimal(readout.timeDays, 3)} d; R_T = ${formatVector(readout.earthPosition)} m`}
        />
        <EquationCard
          title="Posición de la Luna respecto al Sol"
          equation="R_M(t) = R_T(t) + r · (cos θL, sin θL)"
          substitution={`θT0 = 0; θL0 = π; R_M = ${formatVector(readout.moonPositionRelativeToSun)} m`}
        />
        <EquationCard
          title="Ángulo relativo"
          equation="ψ = ψ0 + (ωL − ωT) · t"
          substitution={`ψ0 = π; ψ = ${formatDecimal(readout.relativeAngleRadians, 4)} rad = ${formatDecimal(readout.relativeAngleDegrees, 2)}°`}
        />
        <EquationCard
          title="Periodo sinódico"
          equation="1 / Psyn = 1 / PL − 1 / PT"
          substitution={`Psyn = ${formatDecimal(readout.derivedSynodicPeriodDays, 6)} d; diferencia = ${formatDecimal(readout.derivedSynodicPeriodDifferencePercent, 6)}%`}
        />
        <EquationCard
          title="Distancia Sol-Luna"
          equation="ρ² = R² + r² + 2Rr · cos(θL − θT)"
          substitution={`ρ = ${formatScientific(readout.sunMoonDistance)} m`}
        />
        <EquationCard
          title="Fracción iluminada"
          equation="k = (1 + cos i) / 2"
          substitution={`i = ${formatDecimal(readout.phaseAngleRadians, 4)} rad = ${formatDecimal(readout.phaseAngleDegrees, 2)}°; k = ${formatPercent(readout.illuminatedFractionGeometric)}`}
        />
      </div>

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
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr><th className="pb-2">Modelo</th><th className="pb-2">k</th><th className="pb-2">Diferencia</th></tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="py-2">Geométrica</td><td>{formatPercent(readout.illuminatedFractionGeometric)}</td><td>—</td></tr>
                <tr className="border-t border-border"><td className="py-2">Sol lejano</td><td>{formatPercent(readout.illuminatedFractionApproximate)}</td><td>{formatPercent(readout.illuminatedFractionApproximationDifference)}</td></tr>
                <tr className="border-t border-border"><td className="py-2">Simulador</td><td>{formatPercent(readout.illuminatedFractionState)}</td><td>{formatPercent(readout.illuminatedFractionStateDifference)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 className="font-display text-xl">Cara visible</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            La Luna rota con el mismo periodo con que orbita (rotación sincrónica): siempre muestra la misma cara a la Tierra; el Sol ilumina caras distintas.
          </p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <Metric label="Desfase respecto a la Tierra" value={`${formatDecimal(readout.nearSideOffsetToEarthDegrees, 4)}°`} />
            <Metric label="Ángulo de esa cara respecto al Sol" value={`${formatDecimal(readout.nearSideAngleToSunDegrees, 2)}°`} />
          </dl>
        </div>
      </div>

      <p className="mt-5 text-xs text-muted-foreground">
        Órbitas circulares coplanarias; sin excentricidad, inclinación ni eclipses. Modelo educativo, no una efeméride.
      </p>
    </section>
  );
}

function EquationCard({ title, equation, substitution }: { title: string; equation: string; substitution: string }) {
  return (
    <div className="rounded-lg bg-secondary p-3">
      <p className="text-sm text-primary">{title}: {equation}</p>
      <p className="mt-1 text-xs text-muted-foreground">{substitution}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg">{value}</p>
    </div>
  );
}
