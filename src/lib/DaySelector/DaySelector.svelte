<script lang="ts">
    import ToggleableBox from "$lib/DaySelector/ToggleableBox.svelte";

    export let onChange: (val: boolean[]) => void;

    // TODO: localize
    const days = ["mon", "tues", "wed", "thurs", "fri", "sat", "sun"];

    const checked = Array(days.length).fill(false);

    $: onChange(checked);
</script>

<div class="flex gap-1 w-full">
    {#each days as day, idx}
        <ToggleableBox bind:checked={checked[idx]}>{day}</ToggleableBox>
    {/each}
</div>
