<script>
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

    /* @type { import('./$houdini').PageData } */
    export let data
    
    $: ({ GetEvents } = data)
</script>

<div>
    {$GetEvents.data}
</div>

<button on:click={saveData}>Save Data</button>