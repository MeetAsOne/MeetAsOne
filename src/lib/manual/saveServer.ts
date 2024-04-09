import {UpsertAvailabilityStore} from "$houdini";
import {getPastEvent} from "$lib/storage.ts";
import {compactAvailability, type InternalAvailability} from "$lib/manual/Availability.ts";
import {isSaved} from "$lib/store.ts";

/** Push availability change to server, save to localStorage */
export default async function saveServer(eventId: string, availability: InternalAvailability) {
  isSaved.set(false);
  // Reactive statement should update this, but timing is inconsistent (Svelte runes should fix this)
  const formattedAvailability = compactAvailability(availability)[0];

  const updater = new UpsertAvailabilityStore();
  const username = getPastEvent(eventId)?.myName;
  if (!username) return;
  const res = await updater.mutate({
    availability: formattedAvailability,
    username,
    eventId,
  });
  if (res.errors)
    res.errors.forEach(console.error);
  else if (res.data?.insert_availability?.affected_rows === 0)
    console.error("No rows were changed");
  else
    isSaved.set(true);
}
