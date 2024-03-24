<script lang="ts">
    import TogglableBox from "$lib/DaySelector/TogglableBox.svelte";

    export let onChange: (val: boolean[]) => void;

    // TODO: localize
    const days = ["mon", "tues", "wed", "thurs", "fri", "sat", "sun"];

    const checked = Array(days.length).fill(false);

    $: onChange(checked);
</script>

<div class="flex gap-1 w-full">
    {#each days as day, idx}
        <TogglableBox bind:checked={checked[idx]}>{day}</TogglableBox>
    {/each}
</div>
