<script lang="ts">
  import type Availability from "$lib/manual/Availability";
  import ManualInputColumn from "$lib/manual/ManualInputColumn.svelte";
  import range from "$lib/range";
  import {intToTime} from "$lib/timeutils.js";

  // DO NOT PASS AS PROP! Instead, bind
  export let availability: Availability;

  /** Epoch timestamps for which to display the UI */
  export let dates: number[];
  /** Tuple, each ranges from 0 to 1439 (minutes in day) */
  export let timeRange: [number, number];

  /** Minutes of each time cell */
  const timeStep = 30;

  const blocks = range(...timeRange, timeStep);
</script>

<div class="flex flex-row cursor-pointer select-none">
    {#if dates.length > 0}
        <div class="labels text-right w-[7em]">
            {#each blocks as block}
                <div>
                    {intToTime(block)}
                </div>
            {/each}
        </div>
    {/if}
    {#each dates as date}
        <ManualInputColumn {date} {blocks} />
    {/each}
</div>

<style>
    .labels {
        /* TODO: don't use magic constants */
        line-height: 1.1;
        padding-top: 1.3em;
    }
</style>
