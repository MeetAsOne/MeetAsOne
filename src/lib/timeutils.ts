import {DAY, HOUR, MILLISECOND, MINUTE, TIME_STEP} from "$lib/units.ts";

/** Date formatted in en-US locale, m/dd/yy. TODO: tighten this type */
export type DateStr = `${number}/${number}/${number}` | string;

/** Minutes since epoch representing start and stop datetimes */
export type DatetimeRange = [number, number];

/** Represents [Date (as ms since epoch), block idx since midnight] */
export type Coord = [number, number];

/** convert "2:50 AM" or "15:43" to minutes since midnight */
export function timeToInt(timeString: string) {
  const [hours, minutes, ampm] = timeString.split(/[: ]/);

  // Calculate the total minutes since midnight
  return (Number(hours) + Number(ampm?.toLowerCase() === "pm") * 12) * HOUR + Number(minutes);
}

/** Converts minutes since midnight to "2:50 AM" or "15:43" */
export function intToTime(midnightOffset: number, military = false) {
  const hours = Math.floor(midnightOffset / HOUR);
  const minutes = midnightOffset % HOUR;
  return `${military ? hours : (hours <= 12 ? hours : hours % 13 + 1)}:${String(minutes).padStart(2, "0")}` + (military ? "" : (hours > 12 ? " PM" : " AM"));
}

/** Milliseconds since epoch for date string */
export const dateStrToEpoch = (dateStr: string) => new Date(dateStr).getTime();

/** Converts a date to the format yyyy-mm-dd, regardless of locale or timezone. Not displayed, used internally */
export function canonicalDateStr(date: Date) {
  return date.toISOString().substring(0, 10) as DateStr;  // Remove the time component
}

/**
 * Returns whether `target` block index is within the time ranges specified by `ranges`. Works even if ranges span multiple days
 * @param ranges minutes since epoch [datetime start, datetime stop]
 * @param target index of 15-minute block since midnight
 */
export function timeInRange(ranges: DatetimeRange[], target: number) {
  target *= TIME_STEP;
  return ranges.some(([rangeStart, rangeEnd]) => {
    console.assert(rangeEnd > rangeStart);
    // Convert to minutes since day start
    rangeStart %= DAY;
    rangeEnd %= DAY;
    const isDisjoint = rangeEnd < rangeStart;  // AKA spans multiple days
    return isDisjoint ? (target <= rangeEnd || target >= rangeStart) : (target >= rangeStart && target <= rangeEnd);
  });
}

/** Checks if `target` is in any of the ranges
 * @param ranges ranges in minutes since epoch of format [start, stop]
 * @param target minutes since epoch
 */
export function datetimeInRange(ranges: DatetimeRange[], target: Date | number) {
  if (target instanceof Date)
    target = target.getTime() * MILLISECOND;
  // @ts-ignore
  return ranges.some(([rangeStart, rangeEnd]) => target <= rangeEnd && target >= rangeStart);
}

/** Convert a list of [start, stop] ranges (minutes since epoch) to unique dates they cover. Preserves order */
export function rangesToDate(ranges: DatetimeRange[]) {
  return ranges.flat().reduce((acc, cur) => {
    cur = Math.floor(cur / DAY) * DAY;  // Set time to midnight
    if (!acc.includes(cur))
      acc.push(cur);
    return acc;
  }, [] as number[]).map(timestamp => new Date(timestamp / MILLISECOND));
}

/** Add offset in minutes to a `Coord`, return copy */
export function offsetDatetime(coord: Coord, offsetMin: number) {
  const [dateMs, blockIdx] = coord;
  const sumMin = dateMs * MILLISECOND + blockIdx * TIME_STEP + offsetMin;
  const DAYS_TO_MS = DAY / MILLISECOND;
  return [Math.floor(sumMin / DAY) * DAYS_TO_MS, (sumMin % DAY) * DAYS_TO_MS] as Coord;
}

/** Add the specified number of minutes to `date` copy & return it
 * @param date if number, will assume minutes
 * @param offsetMin minutes to add
 */
export function offsetDate(date: Date | string | number, offsetMin: number) {
  if (typeof date === "number")
    date /= MILLISECOND;
  const dateObj = new Date(date);
  return new Date(dateObj.getTime() + offsetMin / MILLISECOND);
}

/** Offsets all provided ranges by specified offset
 * @param ranges list of [start, stop] ranges (minutes since epoch)
 * @param offsetMin minutes to add
 */
export function offsetRange(ranges: DatetimeRange[], offsetMin: number) {
  return ranges.map(range => range.map(timestamp => offsetDate(timestamp, offsetMin).getTime() * MILLISECOND) as DatetimeRange);
}

/**
 * @return A timezone offset in minutes given a timezone name
 * @see https://stackoverflow.com/a/68593283
 */
export function getTzOffset(timeZone = 'UTC', date = new Date()) {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
  return (tzDate.getTime() - utcDate.getTime()) * MILLISECOND;
}

export const getLocalTzName = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const getAllTzNames = () => Intl.supportedValuesOf('timeZone');

/**
 * Arbitrary dates within one week, one for each day from Monday to Sunday in that order
 * Generated from https://stackoverflow.com/a/43008875 (exact day doesn't matter)
 */
export const weekdayDates = [
  new Date("2017-02-27T05:00:00.000Z"),
  new Date("2017-02-28T05:00:00.000Z"),
  new Date("2017-03-01T05:00:00.000Z"),
  new Date("2017-03-02T05:00:00.000Z"),
  new Date("2017-03-03T05:00:00.000Z"),
  new Date("2017-03-04T05:00:00.000Z"),
  new Date("2017-03-05T05:00:00.000Z"),
] as const;

export const weekdayDateRanges = weekdayDates.map(weekdayDate => ([
  weekdayDate.getTime() * MILLISECOND,
  weekdayDate.getTime() * MILLISECOND + 11 * HOUR + 59 * MINUTE,
] as DatetimeRange))
