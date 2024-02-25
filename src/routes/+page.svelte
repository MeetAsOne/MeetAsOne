<script lang="ts">
	import welcome_fallback from "$lib/images/HomepageTitle.png";
	import { Label, Input } from "flowbite-svelte";
	import { GradientButton } from "flowbite-svelte";
	import { InsertEventStore } from "$houdini";
	import { goto } from "$app/navigation";
	import range from "$lib/range";
	import {DAY, MILLISECOND, TIME_STEP} from "$lib/units";
	import {timeToInt} from "$lib/timeutils";
	import { savePastEvents, getPastEvents } from "$lib/storage";
	import OldEvents from "./OldEvents.svelte";
	import TzPicker from "$lib/TzPicker.svelte";
	import flatpickr from "flatpickr";
	import { onMount } from "svelte";
	import { CalendarWeekSolid } from "flowbite-svelte-icons";

	let name: string = "";
	let selectedTimezone: number;

	let pastEvents = getPastEvents();
	let eventsCreated = pastEvents.filter((event) => event.imOwner);
	let eventsResponded = pastEvents.filter((event) => !event.imOwner);

	async function createEvent(ev: SubmitEvent) {
		ev.preventDefault();
		if (name.length == 0) {
			alert("Please fill in details");
		} else {
			const updater = new InsertEventStore();

			const data = new FormData(ev.currentTarget as HTMLFormElement);
			const startTime =
				timeToInt(data.get("start_time") as string) + selectedTimezone;
			const endTime =
				timeToInt(data.get("end_time") as string) + selectedTimezone;
			const response = await updater.mutate({
				name: name,
				dates: selectedDates.map(day =>
					[day.setUTCHours(0) * MILLISECOND + startTime, day.getTime() * MILLISECOND + endTime]
				),
			});
			if (response.errors) {
				alert(
					"Your configuration is invalid. Make sure end time is after start & you selected no more than 7 days.\n" +
						response.errors.map((err) => err.message).join("/n"),
				);
				return;
			}
			const id = response.data?.insert_events?.returning[0].id!;
			pastEvents.push({ id, name, imOwner: true });
			savePastEvents(pastEvents);
			goto("event/" + id);
		}
	}
	$: savePastEvents(pastEvents);

	let selectedDates: Date[] = [];
	onMount(() => {
		flatpickr("#flatpickr", {
			dateFormat: "F j",
			minDate: "today",
			mode: "multiple",
			onChange: (newSelectedDates) => {
				selectedDates = newSelectedDates;
			},
		});
	});
</script>

<svelte:head>
	<title>MeetAsOne</title>
	<meta
		name="description"
		content="An app to poll people’s availability for scheduling meetings"
	/>
</svelte:head>

<section class="main-section">
	<div class="header">
		<h1>
			<span class="welcome">
				<img
					src={welcome_fallback}
					alt="MeetAsOne"
					style="width: 680px; height: auto;"
				/>
			</span>
		</h1>
	</div>

	<!-- Past Events -->
	<div class="container">
		<div class="section" class:nonempty={eventsCreated.length !== 0 && eventsResponded.length !== 0}>
			{#if eventsCreated.length !== 0}
				<h2
					style="margin-top: 40px; font-weight: bold; text-transform: uppercase; "
				>
					Created Events
				</h2>
				<OldEvents bind:events={eventsCreated} />
			{/if}
			{#if eventsResponded.length !== 0}
				<h2
					style="margin-top: 40px; font-weight: bold; text-transform: uppercase;"
				>
					Events Responded to
				</h2>
				<OldEvents bind:events={eventsResponded} />
			{/if}
		</div>
		<div class="create-event-box">
			<form
				class="flex flex-grow gap-4 align-items-center content-center flex-col items-center"
				on:submit={createEvent}
				autocomplete="off"
			>
				<h2 style="font-weight: bold; ">Create New Event</h2>
				<Input
					id="disabled-input"
					class="w-auto"
					required
					placeholder="Event Name"
					bind:value={name}
				/>

				<div class="flex gap-2">
					<div class="flex-1">
						<Label
							for="start_time"
							class="text-black dark:text-black"
							>Start&nbsp;time</Label
						>
						<Input type="time" id="start_time" name="start_time" />
					</div>
					<div class="flex-1">
						<Label for="end_time" class="text-black dark:text-black"
							>End&nbsp;time</Label
						>
						<Input type="time" id="end_time" name="end_time" />
					</div>
				</div>

				<TzPicker bind:selectedTimezone />

				<!-- According to docs, I shouldn't need left padding, but otherwise text overlaps icon -->
				<Input class="pl-10" id="flatpickr">
					<CalendarWeekSolid slot="left" class="w-5 h-5" />
				</Input>
				<div class="my-button">
					<GradientButton
						size="xl"
						class="my-button"
						outline
						color="redToYellow"
						type="submit"
						style="background-color: var(--color-theme)"
						>Create New Event</GradientButton
					>
					<!-- bg color must be style, not class b/c it will apply to container div instead of button -->
				</div>
			</form>
		</div>
	</div>

	<div class="content">
		<div class="create-event-box2">
			<div class="description-and-features">
				<div class="description">
					<h2
						style="font-weight: bold; text-transform: uppercase; padding: 0px"
					>
						Schedule Meetings Effortlessly
					</h2>
					<p>
						MeetAsOne is an app to poll people’s availability so you
						can schedule a time to meet. You can select a series of
						days and specify the times that work for you, then we
						will find the best time for everyone else. No need to
						manually enter your calendar, with MeetAsOne you can
						upload a screenshot of your Google Calendar or Outlook
						Calendar. We'll parse it out for you and find the
						meeting times for your group!
					</p>
				</div>

				<div class="features-section">
					<h2
						style="font-weight: bold; text-transform: uppercase; color: #333; font-size: 1.5em;"
					>
						Features
					</h2>
					<ul>
						<li>
							Quickly import your calendar by uploading a just
							photo of your calendar.
						</li>
						<li>
							Save your availability for next time or others to
							view.
						</li>
						<li>
							View your previously created events and RSVP'd
							events without signing in.
						</li>
						<li>
							Easily share your events with family and friends.
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* Existing styles remain unchanged */

	.main-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.welcome {
		display: inline;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 680 / 2048) 0;
		background-size: contain;
		background-position: center;
		/* border: 0.5px solid black; Adjust border size */
		/* margin-bottom: 0px; Add margin to separate from description */
	}
	.container {
		display: flex;
		flex-wrap: wrap-reverse;
		justify-content: space-between;
		max-width: 1000px;
	}

	.section {
		display: flex;
		flex-direction: column;
		align-items: normal;
		margin-top: 10px;
		padding: 0.9%;
		align-self: self-start;
	}
	.section.nonempty {
		flex: 1;
		min-width: 300px;
	}

	.content {
		max-width: 1000px;
		display: flex;
		flex-wrap: wrap;
		margin: auto;
		flex-direction: column;
		align-items: center;
	}
	.create-event-box {
		background-color: #bdb48090; /* Set background color as needed */
		padding: 20px;
		border-radius: 4px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		/* margin-top: 20px; */
		/* Adjust size properties as needed */
		max-width: 500px; /* Example: Set the maximum width */
		max-height: 400px;
		margin-left: auto; /* Example: Center the box horizontally */
		margin-right: auto;
		margin-top: 5%;
	}
	.create-event-box2 {
		background-color: #bdb48090; /* Set background color as needed */
		padding: 20px;
		border-radius: 4px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		/* margin-top: 20px; */
		/* Adjust size properties as needed */
		width: 100%; /* Example: Set the width to 70% of the parent container */
		max-width: 2000px;
		margin-left: 0; /* Example: Center the box horizontally */
		margin-right: 0;
		margin-top: 8%;
	}
	.description-and-features {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		padding: 0;
		max-width: 1000px;
		/* margin: auto; */
		margin-top: 0;
	}

	.description,
	.features-section {
		max-width: 1000px;
		margin-top: 20px;
	}

	.description h2 {
		color: #333;
		font-size: 1.5em;
		margin-bottom: 10px;
	}

	.description p {
		color: #555;
	}

	.features-section {
		text-align: left;
		margin-top: 20px; /* Add margin to separate from description */
	}

	ul {
		list-style-type: square;
	}
</style>
