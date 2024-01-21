<script>
  import { Navbar, NavBrand } from "flowbite-svelte";
  import { DarkMode } from "flowbite-svelte";
  import logo from "$lib/images/logo.svg";
</script>

<header>
  <Navbar>
    <NavBrand href="/">
      <span class="welcome">
        <img
          src={logo}
          alt="MeetAsOne"
          style="width: 40px; height: auto; margin-right:16px"
        />
      </span>
    </NavBrand>
    <div style="flex: 1"></div>
    <a href="https://github.com/MeetAsOne/MeetAsOne" class="p-2">GitHub</a>
    <DarkMode />
  </Navbar>
</header>
