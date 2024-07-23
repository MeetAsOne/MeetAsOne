<script lang="ts">
    import {
      type Availability, enforceAvailabilityValidity,
      loadAvailability, loadAvailabilityOne,
      mergeAvailability, mergeServerLocal
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
    import EditSaved from "$lib/EditSaved.svelte";

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
  <h1 class="pt-4">{event?.name ?? ""}</h1>
  <div class="flex justify-center items-center">
    <em class="m-5">
      Times are in
      <TzPicker bind:selectedTimezone={tzOffset} />
    </em>
  </div>
  <div class="flex gap-2 flex-wrap justify-between">
    <div class="flex gap-2 items-center">
      Availability:
      <Button on:click={() => localStorage["general-availability"] = localStorage.draftAvailability}>
        Save
      </Button>
      {#if Object.keys(localAvailability).length}
        <Button on:click={() => importedWeeklyEvents.set(localAvailability)}>
          Load
        </Button>
      {/if}
      <Button on:click={clear}>
        Clear
      </Button>
<!-- TODO:      <EditSaved {isOnline} />-->
    </div>
  </div>
    <div id="availability-container" class="flex flex-row flex-wrap justify-between gap-x-20 gap-y-10 mt-10">
      <div>
        {#if myName}
          <h2>
            <Button on:click={() => myName = undefined}>
              {myName}'s
            </Button> availability
            <Spinner size="6" title="Saving..." class={$isSaved ? "invisible" : ""} />
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
      <div>
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
            availability={mergeServerLocal(enforceAvailabilityValidity(loadAvailability(...event.availabilities), rangesToDate(event.dates).map(canonicalDateStr)), $workingAvailability, myName)}
            shouldUseWeekdays={event.shouldUseWeekdays}
          />
        </div>
      </div>
    </div>
{/if}

<style>
  #availability-container > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
    max-width: 100%;
  }
</style>
