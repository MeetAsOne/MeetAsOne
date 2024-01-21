<script>
  import { Navbar, NavBrand } from "flowbite-svelte";
  import { DarkMode } from "flowbite-svelte";
  import logo from "$lib/images/logo.svg";
//   import { Video } from 'flowbite-svelte';
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
      <!-- <Video src="/images/logo.svg" controls trackSrc="logo.svg" /> -->
	  <!-- <span
	    
        class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
        >MeetAsOne</span
      > -->
    </NavBrand>
    <div>
      <DarkMode />
    </div>
  </Navbar>
</header>
