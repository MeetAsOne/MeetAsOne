<script lang="ts">
  import ManualInputColumn from "$lib/manual/ManualInputColumn.svelte";
  import range from "$lib/range";
  import {intToTime} from "$lib/timeutils.js";
  import {type Availability, compactAvailability} from "$lib/manual/Availability";
  import {UpsertAvailabilityStore} from "$houdini";

  export let shouldSave = false;
  export let availability: Availability = {};
  let formattedAvailability: Availability = {};
  let weeklyAvailability: Availability = {};
  $: [formattedAvailability, weeklyAvailability] = compactAvailability(availability);
  $: console.log("availability", availability);
  $: console.log("formattedAvailability", formattedAvailability);

  /** Epoch timestamps for which to display the UI */
  export let dates: number[];

  /** Tuple, each ranges from 0 to 1439 (minutes in day) */
  export let timeRange: [number, number];

  /** Minutes of each time cell */
  const timeStep = 15;

  const blocks = range(...timeRange, timeStep);

  export let totalParticipants = 0;

  function save() {
    if (shouldSave)
      globalThis?.localStorage?.setItem?.('general-availability', JSON.stringify({
        "time-zone": 1,  // TODO
        days: weeklyAvailability,
      }));

    const updater = new UpsertAvailabilityStore();
    updater.mutate({
      availability: compactAvailability(availability),
      username: "Ethan",
      eventId: "b0a542e5-527c-4115-9cf7-a94016da72da",  // TODO
    });
  }
</script>

<div class="flex flex-row cursor-pointer select-none">
    {#if dates.length > 0}
        <div class="labels text-right w-[5em]">
            {#each blocks as block, idx}
                <div class="h-[17.6px]">
                    {idx % 2 === 0 ? intToTime(block) : " "}
                </div>
            {/each}
        </div>
    {/if}
    {#each dates as date}
        <ManualInputColumn {date} {blocks} {save} {totalParticipants} bind:availability={availability[new Date(date).toLocaleDateString()]} />
    {/each}
</div>

<style>
    .labels {
        /* TODO: don't use magic constants */
        /*line-height: 1.1;*/
        padding-top: 1.3em;
    }
</style>
