# Validación de LunaLab

Los valores de este documento fueron generados ejecutando `validation.ts`,
`phaseModelReadout.ts` y las pruebas automatizadas con las constantes actuales.

## Comparación ampliada

| Magnitud | Valor del modelo | Referencia | Error | Tipo y fuente |
|---|---:|---:|---:|---|
| Velocidad orbital dinámica | 1018,3060966387 m/s | 1022 m/s | 0,3614386851 % | Referencia independiente: NASA Moon Fact Sheet |
| Velocidad orbital cinemática | 1023,1572982615 m/s | 1022 m/s | 0,1132385774 % | Referencia independiente: NASA Moon Fact Sheet |
| Periodo de Kepler frente al sideral observado | 27,4518211617 d | 27,321661 d | 0,4763991533 % | Comparación dinámica frente al periodo observado |
| Periodo sinódico derivado | 29,5305905868 d | 29,53 d | 0,0019999552 % | Referencia independiente: NASA Moon Fact Sheet |
| Periodo sinódico derivado | 29,5305905868 d | 29,5305888531 d | 0,0000058707 % | Referencia independiente: USNO, Explanatory Supplement Eq. 15.2 |
| Distancia Sol-Luna, luna nueva | 149213470700 m | 149213470700 m | 0 % | Verificación de consistencia geométrica interna: R − r |
| Distancia Sol-Luna, luna llena | 149982270700 m | 149982270700 m | 0 % | Verificación de consistencia geométrica interna: R + r |
| Diferencia máxima de iluminación | 0,1284773404 puntos porcentuales | 0,1284777645 puntos porcentuales | 0,0003300929 % | Verificación interna; escala teórica r/(2ρ) |
| F/m Luna frente a a_c (identidad del modelo) | 0,0026975736 frente a 0,0026975736 m/s² | Identidad del modelo | 0 % | No es validación independiente |
| Ec frente a −Ep/2 (identidad del modelo) | 3,806633562 × 10²⁸ frente a 3,806633562 × 10²⁸ J | Identidad del modelo | 0 % | No es validación independiente |

La referencia NASA de `29,53 días` está redondeada a dos decimales y por eso
domina el error porcentual de esa fila. La referencia precisa adicional procede
del USNO, *Explanatory Supplement to the Astronomical Almanac*, ecuación 15.2:

<https://aa.usno.navy.mil/downloads/c15_usb_online.pdf>

NASA Moon Fact Sheet:

<https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html>

Las filas `R − r`, `R + r` y `r/(2ρ)` no son mediciones experimentales: son
verificaciones de consistencia matemática interna del modelo geométrico.

## Eventos astronómicos

Las edades se obtienen con `moonAgeDays(date)` y la iluminación con
`calculatePhaseModelReadout(age).illuminatedFractionGeometric`.

| Evento | Fecha UTC | Edad lunar | Fase del modelo | k geométrica | Desviación |
|---|---|---:|---|---:|---:|
| Luna nueva de referencia | 2000-01-06 18:14 | 0,0000000000 d | Luna nueva | 0 | 0,0000000000 d |
| Eclipse lunar total | 2026-03-03 11:34:52 | 14,3426245551 d | Luna llena | 0,9979897847 | 0,4226698714 d |
| Eclipse solar total | 2026-08-12 17:47:05 | 28,9481640864 d | Luna nueva | 0,0038539674 | 0,5824247666 d |

Ningún caso supera un día. Las desviaciones se conservan sin ajuste.

Fuentes de los eventos:

- <https://eclipse.gsfc.nasa.gov/lunar.html>
- <https://eclipse.gsfc.nasa.gov/OH/OH2026.html>

## Pruebas automatizadas

La ejecución final fue: **13 archivos de prueba y 80 pruebas aprobadas**.

| Archivo | Pruebas declaradas |
|---|---:|
| `energy.test.ts` | 4 |
| `app-routing.test.tsx` | 1 |
| `format.test.ts` | 3 |
| `gravity.test.ts` | 6 |
| `lunarPosition.test.ts` | 9 |
| `lunarSystemState.test.ts` | 11 |
| `moon.test.ts` | 8 |
| `orbital.test.ts` | 6 |
| `orbitalModel.test.ts` | 13 |
| `phaseModelReadout.test.ts` | 5 |
| `physics-constants.test.ts` | 2 |
| `physicsReadout.test.ts` | 6 |
| `validation.test.ts` | 6 |

Las pruebas nuevas de `validation.test.ts` cubren referencias independientes,
consistencias geométricas, diferencia de iluminación, eventos de eclipse y
finitud de los resultados.

## Limitaciones

El modelo usa órbitas circulares coplanarias, distancia media y periodos medios.
No incluye excentricidad lunar real (`0,0549`), inclinación orbital aproximada
de `5,1°`, perturbaciones, libración ni eclipses. No es una efeméride de alta
precisión.
