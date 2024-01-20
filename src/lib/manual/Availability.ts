/** Key: the date in any parsable format. Value: array of indices to time blocks.
 * For example, if you ask for times starting at 8am and use 15 min intervals, 9:30 will be index 5  */
type DateStr = string;
export type Availability = Record<DateStr, number[]>

/** Converts availability from format in database or localstorage into format component can read */
export function loadAvailability(...availabilities: Availability[]) {
  const unpackedAvailability: Availability = {};
  for (const availability of availabilities) {
    for (const key in availability) {
      unpackedAvailability[key] = [];
      for (const idx of availability[key]) {
        unpackedAvailability[key][idx] = unpackedAvailability[key][idx] == undefined ? 1 : unpackedAvailability[key][idx] + 1;
      }
    }
  }
  return unpackedAvailability;
}

/** Converts from component representation to database representation */
export function compactAvailability(availability: Availability) {
  const formattedAvailability: Availability = {};
  const weeklyAvailability: Availability = {};
  for (const key in availability) {
    formattedAvailability[key] = availability[key].map((numAvailble, idx) => numAvailble ? idx : null).filter((a): a is number => a != null);
    weeklyAvailability[new Date(key).getDay()] = formattedAvailability[key];
  }
  return [formattedAvailability, weeklyAvailability] as const;
}

export function applyAvailability(dates: number[], availability: any) {
  const out: Availability = {};
  for (const date of dates) {
    out[new Date(date).toLocaleDateString()] = availability[new Date(date).getDay()] ?? [];
  }
  return loadAvailability(out);
}
