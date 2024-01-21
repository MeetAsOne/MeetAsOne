<script lang="ts">
  import ManualInputColumn from "$lib/manual/ManualInputColumn.svelte";
  import range from "$lib/range";
  import {intToTime} from "$lib/timeutils.js";
  import {type Availability, compactAvailability, type InternalAvailability} from "$lib/manual/Availability";
  import {UpsertAvailabilityStore} from "$houdini";
  import {TIME_STEP} from "$lib/units";
  import {page} from "$app/stores";
  import type {Writable} from "svelte/store";

  export let shouldSave = false;
  export let availability: InternalAvailability = {};
  let formattedAvailability: Availability = {};
  let weeklyAvailability: Availability = {};
  $: [formattedAvailability, weeklyAvailability] = compactAvailability(availability);
  $: console.log("availability", availability);
  $: console.log("formattedAvailability", formattedAvailability);

  /** Epoch timestamps for which to display the UI */
  export let dates: number[];

  export let availablePeople: Writable<string[]> | undefined = undefined;

  /** Tuple, each ranges from 0 to 1439 (minutes in day) */
  export let timeRange: [number, number];

  /** Array of starting times in 15-minute intervals since midnight for all possible blocks */
  const blocks = range(...timeRange.map(t => Math.floor(t / TIME_STEP)) as typeof timeRange, 1);

  export let totalParticipants = 0;

  async function save() {
    if (shouldSave)
      globalThis?.localStorage?.setItem?.('general-availability', JSON.stringify({
        "time-zone": 1,  // TODO
        days: weeklyAvailability,
      }));

    const updater = new UpsertAvailabilityStore();
    const res = await updater.mutate({
      availability: compactAvailability(availability)[0],
      username: localStorage?.name ?? (localStorage.name = prompt("What is your name + last initial?")),
      eventId: $page.params.id,
    });
    if (res.errors)
      res.errors.forEach(console.error);
    if (res.data?.insert_availability?.affected_rows === 0)
      console.error("No rows were changed")
  }
</script>

<div class="flex flex-row select-none">
    {#if dates.length > 0}
        <div class="labels text-right w-[5em]">
            {#each blocks as block, idx}
                <div class="h-[17.6px]">
                    {idx % 2 === 0 ? intToTime(block * TIME_STEP) : " "}
                </div>
            {/each}
        </div>
    {/if}
    {#each dates as date}
        <ManualInputColumn
                {date} {blocks} {save} {totalParticipants} {availablePeople}
                bind:availability={availability[new Date(date).toLocaleDateString()]} />
    {/each}
</div>

<style>
    .labels {
        /* TODO: don't use magic constants */
        /*line-height: 1.1;*/
        padding-top: 1.3em;
    }
</style>
