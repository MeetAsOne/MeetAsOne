<script lang="ts">
    import {
        Button,
        Dropdown,
        DropdownItem,
        Modal,
        Spinner,
    } from "flowbite-svelte";
    import { ChevronDownSolid } from "flowbite-svelte-icons";
    import {importedEvents} from '../store.ts'
    import {applyAvailability, type Availability} from "$lib/manual/Availability.ts";
    import {dateStrToEpoch} from "$lib/timeutils.ts";
    import {compactAvailability} from "$lib/manual/Availability.js";
    import {importedWeeklyEvents} from "$lib/store.js";

    function get15MinuteIndexes(event: GptEvent) {
        const startHour = parseInt(event.start.split(":")[0]);
        const startMinute =
            Math.floor(parseInt(event.start.split(":")[1]) / 15) * 15;
        const endHour = parseInt(event.end.split(":")[0]);
        const endMinute =
            Math.ceil(parseInt(event.end.split(":")[1]) / 15) * 15;

        const startIndex = startHour * 4 + startMinute / 15;
        const endIndex = endHour * 4 + endMinute / 15;

        const indexes = [];
        for (let i = startIndex; i < endIndex; i++) {
            indexes.push(i);
        }

        return indexes;
    }

    function compileEvents(events: GptEvent[]): Availability {
        const compiledEvents: { [date: string]: number[] } = {};

        for (const event of events) {
            if (!compiledEvents[event.date]) {
                compiledEvents[event.date] = [];
            }

            const indexes = get15MinuteIndexes(event);
            compiledEvents[event.date].push(...indexes);
        }

        // Generate all possible indexes
        const allIndexes = Array.from({length: 96}, (_, i) => i);

        // Replace each value in compiledEvents with the array of available indexes
        for (const date in compiledEvents) {
            compiledEvents[date] = allIndexes.filter(index => !compiledEvents[date].includes(index));
        }

        return compiledEvents;
    }

    interface GptEvent {
        date: string;
        start: string;
        end: string;
    }

    let fileInput: HTMLInputElement;
    let files: FileList;
    let scanning = false;

    function runGpt() {
      showModal = false;
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
          window.alert("The calendar could not be imported.");
          return;
        } else if (response.status === 429) {
          window.alert("Too many requests. Please try again in 15 seconds.");
          return;
        } else if (!response.ok) {
          window.alert("An error occurred");
          return;
        }

        const data: GptEvent[] = await response.json();

        importedEvents.set(compileEvents(data))
        console.log($importedEvents)
        return;
      };
    }

    $: if (files) {
        console.log(files);
        runGpt();
    }

    let showModal = false;

    const localAvailability: Availability = JSON.parse(
      globalThis?.localStorage?.["general-availability"] ?? '{"days": {}}',
    ).days;
</script>

<div>
    <Button
        >Import calendar<ChevronDownSolid
            class="w-3 h-3 ms-2 text-white dark:text-white"
        /></Button
    >
    <Dropdown class="w-40 p-3 space-y-1 text-sm">
        <DropdownItem on:click={() => (showModal = true)}
            >Scan image</DropdownItem
        >
        {#if Object.keys(localAvailability).length}
            <DropdownItem on:click={() => importedWeeklyEvents.set(localAvailability)}
                >Load saved</DropdownItem
            >
        {/if}
    </Dropdown>
</div>

{#if showModal}
    <Modal title="Scan image" bind:open={showModal} autoclose outsideclose>
        <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
            Append events from your calendar onto the availability matrix by importing an image.
        </p>
        <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
            Here are some guidelines for the image:
        </p>
        <ul class="list-disc ml-5">
            <li>Take a screenshot or image of the week view of a calendar</li>
            <li>
                Include the dates as part of the image at the top of the
                calendar
            </li>
            <li>
                Include the times which the events are at on the side of the
                calendar
            </li>
            <li>Make sure the image is clear and not blurry</li>
            <!-- Add more steps as needed -->
        </ul>
        <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
            It is not guarenteed your image will be scanned completely.
        </p>
        <svelte:fragment slot="footer">
            <Button on:click={(e) => {
                fileInput.click();
            e.stopPropagation();}}
                >Upload</Button
            >
        </svelte:fragment>
        <input
            type="file"
            bind:this={fileInput}
            bind:files
            style="display: none;"
            accept="image/png, image/jpeg, image/webp, image/gif"
        />
    </Modal>
{/if}

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
