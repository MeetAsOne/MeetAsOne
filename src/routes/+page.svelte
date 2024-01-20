<script lang="ts">
	import welcome_fallback from "$lib/images/meetasone.png";
	import { Label, Input } from 'flowbite-svelte';
	import {
		Datepicker,
		DarkMode,
		GradientButton,
		Card,
	} from "flowbite-svelte";
	import { InsertEventStore } from "$houdini";

	let name: any
	let timezone


	function createEvent() {
		const updater = new InsertEventStore();

		updater.mutate({ name: name, timezone: timezone });
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
				Past Events
			</h2>
			<Card title="Event 1" description="Description of Event 1" />
			<Card title="Event 2" description="Description of Event 2" />

			<!-- RSVP'ed Events -->
			<h2
				style="margin-top: 40px; font-weight: bold; text-transform: uppercase;"
			>
				RSVP'ed Events
			</h2>
			<Card title="Event 3" description="Description of Event 3" />
			<Card title="Event 4" description="Description of Event 4" />
		</div>
		<div class="right-section">
			<div class="dark-mode-toggle">
				<Input id="disabled-input" class="mb-6" required placeholder="name" bind:value={name}/>
				<Input id="disabled-input-2" class="mb-6" required placeholder="timezone" bind:value={timezone} />
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
					on:click={() => createEvent()}>Create NEW EVENT</GradientButton
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
</style>
