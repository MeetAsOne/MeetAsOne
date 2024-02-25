<script lang="ts">
  import type {EventSummary} from "$lib/storage.ts";
  import {Button, ButtonGroup} from "flowbite-svelte";
  import { CloseSolid } from 'flowbite-svelte-icons';

  export let events: EventSummary[];
  export let imOwner: boolean;

  function del(id: string) {
    events.splice(events.findIndex(ev => ev.id === id), 1);
    events = [...events];
  }
</script>

<div class="flex flex-wrap max-w-[350px] m-auto">
    {#each events.filter(ev => ev.imOwner === imOwner) as respondedEvent}
        <div class="event-button">
            <ButtonGroup>
                <Button
                        href={"/event/" + respondedEvent.id}
                        class="!border-r-0"
                        color="primary"
                >
                    {respondedEvent.name}
                </Button>
                <Button on:click={del.bind(globalThis, respondedEvent.id)} class="pl-0 !border-l-0" color="primary" title="Forget">
                    <CloseSolid tabindex="-1" class="w-4 h-4" />
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
