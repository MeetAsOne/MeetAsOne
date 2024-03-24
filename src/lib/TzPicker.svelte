<script lang="ts">
  import {getAllTzNames, getLocalTzName, getTzOffset} from "$lib/timeutils";
  import {ChevronDownSolid} from "flowbite-svelte-icons";
  import {Button, Dropdown, DropdownItem, Search} from "flowbite-svelte";

  /** Name of timezone */
  let selectedTimezoneName = getLocalTzName();

  /** Minutes difference from UTC */
  export let selectedTimezone: number;
  $: selectedTimezone = getTzOffset(selectedTimezoneName);

  let showDropdown = false;
  let searchQuery = "";

  // TODO: it would be nice if selected timezone scrolled into view, but ehhhhh

  function handleOptionSelect(option: string) {
    selectedTimezoneName = option;
    showDropdown = false;
  }
</script>

<Button>
    {globalThis.window ? selectedTimezoneName : "Select timezone"}
    <ChevronDownSolid class="w-3 h-3 ms-2 text-white dark:text-white" />
</Button>
<Dropdown
        class="overflow-y-auto px-3 pb-3 text-sm h-44"
        bind:open={showDropdown}
>
    <div slot="header" class="p-3">
        <Search size="md" bind:value={searchQuery} autofocus />
    </div>
    {#each getAllTzNames() as tzName}
        {#if tzName.toLowerCase().includes(searchQuery.toLowerCase())}
            <li
                    class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
                <DropdownItem on:click={() => handleOptionSelect(tzName)}>
                    {tzName}
                </DropdownItem>
            </li>
        {/if}
    {/each}
</Dropdown>
