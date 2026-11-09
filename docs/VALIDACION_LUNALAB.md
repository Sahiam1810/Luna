# Validación de LunaLab

Los resultados de este documento fueron obtenidos ejecutando las funciones de
`physicsReadout.ts` y `validation.ts` con las constantes actuales del proyecto.

## Comparación de magnitudes

| Magnitud | Valor del modelo | Referencia | Error | Fuente |
|---|---:|---:|---:|---|
| Velocidad orbital | 1023,1573 m/s | 1022 m/s | 0,1132 % | NASA Moon Fact Sheet |
| Periodo sinódico | 29,530588853 días | 29,53 días | 0,00199 % | NASA Moon Fact Sheet |
| F/m Luna frente a a_c | 0,00269757 frente a 0,00272334 m/s² | Verificación interna | 0,9551 % | Modelo LunaLab |
| Ec frente a −Ep/2 | 3,84299×10²⁸ frente a 3,80663×10²⁸ J | Verificación interna | 0,9551 % | Modelo LunaLab |

Fuente externa para velocidad media, periodo sinódico y periodo sideral:

- NASA Moon Fact Sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html

## Valores físicos del modelo

```text
Distancia:              384400000 m
Velocidad orbital:      1023.1572982614726 m/s
Velocidad angular:      0.0000026616995272150692 rad/s
Aceleración centrípeta: 0.0027233372970492096 m/s²
Fuerza gravitacional:   198055856502802840000 N
Energía cinética:       3.842989495994564e28 J
Energía potencial:      -7.613267123967741e28 J
Energía total:          -3.7702776279731776e28 J
```

## Eventos astronómicos

El modelo se compara con fechas de eventos reales. La distancia para luna nueva
se mide al límite circular más cercano (`0` o `SYNODIC_DAYS`); para luna llena
se mide respecto a `SYNODIC_DAYS / 2`.

| Evento | Fecha UTC | Edad calculada | Fase del modelo | Diferencia | Fuente |
|---|---|---:|---|---:|---|
| Luna nueva de referencia | 2000-01-06 18:14 | 0,0000 d | Luna nueva | 0,0000 d | `src/lib/moon.ts` |
| Eclipse lunar total | 2026-03-03 11:34:52 | 14,3426 d | Luna llena | 0,4227 d | NASA GSFC |
| Eclipse solar total | 2026-08-12 17:47:05 | 28,9482 d | Luna nueva | 0,5824 d | NASA GSFC |

Fuentes de los eventos:

- Eclipse lunar total del 3 de marzo de 2026: https://eclipse.gsfc.nasa.gov/lunar.html
- Eclipse solar total del 12 de agosto de 2026: https://eclipse.gsfc.nasa.gov/OH/OH2026.html
- La fecha de referencia de luna nueva está definida directamente en `src/lib/moon.ts`.

Todos los eventos quedan dentro del criterio de aceptación de un día. Esto no
convierte al algoritmo en una efeméride: el resultado se beneficia de usar un
mes sinódico medio y puede desviarse para otros eventos.

## Pruebas automatizadas

La ejecución final fue:

```text
11 archivos de prueba aprobados
65 pruebas aprobadas
```

Las pruebas nuevas cubren:

- `validation.test.ts`: error porcentual, referencias y eventos astronómicos.
- `format.test.ts`: formato de números grandes, pequeños y normales.

Las pruebas anteriores continúan cubriendo fases, constantes, gravedad, energía,
movimiento orbital, modelo vectorial y estado único.

## Conclusión

Las referencias externas y las verificaciones internas son coherentes con el
modelo circular simplificado. Las diferencias inferiores al 1 % no deben
interpretarse como precisión astronómica; son una validación educativa de las
escalas y relaciones del modelo actual.
