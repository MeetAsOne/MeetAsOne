<script lang="ts">
  import type {EventSummary} from "$lib/storage.ts";
  import {Button, ButtonGroup} from "flowbite-svelte";
  import { CloseSolid } from 'flowbite-svelte-icons';

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
                    <CloseSolid />
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
