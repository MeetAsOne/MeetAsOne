// store.js
import { writable, type Writable } from "svelte/store";
import {type Availability, compactAvailability, loadAvailabilityOne} from "./manual/Availability";


export const importedEvents: Writable<Availability> = writable();

export const workingAvailability = writable<Availability>({});
workingAvailability.subscribe(availability => {
  // TODO: yeaa don't worry about the memory leaks...
  if (!globalThis?.localStorage) return;

  const weeklyAvailability = compactAvailability(loadAvailabilityOne(availability))[1];

  console.log("DRAFT", weeklyAvailability);

  localStorage.setItem("draftAvailability", JSON.stringify({
    days: weeklyAvailability,
  }));
  console.log(localStorage.draftAvailability);
});

export const isSaved = writable(true);
