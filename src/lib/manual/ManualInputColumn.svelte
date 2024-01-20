<script lang="ts">
  import range from "$lib/range";

  /** The date for which to display this column */
  export let date: number;


  /** TODO: docs */
  export let blocks: number[];

  let availability = new Array(blocks.length).fill(false);

  let isDragging = false;
  let dragState: boolean | null = null;

  const toggleAvailability = (timeIndex: number) => {
    if (dragState === null) {
      dragState = !availability[timeIndex];
    }

    availability[timeIndex] = dragState;
  };

  const handleMouseDown = (timeIndex: number) => {
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
    }
  };

  // You would typically handle the actual saving of the availability state to some backend or storage here
  const saveAvailability = () => {
    console.log('Saving Availability:', availability);
  };
</script>

<div class="w-[7em] text-center">
    <div>{new Date(date).toLocaleDateString()}</div>
    {#each blocks as block, idx}
        <div class="availability-cell" class:available={availability[idx]}
             on:mousedown={() => handleMouseDown(idx)}
             on:mouseenter={() => handleMouseEnter(idx)}
             on:mouseup={handleMouseUp}>
            <!--{block}-->
        </div>
    {/each}
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
