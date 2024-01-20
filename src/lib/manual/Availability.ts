import {daysOfWeek} from "$lib/timeutils";

export interface Availability {
  id?: number,
  username: string,
  event_id: number,
  start_time: number,
  end_time: number,
}

/** Converts availability from format in database or localstorage into format component can read */
export function loadAvailability(availability: any) {
  let unpackedAvailability = {};
  for (const key in availability) {
    unpackedAvailability[key] = [];//new Array(totalBlocks).fill(0);
    for (const idx of availability[key]) {
      unpackedAvailability[key][idx] = unpackedAvailability[key][idx] == undefined ? 1 : unpackedAvailability[key][idx] + 1;
    }
  }
  return unpackedAvailability as any;
}

/** Converts from component representation to database representation */
export function compactAvailability(availability: any) {
  const formattedAvailability = {};
  const weeklyAvailability = {};
  for (const key in availability) {
    formattedAvailability[key] = availability[key].map((numAvailble, idx) => numAvailble ? idx : null).filter(a => a != null);
    weeklyAvailability[new Date(key).getDay()] = formattedAvailability[key];
  }
  return [formattedAvailability as any, weeklyAvailability] as const;
}

export function applyAvailability(dates: number[], availability: any) {
  const out = {};
  for (const date of dates) {
    out[new Date(date).toLocaleDateString()] = availability[new Date(date).getDay()] ?? [];
  }
  return loadAvailability(out);
}
