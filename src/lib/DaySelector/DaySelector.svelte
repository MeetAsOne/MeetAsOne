<script lang="ts">
    import ToggleableBox from "$lib/DaySelector/ToggleableBox.svelte";

    export let value: Date[] = [];

    // TODO: localize
    const days = ["mon", "tues", "wed", "thurs", "fri", "sat", "sun"] as const;
    // Generated from https://stackoverflow.com/a/43008875 (exact day doesn't matter)
    const dates = [
      new Date("2017-02-27T05:00:00.000Z"),
      new Date("2017-02-28T05:00:00.000Z"),
      new Date("2017-03-01T05:00:00.000Z"),
      new Date("2017-03-02T05:00:00.000Z"),
      new Date("2017-03-03T05:00:00.000Z"),
      new Date("2017-03-04T05:00:00.000Z"),
      new Date("2017-03-05T05:00:00.000Z"),
    ] as const;

    const checked: boolean[] = Array(days.length).fill(false);

    $: value = dates.filter((_, idx) => checked[idx]);
</script>

<div class="flex gap-1 w-full">
    {#each days as day, idx}
        <ToggleableBox bind:checked={checked[idx]}>{day}</ToggleableBox>
    {/each}
</div>
