<script lang="ts">
    import ToggleableBox from "$lib/DaySelector/ToggleableBox.svelte";
    import {weekdayDates} from "$lib/timeutils.ts";

    export let value: Date[] = [];
    export let tz: number;

    // TODO: localize
    const days = ["mon", "tues", "wed", "thurs", "fri", "sat", "sun"] as const;

    const checked: boolean[] = Array(days.length).fill(false);

    $: value = weekdayDates(tz).filter((_, idx) => checked[idx]);
</script>

<div class="flex w-full">
    {#each days as day, idx}
        <ToggleableBox bind:checked={checked[idx]}>{day}</ToggleableBox>
    {/each}
</div>

<style>
    .flex > :global(:first-child) {
        border-bottom-left-radius: 0.5rem;
        border-top-left-radius: 0.5rem;
        overflow: hidden;
    }
    .flex > :global(:last-child) {
        border-bottom-right-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
        overflow: hidden;
    }
</style>
