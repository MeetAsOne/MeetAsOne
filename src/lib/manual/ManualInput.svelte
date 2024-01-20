<script lang="ts">
  import type Availability from "$lib/manual/Availability";
  import ManualInputColumn from "$lib/manual/ManualInputColumn.svelte";
  import range from "$lib/range";
  import {intToTime} from "$lib/timeutils.js";

  // DO NOT PASS AS PROP! Instead, bind
  export let availability: any = {};
  let formattedAvailability = {};
  $: {
    formattedAvailability = JSON.parse(JSON.stringify(availability));
    for (const key in formattedAvailability) {
      formattedAvailability[key] = formattedAvailability[key].map((isAvailble, idx) => isAvailble ? intToTime(blocks[idx]) : null).filter(a => !!a);
    }
  }
  // $: console.log(availability);
  $: console.log(formattedAvailability);

  /** Epoch timestamps for which to display the UI */
  export let dates: number[];

  // TODO: find better way to untrack this
  const a = () => availability = {};
  const b = (date: number) => availability[new Date(date).toLocaleDateString()] = [];
  $: {
    a();
    for (const date of dates) {
      b(date);
    }
  }
  // $: console.log(availability);
  $: globalThis?.localStorage?.setItem?.('general-availability', JSON.stringify({
    "time-zone": 1,
    days: availability,
  }));
  /** Tuple, each ranges from 0 to 1439 (minutes in day) */
  export let timeRange: [number, number];

  /** Minutes of each time cell */
  const timeStep = 15;

  const blocks = range(...timeRange, timeStep);
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
        <ManualInputColumn {date} {blocks} bind:availability={availability[new Date(date).toLocaleDateString()]} />
    {/each}
</div>

<style>
    .labels {
        /* TODO: don't use magic constants */
        /*line-height: 1.1;*/
        padding-top: 1.3em;
    }
</style>
