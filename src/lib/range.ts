// pretty nieve implementation but idk
export default function range(start: number, stop: number, step = 1) {
  return [...Array(Math.ceil((stop - start) / step)).keys()].map(i => i * step + start);
}
