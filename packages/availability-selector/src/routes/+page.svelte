<script lang="ts">
  import ManualInput from "$lib/ManualInput.svelte";
</script>

<ManualInput
    ranges={[[0, 120], [2000, 2100]]}
    tzOffset={0}
    shouldUseWeekdays={false}
/>
