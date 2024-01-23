<script lang="ts">
  import type {Writable} from "svelte/store";
  import {daysOfWeek} from "$lib/timeutils.ts";

  /** The date for which to display this column */
  export let date: number;

  export let save: () => void;


  /** Array of starting times in 15-minute intervals since midnight for all possible blocks */
  export let blocks: number[];

  /** The number here corresponds to how many people RSVPd "yes" */
  export let availability: string[][] = new Array(blocks.length).map(() => []);

  /** Self-explanatory. Used for setting transparency of group calendar */
  export let totalParticipants = 0;

  /** store to write to when hovering over group's time blocks. Setting this also disables input */
  export let availablePeople: Writable<string[]> | undefined = undefined;

  let isDragging = false;
  let dragState: boolean | null = null;

  const toggleAvailability = (timeIndex: number) => {
    if (dragState === null) {
      dragState = !(availability[timeIndex]?.length ?? 0);
    }

    availability[timeIndex] = dragState ? ["me"] : [];
  };

  // Had to implement 2 separate touch and mouse handlers (instead of using pointer handler) b/c `touch-none` prevents 2-finger panning but without it, page scrolls while selecting
  function convertTouchEvent(ev: TouchEvent) {
    if (ev.touches.length > 1)
      handlePointerUp()
    else if (!availablePeople) {
      ev.preventDefault();
      isDragging = true;
      return Number.parseInt((document.elementFromPoint(ev.touches[0].clientX, ev.touches[0].clientY) as HTMLElement).dataset.idx!)
    }
  }

  const handleMouseDown = (timeIndex: number) => {
    if (availablePeople) return;
    isDragging = true;
    toggleAvailability(timeIndex);
  };

  const handlePointerEnter = (timeIndex: number | undefined) => {
    if (timeIndex == undefined) return;
    if (isDragging) {
      toggleAvailability(timeIndex);
    }
    if (availablePeople)
      availablePeople.set(availability[timeIndex] ?? []);
  };

  const handlePointerUp = () => {
    if (isDragging) {
      isDragging = false;
      dragState = null;
      if (!availablePeople)
        save();
    }
  };
</script>

<div class="flex-grow text-center">
    <div>{daysOfWeek[new Date(date).getDay()]}<br />{new Date(date).toLocaleDateString()}</div>
    <div class="bg-white">
        {#each blocks as block}
            <div class="availability-cell" data-idx={block} class:cursor-pointer={!availablePeople}
                 style:opacity={totalParticipants ? (availability[block]?.length ?? totalParticipants) / totalParticipants : "1"}
                 class:available={availability[block]?.length}
                 on:mousedown={() => handleMouseDown(block)}
                 on:mouseenter={() => handlePointerEnter(block)}
                 on:touchmove={ev => handlePointerEnter(convertTouchEvent(ev))}
            >
            </div>
        {/each}
    </div>
</div>
<svelte:window on:pointerup={handlePointerUp} />

<style>
    .availability-cell {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: center;
        background-color: #f8f8f8;
    }
    .available {
        background-color: #90ee90;
    }
</style>
