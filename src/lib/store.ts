// store.js
import { writable, type Writable } from 'svelte/store';
import type { Availability } from './manual/Availability';


export const importedEvents: Writable<Availability> = writable();

export const workingAvailability = writable<Availability>({});
