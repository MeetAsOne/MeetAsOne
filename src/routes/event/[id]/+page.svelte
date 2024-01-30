<script lang="ts">
    import ImportCalendar from "$lib/importCalendar/ImportCalendar.svelte";
    import {
      type Availability, enforceAvailabilityValidity,
      loadAvailability, loadAvailabilityOne,
      mergeAvailability
    } from "$lib/manual/Availability.js";
    import ManualInput from "$lib/manual/ManualInput.svelte";
    import type {GetEvent$result} from "$houdini";
    import type {PageData} from "$houdini/types/src/routes/event/[id]/$houdini";
    import {dateStrToEpoch} from "$lib/timeutils";
    import {page} from "$app/stores";
    import {getPastEvents, savePastEvents} from "$lib/storage";
    import {writable} from "svelte/store";
    import AvailabilityComponent from "$lib/Availability.svelte";
    import {isSaved, workingAvailability} from "$lib/store.ts";
    import {Button, Checkbox, Spinner} from "flowbite-svelte";
    import {timeoutToast, editToast, newToast} from "$lib/Toaster.svelte";
    import saveServer from "$lib/manual/saveServer.ts";
    import TzPicker from "$lib/TzPicker.svelte";

    export let data: PageData;
  let event: GetEvent$result["events"][number] | undefined;
  /** list of people available for focused block*/
  const selectedAvailability = writable([] as string[]);
  let useMulticolor = globalThis?.localStorage?.useMulticolor === "true";
  $: if (globalThis?.localStorage) globalThis.localStorage.useMulticolor = useMulticolor;

  // pull the store reference from the route props
  $: ({ GetEvent } = data);
  $: event = $GetEvent?.data?.events?.[0];
  $: {
    if ($GetEvent.errors) console.error($GetEvent.errors);
  }

  const pastEvents = getPastEvents();
  let selectedTimezone: number;

  $: {
    if (
      pastEvents.created.every((event) => event.id != $page.params.id) &&
      pastEvents.responded.every((event) => event.id != $page.params.id) &&
      event
    ) {
      pastEvents.responded.push({ id: $page.params.id, name: event.name });
      savePastEvents(pastEvents);
    }
  }

  let mySavedAvailability: Availability | undefined;
  $: mySavedAvailability = event?.availabilities.find(avail => avail.username === globalThis?.localStorage?.name)?.availability;

  let isOnline = true;
  let toastRef: number;

  globalThis?.window?.addEventListener('online', function() {
    isOnline = true;
    timeoutToast(editToast(toastRef, "Connection restored!"), 1000);
    // TODO: saveServer($page.params.id, availability);
  });

  globalThis?.window?.addEventListener('offline', function() {
    isOnline = false;
    toastRef = newToast("Editing disabled while offline");
  });
</script>

<svelte:head>
  <title>{event ? event.name : "Event not found"} - MeetAsOne</title>
  <meta
    name="description"
    content={event
      ? `Share your availability for ${event.name}`
      : "Find a time for your event today on MeetAsOne"}
  />
</svelte:head>

{#if $GetEvent.errors || $GetEvent.data?.events?.length === 0}
  Event doesn't exist. <a href="/">Go home?</a>
{:else if event}
  <h1>{event?.name ?? ""}</h1>
  <div class="flex justify-center items-center">
    <em class="m-5">
      Times are in
      <TzPicker bind:selectedTimezone />
    </em>
  </div>
  <div class="flex justify-between gap-2">
    <Button on:click={() => localStorage["general-availability"] = localStorage.draftAvailability}>Save availability to browser</Button>
    <ImportCalendar />
  </div>

  <div class="mt-10 flex items-center justify-center">
    <div class="flex flex-row flex-wrap items-center justify-center">
      <div>
        <h2>
          Your availability
          {#if !$isSaved}
            <Spinner size={6} title="Saving..." />
          {/if}
        </h2>
        <ManualInput
          dates={event.dates.map(dateStrToEpoch)}
          timeRange={[event.start_time, event.end_time]}
          availability={mySavedAvailability ? loadAvailabilityOne(mySavedAvailability) : undefined}
          isDisabled={!isOnline}
        />
      </div>
      <div class="w-10"></div>
      <div class="flex flex-row">
        <div>
          <Checkbox class="dark:text-black" bind:checked={useMulticolor}>Multicolor</Checkbox>
          <AvailabilityComponent
                  everyone={event.availabilities.map((person) => person.username)}
                  available={$selectedAvailability}
          />
        </div>
        <div>
          <h2>Group Availability</h2>
          <ManualInput
            allParticipants={Array.from(new Set(event.availabilities.map(person => person.username)).add(globalThis?.localStorage?.name ?? "me"))}
            dates={event.dates.map(dateStrToEpoch)}
            availablePeople={selectedAvailability}
            timeRange={[event.start_time, event.end_time]}
            {useMulticolor}
            availability={mergeAvailability(enforceAvailabilityValidity(loadAvailability(...event.availabilities), event.dates), $workingAvailability, globalThis?.localStorage?.name)}/>
        </div>
      </div>
    </div>
  </div>
{/if}
