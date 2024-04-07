<script lang="ts">
  import { Button, Modal } from 'flowbite-svelte';
  import {type Availability, enforceAvailabilityValidity, loadAvailabilityOne} from "$lib/manual/Availability.js";
  import ManualInput from "$lib/manual/ManualInput.svelte";
  import {canonicalDateStr, weekdayDateRanges, weekdayDates} from "$lib/timeutils.ts";

  export let isOnline: boolean;

  let clickOutsideModal = false;
  /** Function bound to my ManualInput availability that when called, clears your availability for this event */
  let clear: () => {};
  let availability = enforceAvailabilityValidity(
    loadAvailabilityOne(JSON.parse(
        globalThis?.localStorage?.["general-availability"] ?? '{"days": {}}',
      ).days as Availability),
    weekdayDates().map(canonicalDateStr)
  );
</script>

<Button on:click={() => (clickOutsideModal = true)}>Edit</Button>

<Modal title="Edit saved availability" bind:open={clickOutsideModal} autoclose outsideclose>
    <ManualInput
            ranges={weekdayDateRanges()}
            availability={availability}
            isDisabled={!isOnline}
            bind:clear
            tzOffset={new Date().getTimezoneOffset()}
            shouldUseWeekdays={true}
    />

    <svelte:fragment slot="footer">
        <Button on:click={() => localStorage["general-availability"] = localStorage.draftAvailability}>
            Save
        </Button>
        <Button on:click={clear}>
            Clear
        </Button>
    </svelte:fragment>
</Modal>
