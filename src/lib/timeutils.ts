import {DAY, HOUR, MILLISECOND, TIME_STEP} from "$lib/units.ts";

/** Date formatted in en-US locale, m/dd/yy. TODO: tighten this type */
export type DateStr = `${number}/${number}/${number}` | string;

/** Minutes since epoch representing start and stop datetimes */
export type DatetimeRange = [number, number];

/** convert "2:50 AM" or "15:43" to minutes since midnight */
export function timeToInt(timeString: string) {
  const [hours, minutes, ampm] = timeString.split(/[: ]/);

  // Calculate the total minutes since midnight
  return (Number(hours) + Number(ampm?.toLowerCase() === "pm") * 12) * HOUR + Number(minutes);
}

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

/** Converts a date to the format m/dd/yy, regardless of the locale. Not displayed, but sent to database */
export function canonicalDateStr(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  }).format(date) as DateStr;
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
    const isDisjoint = rangeEnd < rangeStart;
    return isDisjoint ? (target < rangeEnd || target > rangeStart) : (target > rangeStart && target < rangeEnd);
  });
}

export function rangesToDate(ranges: DatetimeRange[]) {
  return ranges.flat().reduce((acc, cur) => {
    cur = Math.floor(cur / DAY) * DAY;  // Set time to midnight
    if (!acc.includes(cur))
      acc.push(cur);
    return acc;
  }, [] as number[]).map(timestamp => new Date(timestamp / MILLISECOND))
}

/**
 * Adds specified number of minutes to local datetime
 * @param date canonical date string
 * @param time minutes since midnight
 * @param offset minutes to add. Positive numbers move towards UTC
 * @returns [new canonical date string, new minutes since midnight]
 */
export function offsetDateTime(date: DateStr, time: number, offset: number) {
  const dateObj = new Date(date);
  dateObj.setMinutes(time + offset);
  return [canonicalDateStr(dateObj), dateObj.getHours() * 60 + dateObj.getMinutes()] as const;
}
