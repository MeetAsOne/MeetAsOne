<script lang="ts">
    import { Button, Dropdown, DropdownItem, Spinner } from "flowbite-svelte";
    import { ChevronDownSolid } from "flowbite-svelte-icons";

    let fileInput: HTMLInputElement;
    let files: FileList;
    let scanning = false;

    $: if (files) {
        scanning = true;
        const file = files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async function () {
            const base64 = (reader!.result! as string).split(",")[1];
            const response = await fetch("/api/parse-calendar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ image: base64 }),
            });
            scanning = false;
            if (response.status === 500) {
                window.alert("The calendar could not be imported");
                return;
            } else if (response.status === 429) {
                window.alert("Too many requests. Please try again later.");
                return;
            } else if (!response.ok) {
                window.alert("An error occurred");
                return;
            }

            const data = await response.json();
            console.log(data);
        };
    }
</script>

<div>
    <Button
        >Import calendar<ChevronDownSolid
            class="w-3 h-3 ms-2 text-white dark:text-white"
        /></Button
    >
    <Dropdown class="w-60 p-3 space-y-1 text-sm">
        <DropdownItem on:click={() => fileInput.click()}
            >Scan image</DropdownItem
        >
        <input
            type="file"
            bind:this={fileInput}
            bind:files
            style="display: none;"
            accept="image/png, image/jpeg, image/webp, image/gif"
        />
    </Dropdown>
</div>

{#if scanning}
    <div
        style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; pointer-events: auto;"
    >
        <div
            style="background: white; padding: 20px; border-radius: 10px; display: flex; align-items: center;"
        >
            <Spinner />
            <span style="margin-left: 10px;">Scanning...</span>
        </div>
    </div>
{/if}
