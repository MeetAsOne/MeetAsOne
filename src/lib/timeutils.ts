/** convert "2:50 AM" or "15:43" to seconds since midnight */
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

export const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
