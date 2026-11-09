import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { MoonDisc } from "./MoonDisc";
import { PHASES, SYNODIC_DAYS, phaseIndex } from "@/lib/moon";
import { calculateLunarSystemState } from "@/domain/physics/lunarSystemState";

const SPEEDS = [0.5, 1, 2, 4];

export function OrbitSimulation() {
  const [age, setAge] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showVectors, setShowVectors] = useState(false);
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
  const fx = lunarState.orbit.acceleration.x / lunarState.orbit.centripetalAcceleration;
  const fy = -lunarState.orbit.acceleration.y / lunarState.orbit.centripetalAcceleration;

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
            <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10z" fill="var(--sun-edge)" />
            </marker>
            <marker id="arrV" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10z" fill="var(--earth)" />
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
          {showVectors && (
            <>
              <line x1={mx} y1={my} x2={mx + vx} y2={my + vy} stroke="var(--earth)" strokeWidth="2" markerEnd="url(#arrV)" />
              <line x1={mx} y1={my} x2={mx + fx * R * 0.45} y2={my + fy * R * 0.45} stroke="var(--destructive)" strokeWidth="2" markerEnd="url(#arrF)" />
            </>
          )}
          <text x="50" y="225" textAnchor="middle" className="fill-muted-foreground text-[12px]">Sol</text>
          <text x={ex} y={ey + 40} textAnchor="middle" className="fill-muted-foreground text-[12px]">Tierra</text>
        </svg>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>☀ Dirección de la luz solar →</span>
          {showVectors && <><span className="text-earth">— velocidad v</span><span className="text-destructive">— fuerza F</span></>}
          <span className="italic">Esquema no a escala.</span>
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
          <label className="flex items-center gap-2"><input type="checkbox" checked={showVectors} onChange={(e) => setShowVectors(e.target.checked)} className="accent-primary" />Vectores</label>
          <span className="text-muted-foreground">Ir a fase:</span>
          {PHASES.map((p, i) => (
            <button key={p.name} className={`ctl ${i === idx ? "ctl-active" : ""}`} onClick={() => { setPlaying(false); setAge((i / 8) * SYNODIC_DAYS); }}>{p.name}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
