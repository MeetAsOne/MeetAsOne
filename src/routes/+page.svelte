<script>
    import Counter from './Counter.svelte';
    import welcome_fallback from '$lib/images/meetasone.png';
</script>

<svelte:head>
    <title>MeetAsOne</title>
    <meta name="description" content="MeetAsOne - An app to poll people’s availability for scheduling meetings." />
    <link rel="stylesheet" href="path/to/your/custom/styles.css" />
</svelte:head>

<section class="main-section">
    <div class="header">
        <h1>
            <span class="welcome">
                <img src={welcome_fallback} alt="MeetAsOne" />
            </span>
        </h1>
    </div>

    <div class="content">
        <div class="description-and-features">
            <div class="description">
                <h2>MeetAsOne - Schedule Meetings Effortlessly</h2>
                <p>
                    MeetAsOne is an app to poll people’s availability so you can schedule a time to meet.
                </p>
            </div>

            <div class="features-section">
                <h2>Features:</h2>
                <ul>
                    <li>Save your availability for next time or others to view.</li>
                    <li>Import your calendar by uploading a photo or signing in.</li>
                </ul>
            </div>
        </div>

        <Counter />
    </div>

    <div class="dark-mode-toggle">
        <label for="darkModeToggle">Dark Mode</label>
        <input type="checkbox" id="darkModeToggle" />
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
        padding: 100px;
        max-width: 800px;
        margin: auto;
    }

    .description,
    .features-section {
        max-width: 400px;
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
        margin-left: 20px;
    }

    .dark-mode-toggle {
        text-align: center;
        margin-top: 20px;
    }

    input[type="checkbox"] {
        margin-left: 5px;
    }
</style>
