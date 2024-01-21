<script>
    import ImportCalendar from "$lib/importCalendar/ImportCalendar.svelte";

    /** @type { import('./$houdini').PageData } **/
    export let data;

    // pull the store reference from the route props
    $: ({ GetEvent } = data);
</script>

{JSON.stringify($GetEvent.data?.events)}
<div class="flex flex-wrap"></div>

<ImportCalendar/>
