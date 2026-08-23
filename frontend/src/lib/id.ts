// Local, collision-resistant id generator (no network / uuid dependency).
let counter = 0;
export function genId(prefix = "n"): string {
  counter = (counter + 1) % 100000;
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}_${rand}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
