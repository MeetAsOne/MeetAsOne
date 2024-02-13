// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type {Availability} from "$lib/manual/Availability.ts";
import type {EventSummary} from "$lib/storage.ts";

// TODO: use a library for actual types, not strings. See `StorageSchema` for reference.
type StorageSchemaStr = Record<keyof StorageSchema, string>;

interface StorageSchema {
	"general-availability": Availability,
	draftAvailability: Availability,
	useMulticolor: boolean,
	"color-theme": "dark" | "light",
	pastEvents: EventSummary[],
}

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		localStorage: StorageSchemaStr,
	}

	interface Storage extends StorageSchemaStr {
	}
}

export {};
