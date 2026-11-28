# LunaLab

LunaLab es un simulador educativo del sistema Sol-Tierra-Luna desarrollado para estudiar, de forma visual e interactiva, cómo la posición relativa de la Luna determina sus fases.

El proyecto está orientado a Física y Mecánica. Permite observar un movimiento orbital circular simplificado, consultar magnitudes físicas, visualizar vectores y revisar las ecuaciones que explican la posición y la iluminación lunar.

## ¿Para qué sirve?

LunaLab ayuda a comprender:

- cómo la Luna orbita alrededor de la Tierra;
- cómo la Tierra y la Luna se mueven respecto al Sol;
- por qué la fase lunar depende de la geometría Sol-Tierra-Luna;
- la diferencia entre periodo sideral y periodo sinódico;
- la relación entre posición, iluminación y fase lunar;
- conceptos de gravitación, velocidad orbital, aceleración y energía;
- la rotación síncrona de la Luna y la cara visible desde la Tierra.

El simulador no reemplaza una efeméride astronómica profesional. Su objetivo es educativo: mostrar las relaciones matemáticas y físicas principales mediante un modelo controlado y fácil de explorar.

## Funcionalidades principales

- Consulta de la fase lunar para una fecha seleccionada.
- Simulación interactiva del ciclo sinódico.
- Control de reproducción, pausa, velocidad y avance por días.
- Visualización de posición, velocidad, aceleración y fuerza gravitacional.
- Lectura de distancia, velocidad orbital, energía y otras magnitudes en unidades SI.
- Sección de ecuaciones de posición y fases con explicaciones accesibles.
- Comparación entre iluminación geométrica, aproximación de Sol lejano y estado del simulador.
- Validación matemática mediante pruebas unitarias y valores de referencia.

## Tecnologías utilizadas

- React 19
- TypeScript
- Vite
- TanStack Start y TanStack Router
- Tailwind CSS 4
- Radix UI y componentes basados en shadcn/ui
- Lucide React para iconos
- Vitest para pruebas unitarias
- ESLint y Prettier para calidad y formato

## Requisitos e instalación

Se necesita Node.js y npm.

```bash
git clone <url-del-repositorio>
cd Luna
npm install
npm run dev
```

Vite mostrará la dirección local, normalmente `http://localhost:5173`.

## Comandos disponibles

```bash
npm run dev          # Servidor de desarrollo
npm test             # Ejecuta todas las pruebas
npx tsc --noEmit     # Comprueba los tipos de TypeScript
npm run build        # Genera la compilación de producción
npm run preview      # Previsualiza la compilación de producción
npm run lint         # Ejecuta ESLint
npm run format       # Formatea los archivos con Prettier
```

## Modelo matemático

El modelo utiliza un sistema de coordenadas heliocéntrico bidimensional, con origen en el Sol y movimientos circulares uniformes en el mismo plano.

### Posición de la Tierra

```text
R_T(t) = R · (cos θT, sin θT)
θT = θT0 + ωT · t
ωT = 2π / PT
```

`R` es la distancia media Tierra-Sol, `PT` es el periodo sideral de la Tierra y `t` es el tiempo desde la luna nueva de referencia.

### Posición de la Luna

```text
R_M(t) = R_T(t) + r · (cos θL, sin θL)
θL = π + ωL · t
ωL = 2π / PL
```

`r` es la distancia media Tierra-Luna y `PL` es el periodo orbital sideral de la Luna. El ángulo inicial `π` coloca la Luna entre el Sol y la Tierra en `t = 0`, correspondiente a la luna nueva del modelo.

### Ángulo relativo y periodo sinódico

```text
ψ = ψ0 + (ωL − ωT) · t
```

El periodo necesario para que se repita una misma fase se obtiene mediante:

```text
1 / Psin = 1 / PL − 1 / PT
```

Por eso el periodo sinódico es aproximadamente `29,53 días`, mientras que el periodo sideral lunar es aproximadamente `27,32 días`.

### Distancia entre el Sol y la Luna

```text
ρ² = R² + r² + 2Rr · cos(θL − θT)
```

En luna nueva, el modelo produce aproximadamente `ρ = R − r`. En luna llena, produce `ρ = R + r`.

### Fracción iluminada

La fracción geométrica iluminada se obtiene a partir del ángulo de fase `i`, formado por las direcciones Luna→Sol y Luna→Tierra:

```text
k = (1 + cos i) / 2
```

- `k = 0`: luna nueva.
- `k ≈ 0,5`: cuarto creciente o menguante.
- `k = 1`: luna llena.

El simulador también muestra la aproximación de Sol lejano `k ≈ (1 + cos ψ) / 2`. La diferencia es pequeña porque la distancia Tierra-Luna es mucho menor que la distancia Tierra-Sol.

### Gravitación y movimiento orbital

```text
F = G · m1 · m2 / r²
v = √(GM/r)
v_cinemática = 2πr / T
a_c = v² / r
Ec = ½mv²
Ep = −GMm / r
```

La velocidad dinámica `v = √(GM/r)` se usa para la aceleración, los vectores y las energías. `2πr/T` se conserva como velocidad cinemática derivada del periodo sideral observado. Las constantes físicas se encuentran centralizadas en `src/domain/physics/constants.ts` y se expresan en unidades del Sistema Internacional.

## Estructura del proyecto

```text
src/
├── components/              Componentes visuales y simulación
│   ├── MoonDisc.tsx
│   ├── OrbitSimulation.tsx
│   ├── PhaseModelSection.tsx
│   └── ui/                  Componentes reutilizables
├── content/                 Textos explicativos de las ecuaciones
├── domain/physics/          Lógica matemática y física
├── lib/                     Fases lunares y formato numérico
├── routes/                  Rutas de TanStack
└── test/                    Pruebas unitarias
```

Módulos principales:

- `src/lib/moon.ts`: edad lunar, iluminación simplificada y clasificación en ocho fases.
- `src/domain/physics/constants.ts`: constantes físicas del sistema Tierra-Luna y Tierra-Sol.
- `src/domain/physics/lunarPosition.ts`: posiciones heliocéntricas, distancia Sol-Luna e iluminación geométrica.
- `src/domain/physics/lunarSystemState.ts`: estado matemático compartido de fase y órbita.
- `src/domain/physics/phaseModelReadout.ts`: valores preparados para explicar la posición y la fase.
- `src/domain/physics/orbitalModel.ts`: vectores de posición, velocidad y aceleración.
- `src/domain/physics/gravity.ts`: ley de gravitación universal.
- `src/domain/physics/energy.ts`: energía cinética y potencial gravitacional.

## Cómo continuar desarrollando

La lógica física debe permanecer separada de los componentes de React:

1. Añade o modifica ecuaciones dentro de `src/domain/physics/`.
2. Valida entradas y unidades en las funciones del dominio.
3. Agrega pruebas en `src/test/` antes de conectarlas a la interfaz.
4. Expón al componente un estado o readout preparado para mostrar.
5. Mantén los componentes enfocados en presentación, controles y accesibilidad.
6. Ejecuta las validaciones antes de integrar cambios:

```bash
npm test
npx tsc --noEmit
git diff --check
```

## Limitaciones físicas

El modelo actual utiliza órbitas circulares y coplanarias, distancia media Tierra-Luna, periodos orbitales medios, movimiento uniforme y una representación bidimensional. También usa la aproximación de Sol lejano para parte de la iluminación.

No se modelan la excentricidad real de la órbita lunar, su inclinación orbital, perturbaciones gravitacionales, libración, eclipses ni una efeméride de alta precisión.

## Documentación adicional

- [`docs/CODIGO_LOGICA_LUNALAB.md`](docs/CODIGO_LOGICA_LUNALAB.md): arquitectura y ecuaciones implementadas.
- [`docs/VALIDACION_LUNALAB.md`](docs/VALIDACION_LUNALAB.md): resultados de validación y comparación con referencias.
- [`docs/RESUMEN_PARA_ENTREGABLE.md`](docs/RESUMEN_PARA_ENTREGABLE.md): resumen académico del modelo.

## Contexto

LunaLab es un proyecto educativo universitario para estudiar Física y Mecánica mediante una simulación interactiva del sistema Tierra-Luna.
