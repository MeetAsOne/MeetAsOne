<script lang="ts">
  import {timezones} from "$lib/timeutils";
  import {ChevronDownSolid} from "flowbite-svelte-icons";
  import {Button, Dropdown, DropdownItem, Search} from "flowbite-svelte";

  export let selectedTimezone = new Date().getTimezoneOffset();

  let showDropdown = false;
  let searchQuery = "";

  function handleOptionSelect(option: number) {
    selectedTimezone = option;
    showDropdown = false;
  }
</script>

<Button style="background-color:#D1AC00">
    {timezones.get(selectedTimezone)}
    <ChevronDownSolid class="w-3 h-3 ms-2 text-white dark:text-white" />
</Button
>
<Dropdown
        class="overflow-y-auto px-3 pb-3 text-sm h-44"
        bind:open={showDropdown}
>
    <div slot="header" class="p-3">
        <Search size="md" bind:value={searchQuery} autofocus />
    </div>
    {#each timezones.entries() as [tzOffset, tzName]}
        {#if tzName.toLowerCase().includes(searchQuery.toLowerCase())}
            <li
                    class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
                <DropdownItem
                        on:click={() => handleOptionSelect(tzOffset)}
                >{tzName}</DropdownItem
                >
            </li>
        {/if}
    {/each}
</Dropdown>
