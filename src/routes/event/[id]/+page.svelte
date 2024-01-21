<script lang="ts">
    import ImportCalendar from "$lib/importCalendar/ImportCalendar.svelte";
    import {applyAvailability} from "$lib/manual/Availability.js";
    import ManualInput from "$lib/manual/ManualInput.svelte";
    import type {GetEvent$result} from "$houdini";
    import type {PageData} from "$houdini/types/src/routes/event/[id]/$houdini";
    import {dateStrToEpoch} from "$lib/timeutils";

    export let data: PageData;
    let event: GetEvent$result["events"][number] | undefined;
    let shouldSave = false;

    // pull the store reference from the route props
    $: ({ GetEvent } = data);
    $: event = $GetEvent.data?.events?.[0];

    const localAvailability = JSON.parse(globalThis?.localStorage?.["general-availability"] ?? '{"days": {}}');
</script>

<label for="darkModeToggle">Save My Calendar</label>
<input type="checkbox" id="darkModeToggle" bind:checked={shouldSave} />
{#if event}
    {JSON.stringify(event)}
    <div class="flex flex-wrap">
<!--        <ManualInput dates={event.dates.map(dateStrToEpoch)} timeRange={[event.start_time, event.end_time]} {shouldSave} availability={applyAvailability(event.dates.map(dateStrToEpoch), localAvailability.days)} />-->
    </div>
{/if}

<ImportCalendar/>
