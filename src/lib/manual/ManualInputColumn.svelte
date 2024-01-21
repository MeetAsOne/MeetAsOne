<script lang="ts">
  import type {Writable} from "svelte/store";

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

  const handlePointerDown = (timeIndex: number, ev: PointerEvent) => {
    // So stupid https://stackoverflow.com/a/70976017
    (ev.target as HTMLElement).releasePointerCapture(ev.pointerId);
    if (availablePeople) return;
    isDragging = true;
    toggleAvailability(timeIndex);
  };

  const handlePointerEnter = (timeIndex: number) => {
    if (isDragging) {
      toggleAvailability(timeIndex);
    }
    if (availablePeople)
      availablePeople.set(availability[timeIndex] ?? []);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      dragState = null;
      if (!availablePeople)
        save();
    }
  };
</script>

<div class="w-[7em] text-center">
    <div>{new Date(date).toLocaleDateString()}</div>
    <div class="bg-white touch-none">
        {#each blocks as block}
            <div class="availability-cell" class:cursor-pointer={!totalParticipants}
                 style:opacity={totalParticipants ? (availability[block]?.length ?? totalParticipants) / totalParticipants : "1"}
                 class:available={availability[block]}
                 on:pointerdown={(ev) => handlePointerDown(block, ev)}
                 on:pointerenter={() => handlePointerEnter(block)}>
            </div>
        {/each}
    </div>
</div>
<svelte:window on:pointerup={handleMouseUp} />

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
