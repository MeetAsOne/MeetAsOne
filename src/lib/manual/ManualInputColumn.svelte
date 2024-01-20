<script lang="ts">
  import {UpsertAvailabilityStore} from "$houdini";
  import {compactAvailability} from "$lib/manual/Availability.js";

  /** The date for which to display this column */
  export let date: number;

  export let save: () => void;


  /** TODO: docs */
  export let blocks: number[];

  /** The number here corresponds to how many people RSVPd "yes" */
  export let availability: number[] = new Array(blocks.length).fill(0);

  /** Setting this also disables input */
  export let totalParticipants = 0;

  let isDragging = false;
  let dragState: boolean | null = null;

  const toggleAvailability = (timeIndex: number) => {
    if (dragState === null) {
      dragState = !availability[timeIndex];
    }

    availability[timeIndex] = Math.min(dragState, true);
  };

  const handleMouseDown = (timeIndex: number) => {
    if (totalParticipants) return;
    isDragging = true;
    toggleAvailability(timeIndex);
  };

  const handleMouseEnter = (timeIndex: number) => {
    if (isDragging) {
      toggleAvailability(timeIndex);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      dragState = null;
      save();
    }
  };
</script>

<div class="w-[7em] text-center">
    <div>{new Date(date).toLocaleDateString()}</div>
    <div class="bg-white">
        {#each blocks as block, idx}
            <div class="availability-cell"
                 style:opacity={totalParticipants ? availability[idx] / totalParticipants : "1"}
                 class:available={availability[idx]}
                 on:mousedown={() => handleMouseDown(idx)}
                 on:mouseenter={() => handleMouseEnter(idx)}
                 on:mouseup={handleMouseUp}>
            </div>
        {/each}
    </div>
</div>
<svelte:window on:mouseup={handleMouseUp} />

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
