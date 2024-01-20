<script lang="ts">
  import ManualInput from "$lib/manual/ManualInput.svelte";
  import type Availability from "$lib/manual/Availability";
  import {Button, Datepicker, Input, Label} from 'flowbite-svelte';
  import range from "$lib/range";
  import {DAY} from "$lib/units";

  let availability: Availability;
  let dates = [] as number[];
  let timeRange: [string, string] = ["8:00 AM", "10:00 PM"];

  // TODO: find a way to convert "2:50 AM" or "15:43" to seconds since midnight
  function timeToInt(value: string, index: number, array: string[]) {
    return ([480, 1320])[index];
  }

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

<div>
    <!-- TODO: make it look pretty -->
    <Label for="start_time" class="mb-2" bind:value={timeRange[0]}>Start time</Label>
    <Input type="time" id="start_time"/>
    <Label for="end_time" class="mb-2" bind:value={timeRange[1]}>End time</Label>
    <Input type="time" id="end_time" />
    <form on:submit={onSubmit}>
        <!-- Start input has name "start". End input has name "end" -->
        <Datepicker range/>
        <Button type="submit">Submit</Button>
    </form>
    <ManualInput bind:availability {dates} timeRange={timeRange.map(timeToInt)}/>
</div>
