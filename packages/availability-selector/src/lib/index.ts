/** Makes a list of numbers from start (inclusive) to stop (exclusive) in `step` increments */
export function range(start: number, stop: number, step = 1) {
  // pretty nieve implementation but idk
  return [...Array(Math.ceil((stop - start) / step)).keys()].map(i => i * step + start);
}

export * from "./units.ts";
export * from "./timeutils.js";
export * from "./Availability.svelte";
export * from "./ManualInput.svelte";
