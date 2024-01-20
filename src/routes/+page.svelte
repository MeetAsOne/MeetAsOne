<script lang="ts">
	import welcome_fallback from "$lib/images/meetasone.png";
	import { Label, Input, Button } from "flowbite-svelte";
	import { Dropdown, DropdownItem, Search } from 'flowbite-svelte';
  	import { ChevronDownSolid, UserRemoveSolid } from 'flowbite-svelte-icons';
    
	import {
		Datepicker,
		DarkMode,
		GradientButton,
		Card,
	} from "flowbite-svelte";
	import { InsertEventStore } from "$houdini";

	let name: any;
	let timezone;
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

	interface PastEvents {
		created: Array<{ name: string; id: string }>;
		responded: Array<{ name: string; id: string }>;
	}

	let pastEventsString = globalThis?.localStorage?.getItem?.("pastEvents");

	let pastEvents: PastEvents;

	if (!pastEventsString) {
		pastEvents = {
			created: [
				{ name: "Hello", id: "1234" },
				{ name: "there", id: "825" },
			],
			responded: [
				{ name: "Hello", id: "1234" },
				{ name: "there", id: "825" },
			],
		};
	} else {
		pastEvents = JSON.parse(pastEventsString);
	}
	globalThis?.localStorage?.setItem?.(
		"pastEvents",
		JSON.stringify(pastEvents),
	);
	let selectedOption = null;

    function handleOptionSelect(option) {
        selectedOption = option;
    }
	function createEvent() {
		const updater = new InsertEventStore();

		async function update() {
            await updater.mutate({ name: name, timezone: selectedOption });
        }

        update();
	}
</script>

<svelte:head>
	<title>MeetAsOne</title>
	<meta
		name="description"
		content="MeetAsOne - An app to poll people’s availability for scheduling meetings."
	/>
</svelte:head>

<DarkMode />
<section class="main-section">
	<div class="header">
		<h1>
			<span class="welcome">
				<img src={welcome_fallback} alt="MeetAsOne" />
			</span>
		</h1>
	</div>

	<!-- Past Events -->
	<div class="container">
		<div class="left-section">
			<h2
				style="margin-top: 40px; font-weight: bold; text-transform: uppercase;"
			>
				Created Events
			</h2>
			{#each pastEvents.created as createdEvent}
				<div class="event-button">
					<Button href={"/events/" + createdEvent.id}
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
					<Button href={"/events/" + respondedEvent.id}
						>{respondedEvent.name}</Button
					>
				</div>
			{/each}
		</div>
		<div class="right-section">
            <div class="dark-mode-toggle">
                <Input id="disabled-input" class="mb-6" required placeholder="name" bind:value={name}/>
                <!---<Button>{selectedOption ? selectedOption : 'Select an option'}<ChevronDownSolid class="w-3 h-3 ms-2 text-white dark:text-white" /></Button>
                <Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44">
                <div slot="header" class="p-3">
                    <Search size="md" />
                </div>
                <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <DropdownItem on:click={() => handleOptionSelect('Option 1')}>Option 1</DropdownItem>
                </li>
                <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <DropdownItem on:click={() => handleOptionSelect('Option 2')}>Option 2</DropdownItem>
                </li>
                <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <DropdownItem on:click={() => handleOptionSelect('Option 3')}>Option 3</DropdownItem>
                </li>
                
                <a slot="footer" href="/" class="flex items-center p-3 -mb-1 text-sm font-medium text-red-600 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-red-500 hover:underline">
                    <UserRemoveSolid class="w-4 h-4 me-2 text-primary-700 dark:text-primary-700" />Delete user
                </a>
                </Dropdown> 
                <Input id="disabled-input-2" class="mb-6" required placeholder="timezone" bind:value={timezone} /> -->

                <Button>{selectedOption ? selectedOption : 'Select Timezone'}<ChevronDownSolid class="w-3 h-3 ms-2 text-white dark:text-white" /></Button>
                <Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44">
                <div slot="header" class="p-3">
                    <Search size="md" />
                </div>
				{#each timezones as time}
					<li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
						<DropdownItem on:click={() => handleOptionSelect(time)}>{time}</DropdownItem>
					</li>
				{/each}
				
                
                </Dropdown>
				
				<Datepicker />
				<label for="darkModeToggle">Save My Calendar</label>
				<input type="checkbox" id="darkModeToggle" />
			</div>

			<div class="my-button">
				<GradientButton
					size="xl"
					class="my-button"
					outline
					color="pinkToOrange"
					on:click={() => createEvent()}
					>Create NEW EVENT</GradientButton
				>
			</div>
		</div>
	</div>

	<div class="content">
		<div class="description-and-features">
			<div class="description">
				<h2 style="font-weight: bold; text-transform: uppercase;">
					Schedule Meetings Effortlessly
				</h2>
				<p>
					MeetAsOne is an app to poll people’s availability so you can
					schedule a time to meet.
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
						Save your availability for next time or others to view.
					</li>
					<li>
						Import your calendar by uploading a photo or signing in.
					</li>
				</ul>
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
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 680 / 2048) 0;
		background-size: cover;
		background-position: center;
		border: 5px solid black; /* Adjust border size */
		margin-bottom: 20px; /* Add margin to separate from description */
	}
	.container {
		display: flex;
		justify-content: space-between;
	}

	.left-section {
		flex: 1;
	}

	.right-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: normal;
		margin-top: 100px;
		padding: 0.9%;
	}

	.my-events,
	.rsvpd-events {
		margin-bottom: 20px;
	}
	.content {
		max-width: 800px;
		margin: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.description-and-features {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 0px;
		max-width: 1000px;
		/* margin: auto; */
		margin-top: 32px;
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
