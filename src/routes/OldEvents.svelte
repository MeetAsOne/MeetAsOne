<script lang="ts">
  import type {EventSummary} from "$lib/storage.ts";
  import {Button, ButtonGroup} from "flowbite-svelte";

  export let events: EventSummary[];

  function del(id: string) {
    events.splice(events.findIndex(ev => ev.id === id), 1);
    events = [...events];
  }
</script>

<div class="flex flex-wrap max-w-[350px] m-auto">
    {#each events as respondedEvent}
        <div class="event-button">
            <ButtonGroup>
                <Button
                        style="background-color:#D1AC00"
                        href={"/event/" + respondedEvent.id}
                        class="!border-r-0"
                >
                    {respondedEvent.name}
                </Button>
                <Button on:click={del.bind(globalThis, respondedEvent.id)} style="background-color:#D1AC00" class="pl-0 !border-l-0" title="Forget">
                    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M6 18 18 6m0 12L6 6"/>
                    </svg>
                </Button>
            </ButtonGroup>
        </div>
    {/each}
</div>


<style>
    .event-button {
        margin: 10px;
    }
</style>
