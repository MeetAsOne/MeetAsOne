<script lang="ts">
  import range from "$lib/range";
  import {canonicalDateStr, type DateStr, intToTime} from "$lib/timeutils.js";
  import {type Availability, compactAvailability, type InternalAvailability, mergeAvailability} from "$lib/manual/Availability";
  import {UpsertAvailabilityStore} from "$houdini";
  import {TIME_STEP} from "$lib/units";
  import {page} from "$app/stores";
  import type {Writable} from "svelte/store";
  import { importedEvents, workingAvailability } from "$lib/store";
  import {getOrSetName} from "$lib/storage.ts";

  export let availability: InternalAvailability = {};
  let formattedAvailability: Availability = {};
  let weeklyAvailability: Availability = {};
  $: [formattedAvailability, weeklyAvailability] = compactAvailability(availability);
  $: if (!availablePeople) workingAvailability.set(formattedAvailability);
  $: console.log("availability", availability);
  $: console.log("formattedAvailability", formattedAvailability);

  importedEvents.subscribe((currentValue) => {
    mergeAvailability(availability, currentValue)
    availability = {...availability}; // Trigger Svelte's reactivity by reassigning the variable
  })

  /** Epoch timestamps for which to display the UI */
  export let dates: number[];

  /** store to write to when hovering over group's time blocks. Setting this also disables input */
  export let availablePeople: Writable<string[]> | undefined = undefined;

  /** Tuple, each ranges from 0 to 1439 (minutes in day) */
  export let timeRange: [number, number];

  /** Array of starting times in 15-minute intervals since midnight for all possible blocks */
  const blocks = range(...timeRange.map(t => Math.floor(t / TIME_STEP)) as typeof timeRange, 1);

  /** Names of all participants */
  export let allParticipants: string[] = [];

  /** If true, display each person in cell as their own color. Otherwise, use shades of green */
  export let useMulticolor = false;

  /** Push availability change to server, save to localStorage */
  async function save() {
    for (const date in availability) {
      for (const block of blocks) {
        availability[date][block] = (selectRectIncludesBlock([new Date(date).getTime(), block], [dragStart, dragNow]) ? dragState : availability[date][block]?.length) ? ["me"] : [];
      }
    }
    // Ensure svelte reactive vars have run
    await new Promise(res => setTimeout(res, 200));

    globalThis?.localStorage?.setItem?.('draftAvailability', JSON.stringify({
      "time-zone": 1,  // TODO
      days: weeklyAvailability,
    }));

    const updater = new UpsertAvailabilityStore();
    const username = getOrSetName();
    if (!username) return;
    const res = await updater.mutate({
      availability: formattedAvailability,
      username,
      eventId: $page.params.id,
    });
    if (res.errors)
      res.errors.forEach(console.error);
    if (res.data?.insert_availability?.affected_rows === 0)
      console.error("No rows were changed")
  }

  /** Represents [Date (as ms since epoch), block idx since midnight] */
  type Coord = [number, number];
  let dragStart: Coord | null;
  let dragNow: Coord | null;
  let dragState: boolean | null;

  const toggleAvailability = (date: DateStr, timeIndex: number) => {
    if (dragState == null) {
      dragState = !(availability[date][timeIndex]?.length ?? 0);
    }

    dragNow = [new Date(date).getTime(), timeIndex];
  };

  // Had to implement 2 separate touch and mouse handlers (instead of using pointer handler) b/c `touch-none` prevents 2-finger panning but without it, page scrolls while selecting
  function convertTouchEvent(ev: TouchEvent) {
    if (ev.touches.length > 1)
      handlePointerUp()
    else if (!availablePeople) {
      ev.preventDefault();
      const target = document.elementFromPoint(ev.touches[0].clientX, ev.touches[0].clientY) as HTMLElement;
      const idx = Number.parseInt(target.dataset.idx!);
      if (!dragStart)
        dragStart = dragNow = [Number.parseInt(target.dataset.date!), idx];
      return idx;
    }
  }

  const handleMouseDown = (date: DateStr, timeIndex: number) => {
    if (availablePeople) return;
    dragStart = dragNow = [new Date(date).getTime(), timeIndex];
    toggleAvailability(date, timeIndex);
  };

  const handlePointerEnter = (date: DateStr, timeIndex: number | undefined) => {
    if (timeIndex == undefined) return;
    if (dragStart) {
      toggleAvailability(date, timeIndex);
    }
    if (availablePeople)
      availablePeople.set(availability[date][timeIndex] ?? []);
  };

  const handlePointerUp = () => {
    if (dragStart) {
      if (!availablePeople)
        save();
      dragStart = dragNow = dragState = null;
    }
  };

  function selectRectIncludesBlock(coord: Coord, deps?: unknown[]) {
    if (!dragStart || !dragNow) return false;
    const [x, y] = coord;
    const [x1, y1, x2, y2] = [
      Math.min(dragStart[0], dragNow[0]),
      Math.min(dragStart[1], dragNow[1]),
      Math.max(dragStart[0], dragNow[0]),
      Math.max(dragStart[1], dragNow[1]),
    ];
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  }
</script>

<div class="flex items-stretch select-none">
    {#if dates.length > 0}
        <div class="labels text-right pr-1">
            {#each blocks as block, idx}
                <div class="label" role="rowheader">
                    {idx % 2 === 0 ? intToTime(block * TIME_STEP) : " "}
                </div>
            {/each}
        </div>
    {/if}
    {#each dates.map(d => new Date(d)) as date}
        <!-- <Column> -->
        {@const colAvailability = availability[date.toLocaleDateString()]}
        {@const dateStr = canonicalDateStr(date)}
        <div class="flex-grow text-center" role="row">
            <div role="columnheader" class="px-1">
                {new Intl.DateTimeFormat(undefined, {weekday: "short"}).format(date)}
                <br />
                <span class="text-sm">
                    {new Intl.DateTimeFormat(undefined, {
                      month: "short",
                      day: "numeric",
                    }).format(date)}
                </span>
            </div>
            <div class="bg-white">
                {#each blocks as block}
                    <!-- <Cell> -->
                    <div class="availability-cell flex" data-idx={block} data-date={date.getTime()}
                         style:opacity={allParticipants.length && !useMulticolor ? (colAvailability[block]?.length ?? allParticipants.length) / allParticipants.length : "1"}
                         class:cursor-pointer={!availablePeople}
                         class:available={selectRectIncludesBlock([date.getTime(), block], [dragStart, dragNow]) ? dragState : colAvailability[block]?.length}
                         on:mousedown={() => handleMouseDown(dateStr, block)}
                         on:mouseenter={() => handlePointerEnter(dateStr, block)}
                         on:touchmove={ev => handlePointerEnter(dateStr, convertTouchEvent(ev))}
                         role="cell"
                         tabindex="0"
                    >
                        {#if allParticipants.length && useMulticolor}
                            {#each (colAvailability[block] ?? []) as participant}
                                {@const hue = (allParticipants.indexOf(participant) + 1) / allParticipants.length * 365}
                                <div class="flex-1" style:background-color={`hsl(${hue}, 65%, 79%)`}></div>
                            {/each}
                        {/if}
                    </div>
                    <!-- </Cell> -->
                {/each}
            </div>
        </div>
        <!-- </Column> -->
    {/each}
</div>
<svelte:window on:pointerup={handlePointerUp} />

<style>
    .labels {
        /* TODO: don't use magic constants */
        /*line-height: 1.1;*/
        padding-top: 48px;
    }
    .label {
        height: 16px;
        line-height: 16px;
    }

    .availability-cell {
        border: 1px solid #ccc;
        height: 16px;
        text-align: center;
        background-color: #f8f8f8;
        display: flex;
    }
    .available {
        background-color: #90ee90;
    }
</style>
