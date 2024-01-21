<script lang="ts">
	import welcome_fallback from "$lib/images/Untitled4.png";
	import { Label, Input, Button } from "flowbite-svelte";
	import { Dropdown, DropdownItem, Search } from "flowbite-svelte";
	import { ChevronDownSolid, UserRemoveSolid } from "flowbite-svelte-icons";

	import { Datepicker, DarkMode, GradientButton } from "flowbite-svelte";
	import { InsertEventStore } from "$houdini";
	import { goto } from "$app/navigation";
	import range from "$lib/range";
	import { DAY } from "$lib/units";
	import { timeToInt } from "$lib/timeutils";
	import {savePastEvents, getPastEvents} from "$lib/storage";

	let name: string = "";
	let timezones = [
		"(GMT-12:00) International Date Line West",
		"(GMT-11:00) Midway Island, Samoa",
		"(GMT-10:00) Hawaii",
		"(GMT-09:00) Alaska",
		"(GMT-08:00) Pacific Time (US & Canada)",
		"(GMT-07:00) Mountain Time (US & Canada)",
		"(GMT-06:00) Central Time (US & Canada)",
		"(GMT-05:00) Eastern Time (US & Canada)",
		"(GMT-04:00) Atlantic Time (Canada)",
		"(GMT-03:00) Buenos Aires, Georgetown",
		"(GMT-02:00) Mid-Atlantic",
		"(GMT-01:00) Cape Verde Islands",
		"(GMT) Greenwich Mean Time, London",
		"(GMT+01:00) Brussels, Copenhagen, Madrid, Paris",
		"(GMT+02:00) Athens, Istanbul, Cairo",
		"(GMT+03:00) Moscow, St. Petersburg, Volgograd",
		"(GMT+04:00) Dubai, Abu Dhabi, Muscat",
		"(GMT+05:00) Karachi, Islamabad, Tashkent",
		"(GMT+05:30) Indian Standard Time",
		"(GMT+06:00) Almaty, Dhaka",
		"(GMT+07:00) Bangkok, Hanoi, Jakarta",
		"(GMT+08:00) Beijing, Hong Kong, Singapore",
		"(GMT+09:00) Tokyo, Seoul, Osaka",
		"(GMT+09:30) Adelaide, Darwin",
		"(GMT+10:00) Brisbane, Sydney, Melbourne",
		"(GMT+11:00) Solomon Islands, New Caledonia",
		"(GMT+12:00) Fiji, Kamchatka, Marshall Is.",
	];

	const pastEvents = getPastEvents();
	let selectedOption: string = "Select Timezone";

	let showDropdown = false;

	function handleOptionSelect(option) {
		selectedOption = option;
		showDropdown = false;
	}
	async function createEvent(ev: SubmitEvent) {
		ev.preventDefault();
		if (name.length == 0 || selectedOption == "Select Timezone") {
			alert("Please fill in details");
		} else {
			const updater = new InsertEventStore();

			const data = new FormData(ev.currentTarget as HTMLFormElement);
			const start_day = new Date(data.get("start") as string).getTime();
			const end_day = new Date(data.get("end") as string).getTime();
			const response = await updater.mutate({
				name: name,
				timezone: selectedOption,
				start_time: timeToInt(data.get("start_time") as string),
				end_time: timeToInt(data.get("end_time") as string),
				dates: range(start_day, end_day + DAY, DAY).map(day => new Date(day).toLocaleDateString()),  // excludes endpoint, thus +DAY
			});
			if (response.errors) {
				alert("Your configuration is invalid. Make sure end time is after start & you selected no more than 7 days.\n" + response.errors.map(err => err.message).join("/n"));
				return;
			}
			const id = response.data?.insert_events?.returning[0].id!;
			pastEvents.created.push({id, name});
			savePastEvents(pastEvents);
			goto("event/" + id);
		}
	}
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
		<div class="section">
			<h2
				style="margin-top: 40px; font-weight: bold; text-transform: uppercase; "
			>
				Created Events
			</h2>
			{#each pastEvents.created as createdEvent}
				<div class="event-button">
					<Button
						style="background-color:#D1AC00"
						href={"/event/" + createdEvent.id}
						>{createdEvent.name}</Button
					>
				</div>
			{/each}
			<h2
				style="margin-top: 40px; font-weight: bold; text-transform: uppercase;"
			>
				Events Responded to
			</h2>
			{#each pastEvents.responded as respondedEvent}
				<div class="event-button">
					<Button
						style="background-color:#D1AC00"
						href={"/event/" + respondedEvent.id}
						>{respondedEvent.name}</Button
					>
				</div>
			{/each}
		</div>
		<div class="create-event-box">
			<h2 style="font-weight: bold; margin-top: 0px; margin-bottom: 0px;">
				Create New Event Here
			</h2>

			<form class="section" on:submit={createEvent}>
				<Input
					id="disabled-input"
					class="m-0"
					required
					placeholder="Event Name"
					bind:value={name}
				/>

				<div class="flex gap-2">
					<div class="flex-1" style="margin: 2%;">
						<Label for="start_time" class="mb-2" color="undefined"
							>Start time</Label
						>
						<Input type="time" id="start_time" name="start_time" />
					</div>
					<div class="flex-1" style="margin: 2%;">
						<Label for="end_time" class="mb-2" color="undefined"
							>End time</Label
						>
						<Input type="time" id="end_time" name="end_time" />
					</div>
				</div>

				<Button class="m-3" style="background-color:#D1AC00"
					>{selectedOption}<ChevronDownSolid
						class="w-3 h-3 ms-2 text-white dark:text-white"
					/></Button
				>
				<Dropdown
					class="overflow-y-auto px-3 pb-3 text-sm h-44 "
					bind:open={showDropdown}
				>
					<!-- <div slot="header" class="p-3">
                    <Search size="md" />
                </div> -->
					{#each timezones as time}
						<li
							class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600"
						>
							<DropdownItem
								on:click={() => handleOptionSelect(time)}
								>{time}</DropdownItem
							>
						</li>
					{/each}
				</Dropdown>
				<div class="m-3">
					<!-- Start input has name "start". End input has name "end" -->
					<Datepicker range />
					<div class="my-button">
						<GradientButton
							size="xl"
							class="my-button"
							outline
							color="redToYellow"
							type="submit"
							style="background-color:#D1AC00"
							>Create New Event</GradientButton
						>
					</div>
				</div>
			</form>
		</div>
	</div>

	<div class="content">
		<div class="create-event-box2">
			<div class="description-and-features">
				<div class="description">
					<h2 style="font-weight: bold; text-transform: uppercase; padding: 0px">
						Schedule Meetings Effortlessly
					</h2>
					<p>
						MeetAsOne is an app to poll people’s availability so you
						can schedule a time to meet. You can select a series of
						days and speicify the times that work for you, then we
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
						Features:
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
	}

	.section {
		flex: 1;
		min-width: 300px;
		display: flex;
		flex-direction: column;
		align-items: normal;
		margin-top: 10px;
		padding: 0.9%;
		align-self: self-start;
	}

	.my-events,
	.rsvpd-events {
		margin-bottom: 20px;
	}

	.content {
		max-width: 1000px;
		display: flex;
		flex-wrap: wrap;
		margin: auto;
		display: flex;
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
		width: 70%; /* Example: Set the width to 70% of the parent container */
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
		max-height: 400px;
		margin-left: 0; /* Example: Center the box horizontally */
		margin-right: 0;
		margin-top: 8%;
	}
	.description-and-features {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-start;
		padding: 0px;
		max-width: 1000px;
		align-items: center;
		/* margin: auto; */
		margin-top: 0px;
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
		margin-left: 200px;
	}

	.dark-mode-toggle {
		text-align: center;
		margin-top: 20px;
	}

	input[type="checkbox"] {
		margin-left: 5px;
	}

	.my-button {
		padding: 30px 20px; /* Adjust the padding values as needed */
	}

	.event-button {
		margin: 10px;
	}
</style>
