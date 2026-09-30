/**
 * Standard rounding for percentages (spec §3.2): "12 of 18" is 67%, not 68%.
 * Half-up on positive values (Math.round). Centralized so every indicator
 * rounds identically.
 */
export function roundPct(value: number): number {
  return Math.round(value);
}
