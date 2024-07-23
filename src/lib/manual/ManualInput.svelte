<script lang="ts">
  import range from "$lib/range";
  import {
    canonicalDateStr, type Coord,
    type DateStr,
    dateStrToEpoch, datetimeInRange,
    type DatetimeRange,
    intToTime, offsetDate, offsetDatetime, offsetRange, rangesToDate,
    timeInRange
  } from "$lib/timeutils.js";
  import {
    applyAvailability,
    type Availability, blankAvailability,
    compactAvailability,
    type InternalAvailability,
    mergeAvailability
  } from "$lib/manual/Availability";
  import {DAY, MILLISECOND, TIME_STEP} from "$lib/units";
  import {page} from "$app/stores";
  import type {Writable} from "svelte/store";
  import {importedEvents, importedWeeklyEvents, workingAvailability} from "$lib/store";
  import saveServer from "$lib/manual/saveServer.ts";

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
  }

  export let availability: InternalAvailability = blankAvailability(UTCDates.map(canonicalDateStr));
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

  /** Array of starting times in 15-minute intervals since midnight for all possible blocks. Changes with timezone */
  let blocks = [] as number[];
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

<div class="flex items-stretch select-none">
    <!-- Row headers -->
    {#if dates.length > 0}
        <!-- TODO: don't use magic constants -->
        <div class="text-right pr-1" style:padding-top={shouldUseWeekdays ? "17px" : "40px"}>
            {#each [...blocks, blocks.at(-1) + 1] as block, idx}
                <div class="label" role="rowheader">
                    {idx % 2 === 0 ? intToTime(block * TIME_STEP).replace(" ", "\xa0") : " "}
                </div>
            {/each}
        </div>
    {/if}
    {#each dates as localDate}
        <!-- <Column> -->
        <div class="flex-grow text-center" role="row">
            <!-- Column header -->
            <div role="columnheader" class="px-1">
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
            <!-- Cell container -->
            <div class="bg-white" class:grayscale={isDisabled}>
                {#each blocks as localBlock}
                    <!-- <Cell> -->
                    {@const localTime = localBlock * TIME_STEP + tzOffset}
                    {@const date = new Date(canonicalDateStr(offsetDate(localDate, localTime)))}
                    {@const dateStr = canonicalDateStr(date)}
                    {@const colAvailability = availability[dateStr]}
                    {@const block = ((DAY + localTime) % DAY) / TIME_STEP}
                    {#if datetimeInRange(ranges, offsetDate(date, block * TIME_STEP))}
                        <div class="availability-cell flex" data-idx={block} data-date={date.getTime()}
                             style:opacity={allParticipants.length && !useMulticolor ? (colAvailability[block]?.length ?? allParticipants.length) / allParticipants.length : "1"}
                             class:cursor-pointer={!availablePeople && !isDisabled}
                             class:cursor-not-allowed={isDisabled}
                             class:available={selectRectIncludesBlock([date.getTime(), block], dragStart, dragNow) ? dragState : colAvailability[block]?.length}
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
                    {:else}
                        <div class="h-[16px]"></div>
                    {/if}
                    <!-- </Cell> -->
                {/each}
            </div>
        </div>
        <!-- </Column> -->
    {/each}
</div>
<svelte:window on:pointerup={handlePointerUp} />

<style>
    .label {
        height: 16px;
        line-height: 16px;
    }
    [role="columnheader"] {
        position: sticky;
        top: 0;
        background-color: var(--color-bg-1);
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
