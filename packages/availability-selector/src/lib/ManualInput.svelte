<script lang="ts">
  import {range} from "./index.ts";
  import {
    canonicalDateStr,
    type Coord,
    type DateStr,
    datetimeInRange,
    type DatetimeRange,
    intToTime,
    offsetDate,
    offsetDatetime,
    offsetRange,
    rangesToDate,
    timeInRange
  } from "./timeutils.ts";
  import {
    type Availability,
    blankAvailability,
    compactAvailability,
    type InternalAvailability,
    mergeAvailability
  } from "./Availability.ts";
  import {DAY, TIME_STEP} from "./units.ts";
  import {page} from "$app/stores";
  import type {Writable} from "svelte/store";
  import {Tooltip} from "flowbite-svelte";
  import AvailabilityComponent from "./Availability.svelte";

  /** Array of [start, stop] tuples, representing minutes since epoch. Does not change to timezone */
  export let ranges: DatetimeRange[];

  /** Dates spanned by `ranges`. Changes with timezone */
  let dates = rangesToDate(ranges);
  /** Dates in UTC format */
  const UTCDates = dates;
  $: dates = rangesToDate(offsetRange(ranges, -tzOffset));

  /** Whether to allow input. Controls manual mode, not viewing mode */
  export let isDisabled = false;

  /** Minutes difference from UTC */
  export let tzOffset: number;

  /** if true, only show days of week (monday, tues, etc). Useful for recurring weekly meetings. If false, also show day of month (eg 13th) */
  export let shouldUseWeekdays: boolean;

  export const clear = () => {
    const blank = blankAvailability(UTCDates.map(canonicalDateStr));
    availability = blank;
    saveServer($page.params.id, availability);
    workingAvailability.set(blank);
  };

  export let availability: InternalAvailability = blankAvailability(UTCDates.map(canonicalDateStr));
  let formattedAvailability: Availability = {};
  let weeklyAvailability: Availability = {};
  $: [formattedAvailability, weeklyAvailability] = compactAvailability(availability);
  $: if (!availablePeople) workingAvailability.set(formattedAvailability);
  $: console.log("availability", availability);
  $: console.log("formattedAvailability", formattedAvailability);

  importedEvents.subscribe((currentValue) => {
    mergeAvailability(availability, currentValue);
    availability = {...availability}; // Trigger Svelte's reactivity by reassigning the variable
  });

  /** store to write to when hovering over group's time blocks. Setting this also disables input */
  export let availablePeople: Writable<string[]> | undefined = undefined;

  /** Array of starting times in 15-minute intervals since midnight for all possible blocks. Changes with timezone */
  let blocks = [] as number[];
  // right now range(0, DAY / TIME_STEP) is num mins in a day / 15 which is num blocks in a day
  $: blocks = range(0, DAY / TIME_STEP).filter(block => timeInRange(offsetRange(ranges, -tzOffset), block));

  /** Names of all participants */
  export let allParticipants: string[] = [];

  /** If true, display each person in cell as their own color. Otherwise, use shades of green */
  export let useMulticolor = false;

  /** Using dragStart, dragNow, and dragState, mark all cells within the dragged rectangle with their new respective value */
  function applyDragPreview() {
    for (const date in availability) {
      // Iter over all blocks b/c `blocks` var is localized
      for (const block of range(0, DAY / TIME_STEP)) {
        const includeBlock = selectRectIncludesBlock([new Date(date).getTime(), block], dragStart, dragNow)
                             && datetimeInRange(ranges, offsetDate(date, block * TIME_STEP));
        if (includeBlock)
          availability[date][block] = dragState ? ["me"] : [];
      }
    }
  }

  let dragStart: Coord | undefined;
  let dragNow: Coord | undefined;
  let dragState: boolean | undefined;

  const toggleAvailability = (date: DateStr, timeIndex: number) => {
    if (dragState == undefined) {
      dragState = !(availability[date][timeIndex]?.length ?? 0);
    }

    dragNow = [new Date(date).getTime(), timeIndex];
  };

  // Had to implement 2 separate touch and mouse handlers (instead of using pointer handler) b/c `touch-none` prevents 2-finger panning but without it, page scrolls while selecting
  function convertTouchEvent(ev: TouchEvent): [DateStr | undefined, number | undefined] {
    if (ev.touches.length > 1)
      handlePointerUp();
    else {
      ev.preventDefault();
      const target = document.elementFromPoint(ev.touches[0].clientX, ev.touches[0].clientY) as HTMLElement | null;
      if (!target || !target.classList.contains("availability-cell")) return [undefined, undefined];
      const idx = Number.parseInt(target.dataset.idx!);
      const date = Number.parseInt(target.dataset.date!);
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
      dragStart = dragNow = dragState = undefined;
    }
  };

  /** Returns a boolean whether `coord` is contained within a rectangle. Expects all `Coord`s to be in UTC */
  function selectRectIncludesBlock(coord: Coord, corner1?: Coord, corner2?: Coord) {
    if (!corner1 || !corner2) return false;
    corner1 = offsetDatetime(corner1, -tzOffset);
    corner2 = offsetDatetime(corner2, -tzOffset);
    const [x, y] = offsetDatetime(coord, -tzOffset);
    const [x1, y1, x2, y2] = [
      Math.min(corner1[0], corner2[0]),
      Math.min(corner1[1], corner2[1]),
      Math.max(corner1[0], corner2[0]),
      Math.max(corner1[1], corner2[1]),
    ];
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  }
</script>

<div class="flex flex-col items-stretch select-none">
    <!-- Column headers -->
    {#if dates.length > 0}
        <div class="flex sticky top-0">
            <div class="w-20"></div> <!-- Empty space for row headers -->
            {#each dates as localDate}
                <div class="flex-grow text-center" role="columnheader">
                    {new Intl.DateTimeFormat(undefined, {weekday: "short", timeZone: "UTC"}).format(localDate)}
                    {#if !shouldUseWeekdays}
                        <br />
                        <span class="text-sm">
                            {new Intl.DateTimeFormat(undefined, {
                              month: "short",
                              day: "numeric",
                              timeZone: "UTC",
                            }).format(localDate)}
                        </span>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
    <!-- Rows -->
    {#each blocks as block}
        <div class="flex items-center">
            <!-- Row header -->
            <div class="text-right pr-1 w-20 leading-4 relative bottom-2">
                {block % 2 === 0 ? intToTime(block * TIME_STEP).replace(" ", "\xa0") : " "}
            </div>
            <!-- Cells -->
            {#each dates as localDate}
                {@const localTime = block * TIME_STEP + tzOffset}
                {@const date = new Date(canonicalDateStr(offsetDate(localDate, localTime)))}
                {@const dateStr = canonicalDateStr(date)}
                {@const colAvailability = availability[dateStr]}
                {@const blockIndex = ((DAY + localTime) % DAY) / TIME_STEP}
                {#if datetimeInRange(ranges, offsetDate(date, blockIndex * TIME_STEP))}
                    <div class="availability-cell flex flex-grow" data-idx={blockIndex} data-date={date.getTime()}
                         style:--lightness={allParticipants.length && !useMulticolor ? (1 - (colAvailability[blockIndex]?.length ?? allParticipants.length) / allParticipants.length) * 70 + 30 + "%" : "30%"}
                         class:cursor-pointer={!availablePeople && !isDisabled}
                         class:cursor-not-allowed={isDisabled}
                         class:available={selectRectIncludesBlock([date.getTime(), blockIndex], dragStart, dragNow) ? dragState : colAvailability[blockIndex]?.length}
                         on:mousedown={() => handleMouseDown(dateStr, blockIndex)}
                         on:mouseenter={() => handlePointerEnter(dateStr, blockIndex)}
                         on:touchmove={ev => handlePointerEnter(...convertTouchEvent(ev))}
                         role="cell"
                         tabindex="0"
                    >
                        {#if allParticipants.length && useMulticolor}
                            {#each (colAvailability[blockIndex] ?? []) as participant}
                                {@const hue = (allParticipants.indexOf(participant) + 1) / allParticipants.length * 365}
                                <div class="flex-1" style:background-color={`hsl(${hue}, 65%, 79%)`}></div>
                            {/each}
                        {/if}
                    </div>
                    {#if allParticipants.length && colAvailability[blockIndex]}
                        <Tooltip class="z-[1000] pointer-events-none">
                            <AvailabilityComponent
                                    everyone={allParticipants}
                                    available={colAvailability[blockIndex]}
                            />
                        </Tooltip>
                    {/if}
                {:else}
                    <div class="h-[16px] flex-grow"></div>
                {/if}
            {/each}
        </div>
    {/each}
</div>
<svelte:window on:pointerup={handlePointerUp} />

<style>
    [role="columnheader"] {
        position: sticky;
        top: 0;
        background-color: var(--color-bg-1);
    }

    [role="columnheader"], .availability-cell {
        min-width: 2em;
    }

    .availability-cell {
        border: 1px solid #ccc;
        height: 16px;
        text-align: center;
        background-color: #f8f8f8;
        display: flex;
    }
    .available {
        /* I like how https://www.schemecolor.com/light-dark-green-gradient.php looks, but don't know how to replicate in code */
        background-color: hsl(120, 73%, var(--lightness));
    }
</style>
