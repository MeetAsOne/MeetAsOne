/** Date formatted in en-US locale, m/dd/yy. TODO: tighten this type */
export type DateStr = `${number}/${number}/${number}` | string;

/** convert "2:50 AM" or "15:43" to minutes since midnight */
export function timeToInt(timeString: string) {
  const [hours, minutes, ampm] = timeString.split(/[: ]/);

  // Calculate the total minutes since midnight
  return (Number(hours) + Number(ampm?.toLowerCase() === "pm") * 12) * 60 + Number(minutes);
}

export function intToTime(midnightOffset: number, military = false) {
  const hours = Math.floor(midnightOffset / 60);
  const minutes = midnightOffset % 60;
  return `${military ? hours : (hours <= 12 ? hours : hours % 13 + 1)}:${String(minutes).padStart(2, "0")}` + (military ? "" : (hours > 12 ? " PM" : " AM"));
}

export const dateStrToEpoch = (dateStr: string) => new Date(dateStr).getTime();

const MIN = 60;
/** Maps `Date.getTimezoneOffset` values to timezone names. NOTE: keys are negated from label & in minutes */
export const timezones = new Map([
  [MIN * 12, "(GMT-12:00) International Date Line West"],
  [MIN * 11, "(GMT-11:00) Midway Island, Samoa"],
  [MIN * 10, "(GMT-10:00) Hawaii"],
  [MIN * 9, "(GMT-09:00) Alaska"],
  [MIN * 8, "(GMT-08:00) Pacific Time (US & Canada)"],
  [MIN * 7, "(GMT-07:00) Mountain Time (US & Canada)"],
  [MIN * 6, "(GMT-06:00) Central Time (US & Canada)"],
  [MIN * 5, "(GMT-05:00) Eastern Time (US & Canada)"],
  [MIN * 4, "(GMT-04:00) Atlantic Time (Canada)"],
  [MIN * 3, "(GMT-03:00) Buenos Aires, Georgetown"],
  [MIN * 2, "(GMT-02:00) Mid-Atlantic"],
  [MIN, "(GMT-01:00) Cape Verde Islands"],
  [0, "(GMT) Greenwich Mean Time, London"],
  [MIN * -1, "(GMT+01:00) Brussels, Copenhagen, Madrid, Paris"],
  [MIN * -2, "(GMT+02:00) Athens, Istanbul, Cairo"],
  [MIN * -3, "(GMT+03:00) Moscow, St. Petersburg, Volgograd"],
  [MIN * -4, "(GMT+04:00) Dubai, Abu Dhabi, Muscat"],
  [MIN * -5, "(GMT+05:00) Karachi, Islamabad, Tashkent"],
  [MIN * -5.5, "(GMT+05:30) Indian Standard Time"],
  [MIN * -6, "(GMT+06:00) Almaty, Dhaka"],
  [MIN * -7, "(GMT+07:00) Bangkok, Hanoi, Jakarta"],
  [MIN * -8, "(GMT+08:00) Beijing, Hong Kong, Singapore"],
  [MIN * -9, "(GMT+09:00) Tokyo, Seoul, Osaka"],
  [MIN * -9.5, "(GMT+09:30) Adelaide, Darwin"],
  [MIN * -10, "(GMT+10:00) Brisbane, Sydney, Melbourne"],
  [MIN * -11, "(GMT+11:00) Solomon Islands, New Caledonia"],
  [MIN * -12, "(GMT+12:00) Fiji, Kamchatka, Marshall Is."],
]);

/** Converts a date to the format m/dd/yy, regardless of the locale. Not displayed, but sent to database */
export function canonicalDateStr(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  }).format(date) as DateStr;
}
