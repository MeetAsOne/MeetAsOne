<script lang="ts">
    import ToggleableBox from "$lib/DaySelector/ToggleableBox.svelte";
    import {weekdayDates} from "$lib/timeutils.ts";

    export let value: Date[] = [];

    // TODO: localize
    const days = ["mon", "tues", "wed", "thurs", "fri", "sat", "sun"] as const;

    const checked: boolean[] = Array(days.length).fill(false);

    $: value = weekdayDates.filter((_, idx) => checked[idx]);
</script>

<div class="flex gap-1 w-full">
    {#each days as day, idx}
        <ToggleableBox bind:checked={checked[idx]}>{day}</ToggleableBox>
    {/each}
</div>
