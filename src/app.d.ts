// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	var isDragging: boolean;
	var dragState: boolean | null;

	type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
}

export {};
