<script lang="ts">
  import ManualInput from "$lib/manual/ManualInput.svelte";
  import type Availability from "$lib/manual/Availability";
  import {Button, Datepicker} from 'flowbite-svelte';
  import range from "$lib/range";
  import {DAY} from "$lib/units";

  let availability: Availability;
  let dates = [] as number[];

  function onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget as HTMLFormElement);
    const start = new Date(data.get("start") as string).getTime();
    const end = new Date(data.get("end") as string).getTime();
    console.log(start, end);
    dates = range(start, end + DAY, DAY);  // excludes endpoint, thus +DAY
    console.log(dates.map(d => new Date(d).toLocaleDateString()));
  }
</script>

<form on:submit={onSubmit}>
    <!-- Start input has name "start". End input has name "end" -->
    <Datepicker range/>
    <Button type="submit">Submit</Button>
</form>
<ManualInput bind:availability {dates} timeRange={[0, 30 * 60]} />
