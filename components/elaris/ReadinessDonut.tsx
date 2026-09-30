/** Readiness donut (spec §7.3). Pure SVG; the % is always shown as text. */
export function ReadinessDonut({ percent, size = 72 }: { percent: number; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(100, percent));
  const dash = (filled / 100) * c;

  const color = filled >= 80 ? "#10b981" : filled >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-sm font-semibold tabular-nums">{filled}%</span>
    </div>
  );
}
