import { useId } from "react";

/** Moon seen from Earth (Northern Hemisphere: waxing lit on the right). angle: 0=new, π=full. */
export function MoonDisc({ angle, size = 120, label }: { angle: number; size?: number; label?: string }) {
  const id = useId().replace(/:/g, "");
  const r = 50;
  const a = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const waxing = a <= Math.PI;
  const rx = Math.abs(Math.cos(a)) * r;
  // crescent when cos>0 (terminator bulges toward lit side)
  const crescent = Math.cos(a) > 0;
  const d = `M50 0 A${r} ${r} 0 0 1 50 100 A${rx} ${r} 0 0 ${crescent ? 0 : 1} 50 0Z`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label ?? "Luna"} className="drop-shadow-moon">
      <defs>
        <radialGradient id={`lit${id}`} cx="40%" cy="38%" r="70%">
          <stop offset="0%" stopColor="var(--moon-light)" />
          <stop offset="100%" stopColor="var(--moon-mid)" />
        </radialGradient>
        <clipPath id={`c${id}`}>
          <path d={d} transform={waxing ? undefined : "translate(100 0) scale(-1 1)"} />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="50" fill="var(--moon-dark)" />
      <g clipPath={`url(#c${id})`}>
        <circle cx="50" cy="50" r="50" fill={`url(#lit${id})`} />
        <g fill="var(--moon-mare)" opacity="0.55">
          <ellipse cx="38" cy="34" rx="13" ry="10" />
          <ellipse cx="60" cy="30" rx="9" ry="8" />
          <ellipse cx="66" cy="52" rx="11" ry="9" />
          <ellipse cx="42" cy="58" rx="8" ry="11" />
          <circle cx="56" cy="80" r="4" />
        </g>
      </g>
    </svg>
  );
}
