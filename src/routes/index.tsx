import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { MoonDisc } from "@/components/MoonDisc";
import { OrbitSimulation } from "@/components/OrbitSimulation";
import { PHASES, SYNODIC_DAYS, angleFromAge, illumination, moonAgeDays, phaseIndex } from "@/lib/moon";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LunaLab — Simulador de las fases de la Luna" },
      { name: "description", content: "Explora las fases de la Luna y su relación con la posición del Sol, la Tierra y la Luna." },
      { property: "og:title", content: "LunaLab — Simulador de las fases de la Luna" },
      { property: "og:description", content: "Simulación educativa Sol-Tierra-Luna con física orbital." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const NAV = [
  ["#inicio", "Inicio"],
  ["#fases", "Fases lunares"],
  ["#simulacion", "Simulación"],
  ["#fisica", "Física"],
] as const;

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <a href="#inicio" className="font-display text-2xl">Luna<span className="text-primary">Lab</span></a>
        <nav className="hidden gap-8 text-sm md:flex">
          {NAV.map(([h, l]) => <a key={h} href={h} className="text-muted-foreground transition-colors hover:text-foreground">{l}</a>)}
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menú" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <nav className="container-x flex flex-col gap-3 pb-4 md:hidden">
          {NAV.map(([h, l]) => <a key={h} href={h} onClick={() => setOpen(false)} className="text-muted-foreground">{l}</a>)}
        </nav>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="inicio" className="starfield">
      <div className="container-x grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-primary">Simulador educativo</p>
          <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl">Explora las fases de la Luna</h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Observa cómo la posición relativa del Sol, la Tierra y la Luna determina lo que vemos en el cielo cada noche, y descubre la física que lo explica.
          </p>
          <a href="#simulacion" className="btn-primary mt-8">Explorar simulación</a>
        </div>
        <div className="relative mx-auto flex items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-sun shadow-sun" aria-hidden />
          <div className="h-px w-16 bg-gradient-to-r from-sun-edge to-transparent" aria-hidden />
          <div className="relative grid h-48 w-48 place-items-center rounded-full border border-dashed border-border">
            <div className="h-14 w-14 rounded-full bg-earth" aria-hidden />
            <div className="absolute -right-5 top-1/2 -translate-y-1/2"><MoonDisc angle={Math.PI} size={40} label="Luna" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DateQuery() {
  const today = new Date().toISOString().slice(0, 10);
  const [value, setValue] = useState(today);
  const [result, setResult] = useState<{ date: string; age: number } | null>(null);
  const query = () => setResult({ date: value, age: moonAgeDays(new Date(value + "T12:00:00Z")) });
  return (
    <section className="container-x py-20">
      <div className="panel grid gap-8 p-6 sm:p-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-4xl">¿Qué fase tenía la Luna?</h2>
          <p className="mt-3 text-muted-foreground">Elige una fecha y calcula la fase con un modelo simplificado del mes sinódico ({SYNODIC_DAYS.toFixed(2)} días).</p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => { e.preventDefault(); query(); }}>
            <label htmlFor="fecha" className="sr-only">Fecha</label>
            <input id="fecha" type="date" value={value} onChange={(e) => setValue(e.target.value)} required
              className="h-11 rounded-lg border border-input bg-secondary px-3 text-foreground [color-scheme:dark]" />
            <button type="submit" className="btn-primary">Consultar</button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">Aproximación educativa: puede diferir ±1 día de las efemérides oficiales.</p>
        </div>
        <div className="flex items-center justify-center gap-6 rounded-xl bg-secondary/50 p-6">
          {result ? (
            <>
              <MoonDisc angle={angleFromAge(result.age)} size={130} label={PHASES[phaseIndex(result.age)].name} />
              <div>
                <p className="text-sm text-muted-foreground">{new Date(result.date + "T12:00:00Z").toLocaleDateString("es", { dateStyle: "long", timeZone: "UTC" })}</p>
                <p className="font-display text-3xl">{PHASES[phaseIndex(result.age)].name}</p>
                <p className="mt-2 text-sm">Edad lunar: <b>{result.age.toFixed(1)} días</b></p>
                <p className="text-sm">Iluminado: <b>{Math.round(illumination(angleFromAge(result.age)) * 100)}%</b></p>
              </div>
            </>
          ) : <p className="text-muted-foreground">El resultado aparecerá aquí.</p>}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section id="fases" className="container-x py-20">
      <h2 className="font-display text-4xl">El ciclo lunar</h2>
      <p className="mt-3 max-w-2xl text-muted-foreground">Las ocho fases principales, vistas desde el hemisferio norte. El Sol siempre ilumina la mitad de la Luna; lo que cambia es cuánto de esa mitad vemos.</p>
      <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PHASES.map((p, i) => (
          <li key={p.name} className="panel panel-hover p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{String(i + 1).padStart(2, "0")}</span>
              {p.trend && <span className={`rounded-full px-2 py-0.5 ${p.trend === "creciente" ? "bg-primary/15 text-primary" : "bg-accent text-accent-foreground"}`}>{p.trend}</span>}
            </div>
            <div className="my-5 flex justify-center"><MoonDisc angle={(i / 8) * Math.PI * 2} size={100} label={p.name} /></div>
            <h3 className="font-display text-xl">{p.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const DATA = [
  ["Distancia Tierra-Luna", "384 400", "km", "Distancia media entre centros."],
  ["Período sidéreo", "27,32", "días", "Una vuelta respecto a las estrellas."],
  ["Período sinódico", "29,53", "días", "De luna nueva a luna nueva; más largo porque la Tierra también avanza alrededor del Sol."],
  ["Velocidad orbital", "≈ 1,02", "km/s", "v = 2πr / T sidéreo."],
  ["Fuerza gravitacional", "≈ 1,98 × 10²⁰", "N", "F = G·M·m / r² con valores medios."],
  ["Ciclo lunar", "0 – 29,5", "días", "Edad de la Luna desde la última luna nueva."],
];

const FORMULAS = [
  ["Gravitación universal", "F = G · M · m / r²", "G: constante gravitacional (6,674×10⁻¹¹ N·m²/kg²); M, m: masas de la Tierra y la Luna; r: distancia entre centros."],
  ["Segunda ley de Newton", "F = m · a", "La fuerza gravitatoria produce la aceleración centrípeta que curva la trayectoria de la Luna."],
  ["Movimiento orbital", "v = √(G · M / r)", "Velocidad de una órbita circular: equilibrio entre gravedad y movimiento."],
  ["Velocidad angular", "ω = 2π / T", "T: período orbital. Indica cuántos radianes recorre la Luna por unidad de tiempo."],
  ["Vectores", "r⃗, v⃗ ⊥ r⃗, F⃗ ∥ −r⃗", "La posición apunta desde la Tierra; la velocidad es tangente; la fuerza apunta hacia la Tierra."],
  ["Energía", "K = ½ m v²   U = −G M m / r", "Energía cinética y potencial gravitacional; su suma se conserva en una órbita ideal."],
];

function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <DateQuery />
        <section id="simulacion" className="container-x py-20">
          <h2 className="font-display text-4xl">Simulación Sol-Tierra-Luna</h2>
          <p className="mt-3 mb-10 max-w-2xl text-muted-foreground">Un solo Sol, una Tierra y una Luna. Ambas vistas están sincronizadas: la fase depende de la geometría, no de la sombra de la Tierra (eso son los eclipses). La traslación terrestre se simplifica en este modelo.</p>
          <OrbitSimulation />
        </section>
        <section className="container-x py-20">
          <h2 className="font-display text-4xl">Datos físicos</h2>
          <p className="mt-3 text-sm text-muted-foreground">Valores medios de referencia; el modelo visual no está a escala.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DATA.map(([n, v, u, e]) => (
              <div key={n} className="panel p-5">
                <p className="text-sm text-muted-foreground">{n}</p>
                <p className="mt-2 font-display text-3xl">{v} <span className="text-base text-primary">{u}</span></p>
                <p className="mt-2 text-sm text-muted-foreground">{e}</p>
              </div>
            ))}
          </div>
        </section>
        <section id="fisica" className="container-x py-20">
          <h2 className="font-display text-4xl">La física detrás de las fases</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {FORMULAS.map(([t, f, e]) => (
              <article key={t} className="panel p-6">
                <h3 className="font-display text-xl">{t}</h3>
                <p className="formula my-4">{f}</p>
                <p className="text-sm text-muted-foreground">{e}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="container-x flex flex-col gap-2 py-10 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <p><span className="font-display text-lg text-foreground">LunaLab</span> · Proyecto educativo sobre las fases lunares.</p>
          <p>HTML · CSS · JavaScript · Datos: NASA Moon Fact Sheet.</p>
        </div>
      </footer>
    </div>
  );
}
