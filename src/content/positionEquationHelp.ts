export type PositionEquationVariable = {
  symbol: string;
  meaning: string;
  unit: string;
};

export type PositionEquationHelp = {
  id: string;
  meaning: string;
  variables: PositionEquationVariable[];
  why: string;
};

export const POSITION_EQUATION_HELP: PositionEquationHelp[] = [
  {
    id: "earth-position",
    meaning: "Posición de la Tierra respecto al Sol en el instante t, en un círculo de radio R.",
    variables: [
      { symbol: "R_T(t)", meaning: "vector posición", unit: "m" },
      { symbol: "R", meaning: "distancia Tierra-Sol", unit: "m" },
      { symbol: "θT = ωT·t", meaning: "ángulo de la Tierra", unit: "rad" },
      { symbol: "ωT = 2π/PT", meaning: "velocidad angular", unit: "rad/s" },
      { symbol: "t", meaning: "tiempo desde la luna nueva", unit: "s" },
    ],
    why: "Un punto en un círculo de radio R con ángulo θ tiene coordenadas (R·cosθ, R·sinθ); como el giro es uniforme, θ crece con el tiempo (θ = ω·t). En t = 0 la Tierra está en (R, 0).",
  },
  {
    id: "moon-position",
    meaning: "Posición de la Luna respecto al Sol: se suman dos vectores, Sol→Tierra y Tierra→Luna.",
    variables: [
      { symbol: "R_M(t)", meaning: "vector posición de la Luna respecto al Sol", unit: "m" },
      { symbol: "R_T(t)", meaning: "vector posición de la Tierra respecto al Sol", unit: "m" },
      { symbol: "r", meaning: "distancia Tierra-Luna", unit: "m" },
      { symbol: "θL = π + ωL·t", meaning: "ángulo lunar", unit: "rad" },
      { symbol: "ωL = 2π/PL", meaning: "velocidad angular lunar", unit: "rad/s" },
    ],
    why: "La Luna gira alrededor de la Tierra y la Tierra alrededor del Sol, así que los movimientos se superponen. Se toma θL0 = π para que en t = 0 la Luna esté entre el Sol y la Tierra (luna nueva).",
  },
  {
    id: "relative-angle",
    meaning: "Mide cuánto ha avanzado la Luna respecto a la línea Sol-Tierra; de ψ depende la fase.",
    variables: [
      { symbol: "ψ", meaning: "ángulo relativo", unit: "rad o °" },
      { symbol: "ψ0 = π", meaning: "luna nueva en t = 0", unit: "rad" },
      { symbol: "ωL − ωT", meaning: "velocidad angular relativa", unit: "rad/s" },
    ],
    why: "La línea Sol-Tierra también gira, así que la Luna debe «alcanzarla»: importa la diferencia de velocidades angulares. ψ = 180° luna nueva, 270° cuarto creciente, 360° luna llena, 450° (=90°) cuarto menguante.",
  },
  {
    id: "synodic-period",
    meaning: "Tiempo que tarda en repetirse una misma fase.",
    variables: [
      { symbol: "Psin", meaning: "periodo sinódico", unit: "d" },
      { symbol: "PL", meaning: "periodo sideral lunar", unit: "d" },
      { symbol: "PT", meaning: "año sideral", unit: "d" },
    ],
    why: "ψ completa 2π cuando (ωL − ωT)·Psin = 2π; con ω = 2π/P resulta esa fórmula. Es como la aguja de los minutos alcanzando a la de las horas: cada 65,45 min y no cada 60. Por eso las fases se repiten cada 29,53 d y no cada 27,32 d.",
  },
  {
    id: "sun-moon-distance",
    meaning: "Distancia entre el Sol y la Luna.",
    variables: [
      { symbol: "ρ", meaning: "distancia Sol-Luna", unit: "m" },
      { symbol: "R", meaning: "distancia Tierra-Sol", unit: "m" },
      { symbol: "r", meaning: "distancia Tierra-Luna", unit: "m" },
      { symbol: "ψ", meaning: "ángulo relativo", unit: "rad" },
    ],
    why: "Es el teorema del coseno en el triángulo Sol-Tierra-Luna. Con ψ = 180° (luna nueva) ρ = R − r; con ψ = 0° (luna llena) ρ = R + r. ρ varía solo ±0,26 % alrededor de R.",
  },
  {
    id: "illuminated-fraction",
    meaning: "Parte del disco lunar visible desde la Tierra que está iluminada (0 = nada, 1 = todo).",
    variables: [
      { symbol: "k", meaning: "fracción iluminada", unit: "0 a 1; se muestra en %" },
      { symbol: "i", meaning: "ángulo de fase: ángulo, visto desde la Luna, entre la dirección al Sol y la dirección a la Tierra", unit: "rad o °" },
    ],
    why: "El Sol siempre ilumina media Luna; según i vemos más o menos de esa mitad. i = 0° → k = 1 (luna llena); i = 90° → k = 0,5; i = 180° → k = 0 (luna nueva). cos i es casi igual a cos ψ porque el Sol está muy lejos; la pequeña diferencia explica por qué en los cuartos k = 50,1 % y no 50 %.",
  },
];
