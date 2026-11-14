# LunaLab: resumen del modelo de posición y fases

## Ecuaciones implementadas

| Ecuación | Archivo |
|---|---|
| `R_T = R(cos θT, sin θT)` | `src/domain/physics/lunarPosition.ts` |
| `R_M = R_T + r(cos θL, sin θL)` | `src/domain/physics/lunarPosition.ts` |
| `ψ = ψ0 + (ωL − ωT)t` | `src/domain/physics/lunarPosition.ts` |
| `1/Psyn = 1/PL − 1/PT` | `src/domain/physics/lunarPosition.ts` |
| `ρ² = R² + r² + 2Rr cos(θL − θT)` | `src/domain/physics/lunarPosition.ts` |
| `k = (1 + cos i)/2` | `src/domain/physics/lunarPosition.ts` |
| `i = ángulo(Luna→Sol, Luna→Tierra)` | `src/domain/physics/phaseModelReadout.ts` |
| `φ = π + ωL t`, cara cercana `φ + π` | `src/domain/physics/lunarPosition.ts` |

## Validación numérica final

| Magnitud | Modelo | Referencia | Error |
|---|---:|---:|---:|
| Velocidad orbital | 1023,1572982615 m/s | 1022 m/s NASA | 0,1132385774 % |
| Periodo sinódico | 29,5305905868 d | 29,53 d NASA | 0,0019999552 % |
| Periodo sinódico | 29,5305905868 d | 29,5305888531 d USNO | 0,0000058707 % |
| Distancia en luna nueva | 149213470700 m | `R − r` | 0 % |
| Distancia en luna llena | 149982270700 m | `R + r` | 0 % |
| Diferencia máxima de iluminación | 0,1284773404 puntos porcentuales | `r/(2ρ)` | 0,0003300929 % |
| `F/m` frente a `a_c` | 0,0026975736 frente a 0,0027233373 m/s² | Consistencia interna | 0,9550678682 % |
| `Ec` frente a `−Ep/2` | `3,842989496 × 10²⁸` frente a `3,806633562 × 10²⁸ J` | Consistencia interna | 0,9550678682 % |

## Limitaciones

1. Las órbitas se modelan como circulares y coplanarias.
2. Se utilizan distancias y periodos medios, sin excentricidad real (`0,0549`).
3. No se incluye la inclinación orbital real, aproximadamente `5,1°`.
4. No se modelan perturbaciones, libración ni eclipses.
5. El resultado es educativo y no constituye una efeméride astronómica.
