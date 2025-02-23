// store.js
import {writable, type Writable} from "svelte/store";
import {type Availability, compactAvailability, loadAvailabilityOne} from "./manual/Availability";


export const importedEvents: Writable<Availability> = writable();

let initialLoad = true;
export const workingAvailability = writable<Availability>({});
workingAvailability.subscribe(availability => {
  // TODO: yeaa don't worry about the memory leaks...
  if (!globalThis?.localStorage) return;
  if (initialLoad) {
    initialLoad = false;
    return;
  }

  const weeklyAvailability = compactAvailability(loadAvailabilityOne(availability))[1];

  console.log("general availability", weeklyAvailability);

  localStorage.setItem("general-availability", JSON.stringify({
    days: weeklyAvailability,
  }));
});

export const isSaved = writable(true);
