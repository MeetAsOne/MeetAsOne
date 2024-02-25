/** Makes a list of numbers from start (inclusive) to stop (exclusive) in `step` increments */
export default function range(start: number, stop: number, step = 1) {
  // pretty nieve implementation but idk
  return [...Array(Math.ceil((stop - start) / step)).keys()].map(i => i * step + start);
}
