import {DAY, HOUR, MILLISECOND, TIME_STEP} from "$lib/units.ts";

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

/** Maps `Date.getTimezoneOffset` values to timezone names. NOTE: keys are negated from label & in minutes */
export const timezones = new Map([
  [HOUR * 12, "(GMT-12:00) International Date Line West"],
  [HOUR * 11, "(GMT-11:00) Midway Island, Samoa"],
  [HOUR * 10, "(GMT-10:00) Hawaii"],
  [HOUR * 9, "(GMT-09:00) Alaska"],
  [HOUR * 8, "(GMT-08:00) Pacific Time (US & Canada)"],
  [HOUR * 7, "(GMT-07:00) Mountain Time (US & Canada)"],
  [HOUR * 6, "(GMT-06:00) Central Time (US & Canada)"],
  [HOUR * 5, "(GMT-05:00) Eastern Time (US & Canada)"],
  [HOUR * 4, "(GMT-04:00) Atlantic Time (Canada)"],
  [HOUR * 3, "(GMT-03:00) Buenos Aires, Georgetown"],
  [HOUR * 2, "(GMT-02:00) Mid-Atlantic"],
  [HOUR, "(GMT-01:00) Cape Verde Islands"],
  [0, "(GMT) Greenwich Mean Time, London"],
  [HOUR * -1, "(GMT+01:00) Brussels, Copenhagen, Madrid, Paris"],
  [HOUR * -2, "(GMT+02:00) Athens, Istanbul, Cairo"],
  [HOUR * -3, "(GMT+03:00) Moscow, St. Petersburg, Volgograd"],
  [HOUR * -4, "(GMT+04:00) Dubai, Abu Dhabi, Muscat"],
  [HOUR * -5, "(GMT+05:00) Karachi, Islamabad, Tashkent"],
  [HOUR * -5.5, "(GMT+05:30) Indian Standard Time"],
  [HOUR * -6, "(GMT+06:00) Almaty, Dhaka"],
  [HOUR * -7, "(GMT+07:00) Bangkok, Hanoi, Jakarta"],
  [HOUR * -8, "(GMT+08:00) Beijing, Hong Kong, Singapore"],
  [HOUR * -9, "(GMT+09:00) Tokyo, Seoul, Osaka"],
  [HOUR * -9.5, "(GMT+09:30) Adelaide, Darwin"],
  [HOUR * -10, "(GMT+10:00) Brisbane, Sydney, Melbourne"],
  [HOUR * -11, "(GMT+11:00) Solomon Islands, New Caledonia"],
  [HOUR * -12, "(GMT+12:00) Fiji, Kamchatka, Marshall Is."],
]);

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
