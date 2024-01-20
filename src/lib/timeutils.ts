// TODO: find a way to convert "2:50 AM" or "15:43" to seconds since midnight
export function timeToInt(value: string, index: number, array: string[]) {
  return ([480, 1320])[index];
}

export function intToTime(midnightOffset: number, millitary = false) {
  const hours = Math.floor(midnightOffset / 60);
  const minutes = midnightOffset % 60;
  return `${millitary ? hours : (hours <= 12 ? hours : hours % 13 + 1)}:${String(minutes).padStart(2, "0")}` + (millitary ? "" : (hours > 12 ? " PM" : " AM"));
}

export const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
