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
    import {canonicalDateStr, dateStrToEpoch, rangesToDate} from "$lib/timeutils";
    import {page} from "$app/stores";
    import {type EventSummary, getPastEvents, savePastEvents} from "$lib/storage";
    import {writable} from "svelte/store";
    import AvailabilityComponent from "$lib/Availability.svelte";
    import {importedWeeklyEvents, isSaved, workingAvailability} from "$lib/store.ts";
    import {Button, ButtonGroup, Checkbox, DropdownItem, Input, Label, Spinner, Tooltip} from "flowbite-svelte";
    import {timeoutToast, editToast, newToast} from "$lib/Toaster.svelte";
    import saveServer from "$lib/manual/saveServer.ts";
    import TzPicker from "$lib/TzPicker.svelte";

    export let data: PageData;
  let event: GetEvent$result["events"][number] | undefined;
  /** list of people available for focused block*/
  const selectedAvailability = writable([] as string[]);
  let useMulticolor = globalThis?.localStorage?.useMulticolor === "true";
  $: if (globalThis?.localStorage) globalThis.localStorage.useMulticolor = useMulticolor.toString();

  // pull the store reference from the route props
  $: ({ GetEvent } = data);
  $: event = $GetEvent?.data?.events?.[0];
  $: {
    if ($GetEvent.errors) console.error($GetEvent.errors);
  }

  const pastEvents = getPastEvents();
  /** Minutes difference in UTC of selected timezone */
  let tzOffset = new Date().getTimezoneOffset();

  $: {
    if (
      pastEvents.every((event) => event.id != $page.params.id) &&
      event
    ) {
      pastEvents.push({ id: $page.params.id, name: event.name, imOwner: false });
      savePastEvents(pastEvents);
    }
  }

  let mySavedAvailability: Availability | undefined;
  $: mySavedAvailability = event?.availabilities.find(avail => avail.username === myName)?.availability;

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

  const localAvailability: Availability = JSON.parse(
          globalThis?.localStorage?.["general-availability"] ?? '{"days": {}}',
  ).days;

  /** Function bound to my ManualInput availability that when called, clears your availability for this event */
  let clear: () => {};

  let myName = pastEvents.find(ev => ev.id === $page.params.id)?.myName;
  $: {
    const thisEventSummary = pastEvents.find(ev => ev.id === $page.params.id);
    if (thisEventSummary) {
      thisEventSummary.myName = myName;
      savePastEvents(pastEvents);
    }
  }

  function submitName(ev: SubmitEvent) {
    const data = new FormData(ev.currentTarget as HTMLFormElement);
    data.get("setMyName");
    myName = data.get("myName") as string;
  }
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
      <TzPicker bind:selectedTimezone={tzOffset} />
    </em>
  </div>
  <div class="flex gap-2 flex-wrap">
    <div class="flex gap-2">
      <Button on:click={() => localStorage["general-availability"] = localStorage.draftAvailability}>
        Save availability to browser
      </Button>
      {#if Object.keys(localAvailability).length}
        <Button on:click={() => importedWeeklyEvents.set(localAvailability)}>
          Load saved
        </Button>
      {/if}
      <div class="border-l-2 border-orange-400"></div>
    </div>
    <div class="flex gap-2">
      <Button on:click={clear}>
        Clear
      </Button>
      <Button on:click={() => myName = undefined}>
        Change name
      </Button>
      <div class="border-l-2 border-orange-400"></div>
    </div>
    <ImportCalendar />
  </div>
    <div class="flex flex-row flex-wrap justify-center gap-x-20 gap-y-10 mt-10">
      <div>
        {#if myName}
          <h2>
            Your availability
            {#if !$isSaved}
              <Spinner size="6" title="Saving..." />
            {/if}
          </h2>
          <ManualInput
            ranges={event.dates}
            availability={mySavedAvailability ? loadAvailabilityOne(mySavedAvailability) : undefined}
            isDisabled={!isOnline}
            bind:clear
            {tzOffset}
            shouldUseWeekdays={event.shouldUseWeekdays}
          />
        {:else}
          <form on:submit|preventDefault={submitName}>
            <label class="mb-2 block" for="setMyName">Your name (only for this event):</label>
            <ButtonGroup>
              <Input id="setMyName" name="myName" placeholder="Name" />
              <Button type="submit">Save</Button>
            </ButtonGroup>
          </form>
        {/if}
      </div>
      <div class="flex flex-row">
        <div>
          <Tooltip triggeredBy=".availability-cell" class="z-[1000]">
            <AvailabilityComponent
                    everyone={event.availabilities.map((person) => person.username)}
                    available={$selectedAvailability}
            />
          </Tooltip>
        </div>
        <div>
          <h2>Group Availability</h2>
          <Checkbox class="dark:text-black justify-center" bind:checked={useMulticolor}>Multicolor</Checkbox>
          <ManualInput
            allParticipants={Array.from(new Set(event.availabilities.map(person => person.username)).add(myName ?? "me"))}
            ranges={event.dates}
            availablePeople={selectedAvailability}
            {tzOffset}
            {useMulticolor}
            availability={mergeAvailability(enforceAvailabilityValidity(loadAvailability(...event.availabilities), rangesToDate(event.dates).map(canonicalDateStr)), $workingAvailability, myName)}
            shouldUseWeekdays={event.shouldUseWeekdays}
          />
        </div>
      </div>
    </div>
{/if}
