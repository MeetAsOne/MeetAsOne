<script>
  import { Navbar, NavBrand } from "flowbite-svelte";
  import { DarkMode } from "flowbite-svelte";
</script>

<header>
  <Navbar>
    <NavBrand href="/">
      <!-- <img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo" /> -->
      <span
        class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
        >MeetAsOne</span
      >
    </NavBrand>
    <div>
      <DarkMode />
    </div>
  </Navbar>
</header>
