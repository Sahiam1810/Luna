import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { MoonDisc } from "./MoonDisc";
import { VectorSymbol } from "./VectorSymbol";
import { PHASES, SYNODIC_DAYS, phaseIndex } from "@/lib/moon";
import { calculateLunarSystemState } from "@/domain/physics/lunarSystemState";
import { calculatePhysicsReadout } from "@/domain/physics/physicsReadout";
import { G, LUNAR_SIDEREAL_PERIOD, M_EARTH, M_MOON } from "@/domain/physics/constants";
import { formatScientific } from "@/lib/format";
import { calculatePhaseModelReadout } from "@/domain/physics/phaseModelReadout";
import { PhaseModelSection } from "./PhaseModelSection";

const SPEEDS = [0.5, 1, 2, 4];

export function OrbitSimulation() {
  const [age, setAge] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showPositionVector, setShowPositionVector] = useState(false);
  const [showVelocityVector, setShowVelocityVector] = useState(false);
  const [showAccelerationVector, setShowAccelerationVector] = useState(false);
  const [showForceVector, setShowForceVector] = useState(false);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = (t: number) => {
      if (last.current != null) {
        const dt = (t - last.current) / 1000;
        setAge((a) => (a + dt * speed * 2) % SYNODIC_DAYS); // 1x = 2 días/segundo
      }
      last.current = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); last.current = null; };
  }, [playing, speed]);

  const step = (d: number) => setAge((a) => (((a + d) % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS);
  const lunarState = calculateLunarSystemState(age);
  const physics = calculatePhysicsReadout(lunarState);
  const phaseModelReadout = calculatePhaseModelReadout(age);
  const phaseAngle = lunarState.angle - Math.PI;
  const idx = phaseIndex(age);
  const phase = PHASES[idx] ?? PHASES[0];

  // Orbit view geometry (schematic, not to scale)
  const ex = 330, ey = 160, R = 80;
  // Convert the mathematical orbital frame to SVG: screen y points downward.
  const mx = ex + R * (lunarState.orbit.position.x / lunarState.orbit.radius);
  const my = ey - R * (lunarState.orbit.position.y / lunarState.orbit.radius);
  // Keep the existing visual vector scale while deriving directions from state.
  const vx = R * (lunarState.orbit.velocity.x / lunarState.orbit.speed) * 0.5;
  const vy = -R * (lunarState.orbit.velocity.y / lunarState.orbit.speed) * 0.5;
  const ax = R * (lunarState.orbit.acceleration.x / lunarState.orbit.centripetalAcceleration) * 0.55;
  const ay = -R * (lunarState.orbit.acceleration.y / lunarState.orbit.centripetalAcceleration) * 0.55;
  const fx = physics.gravitationalForceVector.x / physics.gravitationalForce;
  const fy = -physics.gravitationalForceVector.y / physics.gravitationalForce;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="panel p-4 sm:p-6">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h3 className="font-display text-xl">Vista espacial</h3>
          <span className="text-xs text-muted-foreground">Sobre el Polo Norte · sentido antihorario</span>
        </div>
        <svg viewBox="0 0 460 320" className="w-full" role="img" aria-label="Sistema Sol, Tierra y Luna">
          <defs>
            <radialGradient id="sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--sun-core)" />
              <stop offset="100%" stopColor="var(--sun-edge)" />
            </radialGradient>
            <marker id="arrR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10z" fill="var(--primary)" />
            </marker>
            <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10z" fill="var(--sun-edge)" />
            </marker>
            <marker id="arrV" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10z" fill="var(--earth)" />
            </marker>
            <marker id="arrA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10z" fill="var(--sun-edge)" />
            </marker>
            <marker id="arrF" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10z" fill="var(--destructive)" />
            </marker>
          </defs>
          {/* Earth orbit around the sun (partial arc) */}
          {showOrbits && (
            <path d={`M ${ex} 10 A 300 300 0 0 1 ${ex} 310`} transform={`translate(-40 0)`} fill="none" stroke="var(--border)" strokeDasharray="2 6" />
          )}
          <g className="animate-sun-pulse" style={{ transformOrigin: "50px 160px" }}>
            <circle cx="50" cy="160" r="38" fill="url(#sun)" />
          </g>
          {[-60, -20, 20, 60].map((o) => (
            <line key={o} x1="100" y1={160 + o} x2="200" y2={160 + o} stroke="var(--sun-edge)" strokeOpacity="0.5" markerEnd="url(#arr)" />
          ))}
          {showOrbits && <circle cx={ex} cy={ey} r={R} fill="none" stroke="var(--muted-foreground)" strokeOpacity="0.4" strokeDasharray="4 5" />}
          <circle cx={ex} cy={ey} r="20" fill="var(--earth)" />
          <ellipse cx={ex - 4} cy={ey - 5} rx="7" ry="5" fill="var(--earth-land)" />
          {/* Moon: lit half always faces the sun (left) */}
          <circle cx={mx} cy={my} r="9" fill="var(--moon-dark)" />
          <path d={`M ${mx} ${my - 9} A 9 9 0 0 0 ${mx} ${my + 9}Z`} fill="var(--moon-light)" />
          {showPositionVector && (
            <>
              <line x1={ex} y1={ey} x2={mx} y2={my} stroke="var(--primary)" strokeWidth="2" markerEnd="url(#arrR)" />
              <text x={ex + (mx - ex) * 0.5} y={ey + (my - ey) * 0.5 - 6} className="fill-primary text-[11px] italic">r</text>
            </>
          )}
          {showVelocityVector && (
            <>
              <line x1={mx} y1={my} x2={mx + vx} y2={my + vy} stroke="var(--earth)" strokeWidth="2" markerEnd="url(#arrV)" />
              <text x={mx + vx} y={my + vy - 6} className="fill-earth text-[11px] italic">v</text>
            </>
          )}
          {showAccelerationVector && (
            <>
              <line x1={mx} y1={my} x2={mx + ax} y2={my + ay} stroke="var(--sun-edge)" strokeWidth="2" markerEnd="url(#arrA)" />
              <text x={mx + ax} y={my + ay - 6} className="fill-sun-edge text-[11px] italic">a</text>
            </>
          )}
          {showForceVector && (
            <>
              <line x1={mx} y1={my} x2={mx + fx * R * 0.45} y2={my + fy * R * 0.45} stroke="var(--destructive)" strokeWidth="2" markerEnd="url(#arrF)" />
              <text x={mx + fx * R * 0.45} y={my + fy * R * 0.45 - 6} className="fill-destructive text-[11px] italic">F</text>
            </>
          )}
          <text x="50" y="225" textAnchor="middle" className="fill-muted-foreground text-[12px]">Sol</text>
          <text x={ex} y={ey + 40} textAnchor="middle" className="fill-muted-foreground text-[12px]">Tierra</text>
        </svg>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>☀ Dirección de la luz solar →</span>
          {showPositionVector && <span className="text-primary">— posición <VectorSymbol symbol="r" /></span>}
          {showVelocityVector && <span className="text-earth">— velocidad <VectorSymbol symbol="v" /></span>}
          {showAccelerationVector && <span className="text-sun-edge">— aceleración <VectorSymbol symbol="a" /></span>}
          {showForceVector && <span className="text-destructive">— fuerza <VectorSymbol symbol="F" /></span>}
          <span className="italic">Vectores no dibujados a escala; la longitud es solo visual. Se muestran dirección y magnitud real.</span>
        </div>
      </div>

      <div className="panel flex flex-col items-center p-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Así se ve la Luna desde la Tierra</p>
        <div className="my-6"><MoonDisc angle={phaseAngle} size={200} label={phase.name} /></div>
        <h3 className="font-display text-3xl">{phase.name}</h3>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">{phase.desc}</p>
        <dl className="mt-5 grid w-full grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-secondary p-3"><dt className="text-muted-foreground">Edad lunar</dt><dd className="font-display text-xl">{age.toFixed(1)} d</dd></div>
          <div className="rounded-lg bg-secondary p-3"><dt className="text-muted-foreground">Iluminado</dt><dd className="font-display text-xl">{Math.round(lunarState.illuminatedFraction * 100)}%</dd></div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">Hemisferio norte (en el sur se invierte izquierda/derecha).</p>
      </div>

      <div className="panel flex flex-col gap-4 p-4 lg:col-span-2">
        <div className="flex items-center gap-3">
          <label htmlFor="age" className="shrink-0 text-sm text-muted-foreground">Mes lunar transcurrido</label>
          <input id="age" type="range" min={0} max={SYNODIC_DAYS} step={0.01} value={age}
            onChange={(e) => { setPlaying(false); setAge(Number(e.target.value)); }} className="w-full accent-primary" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="ctl" onClick={() => step(-1)} aria-label="Retroceder un día"><SkipBack size={16} /></button>
          <button className="ctl ctl-primary" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pausar" : "Reproducir"}>
            {playing ? <Pause size={16} /> : <Play size={16} />}{playing ? "Pausar" : "Reproducir"}
          </button>
          <button className="ctl" onClick={() => step(1)} aria-label="Avanzar un día"><SkipForward size={16} /></button>
          <button className="ctl" onClick={() => { setAge(0); setPlaying(false); }} aria-label="Reiniciar"><RotateCcw size={16} />Reiniciar</button>
          <div className="ml-auto flex items-center gap-1" role="group" aria-label="Velocidad">
            {SPEEDS.map((s) => (
              <button key={s} className={`ctl ${s === speed ? "ctl-active" : ""}`} onClick={() => setSpeed(s)}>{s}×</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={showOrbits} onChange={(e) => setShowOrbits(e.target.checked)} className="accent-primary" />Trayectorias</label>
          <label className="flex items-center gap-2 text-primary"><input type="checkbox" checked={showPositionVector} onChange={(e) => setShowPositionVector(e.target.checked)} className="accent-primary" /><VectorSymbol symbol="r" /> ({formatScientific(physics.distance)} m)</label>
          <label className="flex items-center gap-2 text-earth"><input type="checkbox" checked={showVelocityVector} onChange={(e) => setShowVelocityVector(e.target.checked)} className="accent-primary" /><VectorSymbol symbol="v" /> ({formatScientific(physics.speed)} m/s)</label>
          <label className="flex items-center gap-2 text-sun-edge"><input type="checkbox" checked={showAccelerationVector} onChange={(e) => setShowAccelerationVector(e.target.checked)} className="accent-primary" /><VectorSymbol symbol="a" /> ({formatScientific(physics.centripetalAcceleration)} m/s²)</label>
          <label className="flex items-center gap-2 text-destructive"><input type="checkbox" checked={showForceVector} onChange={(e) => setShowForceVector(e.target.checked)} className="accent-primary" /><VectorSymbol symbol="F" /> ({formatScientific(physics.gravitationalForce)} N)</label>
          <span className="text-muted-foreground">Ir a fase:</span>
          {PHASES.map((p, i) => (
            <button key={p.name} className={`ctl ${i === idx ? "ctl-active" : ""}`} onClick={() => { setPlaying(false); setAge((i / 8) * SYNODIC_DAYS); }}>{p.name}</button>
          ))}
        </div>
        <section id="fisica" className="grid gap-4 border-t border-border pt-5 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-2xl">Datos físicos del modelo</h3>
            <p className="mt-1 text-xs text-muted-foreground">Valores calculados desde el estado de la simulación. Son constantes porque el modelo usa una órbita circular con distancia media y periodo sideral; en la realidad varían porque la órbita es elíptica. Aproximación educativa, no una efeméride.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["Distancia", `${formatScientific(physics.distance)} m`],
                ["Velocidad orbital", `${formatScientific(physics.speed, 4)} m/s`],
                ["Velocidad angular", `${formatScientific(physics.angularVelocity)} rad/s`],
                ["Aceleración centrípeta", `${formatScientific(physics.centripetalAcceleration)} m/s²`],
                ["Fuerza gravitacional", `${formatScientific(physics.gravitationalForce)} N`],
                ["Energía cinética Ec", `${formatScientific(physics.kineticEnergy)} J`],
                ["Energía potencial Ep", `${formatScientific(physics.potentialEnergy)} J`],
                ["Energía total E", `${formatScientific(physics.totalEnergy)} J`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 font-display text-lg">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Periodos de referencia: {physics.orbitalPeriodDays.toFixed(2).replace(".", ",")} d siderales · {physics.synodicPeriodDays.toFixed(2).replace(".", ",")} d sinódicos.</p>
          </div>
          <div>
            <h3 className="font-display text-2xl">Fórmulas y verificaciones</h3>
            <div className="mt-4 grid gap-3">
              {[
                ["Gravitación", "F = G·M·m/r²", `${formatScientific(G)} · ${formatScientific(M_EARTH)} · ${formatScientific(M_MOON)} / (${formatScientific(physics.distance)})²`],
                ["Velocidad orbital", "v = √(GM/r)", `√(${formatScientific(G)} · ${formatScientific(M_EARTH)} / ${formatScientific(physics.distance)}) = ${formatScientific(physics.speed, 4)} m/s`],
                ["Velocidad angular", "ω = 2π/T", `2π / ${formatScientific(LUNAR_SIDEREAL_PERIOD)}`],
                ["Aceleración", "a_c = v²/r", `(${formatScientific(physics.speed)})² / ${formatScientific(physics.distance)}`],
                ["Energía cinética", "Ec = ½mv²", `½ · ${formatScientific(M_MOON)} · (${formatScientific(physics.speed)})²`],
                ["Energía potencial", "Ep = −GMm/r", `−${formatScientific(G)} · ${formatScientific(M_EARTH)} · ${formatScientific(M_MOON)} / ${formatScientific(physics.distance)}`],
              ].map(([title, formula, substitution]) => (
                <div key={title} className="rounded-lg bg-secondary p-3">
                  <p className="text-sm text-primary">{title}: {formula}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{substitution}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-border p-3 text-sm">
              <p>Velocidad cinemática 2πr/T: <b>{formatScientific(physics.kinematicSpeed, 4)} m/s</b> ({physics.kinematicSpeedDifferencePercent.toFixed(2).replace(".", ",")}% frente a v dinámica).</p>
              <p className="mt-1">Periodo de Kepler: <b>{physics.keplerPeriodDays.toFixed(6).replace(".", ",")} d</b> ({physics.keplerPeriodDifferencePercent.toFixed(2).replace(".", ",")}% frente al sideral observado).</p>
              <p className="mt-1 text-xs text-muted-foreground">F/m = a_c y Ec = −Ep/2: identidades del modelo dinámico.</p>
            </div>
          </div>
        </section>
      </div>
      <PhaseModelSection ageDays={age} readout={phaseModelReadout} />
    </div>
  );
}
