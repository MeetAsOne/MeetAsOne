<script lang="ts">
  import ManualInputColumn from "$lib/manual/ManualInputColumn.svelte";
  import range from "$lib/range";
  import {intToTime} from "$lib/timeutils.js";
  import {compactAvailability} from "$lib/manual/Availability";

  export let shouldSave = false;
  export let availability: any = {};
  let formattedAvailability = {};
  let weeklyAvailability = {};
  $: [formattedAvailability, weeklyAvailability] = compactAvailability(availability);
  $: console.log("availability", availability);
  $: console.log("formattedAvailability", formattedAvailability);

  /** Epoch timestamps for which to display the UI */
  export let dates: number[];

  $: shouldSave && globalThis?.localStorage?.setItem?.('general-availability', JSON.stringify({
    "time-zone": 1,
    days: weeklyAvailability,
  }));
  /** Tuple, each ranges from 0 to 1439 (minutes in day) */
  export let timeRange: [number, number];

  /** Minutes of each time cell */
  const timeStep = 15;

  const blocks = range(...timeRange, timeStep);

  export let totalParticipants = 0;
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
        <ManualInputColumn {date} {blocks} {totalParticipants} bind:availability={availability[new Date(date).toLocaleDateString()]} />
    {/each}
</div>

<style>
    .labels {
        /* TODO: don't use magic constants */
        /*line-height: 1.1;*/
        padding-top: 1.3em;
    }
</style>
