<script context="module" lang="ts">
    import {writable} from "svelte/store";

    let id = 0;
    const queue = writable([] as (string | undefined)[]);

    export const icons = {
      error: ExclamationCircleSolid
    };

    /** Shows an error toast with the given message and returns an id for that toast to cancel it later */
    export function newToast(message: string, iconType: keyof typeof icons) {
        queue.update(prev => [...prev, message]);
        return id++;
    }

    export function editToast(id: number, newMsg: string) {
      queue.update(prev => {
        prev[id] = newMsg;
        return prev;
      })
      return id;
    }

    export function timeoutToast(id: number, timeout: number) {
      setTimeout(resolveToast.bind(null, id), timeout);
    }

    export function resolveToast(id: number) {
      queue.update(prev => {
        prev[id] = undefined;
        return prev;
      });
    }

    export function clearAllToasts() {
      queue.update(prev => new Array(prev.length));
    }
</script>
<script lang="ts">
  import {Toast} from "flowbite-svelte";
  import {ExclamationCircleSolid} from "flowbite-svelte-icons";
</script>


<div class="fixed bottom-3 left-0 w-full flex flex-col gap-3" id="toaster">
    {#each $queue as message, idx}
        <Toast color="red" class="mx-auto" on:close={resolveToast.bind(null, idx)} open={!!message}>
            <svelte:fragment slot="icon">
                <ExclamationCircleSolid class="w-5 h-5"/>
                <span class="sr-only">Warning icon</span>
            </svelte:fragment>
            {message}
        </Toast>
    {/each}
</div>
