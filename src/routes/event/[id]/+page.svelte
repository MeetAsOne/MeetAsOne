<script lang="ts">
    import ImportCalendar from "$lib/importCalendar/ImportCalendar.svelte";
    import {applyAvailability, loadAvailability} from "$lib/manual/Availability.js";
    import ManualInput from "$lib/manual/ManualInput.svelte";
    import type {GetEvent$result} from "$houdini";
    import type {PageData} from "$houdini/types/src/routes/event/[id]/$houdini";
    import {dateStrToEpoch} from "$lib/timeutils";
    import {page} from "$app/stores";
    import {getPastEvents, savePastEvents} from "$lib/storage";
    import {writable} from "svelte/store";
    import Availability from "$lib/Availability.svelte";

    export let data: PageData;
    let event: GetEvent$result["events"][number] | undefined;
    let shouldSave = true;
    /** list of people available for focused block*/
    const selectedAvailability = writable([] as string[]);
    $: console.log($selectedAvailability);

    // pull the store reference from the route props
    $: ({ GetEvent } = data);
    $: event = $GetEvent.data?.events?.[0];
    $: {
      if ($GetEvent.errors)
        throw $GetEvent.errors;
    }

    const pastEvents = getPastEvents();

    $: {
      if (pastEvents.created.every(event => event.id != $page.params.id) && pastEvents.responded.every(event => event.id != $page.params.id) && event) {
        pastEvents.responded.push({id: $page.params.id, name: event.name});
        savePastEvents(pastEvents);
      }
    }

    const localAvailability = JSON.parse(globalThis?.localStorage?.["general-availability"] ?? '{"days": {}}');
</script>

<svelte:head>
	<title>{event ? event.name : 'Event not found'} - MeetAsOne</title>
	<meta
		name="description"
		content={event ? `Share your availability for ${event.name}` : "Find a time for your event today on MeetAsOne"}
	/>
</svelte:head>


{#if $GetEvent.data?.events?.length === 0}
    Event doesn't exist. <a href="/">Go home?</a>
{:else if event}
    <h1>{event?.name ?? ""}</h1>
    <em>{event?.timezone ?? ""}</em>

    <label for="darkModeToggle">Save My Calendar</label>
    <input type="checkbox" id="darkModeToggle" bind:checked={shouldSave} />
    <ImportCalendar/>
    <div class="flex flex-wrap">
        <div><h2>Your availability</h2>
            <ManualInput dates={event.dates.map(dateStrToEpoch)} timeRange={[event.start_time, event.end_time]}
                         {shouldSave}
                         availability={applyAvailability(event.dates.map(dateStrToEpoch), localAvailability.days)}/>
        </div>
        <div>
            <h2>Group Availability</h2>
            <ManualInput totalParticipants={event.availabilities.length} dates={event.dates.map(dateStrToEpoch)}
                         availablePeople={selectedAvailability}
                         timeRange={[event.start_time, event.end_time]}
                         availability={loadAvailability(...event.availabilities)}/>
        </div>
        <Availability everyone={event.availabilities.map(person => person.username)} available={$selectedAvailability} />
    </div>
{/if}
