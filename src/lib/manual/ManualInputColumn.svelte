<script lang="ts">
  import range from "$lib/range";

  /** The date for which to display this column */
  export let date: number;
  /** Tuple, each ranges from 0 to 1439 (minutes in day) */
  export let timeRange: [number, number];

  const TIME_STEP = 30;  // min
  const blocks = range(...timeRange, TIME_STEP);
</script>

<div class="border border-black w-[7em] text-center">
    <div>{new Date(date).toLocaleDateString()}</div>
    {#each blocks as block}
        <div>{block}</div>
    {/each}
</div>
