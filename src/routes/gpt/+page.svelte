<script>
    import {
        Button,
        Dropdown,
        DropdownItem,
        Checkbox,
        Helper,
    } from "flowbite-svelte";
    import { ChevronDownSolid } from "flowbite-svelte-icons";
</script>

<div>
    <Button
        >Import calendar<ChevronDownSolid
            class="w-3 h-3 ms-2 text-white dark:text-white"
        /></Button
    >
    <Dropdown class="w-60 p-3 space-y-1 text-sm">
        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
            <Helper class="ps-6">Scan calendar photo</Helper>
        </li>
    </Dropdown>
</div>
