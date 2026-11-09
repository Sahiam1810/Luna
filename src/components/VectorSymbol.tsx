type VectorSymbolProps = {
  symbol: string;
  className?: string;
};

/** Displays a vector letter with a CSS arrow, avoiding combining Unicode marks. */
export function VectorSymbol({ symbol, className = "" }: VectorSymbolProps) {
  return (
    <span className={`relative inline-block italic leading-none ${className}`} aria-label={`Vector ${symbol}`}>
      <span>{symbol}</span>
      <span aria-hidden className="pointer-events-none absolute -top-[0.55em] left-[0.05em] text-[0.65em] not-italic leading-none">→</span>
    </span>
  );
}
