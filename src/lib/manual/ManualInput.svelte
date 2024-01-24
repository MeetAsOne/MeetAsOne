<script lang="ts">
  import ManualInputColumn from "$lib/manual/ManualInputColumn.svelte";
  import range from "$lib/range";
  import {intToTime} from "$lib/timeutils.js";
  import {type Availability, compactAvailability, type InternalAvailability, mergeAvailability} from "$lib/manual/Availability";
  import {UpsertAvailabilityStore} from "$houdini";
  import {TIME_STEP} from "$lib/units";
  import {page} from "$app/stores";
  import type {Writable} from "svelte/store";
  import { importedEvents, workingAvailability } from "$lib/store";
  import {getOrSetName} from "$lib/storage.ts";

  export let shouldSave = false;
  export let availability: InternalAvailability = {};
  let formattedAvailability: Availability = {};
  let weeklyAvailability: Availability = {};
  $: [formattedAvailability, weeklyAvailability] = compactAvailability(availability);
  $: if (!availablePeople) workingAvailability.set(formattedAvailability);
  $: console.log("availability", availability);
  $: console.log("formattedAvailability", formattedAvailability);

  importedEvents.subscribe((currentValue) => {
    mergeAvailability(availability, currentValue)
    availability = {...availability}; // Trigger Svelte's reactivity by reassigning the variable
  })

  /** Epoch timestamps for which to display the UI */
  export let dates: number[];

  export let availablePeople: Writable<string[]> | undefined = undefined;

  /** Tuple, each ranges from 0 to 1439 (minutes in day) */
  export let timeRange: [number, number];

  /** Array of starting times in 15-minute intervals since midnight for all possible blocks */
  const blocks = range(...timeRange.map(t => Math.floor(t / TIME_STEP)) as typeof timeRange, 1);

  /** Names of all participants */
  export let allParticipants: string[] = [];

  /** If true, display each person in cell as their own color. Otherwise, use shades of green */
  export let useMulticolor = false;

  async function save() {
    if (shouldSave)
      globalThis?.localStorage?.setItem?.('draftAvailability', JSON.stringify({
        "time-zone": 1,  // TODO
        days: weeklyAvailability,
      }));

    const updater = new UpsertAvailabilityStore();
    const username = getOrSetName();
    if (!username) return;
    const res = await updater.mutate({
      availability: compactAvailability(availability)[0],
      username,
      eventId: $page.params.id,
    });
    if (res.errors)
      res.errors.forEach(console.error);
    if (res.data?.insert_availability?.affected_rows === 0)
      console.error("No rows were changed")
  }
</script>

<div class="flex items-stretch select-none">
    {#if dates.length > 0}
        <div class="labels text-right w-[5em]">
            {#each blocks as block, idx}
                <div class="label">
                    {idx % 2 === 0 ? intToTime(block * TIME_STEP) : " "}
                </div>
            {/each}
        </div>
    {/if}
    {#each dates as date}
        <ManualInputColumn
                {date} {blocks} {save} {allParticipants} {availablePeople} {useMulticolor}
                bind:availability={availability[new Date(date).toLocaleDateString()]} />
    {/each}
</div>

<style>
    .labels {
        /* TODO: don't use magic constants */
        /*line-height: 1.1;*/
        padding-top: 48px;
    }

    .label {
        height: 16px;
        line-height: 16px;
    }
</style>
