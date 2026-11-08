# Informe de auditoría técnica de LunaLab

Fecha de revisión: 2026-11-08  
Alcance: inspección del repositorio sin modificar el código fuente, sin instalar dependencias y sin implementar funcionalidades.

## 1. Resumen ejecutivo

LunaLab es una aplicación web educativa construida con React, TypeScript, Vite y TanStack Start. Su interfaz representa las fases de la Luna mediante SVG, permite consultar una fase aproximada a partir de una fecha y contiene una animación interactiva del sistema Sol-Tierra-Luna.

El proyecto tiene una separación inicial razonable entre rutas, componentes visuales y lógica lunar. La lógica matemática existente está concentrada en `src/lib/moon.ts` y calcula edad lunar, ángulo de fase, fracción iluminada y una fase nominal entre ocho categorías.

La conclusión principal de la auditoría es:

- La parte visual y de interacción está implementada.
- El cálculo simplificado de fases lunares sí existe y se usa en la interfaz.
- La animación orbital utiliza variables matemáticas, pero no es un modelo físico completo ni usa unidades físicas reales.
- Las fórmulas de mecánica clásica aparecen como texto educativo y como valores estáticos; no están implementadas como funciones de cálculo.
- Los vectores mostrados son líneas SVG con dirección esquemática y escala arbitraria, no vectores físicos derivados de masa, velocidad, aceleración o fuerza.
- La aplicación no tiene backend, persistencia, API astronómica ni base de datos.

Estimación orientativa del avance funcional respecto al objetivo universitario completo: **aproximadamente 45 %**. La interfaz demostrable está bastante avanzada, pero la parte de física computable todavía es inicial. Esta cifra es una valoración técnica, no una métrica automática.

## 2. Tecnologías y arquitectura

### Tecnologías detectadas

Las versiones declaradas están en `package.json`:

| Área | Tecnología | Versión declarada |
|---|---|---:|
| UI | React | `^19.2.0` |
| Lenguaje | TypeScript | `^5.8.3` |
| Bundler/desarrollo | Vite | `8.1.5` |
| Framework full-stack/SSR | TanStack Start | `1.168.60` |
| Routing | TanStack Router | `1.170.41` |
| Estado/cache | TanStack React Query | `^5.101.1` |
| Estilos | Tailwind CSS | `^4.2.1` |
| Componentes accesibles | Radix UI | varias versiones `1.x`/`2.x` |
| Componentes estilo shadcn | configuración en `components.json` | estilo `new-york` |
| Iconos | Lucide React | `^0.575.0` |
| Tests | Vitest | `^4.1.10` |
| Tests de React | Testing Library | `^16.0.0` |
| Calidad | ESLint, Prettier | configurados |
| Empaquetado servidor | Nitro | `3.0.260603-beta` |
| Integración del entorno | `@lovable.dev/vite-tanstack-config` | `2.26.5` |

También existen dependencias para formularios, gráficos, calendarios, carruseles y componentes UI (`recharts`, `react-hook-form`, `date-fns`, `embla-carousel-react`, entre otras), pero la funcionalidad actual de LunaLab no depende de un gráfico externo ni de Canvas o Three.js.

### Estructura de alto nivel

```text
Luna/
├── public/                  Recursos estáticos
├── src/
│   ├── components/          Componentes de interfaz y simulación
│   ├── hooks/               Hooks reutilizables
│   ├── lib/                 Lógica de dominio y utilidades
│   ├── routes/              Rutas basadas en archivos
│   ├── test/                Pruebas unitarias y de routing
│   ├── router.tsx           Creación del router
│   ├── start.ts             Configuración de TanStack Start/middleware
│   ├── server.ts            Entrada del servidor y normalización de errores
│   ├── styles.css           Sistema visual y Tailwind
│   └── routeTree.gen.ts     Árbol de rutas generado automáticamente
├── package.json             Scripts y dependencias
├── package-lock.json        Lockfile de npm
├── vite.config.ts           Configuración Vite/TanStack/Lovable
├── tsconfig.json            Configuración TypeScript
├── vitest.config.ts         Configuración de pruebas
└── eslint.config.js         Configuración ESLint/Prettier
```

### Modelo de ejecución

`vite.config.ts` usa `@lovable.dev/vite-tanstack-config` y configura la entrada de servidor en `src/server.ts`. `src/start.ts` crea la instancia de TanStack Start y agrega middleware de manejo de errores y protección CSRF para funciones de servidor.

`src/router.tsx` crea un `QueryClient` nuevo y un router con el árbol generado. `src/routes/__root.tsx` envuelve las rutas con `QueryClientProvider`, define el HTML global, metadata, estilos y los límites de error.

La ruta disponible actualmente es `/`, definida en `src/routes/index.tsx`. El proyecto usa routing basado en archivos; `src/routeTree.gen.ts` no debe editarse manualmente.

### Estado y persistencia

El estado actual es local a los componentes mediante `useState`, `useEffect` y `useRef`. No hay:

- Base de datos.
- Autenticación.
- Almacenamiento local.
- API propia.
- Servicio astronómico externo.
- Carga de datos remotos.

Aunque React Query está configurado globalmente, no hay queries ni mutations utilizadas por la página actual.

## 3. Inventario de funcionalidades

| Funcionalidad | Archivo(s) | Estado | Qué hace realmente | Observaciones |
|---|---|---|---|---|
| Página principal | `src/routes/index.tsx:8-20`, `151-197` | Implementada | Renderiza todas las secciones de LunaLab en `/`. | La ruta concentra mucho contenido en un solo archivo. |
| Navegación interna | `src/routes/index.tsx:22-47` | Implementada | Usa enlaces a anchors (`#inicio`, `#fases`, `#simulacion`, `#fisica`) y menú móvil local. | No es navegación entre páginas. |
| Hero inicial | `src/routes/index.tsx:49-72` | Visual | Muestra Sol, Tierra y una Luna con ángulo fijo `Math.PI`. | No está conectado con la simulación. |
| Galería de ocho fases | `src/routes/index.tsx:111-131`, `src/lib/moon.ts:18-27` | Parcialmente implementada | Recorre `PHASES` y dibuja cada fase con ángulos `i / 8 * 2π`. | Los nombres y descripciones son constantes; la distribución angular sí produce ilustraciones distintas. |
| Consulta por fecha | `src/routes/index.tsx:74-109` | Implementada, simplificada | Convierte la fecha a mediodía UTC y llama a `moonAgeDays`, `angleFromAge`, `phaseAt` e `illumination`. | Es un modelo aproximado y no una efeméride astronómica de alta precisión. |
| Edad lunar | `src/lib/moon.ts:7-10`; uso en `index.tsx:78,100` y `OrbitSimulation.tsx:104` | Implementada, simplificada | Calcula días desde una luna nueva de referencia y aplica módulo del mes sinódico. | No usa fecha juliana ni correcciones orbitales. |
| Porcentaje iluminado | `src/lib/moon.ts:15-16`; uso en `index.tsx:101` y `OrbitSimulation.tsx:105` | Implementada, simplificada | Calcula `(1 - cos(ángulo)) / 2` y lo muestra como porcentaje redondeado. | Es coherente con el modelo angular idealizado. |
| Determinación de fase | `src/lib/moon.ts:29-34` | Implementada, discretizada | Divide el ciclo en ocho sectores y redondea al sector más cercano. | No calcula el instante exacto de cada fase real. |
| Simulación Sol-Tierra-Luna | `src/components/OrbitSimulation.tsx:8-140` | Parcialmente implementada | Actualiza una edad lunar, calcula una posición circular y sincroniza la vista orbital con `MoonDisc`. | El modelo es geométrico y visual; no integra la dinámica de Newton. |
| Movimiento orbital | `src/components/OrbitSimulation.tsx:16-41` | Animación matemática | Usa `requestAnimationFrame`, tiempo transcurrido y funciones seno/coseno para mover la Luna en un círculo. | La velocidad está definida como `2` días simulados por segundo a velocidad 1, no como km/s. |
| Vista ampliada de la Luna | `src/components/MoonDisc.tsx:4-37` | Implementada visualmente | Dibuja un disco SVG con clipping, gradiente, mares y terminador. | Recibe el mismo ángulo que la simulación y la consulta por fecha. |
| Iluminación en la vista orbital | `src/components/OrbitSimulation.tsx:79-81` | Visual simplificada | Dibuja una mitad iluminada fija hacia el Sol representado a la izquierda. | No calcula una intersección de rayos o iluminación 3D; la coherencia depende de la geometría 2D asumida. |
| Controles de reproducción y pausa | `src/components/OrbitSimulation.tsx:116-120` | Implementada | Cambia el estado `playing` y activa/desactiva el ciclo de `requestAnimationFrame`. | El comportamiento es local y funcional. |
| Reinicio y avance/retroceso | `src/components/OrbitSimulation.tsx:31,121-122` | Implementada | Avanza o retrocede un día simulado y reinicia en edad cero. | Los pasos son días del modelo, no integración física. |
| Control de velocidad | `src/components/OrbitSimulation.tsx:6,123-126` | Implementada visual/funcional | Usa multiplicadores `0.5`, `1`, `2` y `4`. | Multiplica el tiempo de simulación, no una velocidad orbital física. |
| Mostrar órbitas | `src/components/OrbitSimulation.tsx:12,67-76` | Implementada visualmente | Muestra u oculta el arco de la órbita terrestre y el círculo lunar. | El arco terrestre es fijo y la Tierra no se traslada. |
| Mostrar vectores | `src/components/OrbitSimulation.tsx:13,82-86` | Visual solamente | Muestra una flecha tangencial y una flecha hacia la Tierra. | Sus magnitudes son arbitrarias y no derivan de fórmulas físicas. |
| Datos físicos | `src/routes/index.tsx:133-140` | Visual estática | Presenta distancia, periodos, velocidad y fuerza como strings. | No se calculan en tiempo de ejecución. |
| Fórmulas educativas | `src/routes/index.tsx:142-149,176-187` | Visual estática | Renderiza fórmulas y explicaciones como tarjetas. | La presencia de una fórmula en pantalla no implica que esté implementada. |
| Manejo de errores | `src/routes/__root.tsx`, `src/start.ts`, `src/server.ts` | Implementado | Tiene 404, error boundary, captura y respuesta HTML de error SSR. | Es infraestructura de la plantilla, no parte del modelo físico. |

## 4. Auditoría de fórmulas físicas

La búsqueda del repositorio muestra que las fórmulas aparecen como texto en `DATA` y `FORMULAS` dentro de `src/routes/index.tsx`, pero no se encontraron funciones que reciban masas, radios, tiempos o velocidades y devuelvan resultados físicos.

| Fórmula solicitada | ¿Está calculada? | Ubicación encontrada | Variables y unidades reales | Resultado mostrado | Evaluación |
|---|---|---|---|---|---|
| `F = G * M * m / r²` | No | Texto en `src/routes/index.tsx:138,143` | No existen `G`, `M`, `m` ni `r` como variables de cálculo. | La tarjeta muestra aproximadamente `1,98 × 10²⁰ N` como string. | La fórmula escrita es correcta, pero no puede auditarse el resultado desde el código porque no se calculan sus entradas. |
| `F = m * a` | No | Texto en `src/routes/index.tsx:144` | No existen masa ni aceleración calculadas. | Solo explicación textual. | No implementada. |
| `ω = 2π / T` | No | Texto en `src/routes/index.tsx:146` | No existe `T` físico en segundos ni una función de velocidad angular. | Solo explicación textual. | No implementada. |
| `v = 2πr / T` | No | Texto descriptivo en `src/routes/index.tsx:137`; la tarjeta también muestra `v = √(G·M/r)` en línea 145 | No existen radio orbital ni periodo en segundos usados en una función. | La tarjeta muestra `≈ 1,02 km/s` como string. | El valor es estático. Además, las dos formas mostradas corresponden a supuestos distintos y deberían explicarse o unificarse cuando se implemente el modelo. |
| `a_c = v² / r` | No | No se encontró implementación ni tarjeta específica. | No existen variables físicas para `v` y `r`. | No se muestra un resultado calculado. | Ausente. |
| `Ec = 1/2 * m * v²` | No | Texto en `src/routes/index.tsx:148` | No existen masa y velocidad calculadas. | Solo fórmula textual. | No implementada. |
| `Ep = -G * M * m / r` | No | Texto en `src/routes/index.tsx:148` | No existen masas, constante gravitacional ni radio físico en código. | Solo fórmula textual. | No implementada. |

### Vectores

En `src/components/OrbitSimulation.tsx:40-41` se definen:

```ts
const vx = R * Math.sin(angle) * 0.5;
const vy = R * Math.cos(angle) * 0.5;
```

Estas expresiones producen una dirección tangencial en coordenadas SVG. `R` vale `80` píxeles y el factor `0.5` no representa una magnitud física ni tiene unidades físicas. La flecha de fuerza de las líneas `84-85` apunta hacia la Tierra mediante una fracción fija `0.45` de la distancia visual.

Por tanto, los vectores son una representación conceptual correcta en dirección —velocidad tangente y fuerza hacia la Tierra—, pero no son el resultado de `F = m a`, `a = v²/r` ni de un cálculo vectorial con unidades.

### Valores físicos estáticos

En `src/routes/index.tsx:133-140` están escritos directamente como texto:

- `384 400 km` para la distancia media Tierra-Luna.
- `27,32 días` para el periodo sidéreo.
- `29,53 días` para el periodo sinódico.
- `≈ 1,02 km/s` para velocidad orbital.
- `≈ 1,98 × 10²⁰ N` para fuerza gravitacional.
- `0 – 29,5 días` para el ciclo lunar.

Son valores de referencia plausibles, pero la aplicación no muestra las masas, la constante gravitacional, las conversiones de días a segundos ni el procedimiento que produce esos resultados.

## 5. Auditoría del algoritmo de fases lunares

### Algoritmo existente

El cálculo actual se encuentra en `src/lib/moon.ts`:

1. Define el mes sinódico como `29.530588853` días en la línea 2.
2. Define el periodo sidéreo `27.321661` días en la línea 3, aunque este valor no participa en los cálculos actuales.
3. Define como referencia una luna nueva aproximada en `2000-01-06 18:14 UTC` en la línea 5.
4. `moonAgeDays` calcula la diferencia entre la fecha recibida y la referencia, convierte milisegundos a días y aplica módulo del mes sinódico en las líneas 7-10.
5. `angleFromAge` convierte la edad lunar en un ángulo de `0` a `2π` en la línea 13.
6. `illumination` calcula la fracción iluminada ideal con `(1 - cos(angle)) / 2` en la línea 16.
7. `phaseIndex` divide el ciclo en ocho partes, desplaza media fase y aplica `floor` y módulo 8 en las líneas 29-32.
8. `phaseAt` obtiene el objeto descriptivo correspondiente del array `PHASES` en la línea 34.

La consulta de fecha usa `new Date(value + "T12:00:00Z")` en `src/routes/index.tsx:78`, evitando que el valor de un campo de fecha sea interpretado accidentalmente en una zona horaria local distinta.

### Qué sí calcula

- Edad aproximada desde una luna nueva de referencia.
- Ángulo ideal de fase.
- Fracción geométrica iluminada.
- Clasificación en ocho sectores.
- La representación visual se actualiza con esos valores.

### Qué no calcula

- Fecha juliana.
- Efemérides solares o lunares.
- Longitud eclíptica.
- Inclinación orbital de la Luna.
- Excentricidad orbital.
- Variación real de la velocidad orbital.
- Correcciones por zona horaria, ΔT o perturbaciones.
- Instantes astronómicos exactos de cuarto creciente, luna llena, etc.
- Eclipses o sombra de la Tierra.

La descripción del propio archivo (`src/lib/moon.ts:1`) reconoce que se trata de un modelo educativo simplificado y no de alta precisión. La advertencia de `src/routes/index.tsx:91` también comunica que puede diferir aproximadamente ±1 día.

## 6. Identificación de datos mock y valores estáticos

### Datos estáticos intencionales

| Hallazgo | Ubicación | Clasificación |
|---|---|---|
| Array `PHASES` con nombres, descripciones y tendencias | `src/lib/moon.ts:18-27` | Catálogo educativo estático; es válido como contenido, no como cálculo. |
| Array `DATA` con datos físicos | `src/routes/index.tsx:133-140` | Mock/presentación estática; no se genera desde constantes físicas. |
| Array `FORMULAS` | `src/routes/index.tsx:142-149` | Contenido educativo estático. |
| `SPEEDS = [0.5, 1, 2, 4]` | `src/components/OrbitSimulation.tsx:6` | Configuración fija de UI. |
| Geometría `ex = 330`, `ey = 160`, `R = 80` | `src/components/OrbitSimulation.tsx:37` | Escala visual arbitraria en píxeles. |
| `1x = 2 días/segundo` | `src/components/OrbitSimulation.tsx:22` | Tiempo de animación elegido para la demostración, no velocidad física. |
| Datos de mares lunares SVG | `src/components/MoonDisc.tsx:27-32` | Decoración visual estática. |
| Hero con `MoonDisc angle={Math.PI}` | `src/routes/index.tsx:66` | Ilustración fija de portada. |
| Arco de órbita terrestre | `src/components/OrbitSimulation.tsx:66-69` | Forma SVG fija; no representa una integración de la órbita terrestre. |

### Datos que sí cambian mediante lógica

- `age` cambia durante la animación o mediante el slider.
- `angle` se deriva de `age`.
- `phase` se deriva de `phaseIndex(age)`.
- `illumination` se deriva del ángulo.
- La fecha consultada se transforma en una edad lunar aproximada.
- El disco SVG cambia su terminador, orientación y área iluminada según el ángulo.

La conclusión es que la aplicación no es una maqueta puramente estática, pero tampoco es aún un simulador físico. Es una visualización interactiva sobre un modelo lunar angular simplificado.

## 7. Archivos clave y ubicación recomendada de la lógica

### Organización actual que conviene reutilizar

| Responsabilidad actual | Archivo | Recomendación |
|---|---|---|
| Cálculo de edad, ángulo, iluminación y fase | `src/lib/moon.ts` | Reutilizar como núcleo del algoritmo de fases; ampliar con funciones pequeñas y testeables. |
| Visualización de disco lunar | `src/components/MoonDisc.tsx` | Mantener como componente visual puro. |
| Estado y controles de la simulación | `src/components/OrbitSimulation.tsx` | Mantener la UI, pero recibir un modelo calculado desde una capa de dominio. |
| Composición de la página | `src/routes/index.tsx` | Mantener la ruta, pero dividir las secciones en componentes cuando se incorporen más cálculos. |
| Pruebas del modelo lunar | `src/test/moon.test.ts` | Ampliar con pruebas de física, unidades y casos límite. |

### Estructura recomendada futura

Sin crearla todavía, una organización posible sería:

```text
src/
├── domain/
│   ├── physics/
│   │   ├── constants.ts       Constantes G, masas y unidades base
│   │   ├── gravity.ts         Fuerza gravitacional y aceleración
│   │   ├── orbital.ts         v, ω, ac y posición orbital
│   │   └── energy.ts          Energía cinética y potencial
│   └── moon/
│       ├── constants.ts       Periodos y referencia lunar
│       ├── phases.ts          Edad, ángulo, iluminación y clasificación
│       └── ephemeris.ts       Algoritmo de fecha/fase si se aumenta la precisión
├── components/
│   ├── simulation/
│   │   ├── OrbitSimulation.tsx
│   │   ├── SolarSystemSvg.tsx
│   │   ├── SimulationControls.tsx
│   │   └── PhysicsReadout.tsx
│   └── moon/
│       └── MoonDisc.tsx
└── test/
    ├── moon.test.ts
    ├── physics.test.ts
    └── orbital.test.ts
```

No es necesario crear todos esos archivos de inmediato. Para la siguiente etapa sería suficiente extraer constantes físicas y crear funciones puras para gravedad y órbita, conservando `moon.ts` y `MoonDisc.tsx`.

## 8. Evaluación de la simulación visual

### Tecnología de renderizado

La simulación usa **SVG dentro de React** en `src/components/OrbitSimulation.tsx:50-90`. El disco lunar también usa SVG en `src/components/MoonDisc.tsx:14-35`. No se utilizan Canvas, Three.js, WebGL ni una biblioteca de gráficos.

### Posiciones dependientes de variables

La posición de la Luna sí depende del ángulo:

```ts
const mx = ex - R * Math.cos(angle);
const my = ey + R * Math.sin(angle);
```

Esto representa un círculo en coordenadas de pantalla. La fórmula es válida para una órbita circular ideal en un plano, pero `R` está expresado en píxeles y no en kilómetros.

### Movimiento orbital

El movimiento está controlado por `requestAnimationFrame` en `src/components/OrbitSimulation.tsx:16-29`. La aplicación mide el tiempo entre frames y aumenta la edad lunar. Es una animación temporal determinista, no una integración de ecuaciones diferenciales.

### Iluminación y sincronización

La vista ampliada recibe `angle` en la línea 100. La consulta por fecha también envía `angleFromAge(result.age)` a `MoonDisc` en `src/routes/index.tsx:96`. Por tanto, ambas vistas están sincronizadas con el mismo ángulo del modelo.

El SVG orbital dibuja la parte iluminada de la Luna con una ruta fija orientada hacia la izquierda (`src/components/OrbitSimulation.tsx:79-81`). Esto es coherente con el Sol que se dibuja a la izquierda en el esquema, pero no se calcula a partir de una posición vectorial general del Sol.

### Limitaciones visuales

- La Tierra permanece fija en la escena.
- La órbita terrestre es un arco decorativo y no mueve la Tierra.
- La Luna gira en un círculo perfecto.
- Las distancias y tamaños no están a escala.
- La animación no representa velocidad variable ni excentricidad.
- La iluminación no contempla inclinación orbital ni eclipses.
- Los vectores no tienen magnitud física.
- Los identificadores SVG de markers y gradients son constantes (`sun`, `arr`, `arrV`, `arrF`); si se renderizan múltiples instancias del componente en una misma página, convendría estudiar colisiones de IDs.

### Conexión recomendada entre modelo y visualización

La capa física debería devolver un estado explícito, por ejemplo:

```ts
type OrbitalState = {
  timeSeconds: number;
  positionKm: { x: number; y: number };
  velocityKmPerSecond: { x: number; y: number };
  accelerationKmPerSecond2: { x: number; y: number };
  forceNewton: { x: number; y: number };
  phaseAngle: number;
  illumination: number;
};
```

El componente SVG debería convertir ese estado físico a coordenadas de pantalla mediante una escala visual independiente. Así se evita mezclar kilómetros, segundos y píxeles en la misma fórmula.

## 9. Pruebas, calidad y problemas encontrados

### Pruebas existentes

`src/test/moon.test.ts` contiene tres casos:

1. La fecha de referencia produce luna nueva (`líneas 5-7`).
2. La mitad del mes sinódico produce luna llena y fracción iluminada cercana a 1 (`líneas 8-11`).
3. Una fecha de luna llena de 2024 se clasifica como fase 4 (`líneas 12-14`).

`src/test/app-routing.test.tsx` comprueba que `/` coincide con una ruta real y no cae en la ruta raíz sin coincidencia (`líneas 9-16`).

### Comprobaciones ejecutadas

Se ejecutaron comandos de lectura, pruebas y validación sin instalar dependencias ni modificar archivos:

```text
npm test       2 archivos de prueba, 4 pruebas: todas pasaron
npx tsc --noEmit: pasó sin errores
npm run lint: falló
```

El fallo de ESLint reporta aproximadamente 5.330 errores de Prettier y 6 warnings. La mayoría indican `Delete ␍`, es decir, diferencias de finales de línea CRLF/LF en Windows. También hay algunos avisos de formato de Prettier en JSX. No se detectó en ese resultado un error de tipado o una fórmula incorrecta; es un problema de formato/configuración que conviene tratar por separado.

No se ejecutó `npm run build` durante esta auditoría para no generar artefactos de compilación sin necesidad. Puede ejecutarse como comprobación adicional.

### Problemas y riesgos

1. **Las fórmulas físicas son solo presentación.** El mayor riesgo académico es confundir las tarjetas de texto con una implementación funcional.
2. **Unidades mezcladas conceptualmente.** La animación usa días simulados y píxeles; todavía no existe una conversión controlada a segundos, kilómetros o metros.
3. **`SIDEREAL_DAYS` no se usa.** Está declarado en `src/lib/moon.ts:3`, pero no participa actualmente en el cálculo orbital.
4. **La ruta principal concentra demasiadas responsabilidades.** `src/routes/index.tsx` incluye contenido, estructura, datos de presentación y lógica de consulta.
5. **Datos físicos sin fuente computable.** El footer menciona NASA en `src/routes/index.tsx:192`, pero no hay una fuente de datos importada o consultada en runtime.
6. **Precisión de fases limitada.** El algoritmo de referencia fija es útil didácticamente, pero no debe presentarse como efeméride exacta.
7. **Vectores esquemáticos.** El usuario puede interpretar las flechas como magnitudes reales cuando actualmente solo muestran dirección conceptual.
8. **Cobertura de pruebas reducida.** No hay pruebas de `MoonDisc`, `OrbitSimulation`, controles, accesibilidad, límites de fechas, unidades ni funciones físicas porque estas últimas todavía no existen.
9. **Configuración de formato en Windows.** ESLint y Prettier no están alineados con los finales de línea actuales del repositorio.
10. **Dependencias de plantilla.** Hay muchos componentes UI y dependencias disponibles que no forman parte de la funcionalidad actual; antes de usarlos conviene verificar si aportan valor.

## 10. Comandos para desarrollar y comprobar

Desde la raíz del proyecto:

```powershell
npm install
npm run dev
```

Validaciones:

```powershell
npm test
npm run lint
npx tsc --noEmit
npm run build
```

El comando `npm run format` modifica archivos, por lo que no debe ejecutarse como validación de solo lectura. El script de `format` está definido como `prettier --write .` en `package.json`.

## 11. Plan técnico recomendado por etapas

### Etapa 1: estabilizar el modelo actual

Archivos a revisar:

- `src/lib/moon.ts`
- `src/test/moon.test.ts`
- `src/routes/index.tsx`

Trabajo:

- Mantener el modelo sinódico simplificado, pero documentar claramente sus supuestos.
- Exponer la fecha de referencia o encapsularla como constante de dominio.
- Añadir pruebas de edad negativa, cambio de ciclo, ángulos `0`, `π` y `2π`, y fechas cercanas a los límites.
- Confirmar que la clasificación de las ocho fases coincide con los intervalos deseados.

Comprobación:

```powershell
npm test
npx tsc --noEmit
```

### Etapa 2: extraer constantes y unidades físicas

Archivos nuevos recomendados:

- `src/domain/physics/constants.ts`
- `src/domain/physics/units.ts` o funciones de conversión equivalentes

Trabajo:

- Definir `G`, masas de la Tierra y la Luna, distancia media y periodos.
- Elegir unidades internas consistentes, preferiblemente SI: kg, m, s, N, J.
- Separar valores físicos de strings de presentación.

Comprobación:

- Tests de conversiones.
- Tests de valores de referencia y tolerancias.
- Verificar explícitamente dimensiones de cada función.

### Etapa 3: implementar mecánica clásica pura

Archivos nuevos recomendados:

- `src/domain/physics/gravity.ts`
- `src/domain/physics/orbital.ts`
- `src/domain/physics/energy.ts`
- `src/test/physics.test.ts`

Trabajo:

- Implementar fuerza gravitacional.
- Implementar aceleración gravitacional y aceleración centrípeta.
- Implementar velocidad orbital y velocidad angular bajo el supuesto de órbita circular.
- Implementar energía cinética y potencial.
- Devolver números o estructuras tipadas, no strings.

Comprobación:

- Comparar con cálculos manuales y valores de referencia.
- Probar unidades y signos, especialmente la energía potencial negativa.
- Verificar que `F ≈ m * ac` en el caso circular elegido.

### Etapa 4: crear un modelo orbital visualmente utilizable

Archivos nuevos o a reorganizar:

- `src/domain/physics/orbital.ts`
- `src/components/OrbitSimulation.tsx`
- Posiblemente `src/components/simulation/SimulationControls.tsx`

Trabajo:

- Definir tiempo de simulación en segundos.
- Calcular posición y velocidad en coordenadas físicas.
- Convertir de coordenadas físicas a coordenadas SVG mediante una escala separada.
- Mostrar unidades junto con los valores físicos.
- Mantener una opción de modelo circular antes de intentar una integración numérica más compleja.

Comprobación:

- La posición debe conservar el radio en la órbita circular.
- La velocidad debe ser tangente.
- La aceleración/fuerza debe apuntar hacia el centro.
- La vista visual y los valores numéricos deben usar el mismo estado orbital.

### Etapa 5: mejorar la fase para fecha seleccionada

Archivos a reutilizar o ampliar:

- `src/lib/moon.ts`
- `src/routes/index.tsx`
- `src/test/moon.test.ts`

Trabajo:

- Mantener el modelo de referencia como modo educativo básico.
- Si el requisito académico lo exige, introducir un algoritmo de mayor precisión en un módulo separado, sin mezclarlo con el renderizado.
- Documentar claramente la precisión esperada y comparar resultados con fechas conocidas.

Comprobación:

- Casos de luna nueva, cuarto creciente, llena y cuarto menguante.
- Comparación con una fuente astronómica de referencia.
- Tolerancia documentada en horas o días.

### Etapa 6: sincronizar iluminación y vectores

Archivos principales:

- `src/components/MoonDisc.tsx`
- `src/components/OrbitSimulation.tsx`
- Nuevos componentes visuales de simulación si se dividen.

Trabajo:

- Recibir del modelo un único estado orbital.
- Derivar la iluminación desde la geometría o desde el ángulo calculado, pero no duplicar reglas en la UI.
- Escalar los vectores visualmente sin alterar sus valores físicos.
- Mostrar leyenda de unidades y aclarar cuando una flecha está normalizada.

Comprobación:

- La luna nueva debe mostrar iluminación cercana a cero.
- La luna llena debe mostrar iluminación cercana a uno.
- El terminador debe cambiar de lado en fases crecientes y menguantes.
- La dirección de la velocidad debe ser perpendicular al radio en la órbita circular.

### Etapa 7: ampliar pruebas y documentación académica

Archivos recomendados:

- `src/test/moon.test.ts`
- `src/test/physics.test.ts`
- `src/test/orbital.test.ts`
- Documentación adicional del modelo y supuestos.

Trabajo:

- Cubrir cálculos, límites, unidades, sincronización y controles principales.
- Documentar qué es un modelo ideal y qué no representa la aplicación.
- Incluir en la exposición ejemplos numéricos reproducibles.

## 12. Conclusión

El proyecto tiene una base visual sólida y una primera capa matemática funcional para el ciclo lunar. La consulta por fecha no es un mock completo: sí calcula edad, ángulo, iluminación y fase con un modelo simplificado. La simulación tampoco es estática: el estado cambia con el tiempo y las posiciones SVG dependen de funciones trigonométricas.

Sin embargo, la mecánica clásica todavía no está implementada como código ejecutable. Las fórmulas de gravedad, Newton, velocidad, aceleración y energía están presentes únicamente como contenido educativo, y los datos físicos son strings estáticos. La animación orbital debe considerarse una demostración geométrica y no un modelo dinámico real.

La ruta más segura para continuar es conservar el diseño y `MoonDisc`, mantener `src/lib/moon.ts` como punto de partida para las fases, y añadir una capa de dominio física independiente con unidades consistentes, funciones puras y pruebas. Después esa capa puede alimentar `OrbitSimulation` mediante un estado orbital común, evitando que la interfaz vuelva a contener constantes físicas o cálculos mezclados con coordenadas SVG.
