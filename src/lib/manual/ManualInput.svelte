<script lang="ts">
  import type Availability from "$lib/manual/Availability";
  import ManualInputColumn from "$lib/manual/ManualInputColumn.svelte";

  // DO NOT PASS AS PROP! Instead, bind
  export let availability: Availability;

  /** Epoch timestamps for which to display the UI */
  export let dates: number[];
</script>

{#each dates as date}
    <ManualInputColumn {date} />
{/each}
