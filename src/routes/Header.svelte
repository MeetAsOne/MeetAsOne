<script>
  import logo from "$lib/images/logo.svg";
  import Competitors from "./Competitors.svelte";
  import {page} from "$app/stores";
</script>

<header>
  <div class="flex items-center justify-evenly w-full py-4">
    <h1>
      <a href="/" class="font-bold flex items-center flex-wrap justify-center">
      <img
              src={logo}
              alt="MeetAsOne"
              style="width: 40px; height: auto; margin-right:16px; display: inline-block;"
      />
      MeetAsOne
      </a>
    </h1>
    <h2 class="flex gap-5">
      {#if $page.url.pathname.startsWith("/event")}
        <a href="https://github.com/MeetAsOne/MeetAsOne" target="_blank">Github</a>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSf5-yinCVqlVBEU_3AQlN4glPiqySzhms4-wA_Oe0sNBO6iOg/viewform?usp=pp_url&entry.173233276={location.pathname.split('/').at(-1)}" target="_blank">Report feedback/issue</a>
      {:else}
        The better alternative to <Competitors />
      {/if}
    </h2>
  </div>
  <hr class="border-black hidden sm:block mx-auto" style="width: calc((100% - 600px) / 3 + 600px)" />
</header>
