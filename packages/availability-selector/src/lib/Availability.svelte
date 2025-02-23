<script lang="ts">
  export let everyone: string[];
  export let available: string[];
</script>

<div>
    {available.length}/{everyone.length} Available
    <div>
        <h3>Available</h3>
        <ul>
            {#each available as person}
                <li>{person}</li>
            {/each}
        </ul>
    </div>
    <div>
        <h3>Unavailable</h3>
        <ul>
            {#each everyone as person}
                {#if !available.includes(person)}
                    <li>{person}</li>
                {/if}
            {/each}
        </ul>
    </div>
</div>

<style>
    h3 {
        text-decoration: underline;
        font-size: 1.2rem;
    }
</style>
