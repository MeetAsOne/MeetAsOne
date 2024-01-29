<script lang="ts">
  import range from "$lib/range";
  import {canonicalDateStr, type DateStr, dateStrToEpoch, intToTime} from "$lib/timeutils.js";
  import {
    applyAvailability,
    type Availability, blankAvailability,
    compactAvailability,
    type InternalAvailability,
    mergeAvailability
  } from "$lib/manual/Availability";
  import {TIME_STEP} from "$lib/units";
  import {page} from "$app/stores";
  import type {Writable} from "svelte/store";
  import {importedEvents, importedWeeklyEvents, workingAvailability} from "$lib/store";
  import saveServer from "$lib/manual/saveServer.ts";

  /** Epoch timestamps for which to display the UI */
  export let dates: number[];

  // Whether to allow input. Controls manual mode, not viewing mode
  export let isDisabled = false;

  export let availability: InternalAvailability = blankAvailability(dates.map(d => canonicalDateStr(new Date(d))));
  let formattedAvailability: Availability = {};
  let weeklyAvailability: Availability = {};
  $: [formattedAvailability, weeklyAvailability] = compactAvailability(availability);
  $: if (!availablePeople) workingAvailability.set(formattedAvailability);
  $: console.log("availability", availability);
  $: console.log("formattedAvailability", formattedAvailability);

  importedEvents.subscribe((currentValue) => {
    mergeAvailability(availability, currentValue)
    availability = {...availability}; // Trigger Svelte's reactivity by reassigning the variable
  });

  importedWeeklyEvents.subscribe((currentValue) => {
    if (!Object.keys(currentValue).length) return;
    availability = mergeAvailability(availability,
      compactAvailability(applyAvailability(
        Object.keys(availability).map(dateStrToEpoch),
        currentValue,
      ))[0]
    );
    importedWeeklyEvents.set({});
    saveServer($page.params.id, availability);
  });

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

  function applyDragPreview() {
    for (const date in availability) {
      for (const block of blocks) {
        availability[date][block] = (selectRectIncludesBlock([new Date(date).getTime(), block], [dragStart, dragNow]) ? dragState : availability[date][block]?.length) ? ["me"] : [];
      }
    }
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
  function convertTouchEvent(ev: TouchEvent): [DateStr | undefined, number | undefined] {
    if (ev.touches.length > 1)
      handlePointerUp()
    else {
      ev.preventDefault();
      const target = document.elementFromPoint(ev.touches[0].clientX, ev.touches[0].clientY) as HTMLElement;
      const idx = Number.parseInt(target.dataset.idx!);
      const date = Number.parseInt(target.dataset.date!)
      if (!dragStart && !availablePeople && !isDisabled)
        dragStart = dragNow = [date, idx];
      return [canonicalDateStr(new Date(date)), idx];
    }
    return [undefined, undefined];
  }

  const handleMouseDown = (date: DateStr, timeIndex: number) => {
    if (availablePeople || isDisabled) return;
    dragStart = dragNow = [new Date(date).getTime(), timeIndex];
    toggleAvailability(date, timeIndex);
  };

  const handlePointerEnter = (date?: DateStr, timeIndex?: number) => {
    if (timeIndex == undefined || date == undefined) return;
    if (dragStart) {
      toggleAvailability(date, timeIndex);
    }
    if (availablePeople)
      availablePeople.set(availability[date][timeIndex] ?? []);
  };

  const handlePointerUp = () => {
    if (dragStart) {
      if (!availablePeople) {
        applyDragPreview();
        saveServer($page.params.id, availability);
      }
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
    <!-- Row headers -->
    {#if dates.length > 0}
        <div class="labels text-right pr-1">
            {#each blocks as block, idx}
                <div class="label" role="rowheader">
                    {idx % 2 === 0 ? intToTime(block * TIME_STEP).replace(" ", "\xa0") : " "}
                </div>
            {/each}
        </div>
    {/if}
    {#each dates.map(d => new Date(d)) as date}
        <!-- <Column> -->
        {@const dateStr = canonicalDateStr(date)}
        {@const colAvailability = availability[dateStr]}
        <div class="flex-grow text-center" role="row">
            <!-- Column header -->
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
            <!-- Cell container -->
            <div class="bg-white" class:grayscale={isDisabled}>
                {#each blocks as block}
                    <!-- <Cell> -->
                    <div class="availability-cell flex" data-idx={block} data-date={date.getTime()}
                         style:opacity={allParticipants.length && !useMulticolor ? (colAvailability[block]?.length ?? allParticipants.length) / allParticipants.length : "1"}
                         class:cursor-pointer={!availablePeople && !isDisabled}
                         class:cursor-not-allowed={isDisabled}
                         class:available={selectRectIncludesBlock([date.getTime(), block], [dragStart, dragNow]) ? dragState : colAvailability[block]?.length}
                         on:mousedown={() => handleMouseDown(dateStr, block)}
                         on:mouseenter={() => handlePointerEnter(dateStr, block)}
                         on:touchmove={ev => handlePointerEnter(...convertTouchEvent(ev))}
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
    [role="columnheader"] {
        position: sticky;
        top: 0;
        background-color: var(--color-bg-1);
        z-index: 100;
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
