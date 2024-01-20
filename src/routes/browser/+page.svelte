<script lang="ts">
    let hi = {
        "time-zone": 1, // 0 = UTC, 1 = UTC+1, 2 = UTC+2, etc.
        "days": {
            "monday": [
                "00:00", // represents not available from 00:00 to 00:15
                "13:15",
                "23:45"
            ],
            "tuesday": [
                "00:00",
                "13:15",
                "23:15"
            ]
        }
    };

    const saveData = () => {
        localStorage.setItem('general-availability', JSON.stringify(data));
    };

    
    
    import { PageData } from './$houdini'

    export let data: PageData

    $({ GetEventsStore } = data)


    import { GetEventsStore } from '$houdini'
    const getEvents = new GetEventsStore()
</script>

<div>
    {#await getEvents.fetch()}
    hi
    {:then data}
    {data?.data?.events.length}
    {/await}
</div>

<button on:click={saveData}>Save Data</button>