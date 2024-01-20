// store.js
import { writable } from 'svelte/store';

// Create a writable store for dark mode
export const isDarkMode = writable(false);
