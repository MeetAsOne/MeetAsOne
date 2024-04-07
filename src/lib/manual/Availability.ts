import type {GetEvent$result} from "$houdini";
import type {DateStr} from "$lib/timeutils.ts";

/** Key: the date in any parsable format. Value: array of indices to time blocks.
 * For example, if you ask for times starting at 8am and use 15 min intervals, 9:30 will be index 5  */
export type Availability = Record<DateStr, number[]>;
export type InternalAvailability = Record<DateStr, string[][]>;
export type GenericAvailability = Availability | InternalAvailability;
export type DateCompatible = number | string | Date;

type GetEvent$availability = GetEvent$result["events"][number]["availabilities"][number];

export function loadAvailabilityOne(availability: Availability) {
  return loadAvailability({availability, username: "me"});
}

/** Converts availability from format in database or localstorage into format component can read */
export function loadAvailability(...availabilities: GetEvent$availability[]) {
  const unpackedAvailability: InternalAvailability = {};
  for (const availability of availabilities) {
    for (const key in availability.availability) {
      if (!(key in unpackedAvailability))
        unpackedAvailability[key] = [];
      for (const idx of availability.availability[key]) {
        if (unpackedAvailability[key][idx] == undefined)
          unpackedAvailability[key][idx] = [];
        unpackedAvailability[key][idx].push(availability.username);
      }
    }
  }
  return unpackedAvailability;
}

/**
 * Converts from component representation to database representation
 * @returns tuple, 1st element is specific availability, 2nd element is availability for days of the week
 */
export function compactAvailability(availability: InternalAvailability) {
  const formattedAvailability: Availability = {};
  const weeklyAvailability: Availability = {};
  for (const key in availability) {
    formattedAvailability[key] = availability[key].map((numbAvailable, idx) => numbAvailable.length ? idx : null).filter((a): a is number => a != null);
    weeklyAvailability[new Date(key).getDay()] = formattedAvailability[key];
  }
  return [formattedAvailability, weeklyAvailability] as const;
}

/**
 * Convert an availability that you know into a new Availability range based on days of the week
 * @param dates The new timeframe you want to shift the availability into
 * @param availability Date & time of availability that you know
 */
export function applyAvailability(dates: DateCompatible[], availability: Availability) {
  const out: Availability = {};
  for (const date of dates) {
    out[new Date(date).toLocaleDateString()] = availability[new Date(date).getDay()] ?? [];
  }
  return loadAvailabilityOne(out);
}

export function mergeAvailability(existing: InternalAvailability, newer: Availability, user = "me") {
  for (const existingDateStr in existing) {
    for (const newDateStr in newer) {
      for (const timeBlock of newer[newDateStr]) {
        const usersAvailable = existing[existingDateStr][timeBlock] as string[] | undefined;
        if (!usersAvailable?.includes(user) && (new Date(newDateStr).getDay() === new Date(existingDateStr).getDay() || newDateStr === existingDateStr)) {
          if (usersAvailable)
            usersAvailable.push(user);
          else
            existing[existingDateStr][timeBlock] = [user];
        }
      }
    }
  }
  return existing;
}

export function blankAvailability(dates: DateStr[]) {
  console.log(enforceAvailabilityValidity({}, dates));
  return enforceAvailabilityValidity({}, dates);
}

export function enforceAvailabilityValidity<T extends GenericAvailability>(availability: T, dates: DateStr[]) {
  for (const date of dates) {
    if (!(date in availability))
      availability[date] = [];
  }
  return availability;
}
